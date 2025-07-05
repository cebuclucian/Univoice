import React, { useState } from 'react';
import { Save, X, Edit3, CheckCircle, AlertCircle, Clock, Calendar, Eye, Download, Copy } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { supabase } from '../lib/supabase';
import { useNotifications } from '../contexts/NotificationContext';

interface ScheduledPost {
  id: string;
  platform: string;
  content: string;
  scheduled_at: string;
  status: string;
  user_id: string;
  marketing_plan_id: string;
}

interface PostEditorProps {
  post: ScheduledPost;
  onUpdate?: (updatedPost: ScheduledPost) => void;
  className?: string;
}

export const PostEditor: React.FC<PostEditorProps> = ({ 
  post, 
  onUpdate, 
  className = '' 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  const handleSave = async () => {
    if (editedContent.trim() === '') {
      setError('Conținutul nu poate fi gol');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const { data, error: updateError } = await supabase
        .from('scheduled_posts')
        .update({ 
          content: editedContent.trim(),
          // Actualizăm și timestamp-ul pentru a indica când a fost editat
          updated_at: new Date().toISOString()
        })
        .eq('id', post.id)
        .select()
        .single();

      if (updateError) throw updateError;

      const updatedPost = { ...post, content: editedContent.trim() };
      setIsEditing(false);
      onUpdate?.(updatedPost);
      
      addNotification({
        type: 'success',
        title: 'Postare actualizată!',
        message: `Conținutul pentru ${post.platform} a fost salvat cu succes.`,
        persistent: false,
        autoClose: true,
        duration: 3000
      });
    } catch (err) {
      console.error('Error saving post content:', err);
      setError('Nu am putut salva modificările. Te rog încearcă din nou.');
      addNotification({
        type: 'error',
        title: 'Eroare la salvare!',
        message: 'Nu am putut salva conținutul postării.',
        persistent: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedContent(post.content);
    setIsEditing(false);
    setError(null);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handlePreview = () => {
    setIsPreviewOpen(true);
    addNotification({
      type: 'info',
      title: 'Previzualizare postare',
      message: `Afișez previzualizarea pentru ${post.platform}`,
      persistent: false,
      autoClose: true,
      duration: 2000
    });
  };

  const handleExport = async () => {
    try {
      // Creează conținutul pentru export
      const exportContent = `Platform: ${post.platform}
Programată pentru: ${formatScheduledDate(post.scheduled_at)}
Status: ${getStatusText(post.status)}

Conținut:
${post.content}

---
Generat de Univoice - ${new Date().toLocaleDateString('ro-RO')}`;

      // Copiază în clipboard
      await navigator.clipboard.writeText(exportContent);
      
      addNotification({
        type: 'success',
        title: 'Postare exportată!',
        message: `Conținutul pentru ${post.platform} a fost copiat în clipboard.`,
        persistent: false,
        autoClose: true,
        duration: 3000
      });

      // Alternativ, deschide într-o filă nouă
      const blob = new Blob([exportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${post.platform}_post_${post.id.slice(0, 8)}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting post:', err);
      addNotification({
        type: 'error',
        title: 'Eroare la export!',
        message: 'Nu am putut exporta postarea.',
        persistent: true,
      });
    }
  };

  const formatScheduledDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24 && diffInHours > 0) {
      return `Astăzi la ${date.toLocaleTimeString('ro-RO', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else if (diffInHours < 48 && diffInHours > 24) {
      return `Mâine la ${date.toLocaleTimeString('ro-RO', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else {
      return date.toLocaleDateString('ro-RO', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Programată';
      case 'published':
        return 'Publicată';
      case 'draft':
        return 'Ciornă';
      case 'failed':
        return 'Eșuată';
      default:
        return status;
    }
  };

  const getPlatformIcon = (platform: string) => {
    // Aici poți adăuga iconițe specifice pentru fiecare platformă
    switch (platform.toLowerCase()) {
      case 'facebook':
        return '📘';
      case 'instagram':
        return '📷';
      case 'twitter':
        return '🐦';
      case 'linkedin':
        return '💼';
      case 'tiktok':
        return '🎵';
      default:
        return '📱';
    }
  };

  return (
    <>
      <Card 
        className={`shadow-lg border-l-4 border-blue-400 ${className}`} 
        padding="md"
        hover="subtle"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getPlatformIcon(post.platform)}</span>
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <span>{post.platform}</span>
                <span 
                  className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(post.status)}`}
                >
                  {getStatusText(post.status)}
                </span>
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{formatScheduledDate(post.scheduled_at)}</span>
              </div>
            </div>
          </div>
          
          {!isEditing && (
            <div className="flex items-center space-x-1">
              {/* Vizualizare */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handlePreview}
                className="p-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                title="Previzualizează postarea"
              >
                <Eye className="h-4 w-4" />
              </Button>
              
              {/* Editare */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleStartEdit}
                className="p-2 hover:bg-green-50 hover:text-green-600 transition-colors"
                title="Editează postarea"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              
              {/* Export */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleExport}
                className="p-2 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                title="Exportă postarea"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <Card className="bg-red-50 border-red-200 mb-4" padding="sm">
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </Card>
        )}

        {/* Content */}
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conținutul postării pentru {post.platform}
              </label>
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={6}
                placeholder={`Editează conținutul pentru ${post.platform}...`}
                className="resize-none"
              />
              <div className="mt-2 text-xs text-gray-500">
                Caractere: {editedContent.length}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Anulează</span>
              </Button>
              <Button 
                onClick={handleSave} 
                loading={loading}
                disabled={editedContent.trim() === '' || editedContent === post.content}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Salvează modificările</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 border">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>
            </div>
            
            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>Programată: {formatScheduledDate(post.scheduled_at)}</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <span>ID: {post.id.slice(0, 8)}...</span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto" padding="lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getPlatformIcon(post.platform)}</span>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Previzualizare - {post.platform}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {formatScheduledDate(post.scheduled_at)}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsPreviewOpen(false)}
                className="p-2"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Preview Content */}
            <div className="space-y-4">
              <div className="bg-white border rounded-lg p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {post.platform.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Brandul tău</p>
                    <p className="text-xs text-gray-500">
                      {formatScheduledDate(post.scheduled_at)}
                    </p>
                  </div>
                </div>
                
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {post.content}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-gray-500">
                    <button className="flex items-center space-x-1 hover:text-blue-600">
                      <span>👍</span>
                      <span className="text-sm">Like</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-blue-600">
                      <span>💬</span>
                      <span className="text-sm">Comment</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-blue-600">
                      <span>📤</span>
                      <span className="text-sm">Share</span>
                    </button>
                  </div>
                  <span 
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(post.status)}`}
                  >
                    {getStatusText(post.status)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsPreviewOpen(false)}
                  className="flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Închide</span>
                </Button>
                <Button 
                  onClick={() => {
                    setIsPreviewOpen(false);
                    handleStartEdit();
                  }}
                  className="flex items-center space-x-2"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Editează</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};
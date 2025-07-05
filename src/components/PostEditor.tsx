import React, { useState } from 'react';
import { Save, X, Edit3, CheckCircle, AlertCircle, Clock, Calendar } from 'lucide-react';
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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleStartEdit}
            className="flex items-center space-x-2 micro-bounce"
          >
            <Edit3 className="h-4 w-4" />
            <span>Editează text</span>
          </Button>
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
  );
};
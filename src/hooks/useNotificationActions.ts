import { useNotifications } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

export const useNotificationActions = () => {
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  const notifySuccess = (title: string, message: string, persistent = false) => {
    addNotification({
      type: 'success',
      title,
      message,
      persistent,
      autoClose: !persistent,
      duration: 4000
    });
  };

  const notifyError = (title: string, message: string, persistent = false) => {
    addNotification({
      type: 'error',
      title,
      message,
      persistent,
      autoClose: false, // Errors should be manually dismissed
    });
  };

  const notifyWarning = (title: string, message: string, persistent = false) => {
    addNotification({
      type: 'warning',
      title,
      message,
      persistent,
      autoClose: !persistent,
      duration: 6000
    });
  };

  const notifyInfo = (title: string, message: string, persistent = false) => {
    addNotification({
      type: 'info',
      title,
      message,
      persistent,
      autoClose: !persistent,
      duration: 5000
    });
  };

  const notifyPlanGenerated = (planTitle: string) => {
    addNotification({
      type: 'success',
      title: 'Plan de marketing generat!',
      message: `Planul "${planTitle}" a fost creat cu succes și este gata de utilizare.`,
      persistent: true,
      action: {
        label: 'Vezi planul',
        onClick: () => navigate('/app/plans')
      }
    });
  };

  const notifyBrandVoiceUpdated = () => {
    addNotification({
      type: 'success',
      title: 'Vocea brandului actualizată!',
      message: 'Modificările au fost salvate. Toate planurile viitoare vor folosi noua voce.',
      persistent: true,
      action: {
        label: 'Vezi dashboard',
        onClick: () => navigate('/app/dashboard')
      }
    });
  };

  const notifyLimitReached = (type: 'plans' | 'content', limit: number) => {
    const resourceName = type === 'plans' ? 'planuri de marketing' : 'conținut';
    addNotification({
      type: 'warning',
      title: 'Limită atinsă',
      message: `Ai atins limita de ${limit} ${resourceName} pentru această lună. Upgrade pentru mai multe resurse.`,
      persistent: true,
      action: {
        label: 'Upgrade acum',
        onClick: () => navigate('/app/account')
      }
    });
  };

  const notifyAnalysisComplete = (score: number) => {
    const message = score >= 80 
      ? 'Vocea brandului tău este excelentă! Continuă să creezi conținut de calitate.'
      : score >= 60
      ? 'Vocea brandului tău este bună, dar poate fi îmbunătățită. Vezi recomandările AI.'
      : 'Vocea brandului tău necesită îmbunătățiri. AI-ul poate ajuta să o optimizezi.';

    addNotification({
      type: score >= 80 ? 'success' : score >= 60 ? 'info' : 'warning',
      title: 'Analiza vocii brandului completă',
      message,
      persistent: true,
      action: {
        label: 'Vezi analiza',
        onClick: () => navigate('/app/dashboard')
      }
    });
  };

  const notifySystemUpdate = (version: string, features: string[]) => {
    addNotification({
      type: 'info',
      title: `Univoice ${version} disponibil!`,
      message: `Noi funcționalități: ${features.slice(0, 2).join(', ')}${features.length > 2 ? ' și altele' : ''}.`,
      persistent: true,
      action: {
        label: 'Vezi noutăți',
        onClick: () => window.open('/changelog', '_blank')
      }
    });
  };

  const notifyMaintenanceScheduled = (date: string, duration: string) => {
    addNotification({
      type: 'warning',
      title: 'Mentenanță programată',
      message: `Sistemul va fi indisponibil pe ${date} pentru aproximativ ${duration}. Planifică-ți activitatea în consecință.`,
      persistent: true
    });
  };

  const notifyContentGenerated = (count: number, platform: string) => {
    addNotification({
      type: 'success',
      title: 'Conținut generat cu succes!',
      message: `${count} postări pentru ${platform} au fost generate și sunt gata de publicare.`,
      persistent: false,
      autoClose: true,
      duration: 4000
    });
  };

  return {
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    notifyPlanGenerated,
    notifyBrandVoiceUpdated,
    notifyLimitReached,
    notifyAnalysisComplete,
    notifySystemUpdate,
    notifyMaintenanceScheduled,
    notifyContentGenerated
  };
};
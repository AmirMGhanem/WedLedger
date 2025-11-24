/**
 * Notification translation helper
 * Provides translated notification titles and content based on language
 */

type NotificationType = 'invite' | 'permission_update' | 'revoked' | 'viewed' | 'accepted' | 'general';

interface NotificationTranslationParams {
  type: NotificationType;
  language: 'he' | 'en';
  childName?: string;
  parentName?: string;
  userName?: string;
  permission?: 'read' | 'read_write';
}

const translations = {
  he: {
    invite: {
      title: 'הזמנה חדשה',
      content: (childName: string, permission: string) => 
        `${childName} הזמין אותך לשתף את הספר שלו עם הרשאה של ${permission === 'read' ? 'קריאה בלבד' : 'קריאה וכתיבה'}.`,
    },
    permission_update: {
      title: 'הרשאה עודכנה',
      content: (childName: string, permission: string) =>
        `${childName} עדכן את הרשאת הגישה שלך ל-${permission === 'read' ? 'קריאה בלבד' : 'קריאה וכתיבה'}.`,
    },
    revoked: {
      title: 'גישה בוטלה',
      content: (userName: string) =>
        `${userName} ביטל את הגישה לספר שלו.`,
    },
    viewed: {
      title: 'הספר נצפה',
      content: (parentName: string) =>
        `${parentName} צופה בספר שלך.`,
    },
    accepted: {
      title: 'הזמנה אושרה',
      content: (parentName: string) =>
        `${parentName} אישר את ההזמנה שלך ויכול כעת לגשת לספר שלך.`,
    },
  },
  en: {
    invite: {
      title: 'New Invite Request',
      content: (childName: string, permission: string) =>
        `${childName} has invited you to share their ledger with ${permission === 'read' ? 'read-only' : 'read & write'} permission.`,
    },
    permission_update: {
      title: 'Permission Updated',
      content: (childName: string, permission: string) =>
        `${childName} has updated your access permission to ${permission === 'read' ? 'read-only' : 'read & write'}.`,
    },
    revoked: {
      title: 'Access Revoked',
      content: (userName: string) =>
        `${userName} has revoked access to their ledger.`,
    },
    viewed: {
      title: 'Ledger Viewed',
      content: (parentName: string) =>
        `${parentName} is viewing your ledger.`,
    },
    accepted: {
      title: 'Invite Accepted',
      content: (parentName: string) =>
        `${parentName} has accepted your invite and can now access your ledger.`,
    },
  },
};

export function getNotificationTranslation(params: NotificationTranslationParams): { title: string; content: string } {
  const lang = params.language || 'he';
  const langTranslations = translations[lang] || translations.he;
  
  const typeTranslations = langTranslations[params.type as keyof typeof langTranslations];
  
  if (!typeTranslations) {
    // Fallback
    return {
      title: params.type,
      content: '',
    };
  }

  let content = '';
  
  switch (params.type) {
    case 'invite':
      content = typeTranslations.content(
        params.childName || 'Someone',
        params.permission === 'read' ? 'read' : 'read_write'
      );
      break;
    case 'permission_update':
      content = typeTranslations.content(
        params.childName || 'The user',
        params.permission === 'read' ? 'read' : 'read_write'
      );
      break;
    case 'revoked':
      content = typeTranslations.content(params.userName || 'Someone');
      break;
    case 'viewed':
      content = typeTranslations.content(params.parentName || 'Someone');
      break;
    case 'accepted':
      content = typeTranslations.content(params.parentName || 'Someone');
      break;
    default:
      content = '';
  }

  return {
    title: typeTranslations.title,
    content,
  };
}


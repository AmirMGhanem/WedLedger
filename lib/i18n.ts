import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      // Common
      'app.name': 'WedLedger',
      'common.loading': 'Loading...',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.close': 'Close',
      'common.add': 'Add',
      'common.back': 'Back',
      
      // Navigation
      'nav.myGifts': 'My Gifts',
      'nav.analytics': 'Analytics',
      'nav.familyMembers': 'Family Members',
      'nav.logout': 'Logout',
      
      // Login Page
      'login.title': 'Sign in to WedLedger',
      'login.phoneLabel': 'Phone Number',
      'login.phonePlaceholder': '+1234567890',
      'login.sendOtp': 'Send OTP',
      'login.sending': 'Sending...',
      'login.otpLabel': 'Enter OTP',
      'login.otpPlaceholder': '123456',
      'login.otpHelper': 'Enter the 6-digit code (check console for demo)',
      'login.verify': 'Verify OTP',
      'login.verifying': 'Verifying...',
      'login.demoMode': 'Demo Mode: OTP will be shown in browser console (F12)',
      'login.errorSendOtp': 'Failed to send OTP. Please try again.',
      
      // Dashboard
      'dashboard.noGifts': 'No gifts tracked yet',
      'dashboard.addFirstGift': 'Tap the + button to add your first gift',
      
      // Add Gift
      'addGift.title': 'Add Gift',
      'addGift.date': 'Date',
      'addGift.amount': 'Amount',
      'addGift.currency': 'Currency',
      'addGift.recipient': 'Recipient Name',
      'addGift.giftFrom': 'Gift From (Family Member)',
      'addGift.required': '*',
      'addGift.noFamily': 'No family members found. Please add family members from the Family page before adding gifts.',
      'addGift.success': 'Gift saved successfully!',
      'addGift.errorSelectMember': 'Please select a family member',
      'addGift.errorSave': 'Failed to save gift',
      'addGift.saving': 'Saving...',
      
      // Family Page
      'family.title': 'Family Members',
      'family.addMember': 'Add Member',
      'family.noMembers': 'No family members added yet',
      'family.editTitle': 'Edit Family Member',
      'family.addTitle': 'Add Family Member',
      'family.nameLabel': 'Name',
      'family.colorLabel': 'Color',
      'family.errorName': 'Name is required',
      'family.errorSave': 'Failed to save family member',
      'family.deleteConfirm': 'Are you sure you want to delete this family member?',
      
      // Analytics
      'analytics.title': 'Analytics Dashboard',
      'analytics.totalGifts': 'Total Gifts',
      'analytics.totalAmount': 'Total Amount',
      'analytics.totalRecipients': 'Total Recipients',
      'analytics.avgGift': 'Average Gift',
      'analytics.byMember': 'Gifts by Family Member',
      'analytics.amountByMember': 'Amount by Family Member',
      'analytics.overTime': 'Gifts Over Time',
      'analytics.topRecipients': 'Top Recipients',
      'analytics.multipleGifts': 'Recipients with Multiple Gifts',
      'analytics.gifts': 'gifts',
      'analytics.noData': 'No data available yet',
      'analytics.addGifts': 'Add some gifts to see analytics',
      
      // Gift Details Modal
      'giftDetails.title': 'Gift Details',
      'giftDetails.recipient': 'Recipient',
      'giftDetails.from': 'From',
      'giftDetails.amount': 'Amount',
      'giftDetails.date': 'Date',
      'giftDetails.editGift': 'Edit Gift',
      'giftDetails.deleteConfirm': 'Are you sure you want to delete this gift?',
      'giftDetails.errorDelete': 'Failed to delete gift',
      'giftDetails.errorUpdate': 'Failed to update gift',
      'giftDetails.saveChanges': 'Save Changes',
      
      // Colors
      'color.pink': 'Pink',
      'color.purple': 'Purple',
      'color.blue': 'Blue',
      'color.cyan': 'Cyan',
      'color.teal': 'Teal',
      'color.green': 'Green',
      'color.orange': 'Orange',
      'color.red': 'Red',
      'color.brown': 'Brown',
      'color.grey': 'Grey',
    },
  },
  he: {
    translation: {
      // Common
      'app.name': 'פנקס חתונה',
      'common.loading': 'טוען...',
      'common.save': 'שמור',
      'common.cancel': 'ביטול',
      'common.delete': 'מחק',
      'common.edit': 'ערוך',
      'common.close': 'סגור',
      'common.add': 'הוסף',
      'common.back': 'חזור',
      
      // Navigation
      'nav.myGifts': 'המתנות שלי',
      'nav.analytics': 'ניתוח נתונים',
      'nav.familyMembers': 'בני משפחה',
      'nav.logout': 'התנתק',
      
      // Login Page
      'login.title': 'התחבר לפנקס חתונה',
      'login.phoneLabel': 'מספר טלפון',
      'login.phonePlaceholder': '+972501234567',
      'login.sendOtp': 'שלח קוד',
      'login.sending': 'שולח...',
      'login.otpLabel': 'הזן קוד',
      'login.otpPlaceholder': '123456',
      'login.otpHelper': 'הזן את הקוד בן 6 הספרות (בדוק בקונסול)',
      'login.verify': 'אמת קוד',
      'login.verifying': 'מאמת...',
      'login.demoMode': 'מצב הדגמה: הקוד יוצג בקונסול הדפדפן (F12)',
      'login.errorSendOtp': 'שליחת הקוד נכשלה. נסה שוב.',
      
      // Dashboard
      'dashboard.noGifts': 'אין עדיין מתנות רשומות',
      'dashboard.addFirstGift': 'לחץ על + להוספת המתנה הראשונה',
      
      // Add Gift
      'addGift.title': 'הוסף מתנה',
      'addGift.date': 'תאריך',
      'addGift.amount': 'סכום',
      'addGift.currency': 'מטבע',
      'addGift.recipient': 'שם המקבל',
      'addGift.giftFrom': 'מתנה מ (בן משפחה)',
      'addGift.required': '*',
      'addGift.noFamily': 'לא נמצאו בני משפחה. אנא הוסף בני משפחה מעמוד המשפחה לפני הוספת מתנות.',
      'addGift.success': 'המתנה נשמרה בהצלחה!',
      'addGift.errorSelectMember': 'אנא בחר בן משפחה',
      'addGift.errorSave': 'שמירת המתנה נכשלה',
      'addGift.saving': 'שומר...',
      
      // Family Page
      'family.title': 'בני משפחה',
      'family.addMember': 'הוסף בן משפחה',
      'family.noMembers': 'עדיין לא נוספו בני משפחה',
      'family.editTitle': 'ערוך בן משפחה',
      'family.addTitle': 'הוסף בן משפחה',
      'family.nameLabel': 'שם',
      'family.colorLabel': 'צבע',
      'family.errorName': 'שם הוא שדה חובה',
      'family.errorSave': 'שמירת בן המשפחה נכשלה',
      'family.deleteConfirm': 'האם אתה בטוח שברצונך למחוק את בן המשפחה?',
      
      // Analytics
      'analytics.title': 'לוח בקרה - ניתוח נתונים',
      'analytics.totalGifts': 'סה״כ מתנות',
      'analytics.totalAmount': 'סכום כולל',
      'analytics.totalRecipients': 'סה״כ מקבלים',
      'analytics.avgGift': 'ממוצע מתנה',
      'analytics.byMember': 'מתנות לפי בן משפחה',
      'analytics.amountByMember': 'סכום לפי בן משפחה',
      'analytics.overTime': 'מתנות לאורך זמן',
      'analytics.topRecipients': 'מקבלים מובילים',
      'analytics.multipleGifts': 'מקבלים עם מספר מתנות',
      'analytics.gifts': 'מתנות',
      'analytics.noData': 'אין עדיין נתונים זמינים',
      'analytics.addGifts': 'הוסף מתנות כדי לראות ניתוח',
      
      // Gift Details Modal
      'giftDetails.title': 'פרטי מתנה',
      'giftDetails.recipient': 'מקבל',
      'giftDetails.from': 'מאת',
      'giftDetails.amount': 'סכום',
      'giftDetails.date': 'תאריך',
      'giftDetails.editGift': 'ערוך מתנה',
      'giftDetails.deleteConfirm': 'האם אתה בטוח שברצונך למחוק את המתנה?',
      'giftDetails.errorDelete': 'מחיקת המתנה נכשלה',
      'giftDetails.errorUpdate': 'עדכון המתנה נכשל',
      'giftDetails.saveChanges': 'שמור שינויים',
      
      // Colors
      'color.pink': 'ורוד',
      'color.purple': 'סגול',
      'color.blue': 'כחול',
      'color.cyan': 'טורקיז',
      'color.teal': 'טורקיז כהה',
      'color.green': 'ירוק',
      'color.orange': 'כתום',
      'color.red': 'אדום',
      'color.brown': 'חום',
      'color.grey': 'אפור',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'he', // Default to Hebrew
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;


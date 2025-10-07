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
      'nav.eventTypes': 'Event Types',
      'nav.giftTypes': 'Gift Types',
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
      'login.testingOtp': 'Testing OTP:',
      'login.errorSendOtp': 'Failed to send OTP. Please try again.',
      
      // Dashboard
      'dashboard.noGifts': 'No gifts tracked yet',
      'dashboard.addFirstGift': 'Tap the + button to add your first gift',
      'dashboard.search': 'Search gifts...',
      'dashboard.filterBy': 'Filter By',
      'dashboard.sortBy': 'Sort By',
      'dashboard.allDirections': 'All Directions',
      'dashboard.allEventTypes': 'All Event Types',
      'dashboard.allGiftTypes': 'All Gift Types',
      'dashboard.allFamilyMembers': 'All Family Members',
      'dashboard.sortDateDesc': 'Date (Newest First)',
      'dashboard.sortDateAsc': 'Date (Oldest First)',
      'dashboard.sortAmountDesc': 'Amount (High to Low)',
      'dashboard.sortAmountAsc': 'Amount (Low to High)',
      'dashboard.sortRecipient': 'Recipient (A-Z)',
      'dashboard.clearFilters': 'Clear Filters',
      
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
      
      // Event Types Page
      'eventTypes.title': 'Event Types',
      'eventTypes.addType': 'Add Event Type',
      'eventTypes.noTypes': 'No event types added yet',
      'eventTypes.examples': 'e.g., Wedding, Birthday, Anniversary',
      'eventTypes.editTitle': 'Edit Event Type',
      'eventTypes.addTitle': 'Add Event Type',
      'eventTypes.nameLabel': 'Event Name',
      'eventTypes.namePlaceholder': 'e.g., Wedding, Birthday, Anniversary',
      'eventTypes.deleteConfirm': 'Are you sure you want to delete this event type?',
      'eventTypes.errorSave': 'Failed to save event type',
      'eventTypes.errorName': 'Name is required',
      
      // Gift Types Page
      'giftTypes.title': 'Gift Types',
      'giftTypes.addType': 'Add Gift Type',
      'giftTypes.noTypes': 'No gift types added yet',
      'giftTypes.examples': 'e.g., Cash, Jewelry, Home Decor, Electronics',
      'giftTypes.editTitle': 'Edit Gift Type',
      'giftTypes.addTitle': 'Add Gift Type',
      'giftTypes.nameLabel': 'Gift Type Name',
      'giftTypes.namePlaceholder': 'e.g., Cash, Jewelry, Home Decor',
      'giftTypes.deleteConfirm': 'Are you sure you want to delete this gift type?',
      'giftTypes.errorSave': 'Failed to save gift type',
      'giftTypes.errorName': 'Name is required',
      
      // Gift Form Fields
      'gift.direction': 'Gift Direction',
      'gift.given': 'Given',
      'gift.received': 'Received',
      'gift.eventType': 'Event Type',
      'gift.giftType': 'Gift Type',
      'gift.eventTypePlaceholder': 'e.g., Wedding, Birthday',
      'gift.giftTypePlaceholder': 'e.g., Cash, Jewelry',
      'gift.notes': 'Notes',
      'gift.notesPlaceholder': 'Add any additional notes here...',
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
      'nav.eventTypes': 'סוגי אירועים',
      'nav.giftTypes': 'סוגי מתנות',
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
      'login.testingOtp': 'קוד לבדיקה:',
      'login.errorSendOtp': 'שליחת הקוד נכשלה. נסה שוב.',
      
      // Dashboard
      'dashboard.noGifts': 'אין עדיין מתנות רשומות',
      'dashboard.addFirstGift': 'לחץ על + להוספת המתנה הראשונה',
      'dashboard.search': 'חיפוש מתנות...',
      'dashboard.filterBy': 'סנן לפי',
      'dashboard.sortBy': 'מיין לפי',
      'dashboard.allDirections': 'כל הכיוונים',
      'dashboard.allEventTypes': 'כל סוגי האירועים',
      'dashboard.allGiftTypes': 'כל סוגי המתנות',
      'dashboard.allFamilyMembers': 'כל בני המשפחה',
      'dashboard.sortDateDesc': 'תאריך (החדש ביותר)',
      'dashboard.sortDateAsc': 'תאריך (הישן ביותר)',
      'dashboard.sortAmountDesc': 'סכום (גבוה לנמוך)',
      'dashboard.sortAmountAsc': 'סכום (נמוך לגבוה)',
      'dashboard.sortRecipient': 'נמען (א-ת)',
      'dashboard.clearFilters': 'נקה מסננים',
      
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
      
      // Event Types Page
      'eventTypes.title': 'סוגי אירועים',
      'eventTypes.addType': 'הוסף סוג אירוע',
      'eventTypes.noTypes': 'עדיין לא נוספו סוגי אירועים',
      'eventTypes.examples': 'לדוגמה: חתונה, יום הולדת, יום נישואין',
      'eventTypes.editTitle': 'ערוך סוג אירוע',
      'eventTypes.addTitle': 'הוסף סוג אירוע',
      'eventTypes.nameLabel': 'שם האירוע',
      'eventTypes.namePlaceholder': 'לדוגמה: חתונה, יום הולדת, יום נישואין',
      'eventTypes.deleteConfirm': 'האם אתה בטוח שברצונך למחוק את סוג האירוע?',
      'eventTypes.errorSave': 'שמירת סוג האירוע נכשלה',
      'eventTypes.errorName': 'שם הוא שדה חובה',
      
      // Gift Types Page
      'giftTypes.title': 'סוגי מתנות',
      'giftTypes.addType': 'הוסף סוג מתנה',
      'giftTypes.noTypes': 'עדיין לא נוספו סוגי מתנות',
      'giftTypes.examples': 'לדוגמה: מזומן, תכשיטים, עיצוב הבית, אלקטרוניקה',
      'giftTypes.editTitle': 'ערוך סוג מתנה',
      'giftTypes.addTitle': 'הוסף סוג מתנה',
      'giftTypes.nameLabel': 'שם סוג המתנה',
      'giftTypes.namePlaceholder': 'לדוגמה: מזומן, תכשיטים, עיצוב הבית',
      'giftTypes.deleteConfirm': 'האם אתה בטוח שברצונך למחוק את סוג המתנה?',
      'giftTypes.errorSave': 'שמירת סוג המתנה נכשלה',
      'giftTypes.errorName': 'שם הוא שדה חובה',
      
      // Gift Form Fields
      'gift.direction': 'כיוון המתנה',
      'gift.given': 'נתתי',
      'gift.received': 'קיבלתי',
      'gift.eventType': 'סוג אירוע',
      'gift.giftType': 'סוג מתנה',
      'gift.eventTypePlaceholder': 'לדוגמה: חתונה, יום הולדת',
      'gift.giftTypePlaceholder': 'לדוגמה: מזומן, תכשיטים',
      'gift.notes': 'הערות',
      'gift.notesPlaceholder': 'הוסף הערות נוספות כאן...',
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


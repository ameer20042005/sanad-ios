import { I18nManager, Platform } from 'react-native';

/**
 * إعدادات دعم اللغة العربية و RTL
 * RTL إجباري دائماً - يقلب التطبيق بالكامل تلقائياً
 * لا يعتمد على لغة الجهاز - ثابت دائماً
 */
export const setupRTL = () => {
  console.log('🔄 فحص حالة RTL الحالية:', I18nManager.isRTL);

  // فرض RTL دائماً بغض النظر عن لغة الجهاز
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);

  // إذا لم يكن RTL مفعل بالفعل، استخدم DevSettings لإعادة التحميل
  if (!I18nManager.isRTL) {
    console.log('⚠️ RTL غير مفعل! جاري إعادة التحميل...');

    // إعادة تحميل التطبيق تلقائياً في بيئة التطوير
    if (Platform.OS !== 'web' && __DEV__) {
      try {
        const DevSettings = require('react-native').DevSettings;
        if (DevSettings && DevSettings.reload) {
          setTimeout(() => {
            DevSettings.reload();
          }, 100);
        }
      } catch (error) {
        console.warn('⚠️ لم نتمكن من إعادة التحميل تلقائياً. يرجى إعادة تشغيل التطبيق يدوياً.');
      }
    }
    console.log('✅ RTL تم تفعيله! جاري إعادة التحميل...');
  } else {
    console.log('✅ RTL مفعل بالفعل - التطبيق يعمل من اليمين لليسار');
  }
};

/**
 * التحقق من حالة RTL
 */
export const isRTL = () => {
  return I18nManager.isRTL;
};

/**
 * الحصول على اتجاه النص
 */
export const getWritingDirection = () => {
  return I18nManager.isRTL ? 'rtl' : 'ltr';
};

/**
 * أنماط خاصة بـ RTL
 */
export const rtlStyles = {
  textAlign: 'right' as const,
  writingDirection: 'rtl' as const,
  flexDirection: 'row-reverse' as const,
};
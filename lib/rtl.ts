import { I18nManager, Platform } from 'react-native';

// متغير لتتبع ما إذا كنا قد حاولنا إعادة التحميل بالفعل
let hasTriedReload = false;

/**
 * إعدادات دعم اللغة العربية و RTL
 * RTL إجباري دائماً - يقلب التطبيق بالكامل تلقائياً
 * لا يعتمد على لغة الجهاز - ثابت دائماً
 */
export const setupRTL = () => {
  // فرض RTL دائماً بغض النظر عن لغة الجهاز
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);

  // في React Native، forceRTL يحتاج إلى إعادة تحميل ليعمل
  // إذا لم يكن RTL مفعل بعد، نحاول إعادة التحميل في بيئة التطوير (مرة واحدة فقط)
  if (!I18nManager.isRTL && Platform.OS !== 'web' && !hasTriedReload) {
    hasTriedReload = true;
    
    // محاولة إعادة التحميل في بيئة التطوير
    if (__DEV__) {
      try {
        // استخدام NativeModules لإعادة التحميل
        const { NativeModules } = require('react-native');
        if (NativeModules.DevSettings && NativeModules.DevSettings.reload) {
          console.log('🔄 إعادة تحميل التطبيق لتفعيل RTL...');
          setTimeout(() => {
            NativeModules.DevSettings.reload();
          }, 300);
          return;
        }
      } catch (error) {
        // تجاهل الأخطاء في محاولة إعادة التحميل
      }
    }
  }
  
  // إذا كان RTL مفعل، نؤكد ذلك
  if (I18nManager.isRTL) {
    console.log('✅ RTL مفعل - التطبيق يعمل من اليمين لليسار');
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
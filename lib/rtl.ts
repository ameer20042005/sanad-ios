import { I18nManager } from 'react-native';

/**
 * إعدادات دعم اللغة العربية و RTL
 * RTL اختياري - يتبع إعدادات النظام واللغة
 */
export const setupRTL = () => {
  // السماح بدعم RTL (بدون إجبار)
  I18nManager.allowRTL(true);
  // لا نستخدم forceRTL - نترك النظام يقرر بناءً على اللغة
  // I18nManager.forceRTL(true); // تم إزالة الإجبار
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
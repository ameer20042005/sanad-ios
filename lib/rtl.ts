import { I18nManager } from 'react-native';

/**
 * إعدادات دعم اللغة العربية و RTL
 */
export const setupRTL = () => {
  // تفعيل دعم RTL
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
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
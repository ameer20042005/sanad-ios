/**
 * مساعد التنقل - يوفر دوال للتنقل الآمن والمنطقي في التطبيق
 */
import { router } from 'expo-router';

export class NavigationHelper {
  /**
   * العودة للخلف بطريقة آمنة
   * إذا لم يكن هناك صفحة سابقة، يذهب إلى الصفحة الرئيسية
   */
  static safeGoBack() {
    try {
      if (router.canGoBack && router.canGoBack()) {
        router.back();
      } else {
        router.push('/(tabs)');
      }
    } catch (error) {
      console.warn('خطأ في العودة للخلف:', error);
      router.push('/(tabs)');
    }
  }

  /**
   * الذهاب إلى الصفحة الرئيسية
   */
  static goHome() {
    router.push('/(tabs)');
  }

  /**
   * الذهاب إلى صفحة تسجيل الدخول
   */
  static goToLogin() {
    router.push('/login');
  }

  /**
   * الذهاب إلى صفحة التسجيل
   */
  static goToRegister() {
    router.push('/register');
  }

  /**
   * الذهاب إلى الملف الشخصي
   */
  static goToProfile() {
    router.push('/profile');
  }

  /**
   * استبدال الصفحة الحالية (لا يمكن العودة إليها)
   */
  static replaceWith(route: string) {
    router.replace(route as any);
  }

  /**
   * دفع صفحة جديدة
   */
  static pushTo(route: string) {
    router.push(route as any);
  }
}

export default NavigationHelper;
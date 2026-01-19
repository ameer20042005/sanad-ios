import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/contexts/AuthContext';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { setupRTL } from '@/lib/rtl';
import { Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import ErrorBoundary from '@/components/ErrorBoundary';
import AuthNavigator from '@/components/AuthNavigator';
import { 
  registerForPushNotificationsAsync,
  setupBackgroundNotificationHandler 
} from '@/lib/notificationService';

// منع إخفاء Splash Screen تلقائياً حتى نكون جاهزين
SplashScreen.preventAutoHideAsync();

// إضافة معالج عام للأخطاء غير المتوقعة
if (Platform.OS !== 'web') {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    // تحويل جميع الوسائط إلى سلسلة نصية للتحقق
    const message = args
      .map(arg => {
        if (typeof arg === 'object' && arg !== null) {
          // إذا كان كائن خطأ، افحص message و details
          const errorMessage = arg?.message || '';
          const errorDetails = arg?.details || '';
          const errorCode = arg?.code || '';
          return `${errorMessage} ${errorDetails} ${errorCode}`.toLowerCase();
        }
        return String(arg).toLowerCase();
      })
      .join(' ');
    
    // قمع أخطاء غير حرجة
    if (
      message.includes('keep awake') || 
      message.includes('unable to activate') || 
      message.includes('uncaught (in promise)') ||
      message.includes('network request failed') ||
      message.includes('network error') ||
      message.includes('fetch failed') ||
      message.includes('typeerror: network') ||
      message.includes('search error') && (message.includes('network') || message.includes('fetch'))
    ) {
      // فقط قمع أخطاء الشبكة غير الحرجة، لكن سجلها كتحذير
      if (message.includes('network') || message.includes('fetch')) {
        // قمع أخطاء الشبكة تماماً لأنها غير حرجة وتم معالجتها في الكود
        return;
      } else {
        console.warn('Suppressed keep-awake error:', ...args);
        return;
      }
    }
    originalConsoleError(...args);
  };

  // معالجة الأخطاء غير المعالجة في Promise
  if (typeof globalThis !== 'undefined' && globalThis.addEventListener) {
    globalThis.addEventListener('unhandledrejection', (event: any) => {
      const message = event.reason?.message?.toLowerCase() || '';
      if (
        message.includes('keep awake') || 
        message.includes('unable to activate') ||
        message.includes('network request failed') ||
        message.includes('network error') ||
        message.includes('fetch failed')
      ) {
        // قمع أخطاء الشبكة غير الحرجة
        if (message.includes('network') || message.includes('fetch')) {
          console.warn('⚠️ خطأ في الشبكة غير معالج (غير حرج):', event.reason);
        } else {
          console.warn('Suppressed unhandled keep-awake promise rejection:', event.reason);
        }
        event.preventDefault();
        return;
      }
    });
  }
}

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#DC2626',
    primaryContainer: '#FEE2E2',
    secondary: '#E53E3E',
    surface: '#FFFFFF',
    background: '#F9FAFB',
  },
};

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  useFrameworkReady();
  
  // إعداد RTL للتطبيق بالكامل
  useEffect(() => {
    let mounted = true;
    
    const initializeApp = async () => {
      try {
        // إعداد RTL
        setupRTL();
      } catch (error: any) {
        console.warn('⚠️ خطأ في إعداد RTL (غير حرج):', error?.message || error);
      }
      
      // إعداد Background Notification Handler (مهم للإشعارات عندما التطبيق مغلق)
      try {
        setupBackgroundNotificationHandler();
      } catch (error: any) {
        console.warn('⚠️ خطأ في إعداد Background Notification Handler (غير حرج):', error?.message || error);
      }
      
      // تسجيل الإشعارات الفورية (Local فقط - يعمل في Expo Go)
      // تأخير بسيط لضمان أن التطبيق جاهز تماماً
      setTimeout(async () => {
        if (!mounted) return;
        
        try {
          // فحص أننا على iOS/Android وليس web
          if (Platform.OS === 'web') {
            console.log('ℹ️ الإشعارات غير مدعومة على الويب');
            return;
          }
          
          const result = await registerForPushNotificationsAsync();
          if (result && mounted) {
            console.log('✅ تم تسجيل الإشعارات بنجاح:', result);
            console.log('📱 الإشعارات ستعمل حتى لو كان التطبيق مغلق');
          }
        } catch (error: any) {
          // تجاهل أخطاء Push Notifications - لا يجب أن تسبب crash
          const errorMessage = error?.message?.toLowerCase() || '';
          if (errorMessage.includes('permission') || errorMessage.includes('notification')) {
            console.warn('⚠️ تحذير الإشعارات (غير حرج):', error.message);
          } else {
            console.warn('⚠️ خطأ في تسجيل الإشعارات (غير حرج):', error?.message || error);
          }
        }
      }, 500); // تأخير 500ms لضمان أن التطبيق جاهز
      
      // إخفاء Splash Screen بعد تهيئة التطبيق
      if (mounted) {
        try {
          await SplashScreen.hideAsync();
          setAppIsReady(true);
        } catch (error: any) {
          console.warn('⚠️ خطأ في إخفاء Splash Screen (غير حرج):', error?.message || error);
          setAppIsReady(true); // نكمل حتى لو فشل إخفاء Splash Screen
        }
      }
    };
    
    initializeApp();
    
    return () => {
      mounted = false;
    };
    
    // إزالة keep awake مؤقتاً لتجنب الأخطاء
    // يمكن إعادة تفعيله لاحقاً عند حل المشكلة
    /*
    if (__DEV__ && Platform.OS !== 'web') {
      const timeoutId = setTimeout(async () => {
        try {
          const { activateKeepAwakeAsync } = await import('expo-keep-awake');
          await activateKeepAwakeAsync('development');
          console.log('Keep awake activated successfully');
        } catch (error: any) {
          console.warn('Warning: Could not activate keep awake:', error?.message || error);
        }
      }, 1000);
      
      return () => {
        clearTimeout(timeoutId);
        const deactivateKeepAwakeSafely = async () => {
          try {
            const { deactivateKeepAwake } = await import('expo-keep-awake');
            deactivateKeepAwake('development');
            console.log('Keep awake deactivated successfully');
          } catch (error: any) {
            console.warn('Warning: Could not deactivate keep awake:', error?.message || error);
          }
        };
        deactivateKeepAwakeSafely();
      };
    }
    */
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <AuthProvider>
            <AuthNavigator>
              <Stack 
                screenOptions={{ headerShown: false }}
                initialRouteName="index">
                {/* الصفحة الرئيسية للتوجيه */}
                <Stack.Screen name="index" options={{ headerShown: false }} />
                
                {/* صفحات المصادقة والتسجيل */}
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="register" options={{ headerShown: false }} />
                <Stack.Screen name="welcome" options={{ headerShown: false }} />
                
                {/* الصفحات الرئيسية */}
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="blood-donation-form" options={{ headerShown: false }} />
                <Stack.Screen name="about" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
            </AuthNavigator>
          </AuthProvider>
          <StatusBar style="auto" />
        </PaperProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

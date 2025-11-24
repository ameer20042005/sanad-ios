import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/contexts/AuthContext';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { setupRTL } from '@/lib/rtl';
import { Platform } from 'react-native';
import ErrorBoundary from '@/components/ErrorBoundary';
import AuthNavigator from '@/components/AuthNavigator';
import { 
  registerForPushNotificationsAsync,
  setupBackgroundNotificationHandler 
} from '@/lib/notificationService';

// إضافة معالج عام للأخطاء غير المتوقعة
if (Platform.OS !== 'web') {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const message = args.join(' ').toLowerCase();
    if (message.includes('keep awake') || message.includes('unable to activate') || message.includes('uncaught (in promise')) {
      console.warn('Suppressed keep-awake error:', ...args);
      return;
    }
    originalConsoleError(...args);
  };

  // معالجة الأخطاء غير المعالجة في Promise
  if (typeof globalThis !== 'undefined' && globalThis.addEventListener) {
    globalThis.addEventListener('unhandledrejection', (event: any) => {
      const message = event.reason?.message?.toLowerCase() || '';
      if (message.includes('keep awake') || message.includes('unable to activate')) {
        console.warn('Suppressed unhandled keep-awake promise rejection:', event.reason);
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
  useFrameworkReady();
  
  // إعداد RTL للتطبيق بالكامل
  useEffect(() => {
    setupRTL();
    
    // إعداد Background Notification Handler (مهم للإشعارات عندما التطبيق مغلق)
    setupBackgroundNotificationHandler();
    
    // تسجيل الإشعارات الفورية (Local فقط - يعمل في Expo Go)
    registerForPushNotificationsAsync()
      .then(result => {
        if (result) {
          console.log('✅ تم تسجيل الإشعارات بنجاح:', result);
          console.log('📱 الإشعارات ستعمل حتى لو كان التطبيق مغلق');
        }
      })
      .catch(error => {
        // تجاهل أخطاء Push Notifications في Expo Go
        console.warn('⚠️ تحذير الإشعارات (يمكن تجاهله في Expo Go):', error.message);
      });
    
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
                <Stack.Screen name="auth/account-register" options={{ headerShown: false }} />
                <Stack.Screen name="auth/forgot-password" options={{ headerShown: false }} />
                
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

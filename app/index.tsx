import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function IndexScreen() {
  const { profile, loading, isGuest } = useAuth();

  useEffect(() => {
    let mounted = true;
    
    // تأخير بسيط لضمان أن التطبيق جاهز تماماً
    const navigate = async () => {
      // انتظار حتى ينتهي التحميل
      if (loading) {
        console.log('⏳ [Index] جاري التحميل...');
        return;
      }

      // تأخير إضافي صغير لضمان أن router جاهز
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!mounted) return;

      console.log('🔍 [Index] التحقق من الحالة:', { profile: !!profile, isGuest });

      try {
        if (profile) {
          console.log('✅ [Index] مستخدم مسجل، الذهاب إلى التطبيق');
          router.replace('/(tabs)');
          return;
        }

        if (isGuest) {
          console.log('👤 [Index] وضع الضيف، الذهاب إلى التطبيق');
          router.replace('/(tabs)');
          return;
        }

        console.log('🔐 [Index] لا يوجد مستخدم، الذهاب إلى تسجيل الدخول');
        router.replace('/login');
      } catch (error: any) {
        console.error('❌ [Index] خطأ في التوجيه:', error?.message || error);
        // في حالة الخطأ، نعيد المحاولة بعد تأخير
        setTimeout(() => {
          if (mounted) {
            try {
              router.replace('/login');
            } catch (retryError) {
              console.error('❌ [Index] فشل إعادة المحاولة:', retryError);
            }
          }
        }, 500);
      }
    };

    navigate();

    return () => {
      mounted = false;
    };
  }, [profile, loading, isGuest]);

  // عرض شاشة تحميل بسيطة
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#DC2626" />
      <Text style={styles.loadingText}>جاري تحميل التطبيق...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});
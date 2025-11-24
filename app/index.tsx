import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function IndexScreen() {
  const { profile, loading, isGuest } = useAuth();

  useEffect(() => {
    if (loading) {
      console.log('⏳ [Index] جاري التحميل...');
      return;
    }

    console.log('🔍 [Index] التحقق من الحالة:', { profile: !!profile, isGuest });

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
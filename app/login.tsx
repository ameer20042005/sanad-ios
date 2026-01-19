import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import NoInternetModal from '@/components/NoInternetModal';

export default function AuthScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNoInternetModal, setShowNoInternetModal] = useState(false);
  const { signInWithPhone, continueAsGuest } = useAuth();
  const { hasInternetConnection } = useNetworkStatus();
  const handleDemoAccount = async () => {
    try {
      console.log('🔵 بدء تسجيل الدخول بحساب Demo...');
      setLoading(true);
      const demoPhone = '07000001001';
      const result = await signInWithPhone(demoPhone);

      if (result.success) {
        console.log('✅ تم تسجيل الدخول بحساب Demo');
        router.replace('/(tabs)');
      } else if (result.needsRegistration) {
        Alert.alert('خطأ', 'حساب Demo غير مسجل في النظام.');
      } else {
        Alert.alert('خطأ', result.error || 'تعذر تسجيل الدخول بحساب Demo');
      }
    } catch (error) {
      console.error('❌ خطأ في handleDemoAccount:', error);
      Alert.alert('خطأ', 'تعذر تسجيل الدخول بحساب Demo، يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };


  const handleAuth = async () => {
    // التحقق من الاتصال بالإنترنت
    if (!(await hasInternetConnection())) {
      setShowNoInternetModal(true);
      return;
    }

    if (!phone) {
      Alert.alert('خطأ', 'يرجى إدخال رقم الهاتف');
      return;
    }

    // التحقق من صحة رقم الهاتف العراقي
    const phoneRegex = /^(07[3-9]\d{8}|07[0-2]\d{8})$/;
    if (!phoneRegex.test(phone.trim())) {
      Alert.alert('خطأ', 'يرجى إدخال رقم هاتف عراقي صحيح (مثال: 07901234567)');
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithPhone(phone.trim());

      if (result.success) {
        Alert.alert('نجح', 'تم تسجيل الدخول بنجاح');
        router.replace('/(tabs)');
      } else if (result.needsRegistration) {
        // رقم الهاتف غير موجود - التوجيه لصفحة التسجيل
        Alert.alert(
          'رقم غير مسجل',
          'هذا الرقم غير مسجل في النظام. هل تريد التسجيل كمتبرع جديد؟',
          [
            {
              text: 'إلغاء',
              style: 'cancel'
            },
            {
              text: 'تسجيل',
              onPress: () => router.push('/register')
            }
          ]
        );
      } else {
        Alert.alert('خطأ', result.error || 'تعذر تسجيل الدخول');
      }
    } catch (error: any) {
      Alert.alert('خطأ', error?.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>تسجيل الدخول</Text>
        </View>

        <View style={styles.content}>
          {/* شعار التطبيق */}
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/appLogo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.welcomeTitle}>مرحباً بك في تطبيق سند</Text>
          <Text style={styles.welcomeText}>
            انضم إلى مجتمعنا من منقذي الأرواح أو سجل دخولك للمتابعة.
          </Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="رقم الهاتف (07XXXXXXXX)"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              textAlign="right"
              maxLength={11}
              placeholderTextColor="#9CA3AF"
            />

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleAuth}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'جاري التحميل...' : 'تسجيل الدخول'}
              </Text>
            </TouchableOpacity>

            <View style={styles.bottomButtons}>
              <TouchableOpacity
                style={styles.registerButton}
                onPress={async () => {
                  if (!(await hasInternetConnection())) {
                    setShowNoInternetModal(true);
                    return;
                  }
                  router.push('/register');
                }}
              >
                <Text style={styles.registerButtonText}>
                  لا تملك حساب؟ سجل كمتبرع
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.guestButton}
                onPress={handleDemoAccount}
              >
                <Text style={styles.guestButtonText}>Demo Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      <NoInternetModal
        visible={showNoInternetModal}
        onClose={() => setShowNoInternetModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 25,
  },
  form: {
    gap: 15,
  },
  input: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderRadius: 12,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  forgotPassword: {
    color: '#DC2626',
    fontSize: 13,
    textAlign: 'center',
    marginTop: -8,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 15,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bottomButtons: {
    gap: 12,
    marginTop: 20,
  },
  registerButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  registerButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  guestButton: {
    backgroundColor: '#6B7280',
    paddingVertical: 14,
    borderRadius: 12,
  },
  guestButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  User,
  Lock,
  Bell,
  HelpCircle,
  MessageSquare,
  Shield,
  Settings as SettingsIcon,
  Trash2,
  Info,
  Droplet,
  Heart,
  LogIn,
} from 'lucide-react-native';
import AdBanner from '@/components/AdBanner';
import { supabase } from '@/lib/supabase';
import NavigationHelper from '@/lib/navigationHelper';
import AuthManager from '@/lib/authManager';
import { useAuth } from '@/contexts/AuthContext';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import NoInternetModal from '@/components/NoInternetModal';

export default function SettingsScreen() {
  const { profile, isGuest } = useAuth();
  // التحقق من أن الحساب هو الحساب الافتراضي (Demo)
  const isDefaultAccount = profile?.id === 'default-account-id';
  const [userStatus, setUserStatus] = useState<{
    isLoggedIn: boolean;
    hasDonorProfile: boolean;
    loading: boolean;
  }>({ isLoggedIn: false, hasDonorProfile: false, loading: true });
  const [showNoInternetModal, setShowNoInternetModal] = useState(false);
  const { hasInternetConnection } = useNetworkStatus();

  // مسح تلقائي للبيانات القديمع
  useEffect(() => {
    const clearOldDataOnStartup = async () => {
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage').then(m => m.default);
        const keys = await AsyncStorage.getAllKeys();
        const oldDataKeys = keys.filter(key => 
          key.includes('userSession') || 
          key.includes('userData') || 
          key.includes('donors') ||
          key.includes('oldProfile')
        );
        if (oldDataKeys.length > 0) {
          await AsyncStorage.multiRemove(oldDataKeys);
          console.log('تم مسح البيانات القديمة تلقائياً');
        }
      } catch (error) {
        console.log('خطأ في مسح البيانات القديمة:', error);
      }
    };

    clearOldDataOnStartup();
    checkUserStatus();
  }, [profile, isGuest]);

  const checkUserStatus = async () => {
    try {
      console.log('🔍 [Settings] التحقق من حالة المستخدم:', { profile: !!profile, isGuest });
      
      if (isGuest) {
        console.log('👤 [Settings] وضع الضيف نشط');
        setUserStatus({ isLoggedIn: false, hasDonorProfile: false, loading: false });
        return;
      }
      
      if (!profile) {
        console.log('❌ [Settings] لا يوجد مستخدم');
        setUserStatus({ isLoggedIn: false, hasDonorProfile: false, loading: false });
        return;
      }

      // المستخدم مسجل دخول ولديه ملف شخصي
      console.log('✅ [Settings] مستخدم مسجل مع ملف شخصي');
      setUserStatus({
        isLoggedIn: true,
        hasDonorProfile: true,
        loading: false
      });
    } catch (error) {
      console.error('Error checking user status:', error);
      setUserStatus({ isLoggedIn: false, hasDonorProfile: false, loading: false });
    }
  };

  const handleDonorProfileAction = () => {
    if (userStatus.hasDonorProfile) {
      // المستخدم لديه ملف متبرع، اذهب للملف الشخصي
      router.push('/profile');
    } else if (userStatus.isLoggedIn) {
      // المستخدم مسجل دخول لكن ليس لديه ملف متبرع
      router.push('/register');
    } else {
      // المستخدم غير مسجل
      router.push('/login');
    }
  };

  const handleSettingPress = (setting: string) => {
    Alert.alert('الإعدادات', `تم الضغط على: ${setting}`);
  };

  const handleDeleteMyRequests = async () => {
    // التحقق من الاتصال بالإنترنت
    if (!(await hasInternetConnection())) {
      setShowNoInternetModal(true);
      return;
    }

    try {
      const { profile } = await AuthManager.getCurrentUser();
      
      if (!profile) {
        Alert.alert('خطأ', 'يجب تسجيل الدخول أولاً.');
        return;
      }
      
      const donorId = profile.id;
      
      // أولاً نحصل على عدد طلبات المستخدم (نتحقق من donor_id)
      const { count, error: countError } = await supabase
        .from('blood_donation_requests')
        .select('*', { count: 'exact', head: true })
        .eq('donor_id', donorId);

      if (countError) {
        console.error('Error counting requests:', countError);
      }

      const requestsCount = count || 0;

      if (requestsCount === 0) {
        Alert.alert('لا توجد طلبات', 'لا توجد طلبات تبرع مسجلة باسمك للحذف.');
        return;
      }

      Alert.alert(
        'تأكيد الحذف ⚠️',
        `هل أنت متأكد من حذف طلباتك (${requestsCount} طلب)؟\nهذا الإجراء لا يمكن التراجع عنه.\n\nملاحظة: سيتم حذف طلباتك فقط وليس طلبات المستخدمين الآخرين.`,
        [
          {
            text: 'إلغاء',
            style: 'cancel',
          },
          {
            text: 'حذف طلباتي',
            style: 'destructive',
            onPress: async () => {
              // التحقق من الاتصال مرة أخرى قبل الحذف
              if (!(await hasInternetConnection())) {
                setShowNoInternetModal(true);
                return;
              }

              try {
                const { error } = await supabase
                  .from('blood_donation_requests')
                  .delete()
                  .eq('donor_id', donorId);
                
                if (error) {
                  Alert.alert('خطأ', 'فشل في حذف الطلبات. حاول مرة أخرى.');
                  console.error('Error deleting requests:', error);
                  return;
                }
                
                Alert.alert('تم الحذف ✅', `تم حذف جميع طلباتك (${requestsCount} طلب) بنجاح.`);
              } catch (error) {
                Alert.alert('خطأ', 'حدث خطأ غير متوقع.');
                console.error('Error:', error);
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('خطأ', 'فشل في الوصول لبيانات المستخدم.');
      console.error('Error getting profile:', error);
    }
  };

  const getAccountSection = () => {
    if (userStatus.loading) {
      return {
        title: 'الحساب',
        items: [
          {
            icon: User,
            title: 'جاري التحميل...',
            subtitle: 'يتم فحص حالة المستخدم',
            onPress: () => {},
          },
        ],
      };
    }

    // إذا كان المستخدم في وضع Demo (Guest) أو يستخدم الحساب الافتراضي، أظهر زر البروفايل وزر تسجيل الدخول
    if (isGuest || isDefaultAccount) {
      return {
        title: 'الحساب',
        items: [
          {
            icon: User,
            title: 'الملف الشخصي',
            subtitle: isDefaultAccount ? 'عرض ملفك الشخصي (حساب Demo)' : 'عرض ملفك الشخصي (وضع الضيف)',
            onPress: () => router.push('/profile'),
          },
          {
            icon: LogIn,
            title: 'تسجيل الدخول',
            subtitle: 'تسجيل الدخول بحساب حقيقي للخروج من وضع Demo',
            onPress: () => router.push('/login'),
          },
        ],
      };
    }

    if (!userStatus.isLoggedIn) {
      return {
        title: 'الحساب',
        items: [
          {
            icon: User,
            title: 'تسجيل الدخول',
            subtitle: 'سجل دخولك للوصول لجميع الميزات',
            onPress: handleDonorProfileAction,
          },
        ],
      };
    }

    if (userStatus.isLoggedIn && !userStatus.hasDonorProfile) {
      return {
        title: 'الحساب',
        items: [
          {
            icon: Droplet,
            title: 'إكمال بيانات المتبرع',
            subtitle: 'أضف بيانات التبرع لتصبح جزءاً من شبكة المنقذين',
            onPress: handleDonorProfileAction,
          },
        ],
      };
    }

    return {
      title: 'الحساب',
      items: [
        {
          icon: User,
          title: 'الملف الشخصي',
          subtitle: 'إدارة معلومات ملفك الشخصي وبيانات المتبرع',
          onPress: handleDonorProfileAction,
        },
      ],
    };
  };

  const settingSections = [
    getAccountSection(),
    {
      title: 'إدارة طلبات التبرع',
      items: [
        {
          icon: Droplet,
          title: 'مشاهدة الطلبات',
          subtitle: 'عرض جميع طلبات التبرع',
          onPress: () => router.push('/(tabs)/blood-donation'),
        },
        {
          icon: Trash2,
          title: 'حذف طلباتي',
          subtitle: 'مسح طلبات التبرع الخاصة بك فقط',
          onPress: handleDeleteMyRequests,
          danger: true,
        },

      ],
    },
    {
      title: 'المساعدة والدعم',
      items: [
        {
          icon: HelpCircle,
          title: 'اتصل بالدعم',
          subtitle: 'إرسال رسالة للدعم',
          onPress: () => router.push('/contact'),
        },
        {
          icon: Info,
          title: 'حول التطبيق',
          subtitle: 'معلومات عن التطبيق والمطورين',
          onPress: () => router.push('/about'),
        },
      ],
    }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <AdBanner />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
        <Text style={styles.headerTitle}>الإعدادات</Text>
        <TouchableOpacity onPress={() => NavigationHelper.safeGoBack()}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={[
                  styles.settingItem,
                  item.danger && styles.dangerItem
                ]}
                onPress={item.onPress}>
                <View style={styles.settingContent}>
                  <View style={styles.settingText}>
                    <Text style={[
                      styles.settingTitle,
                      item.danger && styles.dangerText
                    ]}>{item.title}</Text>
                    <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                  </View>
                  <View style={[
                    styles.iconContainer,
                    item.danger && styles.dangerIconContainer
                  ]}>
                    <item.icon 
                      size={24} 
                      color={item.danger ? "#EF4444" : "#6B7280"} 
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
      </ScrollView>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  settingItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
  },
  dangerItem: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  dangerText: {
    color: '#EF4444',
  },
  dangerIconContainer: {
    backgroundColor: '#FEE2E2',
  },
});
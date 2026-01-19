import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  I18nManager,
  Linking,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Surface,
  ActivityIndicator,
  Chip,
  Divider,
  useTheme,
  IconButton,
} from 'react-native-paper';
import { Alert, TouchableOpacity } from 'react-native';
import { supabase } from '@/lib/supabase';
import { setupRTL } from '@/lib/rtl';
import AuthManager from '@/lib/authManager';
import { Calendar, Droplet, MapPin, Phone, Trash2, MessageCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdBanner from '@/components/AdBanner';
import { 
  registerForPushNotificationsAsync, 
  sendBloodDonationRequestNotification,
  setupNotificationClickHandler 
} from '@/lib/notificationService';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import NoInternetModal from '@/components/NoInternetModal';

// Enable RTL support (forced)
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

interface BloodDonationRequest {
  id: string;
  name: string;
  phone: string;
  governorate: string;
  city: string;
  blood_type: string;
  created_at: string;
  user_id?: string;
}

export default function BloodDonationListScreen() {
  const theme = useTheme();
  const [requests, setRequests] = useState<BloodDonationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showNoInternetModal, setShowNoInternetModal] = useState(false);
  const { hasInternetConnection } = useNetworkStatus();

  useEffect(() => {
    setupRTL();
    initializeUser();
    fetchRequests();
    
    // تسجيل الإشعارات
    registerForPushNotificationsAsync();
    
    // إعداد معالج النقر على الإشعار
    const notificationSubscription = setupNotificationClickHandler((notification) => {
      console.log('تم النقر على الإشعار:', notification);
      // يمكن إضافة منطق للانتقال إلى صفحة معينة
    });
    
    // إعداد Realtime subscription للاستماع للطلبات الجديدة
    const channel = supabase
      .channel('blood_donation_requests_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'blood_donation_requests',
        },
        async (payload) => {
          console.log('طلب جديد تم إضافته:', payload);
          
          // إضافة الطلب الجديد للقائمة
          const newRequest = payload.new as BloodDonationRequest;
          setRequests(prev => [newRequest, ...prev]);
          
          // إرسال إشعار محلي
          try {
            await sendBloodDonationRequestNotification(
              newRequest.name,
              newRequest.blood_type,
              `${newRequest.city}، ${newRequest.governorate}`,
              newRequest.phone
            );
          } catch (error) {
            console.error('خطأ في إرسال الإشعار:', error);
          }
        }
      )
      .subscribe();

    // تنظيف الاشتراكات عند إلغاء التحميل
    return () => {
      notificationSubscription.remove();
      supabase.removeChannel(channel);
    };
  }, []);

  const initializeUser = async () => {
    try {
      const { profile } = await AuthManager.getCurrentUser();
      if (profile) {
        setCurrentUserId(profile.id);
        console.log('تم تهيئة معرف المستخدم:', profile.id);
      } else {
        setCurrentUserId(null);
        console.log('المستخدم غير مسجل الدخول');
      }
    } catch (error) {
      console.error('خطأ في تهيئة المستخدم:', error);
      setCurrentUserId(null);
    }
  };

  // دالة مساعدة للحصول على معرف المستخدم الحالي من المصادقة
  const getCurrentAuthUserId = async (): Promise<string | null> => {
    try {
      const { profile } = await AuthManager.getCurrentUser();
      return profile?.id || null;
    } catch (error) {
      console.error('خطأ في الحصول على معرف المستخدم:', error);
      return null;
    }
  };

  const fetchRequests = async () => {
    try {
      // التحقق من الاتصال بالإنترنت
      const hasInternet = await hasInternetConnection();
      if (!hasInternet) {
        console.warn('⚠️ لا يوجد اتصال بالإنترنت - لا يمكن جلب الطلبات');
        setShowNoInternetModal(true);
        setRequests([]); // إفراغ القائمة عند عدم وجود اتصال
        return;
      }

      const { data, error } = await supabase
        .from('blood_donation_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching requests:', error);
        // في حالة خطأ الشبكة، أظهر رسالة واضحة
        if (error.message?.includes('Network') || error.message?.includes('network') || error.message?.includes('fetch')) {
          setShowNoInternetModal(true);
        }
        return;
      }

      setRequests(data || []);
    } catch (error: any) {
      console.error('Error:', error);
      // في حالة خطأ الشبكة، أظهر رسالة واضحة
      if (error?.message?.includes('Network') || error?.message?.includes('network') || error?.message?.includes('fetch')) {
        setShowNoInternetModal(true);
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-IQ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getBloodTypeColor = (bloodType: string) => {
    const colors: { [key: string]: string } = {
      'A+': '#EF4444', 'A-': '#F97316',
      'B+': '#8B5CF6', 'B-': '#A855F7',
      'AB+': '#059669', 'AB-': '#10B981',
      'O+': '#DC2626', 'O-': '#B91C1C'
    };
    return colors[bloodType] || theme.colors.primary;
  };

  const handleDeleteRequest = (requestId: string, requestName: string) => {
    Alert.alert(
      'تأكيد الحذف ⚠️',
      `هل أنت متأكد من حذف طلب التبرع لـ "${requestName}"؟\nهذا الإجراء لا يمكن التراجع عنه.`,
      [
        {
          text: 'إلغاء',
          style: 'cancel',
        },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            // التحقق من الاتصال بالإنترنت
            if (!(await hasInternetConnection())) {
              setShowNoInternetModal(true);
              return;
            }

            try {
              // التحقق من تسجيل الدخول أولاً
              const { profile } = await AuthManager.getCurrentUser();
              if (!profile) {
                Alert.alert('خطأ', 'يجب تسجيل الدخول أولاً لحذف الطلب.');
                return;
              }
              
              console.log('محاولة حذف الطلب:', { requestId, userId: profile.id });
              
              // حذف الطلب مباشرة باستخدام RLS
              const { error } = await supabase
                .from('blood_donation_requests')
                .delete()
                .eq('id', requestId);
              
              if (error) {
                console.error('خطأ في حذف الطلب:', error);
                Alert.alert(
                  'خطأ في الحذف', 
                  `فشل في حذف الطلب. تفاصيل الخطأ:\n${error.message}\n\nكود الخطأ: ${error.code || 'غير محدد'}`
                );
                return;
              }
              

              
              // تحديث القائمة محلياً
              setRequests(prev => prev.filter(req => req.id !== requestId));
              Alert.alert('تم الحذف ✅', 'تم حذف الطلب بنجاح.');
              
              console.log('تم حذف الطلب بنجاح:', requestId);
              
            } catch (error) {
              console.error('خطأ غير متوقع:', error);
              Alert.alert('خطأ', 'حدث خطأ غير متوقع أثناء حذف الطلب.');
            }
          },
        },
      ]
    );
  };

  const isMyRequest = (request: BloodDonationRequest): boolean => {
    // التحقق من أن المستخدم مسجل الدخول وأن الطلب خاص به
    // استخدام donor_id للمقارنة مع معرف المتبرع الحالي
    if (!currentUserId) return false;
    if (!request.user_id && !(request as any).donor_id) return false;
    // التحقق من user_id أو donor_id
    return request.user_id === currentUserId || (request as any).donor_id === currentUserId;
  };

  const handlePhoneCall = (phoneNumber: string, requestName: string) => {
    if (!phoneNumber) {
      Alert.alert('خطأ', 'رقم الهاتف غير متوفر');
      return;
    }

    // عرض تنبيه التأكيد أولاً
    Alert.alert(
      `الاتصال بـ ${requestName} 📞`,
      `رقم الهاتف: ${phoneNumber}\n\nهل تريد الاتصال الآن؟`,
      [
        {
          text: 'إلغاء',
          style: 'cancel'
        },
        {
          text: 'اتصل الآن',
          style: 'default',
          onPress: () => {
            // تنظيف رقم الهاتف من المسافات والرموز
            const cleanPhone = phoneNumber.replace(/\s+/g, '').replace(/[^\d+]/g, '').trim();
            const phoneUrl = `tel:${cleanPhone}`;

            // محاولة فتح تطبيق الاتصال مباشرة بدون التحقق من canOpenURL
            Linking.openURL(phoneUrl).catch((error) => {
              console.error('خطأ في فتح تطبيق الاتصال:', error);
              // رسالة خطأ واضحة للمستخدم في حالة الفشل فقط
              Alert.alert(
                'تعذر الاتصال',
                `لا يمكن فتح تطبيق الاتصال على هذا الجهاز.\n\nيمكنك نسخ الرقم والاتصال يدوياً:\n${phoneNumber}`,
                [
                  { text: 'حسناً', style: 'cancel' }
                ]
              );
            });
          }
        }
      ]
    );
  };

  const handleWhatsApp = (phoneNumber: string, requestName: string) => {
    if (!phoneNumber) {
      Alert.alert('خطأ', 'رقم الهاتف غير متوفر');
      return;
    }

    // تنظيف رقم الهاتف وإضافة كود العراق إذا لزم الأمر
    let cleanPhone = phoneNumber.replace(/\s+/g, '').replace(/[^\d]/g, '').trim();
    
    // إذا كان الرقم يبدأ بـ 07، استبدله بـ 9647
    if (cleanPhone.startsWith('07')) {
      cleanPhone = '964' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('964')) {
      cleanPhone = '964' + cleanPhone;
    }
    
    const message = `مرحباً ${requestName}، أنا بحاجة للتبرع بالدم. هل يمكنك المساعدة؟`;
    const whatsappUrl = `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;

    // محاولة فتح واتساب مباشرة
    Linking.openURL(whatsappUrl).catch((error) => {
      console.error('خطأ في فتح واتساب:', error);
      Alert.alert(
        'واتساب غير متوفر',
        'تطبيق واتساب غير مثبت على هذا الجهاز أو لا يمكن فتحه',
        [{ text: 'حسناً', style: 'cancel' }]
      );
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AdBanner />
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
      
      <Surface style={styles.header} elevation={1}>
        <Droplet size={32} color={theme.colors.primary} />
        <Title style={[styles.title, { color: theme.colors.onSurface }]}>طلبات التبرع بالدم</Title>
        <Text style={styles.subtitle}>جميع طلبات التبرع المسجلة في النظام</Text>
      </Surface>

      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Text style={styles.statNumber}>{requests.length}</Text>
            <Text style={styles.statLabel}>إجمالي الطلبات</Text>
          </Card.Content>
        </Card>
      </View>

      {isLoading ? (
        <Card style={styles.loadingContainer}>
          <Card.Content style={styles.centerContent}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>جاري تحميل الطلبات...</Text>
          </Card.Content>
        </Card>
      ) : requests.length === 0 ? (
        <Card style={styles.emptyContainer}>
          <Card.Content style={styles.centerContent}>
            <Calendar size={48} color={theme.colors.outline} />
            <Text style={styles.emptyTitle}>لا توجد طلبات حالياً</Text>
            <Text style={styles.emptyText}>سيتم عرض طلبات التبرع هنا عند إضافتها</Text>
          </Card.Content>
        </Card>
      ) : (
        <View style={styles.requestsList}>
          {requests.map((request) => (
            <View key={request.id} style={styles.requestCard}>
              <View style={styles.requestTopRow}>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => handlePhoneCall(request.phone, request.name)}>
                    <Phone size={16} color="#FFFFFF" />
                    <Text style={styles.callButtonText}>اتصال</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.whatsappButton}
                    onPress={() => handleWhatsApp(request.phone, request.name)}>
                    <MessageCircle size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                  {isMyRequest(request) && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteRequest(request.id, request.name)}>
                      <Trash2 size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.bloodTypeContainer}>
                  <Text style={styles.bloodType}>{request.blood_type}</Text>
                  {isMyRequest(request) && (
                    <View style={styles.myRequestBadge}>
                      <Text style={styles.myRequestText}>طلبي</Text>
                    </View>
                  )}
                </View>
              </View>
              
              <View style={styles.requestInfo}>
                <Text style={styles.requestName}>{request.name}</Text>
                <Text style={styles.requestLocation}>
                  {request.city}، {request.governorate}
                </Text>
              </View>

              <View style={styles.dateContainer}>
                <Text style={styles.requestDate}>📅 {formatDate(request.created_at)}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
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
    writingDirection: 'rtl',
  },
  header: {
    padding: 36,
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    marginBottom: 8,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  statLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  centerContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingContainer: {
    margin: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    margin: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    color: '#374151',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6B7280',
    lineHeight: 20,
  },
  requestsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
    gap: 12,
  },
  requestTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bloodTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bloodType: {
    fontSize: 16,
    color: '#E53E3E',
    fontWeight: '700',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  myRequestBadge: {
    backgroundColor: '#DEF7EC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  myRequestText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: 'bold',
  },
  requestInfo: {
    gap: 4,
  },
  requestName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    paddingRight: 150,
  },
  requestLocation: {
    fontSize: 14,
    color: '#6B7280',
    paddingRight: 150,
  },
  requestPhone: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    paddingRight: 135,
    marginTop: 2,
  },
  dateContainer: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  requestDate: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    paddingRight: 50,
  },
  callButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    gap: 6,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
});
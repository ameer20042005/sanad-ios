import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { ArrowLeft } from 'lucide-react-native';
import AdBanner from '@/components/AdBanner';
import NavigationHelper from '@/lib/navigationHelper';
import { 
  registerForPushNotificationsAsync, 
  setupNotificationClickHandler,
  sendCampaignNotificationSafe,
  listenToIncomingNotifications,
  setupBackgroundNotificationHandler
} from '@/lib/notificationService';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import NoInternetModal from '@/components/NoInternetModal';

interface Campaign {
  id: string;
  title: string;
  description: string;
  blood_type: string;
  city: string;
  location: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function CampaignsScreen() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNoInternetModal, setShowNoInternetModal] = useState(false);
  const { hasInternetConnection } = useNetworkStatus();

  const fetchCampaigns = async () => {
    // التحقق من الاتصال بالإنترنت
    if (!(await hasInternetConnection())) {
      setShowNoInternetModal(true);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('donation_campaigns')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        // في حالة خطأ الشبكة، أظهر رسالة واضحة
        if (error.message?.includes('Network') || error.message?.includes('network') || error.message?.includes('fetch')) {
          setShowNoInternetModal(true);
          setCampaigns([]); // إفراغ القائمة عند عدم وجود اتصال
          return;
        }
        throw error;
      }

      setCampaigns(data || []);
    } catch (error: any) {
      console.error('Error fetching campaigns:', error);
      // في حالة خطأ الشبكة، أظهر رسالة واضحة
      if (error?.message?.includes('Network') || error?.message?.includes('network') || error?.message?.includes('fetch')) {
        setShowNoInternetModal(true);
        setCampaigns([]);
      } else {
        Alert.alert('خطأ', error.message || 'حدث خطأ أثناء جلب الحملات');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    
    // إعداد Background Notification Handler (يعمل عندما التطبيق مغلق)
    setupBackgroundNotificationHandler();
    
    // تسجيل الإشعارات
    registerForPushNotificationsAsync();
    
    // الاستماع للإشعارات الواردة (حتى لو كان التطبيق مغلق)
    const incomingNotificationSubscription = listenToIncomingNotifications((notification) => {
      console.log('🔔 تم استلام إشعار حملة جديدة:', notification);
      // يمكن تحديث UI أو إضافة منطق إضافي هنا
    });
    
    // إعداد معالج النقر على الإشعار
    const notificationSubscription = setupNotificationClickHandler((notification) => {
      console.log('👆 تم النقر على إشعار الحملة:', notification);
      // يمكن إضافة منطق للانتقال إلى صفحة معينة
      const data = notification.request.content.data;
      if (data?.screen === 'campaigns') {
        console.log('📍 فتح صفحة الحملات');
        // التطبيق موجود بالفعل في صفحة الحملات
      }
    });
    
    // إعداد Realtime subscription للاستماع للحملات الجديدة
    const channel = supabase
      .channel('donation_campaigns_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'donation_campaigns',
        },
        async (payload) => {
          console.log('🆕 حملة جديدة تم إضافتها:', payload);
          
          // إضافة الحملة الجديدة للقائمة
          const newCampaign = payload.new as Campaign;
          
          // فقط إضافة الحملة إذا كانت نشطة
          if (newCampaign.is_active) {
            setCampaigns(prev => [newCampaign, ...prev]);
            
            // إرسال إشعار محلي (يعمل حتى لو كان التطبيق مغلق)
            console.log('📤 إرسال إشعار الحملة...');
            const result = await sendCampaignNotificationSafe(
              newCampaign.title,
              newCampaign.blood_type,
              newCampaign.city,
              newCampaign.location,
              newCampaign.start_date,
              newCampaign.end_date
            );
            
            if (result.success) {
              console.log('✅ تم إرسال الإشعار بنجاح!');
            } else {
              console.error('❌ فشل إرسال الإشعار:', result.error);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'donation_campaigns',
        },
        async (payload) => {
          console.log('🔄 حملة تم تحديثها:', payload);
          
          const updatedCampaign = payload.new as Campaign;
          
          // تحديث الحملة في القائمة
          setCampaigns(prev => 
            prev.map(campaign => 
              campaign.id === updatedCampaign.id ? updatedCampaign : campaign
            )
          );
        }
      )
      .subscribe();

    // تنظيف الاشتراكات عند إلغاء التحميل
    return () => {
      incomingNotificationSubscription.remove();
      notificationSubscription.remove();
      supabase.removeChannel(channel);
    };
  }, []);

  const getStatusText = (campaign: Campaign) => {
    return campaign.is_active ? 'نشطة' : 'غير نشطة';
  };

  const getStatusColor = (campaign: Campaign) => {
    return campaign.is_active ? '#10B981' : '#6B7280';
  };

  const activeCampaigns = campaigns.filter((c) => c.is_active);
  const inactiveCampaigns = campaigns.filter((c) => !c.is_active);

  return (
    <SafeAreaView style={styles.safeArea}>
      <AdBanner />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
        <Text style={styles.headerTitle}>الحملات</Text>
        <TouchableOpacity onPress={() => NavigationHelper.safeGoBack()}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {campaigns.length === 0 && !loading ? (
          <View style={styles.emptyState}>
            <Image 
              source={require('@/assets/appLogo.png')} 
              style={styles.emptyLogo}
              resizeMode="contain"
            />
            <Text style={styles.emptyTitle}>لا توجد حملات حالياً</Text>
            <Text style={styles.emptySubtitle}>
              لم يتم إنشاء أي حملات بعد. تابعنا لمعرفة آخر الحملات الجديدة
            </Text>
          </View>
        ) : (
          <>
            {/* الحملات النشطة */}
            {activeCampaigns.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>الحملات النشطة</Text>
                
                {activeCampaigns.map((campaign) => (
                  <View key={campaign.id} style={styles.campaignCard}>
                    <View style={styles.campaignContent}>
                      <View style={styles.campaignInfo}>
                        <View style={styles.statusContainer}>
                          <Text style={[styles.status, { color: getStatusColor(campaign) }]}>
                            {getStatusText(campaign)}
                          </Text>
                          <Text style={styles.bloodType}>{campaign.blood_type}</Text>
                        </View>
                        <Text style={styles.campaignTitle}>{campaign.title}</Text>
                        <Text style={styles.campaignDescription}>{campaign.description}</Text>
                        <Text style={styles.locationText}>{campaign.city} - {campaign.location}</Text>
                        <Text style={styles.dateText}>من {new Date(campaign.start_date).toLocaleDateString('ar-SA')} إلى {new Date(campaign.end_date).toLocaleDateString('ar-SA')}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* الحملات غير النشطة */}
            {inactiveCampaigns.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>الحملات غير النشطة</Text>
                
                {inactiveCampaigns.map((campaign) => (
                  <View key={campaign.id} style={styles.campaignCard}>
                    <View style={styles.campaignContent}>
                      <View style={styles.campaignInfo}>
                        <View style={styles.statusContainer}>
                          <Text style={[styles.status, { color: getStatusColor(campaign) }]}>
                            {getStatusText(campaign)}
                          </Text>
                          <Text style={styles.bloodType}>{campaign.blood_type}</Text>
                        </View>
                        <Text style={styles.campaignTitle}>{campaign.title}</Text>
                        <Text style={styles.campaignDescription}>{campaign.description}</Text>
                        <Text style={styles.locationText}>{campaign.city} - {campaign.location}</Text>
                        <Text style={styles.dateText}>من {new Date(campaign.start_date).toLocaleDateString('ar-SA')} إلى {new Date(campaign.end_date).toLocaleDateString('ar-SA')}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'left',
  },
  campaignCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  campaignContent: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  campaignInfo: {
    flex: 1,
    alignItems: 'flex-start',
    paddingRight: 0,
  },
  statusContainer: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    width: '100%',
    justifyContent: 'flex-start',
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'left',
  },
  campaignTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'left',
  },
  campaignDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
    textAlign: 'left',
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
  },
  campaignImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyLogo: {
    width: 100,
    height: 100,
    marginBottom: 24,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  bloodType: {
    fontSize: 14,
    color: '#E53E3E',
    fontWeight: '700',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 12,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'left',
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
    textAlign: 'left',
  },
});
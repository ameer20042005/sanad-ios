import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * خدمة إدارة الإشعارات المحلية
 * ملاحظة: Push Notifications لا تعمل في Expo Go، نستخدم Local Notifications فقط
 */

// إعداد سلوك الإشعارات عند استلامها
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * طلب صلاحيات الإشعارات من المستخدم (Local فقط)
 */
export async function registerForPushNotificationsAsync() {
  try {
    // فحص أننا على منصة مدعومة
    if (Platform.OS === 'web') {
      console.log('ℹ️ الإشعارات غير مدعومة على الويب');
      return null;
    }
    
    if (Platform.OS === 'android') {
      // إنشاء قناة إشعارات طلبات التبرع لـ Android
      await Notifications.setNotificationChannelAsync('blood-donation-requests', {
        name: 'طلبات التبرع بالدم',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#DC2626',
        sound: 'default',
        enableVibrate: true,
        enableLights: true,
        showBadge: true,
        description: 'إشعارات فورية عند ورود طلبات تبرع بالدم جديدة',
      });
      
      // إنشاء قناة إشعارات الحملات لـ Android
      await Notifications.setNotificationChannelAsync('donation-campaigns', {
        name: 'حملات التبرع بالدم',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#7C3AED',
        sound: 'default',
        enableVibrate: true,
        enableLights: true,
        showBadge: true,
        description: 'إشعارات عن حملات التبرع بالدم الجديدة',
      });
    }

    // طلب الصلاحيات
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('لم يتم منح صلاحية الإشعارات');
      return null;
    }

    console.log('تم تسجيل الإشعارات المحلية بنجاح');
    return 'local-notifications-enabled';
  } catch (error) {
    console.error('خطأ في تسجيل الإشعارات:', error);
    return null;
  }
}

/**
 * إرسال إشعار محلي فوري
 */
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: any
) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        color: '#DC2626',
        badge: 1,
        ...(Platform.OS === 'android' && {
          channelId: 'blood-donation-requests',
        }),
      },
      trigger: null, // إرسال فوري
    });
    console.log('تم إرسال الإشعار:', title);
  } catch (error) {
    console.error('خطأ في إرسال الإشعار:', error);
  }
}

/**
 * إرسال إشعار بطلب تبرع جديد
 */
export async function sendBloodDonationRequestNotification(
  donorName: string,
  bloodType: string,
  location: string,
  phone: string
) {
  const title = '🩸 طلب تبرع دم جديد!';
  const body = `${donorName} يحتاج إلى فصيلة ${bloodType} في ${location}`;
  
  const data = {
    type: 'blood_donation_request',
    donorName,
    bloodType,
    location,
    phone,
    screen: 'blood-donation',
  };

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
        color: '#DC2626',
        badge: 1,
        ...(Platform.OS === 'android' && {
          channelId: 'blood-donation-requests',
        }),
      },
      trigger: null, // إرسال فوري
    });
    console.log('تم إرسال إشعار طلب التبرع:', donorName);
  } catch (error) {
    console.error('خطأ في إرسال إشعار طلب التبرع:', error);
  }
}

/**
 * إرسال إشعار بحملة تبرع جديدة
 * تعمل بنفس طريقة طلبات التبرع - حتى لو كان التطبيق مغلق
 */
export async function sendCampaignNotification(
  campaignTitle: string,
  bloodType: string,
  location: string,
  startDate: string,
  endDate: string
) {
  try {
    // التأكد من إنشاء قناة الإشعارات (للأندرويد)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('donation-campaigns', {
        name: 'حملات التبرع بالدم',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#7C3AED',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
        description: 'إشعارات عن حملات التبرع بالدم الجديدة',
      });
    }

    const title = '🎯 حملة تبرع دم جديدة!';
    const body = `${campaignTitle}\nفصيلة الدم: ${bloodType}\nالموقع: ${location}`;
    
    const data = {
      type: 'donation_campaign',
      campaignTitle,
      bloodType,
      location,
      startDate,
      endDate,
      screen: 'campaigns',
    };

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
        color: '#7C3AED',
        badge: 1,
        ...(Platform.OS === 'android' && {
          channelId: 'donation-campaigns',
        }),
      },
      trigger: null, // إرسال فوري
    });
    
    console.log('✅ تم إرسال إشعار الحملة:', campaignTitle, 'ID:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('❌ خطأ في إرسال إشعار الحملة:', error);
    throw error;
  }
}

/**
 * معالج النقر على الإشعار
 */
export function setupNotificationClickHandler(
  handler: (notification: Notifications.Notification) => void
) {
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      handler(response.notification);
    }
  );

  return subscription;
}

/**
 * مسح جميع الإشعارات
 */
export async function clearAllNotifications() {
  await Notifications.dismissAllNotificationsAsync();
  await Notifications.setBadgeCountAsync(0);
}

/**
 * الحصول على عدد الإشعارات غير المقروءة
 */
export async function getBadgeCount() {
  return await Notifications.getBadgeCountAsync();
}

/**
 * تعيين عدد الإشعارات على الأيقونة
 */
export async function setBadgeCount(count: number) {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * إعداد Background Notification Handler
 * يسمح باستلام الإشعارات عندما يكون التطبيق في الخلفية أو مغلق
 * ملاحظة: setNotificationHandler يتم استدعاؤه مرة واحدة فقط في أعلى الملف
 * لتجنب تكرار الإشعارات
 */
export function setupBackgroundNotificationHandler() {
  // لا حاجة لاستدعاء setNotificationHandler هنا لأنه تم استدعاؤه بالفعل
  // في أعلى الملف. هذه الدالة موجودة للتوافق مع الكود القديم
  console.log('✅ Background Notification Handler جاهز (تم الإعداد في أعلى الملف)');
}

/**
 * الاستماع للإشعارات الواردة (حتى لو كان التطبيق مغلق)
 */
export function listenToIncomingNotifications(
  onReceived: (notification: Notifications.Notification) => void
) {
  const subscription = Notifications.addNotificationReceivedListener((notification) => {
    console.log('🔔 تم استلام إشعار جديد:', notification);
    onReceived(notification);
  });
  
  return subscription;
}

/**
 * دالة مساعدة لإرسال إشعار حملة مع معالجة الأخطاء الكاملة
 */
export async function sendCampaignNotificationSafe(
  campaignTitle: string,
  bloodType: string,
  city: string,
  location: string,
  startDate: string,
  endDate: string
): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  try {
    const fullLocation = `${city} - ${location}`;
    const notificationId = await sendCampaignNotification(
      campaignTitle,
      bloodType,
      fullLocation,
      startDate,
      endDate
    );
    
    return {
      success: true,
      notificationId,
    };
  } catch (error: any) {
    console.error('❌ فشل إرسال إشعار الحملة:', error);
    return {
      success: false,
      error: error.message || 'خطأ غير معروف',
    };
  }
}

/**
 * دالة مساعدة لإرسال إشعار طلب تبرع مع معالجة الأخطاء الكاملة
 */
export async function sendBloodDonationRequestNotificationSafe(
  donorName: string,
  bloodType: string,
  city: string,
  governorate: string,
  phone: string
): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  try {
    const location = `${city}، ${governorate}`;
    await sendBloodDonationRequestNotification(donorName, bloodType, location, phone);
    
    return {
      success: true,
    };
  } catch (error: any) {
    console.error('❌ فشل إرسال إشعار طلب التبرع:', error);
    return {
      success: false,
      error: error.message || 'خطأ غير معروف',
    };
  }
}

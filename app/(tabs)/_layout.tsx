import { Tabs, router } from 'expo-router';
import { Home, Search, Calendar, Settings, Droplet } from 'lucide-react-native';
import { Platform, I18nManager } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { setupRTL } from '@/lib/rtl';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const { profile, loading, isGuest } = useAuth();
  const insets = useSafeAreaInsets();
  const androidExtraSpacing = Platform.OS === 'android' ? 16 : 0;
  const bottomInset = insets.bottom;
  const tabBarHeight = 70 + bottomInset + androidExtraSpacing;
  const tabBarPaddingBottom = 16 + bottomInset + androidExtraSpacing;

  // تفعيل RTL للغة العربية
  useEffect(() => {
    setupRTL();
  }, []);

  // التحقق من المصادقة - السماح للضيوف بالوصول
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/26cd61a3-4308-4d10-b7ac-fbdcbce75097',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/(tabs)/_layout.tsx:23',message:'TabLayout auth check',data:{loading,hasProfile:!!profile,isGuest},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (!loading && !profile && !isGuest) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/26cd61a3-4308-4d10-b7ac-fbdcbce75097',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/(tabs)/_layout.tsx:26',message:'TabLayout redirecting to login',data:{loading,hasProfile:false,isGuest:false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.log('🔒 [TabLayout] لا يوجد مستخدم أو ضيف، العودة لتسجيل الدخول');
      router.replace('/login');
    } else if (!loading) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/26cd61a3-4308-4d10-b7ac-fbdcbce75097',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/(tabs)/_layout.tsx:29',message:'TabLayout access allowed',data:{hasProfile:!!profile,isGuest},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.log('✅ [TabLayout] الوصول مسموح:', { profile: !!profile, isGuest });
    }
  }, [profile, loading, isGuest]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: 12,
          paddingHorizontal: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
          // منع انقلاب الترتيب بسبب RTL - إبقاء الترتيب من اليسار لليمين
          flexDirection: 'row',
        },
        tabBarActiveTintColor: '#DC2626',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
          textAlign: 'center',
          paddingTop: 2,
          writingDirection: 'rtl',
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
          flex: 1,
        },
      }}>
      {/* ترتيب منطقي للتبويبات من اليمين لليسار */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="find"
        options={{
          title: 'البحث عن متبرع',
          tabBarIcon: ({ size, color }) => (
            <Search size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="blood-donation"
        options={{
          title: 'طلبات التبرع',
          tabBarIcon: ({ size, color }) => (
            <Droplet size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="campaigns"
        options={{
          title: 'الحملات',
          tabBarIcon: ({ size, color }) => (
            <Calendar size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'الإعدادات',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
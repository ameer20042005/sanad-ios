import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function IndexScreen() {
  const { profile, loading, isGuest } = useAuth();

  useEffect(() => {
    let mounted = true;
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/26cd61a3-4308-4d10-b7ac-fbdcbce75097',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/index.tsx:9',message:'Index useEffect triggered',data:{profile:!!profile,loading,isGuest},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    // تأخير بسيط لضمان أن التطبيق جاهز تماماً
    const navigate = async () => {
      // انتظار حتى ينتهي التحميل
      if (loading) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/26cd61a3-4308-4d10-b7ac-fbdcbce75097',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/index.tsx:17',message:'Navigation skipped - still loading',data:{loading},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        console.log('⏳ [Index] جاري التحميل...');
        return;
      }

      // تأخير إضافي صغير لضمان أن router جاهز
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!mounted) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/26cd61a3-4308-4d10-b7ac-fbdcbce75097',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/index.tsx:25',message:'Component unmounted before navigation',data:{mounted},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        return;
      }

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/26cd61a3-4308-4d10-b7ac-fbdcbce75097',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/index.tsx:28',message:'Checking auth state before navigation',data:{hasProfile:!!profile,isGuest},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.log('🔍 [Index] التحقق من الحالة:', { profile: !!profile, isGuest });

      try {
        if (profile) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/26cd61a3-4308-4d10-b7ac-fbdcbce75097',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/index.tsx:32',message:'Navigating to tabs - user logged in',data:{hasProfile:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          console.log('✅ [Index] مستخدم مسجل، الذهاب إلى التطبيق');
          router.replace('/(tabs)');
          return;
        }

        if (isGuest) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/26cd61a3-4308-4d10-b7ac-fbdcbce75097',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/index.tsx:38',message:'Navigating to tabs - guest mode',data:{isGuest:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          console.log('👤 [Index] وضع الضيف، الذهاب إلى التطبيق');
          router.replace('/(tabs)');
          return;
        }

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/26cd61a3-4308-4d10-b7ac-fbdcbce75097',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/index.tsx:44',message:'Navigating to login - no user',data:{hasProfile:false,isGuest:false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        console.log('🔐 [Index] لا يوجد مستخدم، الذهاب إلى تسجيل الدخول');
        router.replace('/login');
      } catch (error: any) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/26cd61a3-4308-4d10-b7ac-fbdcbce75097',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/index.tsx:46',message:'Navigation error caught',data:{error:error?.message||String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
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
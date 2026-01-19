import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthManager from '@/lib/authManager';

interface AuthContextType {
  profile: any | null;
  loading: boolean;
  signInWithPhone: (phone: string, useDefaultAccount?: boolean) => Promise<{ success: boolean; error?: string; needsRegistration?: boolean }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: any) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
  isGuest: boolean;
  continueAsGuest: () => Promise<void>;
  exitGuestMode: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_MODE_KEY = '@sanad_guest_mode';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  // تحديث الملف الشخصي
  const refreshProfile = async () => {
    try {
      const result = await AuthManager.getCurrentUser();
      if (result.profile) {
        setProfile(result.profile);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('خطأ في جلب الملف الشخصي:', error);
      setProfile(null);
    }
  };

  // تسجيل الدخول باستخدام رقم الهاتف
  const exitGuestMode = async () => {
    setIsGuest(false);
    await AsyncStorage.removeItem(GUEST_MODE_KEY);
  };

  const continueAsGuest = async () => {
    try {
      console.log('🔄 تفعيل وضع الضيف...');
      await AsyncStorage.setItem(GUEST_MODE_KEY, 'true');
      setIsGuest(true);
      setProfile(null);
      setLoading(false);
      console.log('✅ تم تفعيل وضع الضيف');
    } catch (error) {
      console.error('❌ خطأ في تفعيل وضع الضيف:', error);
      throw error;
    }
  };

  const signInWithPhone = async (phone: string, useDefaultAccount: boolean = false) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/26cd61a3-4308-4d10-b7ac-fbdcbce75097',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'contexts/AuthContext.tsx:61',message:'signInWithPhone called',data:{phone,useDefaultAccount},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    const result = await AuthManager.signInWithPhone(phone, useDefaultAccount);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/26cd61a3-4308-4d10-b7ac-fbdcbce75097',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'contexts/AuthContext.tsx:64',message:'signInWithPhone result',data:{success:result.success,hasProfile:!!result.profile,isDefaultAccount:result.isDefaultAccount,error:result.error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    if (result.success && result.profile) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/26cd61a3-4308-4d10-b7ac-fbdcbce75097',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'contexts/AuthContext.tsx:66',message:'Setting profile after successful login',data:{profileId:result.profile?.id,isDefaultAccount:result.isDefaultAccount},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      setProfile(result.profile);
      await exitGuestMode();
      return { success: true };
    } else {
      // رقم الهاتف غير موجود - يحتاج للتسجيل
      // فقط إذا لم يكن خطأ في الاتصال
      const isNetworkError = result.error?.includes('اتصال') || result.error?.includes('شبكة');
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/26cd61a3-4308-4d10-b7ac-fbdcbce75097',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'contexts/AuthContext.tsx:75',message:'Login failed',data:{error:result.error,isNetworkError,needsRegistration:!isNetworkError&&result.error?.includes('غير مسجل')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      return { 
        success: false, 
        error: result.error, 
        needsRegistration: !isNetworkError && result.error?.includes('غير مسجل')
      };
    }
  };

  // تسجيل الخروج
  const signOut = async () => {
    const result = await AuthManager.signOut();
    if (result.success) {
      setProfile(null);
      await exitGuestMode();
    }
    return result;
  };

  // تحديث الملف الشخصي
  const updateProfile = async (updates: any) => {
    if (!profile) {
      return { success: false, error: 'لا يوجد مستخدم مسجل دخول' };
    }

    console.log('🔄 [AuthContext] تحديث البروفايل:', updates);
    const result = await AuthManager.updateDonorProfile(profile.id, updates);
    console.log('📊 [AuthContext] نتيجة التحديث:', result);
    
    if (result.success && result.profile) {
      console.log('✅ [AuthContext] تحديث state بالبروفايل الجديد:', result.profile);
      setProfile(result.profile);
    } else {
      console.error('❌ [AuthContext] فشل التحديث أو لا يوجد profile في النتيجة');
    }
    return result;
  };

  // تحميل المستخدم الحالي عند بدء التطبيق
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/26cd61a3-4308-4d10-b7ac-fbdcbce75097',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'contexts/AuthContext.tsx:112',message:'Auth initialization started',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      try {
        const [userResult, guestFlag] = await Promise.all([
          AuthManager.getCurrentUser(),
          AsyncStorage.getItem(GUEST_MODE_KEY)
        ]);

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/26cd61a3-4308-4d10-b7ac-fbdcbce75097',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'contexts/AuthContext.tsx:118',message:'Auth data fetched',data:{hasProfile:!!userResult.profile,guestFlag,error:userResult.error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion

        if (!mounted) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/26cd61a3-4308-4d10-b7ac-fbdcbce75097',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'contexts/AuthContext.tsx:121',message:'Component unmounted during init',data:{mounted},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          return;
        }

        if (userResult.profile) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/26cd61a3-4308-4d10-b7ac-fbdcbce75097',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'contexts/AuthContext.tsx:127',message:'Setting profile from storage',data:{profileId:userResult.profile?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          setProfile(userResult.profile);
          setIsGuest(false);
          await AsyncStorage.removeItem(GUEST_MODE_KEY);
        } else {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/26cd61a3-4308-4d10-b7ac-fbdcbce75097',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'contexts/AuthContext.tsx:132',message:'No profile found, setting guest mode',data:{isGuest:guestFlag==='true'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          setProfile(null);
          setIsGuest(guestFlag === 'true');
        }
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/26cd61a3-4308-4d10-b7ac-fbdcbce75097',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'contexts/AuthContext.tsx:136',message:'Setting loading to false',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        setLoading(false);
      } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/26cd61a3-4308-4d10-b7ac-fbdcbce75097',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'contexts/AuthContext.tsx:139',message:'Auth initialization error',data:{error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        console.error('خطأ في تهيئة المصادقة:', error);
        if (mounted) {
          setProfile(null);
          setIsGuest(false);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const value: AuthContextType = {
    profile,
    loading,
    signInWithPhone,
    signOut,
    updateProfile,
    refreshProfile,
    isGuest,
    continueAsGuest,
    exitGuestMode,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
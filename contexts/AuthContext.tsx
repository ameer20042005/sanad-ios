import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthManager from '@/lib/authManager';

interface AuthContextType {
  profile: any | null;
  loading: boolean;
  signInWithPhone: (phone: string) => Promise<{ success: boolean; error?: string; needsRegistration?: boolean }>;
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

  const signInWithPhone = async (phone: string) => {
    const result = await AuthManager.signInWithPhone(phone);
    if (result.success && result.profile) {
      setProfile(result.profile);
      await exitGuestMode();
      return { success: true };
    } else {
      // رقم الهاتف غير موجود - يحتاج للتسجيل
      return { success: false, error: result.error, needsRegistration: true };
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
      try {
        const [userResult, guestFlag] = await Promise.all([
          AuthManager.getCurrentUser(),
          AsyncStorage.getItem(GUEST_MODE_KEY)
        ]);

        if (!mounted) {
          return;
        }

        if (userResult.profile) {
          setProfile(userResult.profile);
          setIsGuest(false);
          await AsyncStorage.removeItem(GUEST_MODE_KEY);
        } else {
          setProfile(null);
          setIsGuest(guestFlag === 'true');
        }
        setLoading(false);
      } catch (error) {
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
import { supabase } from './supabase';
import { DonorProfile, DonorProfileInsert, DonorProfileUpdate } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// مفتاح تخزين بيانات المستخدم
const CURRENT_USER_KEY = '@sanad_current_user';

// حساب افتراضي محلي يمكن استخدامه بدون اتصال بالإنترنت
const DEFAULT_ACCOUNT: DonorProfile = {
  id: 'default-account-id',
  name: 'حساب تجريبي',
  phone: '07000001001',
  blood_type: 'O+',
  governorate: 'بغداد',
  city: 'الكرخ',
  contact_preference: 'anytime',
  morning_from: null,
  morning_to: null,
  evening_from: null,
  evening_to: null,
  is_active: true,
  donation_status: 'متاح',
  last_donation_date: null,
  notes: 'حساب تجريبي للاستخدام بدون اتصال بالإنترنت',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

/**
 * التحقق من وجود اتصال بالإنترنت
 */
async function checkInternetConnection(): Promise<boolean> {
  try {
    const state = await NetInfo.fetch();
    console.log('🌐 AuthManager checkInternetConnection:', {
      isConnected: state.isConnected,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
      details: state.details
    });
    
    // في iOS، isInternetReachable غير موثوق وقد يكون null حتى مع وجود اتصال
    // لذلك نعتمد فقط على isConnected كمعيار أساسي
    // إذا كان isConnected === true، نعتبر أن الإنترنت متاح بغض النظر عن isInternetReachable
    const result = state.isConnected === true;
    console.log('✅ AuthManager checkInternetConnection result:', result);
    return result;
  } catch (error) {
    console.warn('⚠️ خطأ في التحقق من الاتصال:', error);
    // في حالة الخطأ، نفترض وجود اتصال لتجنب منع المستخدم
    return true;
  }
}

/**
 * نظام إدارة تسجيل الدخول بدون مصادقة
 * يعتمد فقط على رقم الهاتف للبحث في جدول donors
 */
export class AuthManager {
  /**
   * تسجيل الدخول باستخدام رقم الهاتف فقط
   * يبحث عن المتبرع في جدول donors باستخدام رقم الهاتف
   * الحساب الافتراضي يستخدم فقط عند استخدام رقم الحساب الافتراضي (07000001001)
   */
  static async signInWithPhone(
    phone: string,
    useDefaultAccount: boolean = false
  ): Promise<{ success: boolean; error?: string; profile?: DonorProfile; isDefaultAccount?: boolean }> {
    try {
      const normalizedPhone = phone.trim();
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/26cd61a3-4308-4d10-b7ac-fbdcbce75097',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/authManager.ts:57',message:'signInWithPhone entry',data:{phone:normalizedPhone,useDefaultAccount,isDefaultPhone:normalizedPhone===DEFAULT_ACCOUNT.phone},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion

      // إذا كان رقم الهاتف هو رقم الحساب الافتراضي أو تم طلب استخدام الحساب الافتراضي، استخدم الحساب الافتراضي مباشرة
      if (normalizedPhone === DEFAULT_ACCOUNT.phone || useDefaultAccount) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/26cd61a3-4308-4d10-b7ac-fbdcbce75097',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/authManager.ts:64',message:'Using default account',data:{reason:normalizedPhone===DEFAULT_ACCOUNT.phone?'default_phone':'useDefaultAccount_flag'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        console.log('✅ استخدام الحساب الافتراضي المحلي');
        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(DEFAULT_ACCOUNT));
        return {
          success: true,
          profile: DEFAULT_ACCOUNT,
          isDefaultAccount: true
        };
      }

      // التحقق من الاتصال بالإنترنت للتسجيل الطبيعي
      const hasInternet = await checkInternetConnection();
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/26cd61a3-4308-4d10-b7ac-fbdcbce75097',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/authManager.ts:75',message:'Internet connection check',data:{hasInternet},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      if (!hasInternet) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/26cd61a3-4308-4d10-b7ac-fbdcbce75097',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/authManager.ts:77',message:'No internet - returning error',data:{hasInternet},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        return {
          success: false,
          error: 'لا يوجد اتصال بالإنترنت. يرجى التحقق من الاتصال والمحاولة مرة أخرى.'
        };
      }

      // محاولة الاتصال بـ Supabase
      try {
        const { data, error: profileError } = await supabase
          .from('donor_profiles')
          .select('*')
          .eq('phone', normalizedPhone)
          .maybeSingle();

        if (profileError) {
          console.error('❌ فشل في جلب الملف:', profileError);
          // في حالة خطأ الشبكة، أعد رسالة خطأ واضحة
          if (profileError.message?.includes('Network') || profileError.message?.includes('network')) {
            return {
              success: false,
              error: 'فشل الاتصال بالشبكة. يرجى التحقق من الاتصال والمحاولة مرة أخرى.'
            };
          }
          return { success: false, error: profileError.message };
        }

        if (!data) {
          return {
            success: false,
            error: 'رقم الهاتف غير مسجل. يرجى التسجيل أولاً'
          };
        }

        // حفظ بيانات المستخدم محلياً
        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data));

        return {
          success: true,
          profile: data as DonorProfile,
          isDefaultAccount: false
        };
      } catch (networkError: any) {
        // في حالة أي خطأ في الشبكة، أعد رسالة خطأ واضحة
        console.error('⚠️ خطأ في الاتصال بالشبكة:', networkError?.message);
        if (networkError?.message?.includes('Network') || networkError?.message?.includes('network') || networkError?.message?.includes('fetch')) {
          return {
            success: false,
            error: 'فشل الاتصال بالشبكة. يرجى التحقق من الاتصال والمحاولة مرة أخرى.'
          };
        }
        throw networkError;
      }

    } catch (error: any) {
      console.error('خطأ في تسجيل الدخول:', error);
      return {
        success: false,
        error: error?.message || 'حدث خطأ غير متوقع أثناء تسجيل الدخول'
      };
    }
  }

  /**
   * إنشاء ملف متبرع جديد
   * يضيف المتبرع إلى جدول donor_profiles
   * إذا لم يكن هناك اتصال بالإنترنت، يحفظ البيانات محلياً فقط
   */
  static async createDonorProfile(
    profileData: DonorProfileInsert
  ): Promise<{ success: boolean; error?: string; profile?: DonorProfile; isLocalOnly?: boolean }> {
    try {
      const normalizedPhone = profileData.phone.trim();

      // التحقق من الاتصال بالإنترنت
      const hasInternet = await checkInternetConnection();

      // إذا لم يكن هناك اتصال، احفظ البيانات محلياً فقط
      if (!hasInternet) {
        console.warn('⚠️ لا يوجد اتصال بالإنترنت - حفظ البيانات محلياً فقط');
        const localProfile: DonorProfile = {
          id: `local-${Date.now()}`,
          name: profileData.name,
          phone: normalizedPhone,
          blood_type: profileData.blood_type,
          governorate: profileData.governorate,
          city: profileData.city,
          contact_preference: profileData.contact_preference || 'anytime',
          morning_from: profileData.morning_from || null,
          morning_to: profileData.morning_to || null,
          evening_from: profileData.evening_from || null,
          evening_to: profileData.evening_to || null,
          is_active: profileData.is_active ?? true,
          donation_status: 'متاح',
          last_donation_date: profileData.last_donation_date || null,
          notes: profileData.notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(localProfile));
        return { success: true, profile: localProfile, isLocalOnly: true };
      }

      // محاولة الاتصال بـ Supabase
      try {
        const { data: existingCheck, error: phoneCheckError } = await supabase
          .from('donor_profiles')
          .select('phone')
          .eq('phone', normalizedPhone)
          .maybeSingle();

        if (phoneCheckError && phoneCheckError.code !== 'PGRST116') {
          console.error('❌ خطأ في فحص الرقم:', phoneCheckError);
          // في حالة خطأ الشبكة، احفظ محلياً
          if (phoneCheckError.message?.includes('Network') || phoneCheckError.message?.includes('network')) {
            console.warn('⚠️ خطأ في الشبكة - حفظ البيانات محلياً');
            const localProfile: DonorProfile = {
              id: `local-${Date.now()}`,
              name: profileData.name,
              phone: normalizedPhone,
              blood_type: profileData.blood_type,
              governorate: profileData.governorate,
              city: profileData.city,
              contact_preference: profileData.contact_preference || 'anytime',
              morning_from: profileData.morning_from || null,
              morning_to: profileData.morning_to || null,
              evening_from: profileData.evening_from || null,
              evening_to: profileData.evening_to || null,
              is_active: profileData.is_active ?? true,
              donation_status: 'متاح',
              last_donation_date: profileData.last_donation_date || null,
              notes: profileData.notes || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(localProfile));
            return { success: true, profile: localProfile, isLocalOnly: true };
          }
          return { success: false, error: phoneCheckError.message };
        }

        if (existingCheck) {
          return { success: false, error: 'رقم الهاتف مسجل مسبقاً' };
        }

        const payload: DonorProfileInsert = {
          ...profileData,
          phone: normalizedPhone,
          contact_preference: profileData.contact_preference || 'anytime',
          is_active: profileData.is_active ?? true,
        };

        const { data, error } = await supabase
          .from('donor_profiles')
          .insert([payload])
          .select('*')
          .maybeSingle();

        if (error) {
          if (error.code === '23505') {
            return { success: false, error: 'رقم الهاتف مسجل مسبقاً' };
          }
          // في حالة خطأ الشبكة، احفظ محلياً
          if (error.message?.includes('Network') || error.message?.includes('network')) {
            console.warn('⚠️ خطأ في الشبكة أثناء الإنشاء - حفظ البيانات محلياً');
            const localProfile: DonorProfile = {
              id: `local-${Date.now()}`,
              name: profileData.name,
              phone: normalizedPhone,
              blood_type: profileData.blood_type,
              governorate: profileData.governorate,
              city: profileData.city,
              contact_preference: profileData.contact_preference || 'anytime',
              morning_from: profileData.morning_from || null,
              morning_to: profileData.morning_to || null,
              evening_from: profileData.evening_from || null,
              evening_to: profileData.evening_to || null,
              is_active: profileData.is_active ?? true,
              donation_status: 'متاح',
              last_donation_date: profileData.last_donation_date || null,
              notes: profileData.notes || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(localProfile));
            return { success: true, profile: localProfile, isLocalOnly: true };
          }
          return { success: false, error: 'فشل في إنشاء الملف الشخصي: ' + error.message };
        }

        if (!data) {
          return { success: false, error: 'فشل في إنشاء الملف الشخصي' };
        }

        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data));

        return { success: true, profile: data, isLocalOnly: false };
      } catch (networkError: any) {
        // في حالة أي خطأ في الشبكة، احفظ محلياً
        console.warn('⚠️ خطأ في الاتصال بالشبكة أثناء الإنشاء:', networkError?.message);
        if (networkError?.message?.includes('Network') || networkError?.message?.includes('network') || networkError?.message?.includes('fetch')) {
          const localProfile: DonorProfile = {
            id: `local-${Date.now()}`,
            name: profileData.name,
            phone: normalizedPhone,
            blood_type: profileData.blood_type,
            governorate: profileData.governorate,
            city: profileData.city,
            contact_preference: profileData.contact_preference || 'anytime',
            morning_from: profileData.morning_from || null,
            morning_to: profileData.morning_to || null,
            evening_from: profileData.evening_from || null,
            evening_to: profileData.evening_to || null,
            is_active: profileData.is_active ?? true,
            donation_status: 'متاح',
            last_donation_date: profileData.last_donation_date || null,
            notes: profileData.notes || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(localProfile));
          return { success: true, profile: localProfile, isLocalOnly: true };
        }
        throw networkError;
      }
    } catch (error: any) {
      console.error('خطأ في إنشاء ملف المتبرع:', error);
      return { success: false, error: error?.message || 'حدث خطأ غير متوقع' };
    }
  }

  /**
   * تسجيل الخروج
   */
  static async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
      return { success: true };
    } catch (error: any) {
      console.error('خطأ في تسجيل الخروج:', error);
      return {
        success: false,
        error: error?.message || 'حدث خطأ أثناء تسجيل الخروج'
      };
    }
  }

  /**
   * الحصول على المستخدم الحالي من التخزين المحلي
   */
  static async getCurrentUser(): Promise<{ profile: any | null; error?: string }> {
    try {
      const userData = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (!userData) {
        return { profile: null };
      }

      const profile = JSON.parse(userData);
      return { profile };
    } catch (error: any) {
      console.error('خطأ في الحصول على المستخدم:', error);
      return {
        profile: null,
        error: error?.message || 'حدث خطأ أثناء الحصول على بيانات المستخدم'
      };
    }
  }

  /**
   * تحديث بيانات المتبرع
   * إذا لم يكن هناك اتصال بالإنترنت، يحدث البيانات محلياً فقط
   */
  static async updateDonorProfile(
    donorId: string,
    updates: DonorProfileUpdate
  ): Promise<{ success: boolean; error?: string; profile?: DonorProfile; isLocalOnly?: boolean }> {
    try {
      console.log('🔄 تحديث البيانات:', { donorId, updates });
      
      // التحقق من الاتصال بالإنترنت
      const hasInternet = await checkInternetConnection();

      // إذا كان الحساب محلياً (يبدأ بـ local- أو default-)، حدث محلياً فقط
      if (donorId.startsWith('local-') || donorId.startsWith('default-') || !hasInternet) {
        console.log('📱 تحديث محلي فقط (حساب محلي أو بدون اتصال)');
        const { profile: currentProfile } = await this.getCurrentUser();
        if (!currentProfile) {
          return { success: false, error: 'لم يتم العثور على بيانات المستخدم' };
        }
        
        const updatedProfile: DonorProfile = {
          ...currentProfile,
          ...updates,
          updated_at: new Date().toISOString(),
        };
        
        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedProfile));
        console.log('💾 تم تحديث البيانات محلياً');
        return { success: true, profile: updatedProfile, isLocalOnly: true };
      }

      // محاولة التحديث على Supabase
      try {
        const sanitizedUpdates = Object.entries(updates || {}).reduce<Record<string, any>>((acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = value;
          }
          return acc;
        }, {});

        const { data, error: updateError } = await supabase
          .from('donor_profiles')
          .update(sanitizedUpdates)
          .eq('id', donorId)
          .select('*')
          .single();

        if (updateError) {
          console.error('❌ خطأ في التحديث:', updateError);
          // في حالة خطأ الشبكة، حدث محلياً
          if (updateError.message?.includes('Network') || updateError.message?.includes('network')) {
            console.warn('⚠️ خطأ في الشبكة - تحديث محلي');
            const { profile: currentProfile } = await this.getCurrentUser();
            if (currentProfile) {
              const updatedProfile: DonorProfile = {
                ...currentProfile,
                ...updates,
                updated_at: new Date().toISOString(),
              };
              await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedProfile));
              return { success: true, profile: updatedProfile, isLocalOnly: true };
            }
          }
          return { success: false, error: 'فشل في تحديث الملف الشخصي: ' + updateError.message };
        }

        if (!data) {
          console.error('❌ لم يتم العثور على البيانات بعد التحديث');
          return { success: false, error: 'لم يتم العثور على بيانات المستخدم بعد التحديث' };
        }

        console.log('📊 البيانات المحدثة:', data);

        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data));
        console.log('💾 تم حفظ البيانات في AsyncStorage');

        return { success: true, profile: data, isLocalOnly: false };
      } catch (networkError: any) {
        // في حالة أي خطأ في الشبكة، حدث محلياً
        console.warn('⚠️ خطأ في الاتصال بالشبكة أثناء التحديث:', networkError?.message);
        if (networkError?.message?.includes('Network') || networkError?.message?.includes('network') || networkError?.message?.includes('fetch')) {
          const { profile: currentProfile } = await this.getCurrentUser();
          if (currentProfile) {
            const updatedProfile: DonorProfile = {
              ...currentProfile,
              ...updates,
              updated_at: new Date().toISOString(),
            };
            await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedProfile));
            return { success: true, profile: updatedProfile, isLocalOnly: true };
          }
        }
        throw networkError;
      }
    } catch (error: any) {
      console.error('خطأ في تحديث ملف المتبرع:', error);
      return { success: false, error: error?.message || 'حدث خطأ غير متوقع' };
    }
  }

  /**
   * التحقق من صحة رقم الهاتف العراقي
   */
  static isValidIraqiPhone(phone: string): boolean {
    const phoneRegex = /^(07[3-9]\d{8}|07[0-2]\d{8})$/;
    return phoneRegex.test(phone);
  }
}

export default AuthManager;
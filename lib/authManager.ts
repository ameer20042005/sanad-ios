import { supabase } from './supabase';
import { DonorProfile, DonorProfileInsert, DonorProfileUpdate } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// مفتاح تخزين بيانات المستخدم
const CURRENT_USER_KEY = '@sanad_current_user';

/**
 * نظام إدارة تسجيل الدخول بدون مصادقة
 * يعتمد فقط على رقم الهاتف للبحث في جدول donors
 */
export class AuthManager {
  /**
   * تسجيل الدخول باستخدام رقم الهاتف فقط
   * يبحث عن المتبرع في جدول donors باستخدام رقم الهاتف
   */
  static async signInWithPhone(
    phone: string
  ): Promise<{ success: boolean; error?: string; profile?: DonorProfile }> {
    try {
      const normalizedPhone = phone.trim();

      const { data, error: profileError } = await supabase
        .from('donor_profiles')
        .select('*')
        .eq('phone', normalizedPhone)
        .maybeSingle();

      if (profileError) {
        console.error('❌ فشل في جلب الملف:', profileError);
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
        profile: data as DonorProfile
      };

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
   */
  static async createDonorProfile(
    profileData: DonorProfileInsert
  ): Promise<{ success: boolean; error?: string; profile?: DonorProfile }> {
    try {
      const normalizedPhone = profileData.phone.trim();

      const { data: existingCheck, error: phoneCheckError } = await supabase
        .from('donor_profiles')
        .select('phone')
        .eq('phone', normalizedPhone)
        .maybeSingle();

      if (phoneCheckError && phoneCheckError.code !== 'PGRST116') {
        console.error('❌ خطأ في فحص الرقم:', phoneCheckError);
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
        return { success: false, error: 'فشل في إنشاء الملف الشخصي: ' + error.message };
      }

      if (!data) {
        return { success: false, error: 'فشل في إنشاء الملف الشخصي' };
      }

      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data));

      return { success: true, profile: data };
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
   */
  static async updateDonorProfile(
    donorId: string,
    updates: DonorProfileUpdate
  ): Promise<{ success: boolean; error?: string; profile?: DonorProfile }> {
    try {
      console.log('🔄 تحديث البيانات:', { donorId, updates });
      
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
        return { success: false, error: 'فشل في تحديث الملف الشخصي: ' + updateError.message };
      }

      if (!data) {
        console.error('❌ لم يتم العثور على البيانات بعد التحديث');
        return { success: false, error: 'لم يتم العثور على بيانات المستخدم بعد التحديث' };
      }

      console.log('📊 البيانات المحدثة:', data);

      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data));
      console.log('💾 تم حفظ البيانات في AsyncStorage');

      return { success: true, profile: data };
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
import { supabase } from './supabase';
import AuthManager from './authManager';

/**
 * نظام إدارة البيانات الشخصية للمتبرعين
 * يعمل بدون نظام مصادقة Supabase
 */
export class ProfileManager {
  /**
   * الحصول على البيانات الشخصية للمستخدم الحالي
   */
  static async getCurrentUserProfile(): Promise<{ profile: any | null; error?: string }> {
    try {
      const result = await AuthManager.getCurrentUser();
      return { profile: result.profile, error: result.error };
    } catch (error: any) {
      console.error('خطأ في جلب البيانات الشخصية:', error);
      return { 
        profile: null, 
        error: error?.message || 'حدث خطأ غير متوقع' 
      };
    }
  }

  /**
   * تحديث البيانات الشخصية للمستخدم الحالي
   */
  static async updateProfile(updates: any): Promise<{ success: boolean; error?: string; profile?: any }> {
    try {
      const currentUser = await AuthManager.getCurrentUser();
      
      if (!currentUser.profile) {
        return { 
          success: false, 
          error: 'يجب تسجيل الدخول أولاً' 
        };
      }

      const result = await AuthManager.updateDonorProfile(currentUser.profile.id, updates);
      return result;

    } catch (error: any) {
      console.error('خطأ في تحديث البيانات:', error);
      return { 
        success: false, 
        error: error?.message || 'حدث خطأ غير متوقع أثناء التحديث' 
      };
    }
  }

  /**
   * البحث عن المتبرعين المتاحين
   */
  static async searchAvailableDonors(
    filters?: {
      bloodType?: string;
      governorate?: string;
      city?: string;
    }
  ): Promise<{ donors: any[]; error?: string }> {
    try {
      const currentUser = await AuthManager.getCurrentUser();
      
      let query = supabase
        .from('donor_profiles')
        .select('*')
        .eq('is_active', true);

      // استبعاد المستخدم الحالي من النتائج
      if (currentUser.profile) {
        query = query.neq('id', currentUser.profile.id);
      }

      // تطبيق المرشحات
      if (filters?.bloodType) {
        query = query.eq('blood_type', filters.bloodType);
      }
      
      if (filters?.governorate) {
        query = query.eq('governorate', filters.governorate);
      }
      
      if (filters?.city) {
        query = query.eq('city', filters.city);
      }

      const { data: donors, error: searchError } = await query
        .order('created_at', { ascending: false })
        .limit(50);

      if (searchError) {
        return { 
          donors: [], 
          error: 'خطأ في البحث: ' + searchError.message 
        };
      }

      return { donors: donors || [] };

    } catch (error: any) {
      console.error('خطأ في البحث عن المتبرعين:', error);
      return { 
        donors: [], 
        error: error?.message || 'حدث خطأ أثناء البحث' 
      };
    }
  }

  /**
   * تحديث حالة الاستعداد للتبرع
   */
  static async updateAvailability(
    isAvailable: boolean,
    lastDonationDate?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const updates: any = {
        is_active: isAvailable
      };

      if (lastDonationDate) {
        updates.last_donation_date = lastDonationDate;
      }

      const result = await this.updateProfile(updates);
      
      return {
        success: result.success,
        error: result.error
      };

    } catch (error: any) {
      console.error('خطأ في تحديث حالة التبرع:', error);
      return { 
        success: false, 
        error: error?.message || 'حدث خطأ أثناء تحديث حالة التبرع' 
      };
    }
  }

  /**
   * حذف الملف الشخصي
   */
  static async deleteProfile(): Promise<{ success: boolean; error?: string }> {
    try {
      const currentUser = await AuthManager.getCurrentUser();
      
      if (!currentUser.profile) {
        return { 
          success: false, 
          error: 'يجب تسجيل الدخول أولاً' 
        };
      }

      const { error: deleteError } = await supabase
        .from('donor_profiles')
        .delete()
        .eq('id', currentUser.profile.id);

      if (deleteError) {
        return { 
          success: false, 
          error: 'خطأ في حذف الملف الشخصي: ' + deleteError.message 
        };
      }

      // تسجيل خروج المستخدم
      await AuthManager.signOut();

      return { success: true };

    } catch (error: any) {
      console.error('خطأ في حذف الملف الشخصي:', error);
      return { 
        success: false, 
        error: error?.message || 'حدث خطأ أثناء حذف الملف الشخصي' 
      };
    }
  }

  /**
   * التحقق من صحة بيانات المتبرع
   */
  static validateDonorData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.name && data.name.trim().length < 3) {
      errors.push('الاسم يجب أن يكون 3 أحرف على الأقل');
    }

    if (data.phone) {
      const phoneRegex = /^(07[3-9]\d{8}|07[0-2]\d{8})$/;
      if (!phoneRegex.test(data.phone)) {
        errors.push('رقم الهاتف غير صحيح (مثال: 07901234567)');
      }
    }

    if (data.blood_type && !['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(data.blood_type)) {
      errors.push('فصيلة الدم غير صحيحة');
    }

    if (data.contact_preference && !['anytime', 'morning', 'evening'].includes(data.contact_preference)) {
      errors.push('تفضيل وقت الاتصال غير صحيح');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * إحصائيات المتبرعين
   */
  static async getDonorStats(): Promise<{ 
    totalDonors: number; 
    availableDonors: number; 
    error?: string;
  }> {
    try {
      // إجمالي المتبرعين
      const { count: totalDonors, error: totalError } = await supabase
        .from('donor_profiles')
        .select('*', { count: 'exact', head: true });

      if (totalError) {
        return { 
          totalDonors: 0, 
          availableDonors: 0, 
          error: 'خطأ في جلب الإحصائيات' 
        };
      }

      // المتبرعين المتاحين
      const { count: availableDonors, error: availableError } = await supabase
        .from('donor_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (availableError) {
        return { 
          totalDonors: totalDonors || 0, 
          availableDonors: 0, 
          error: 'خطأ في جلب إحصائيات المتبرعين المتاحين' 
        };
      }

      return {
        totalDonors: totalDonors || 0,
        availableDonors: availableDonors || 0
      };

    } catch (error: any) {
      console.error('خطأ في جلب الإحصائيات:', error);
      return { 
        totalDonors: 0, 
        availableDonors: 0, 
        error: error?.message || 'حدث خطأ في جلب الإحصائيات' 
      };
    }
  }
}

export default ProfileManager;
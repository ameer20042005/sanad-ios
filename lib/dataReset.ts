// دالة لمسح جميع البيانات المحفوظة محلياً وإعادة تعيين الحالة
// استخدم هذه الدالة عند تغيير قاعدة البيانات أو عند مشاكل في الحالة القديمة

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';

export const clearAllAppData = async () => {
  try {
    // مسح جميع البيانات المحلية
    await AsyncStorage.clear();
    
    console.log('✅ تم مسح جميع البيانات بنجاح');
    
    return true;
  } catch (error) {
    console.error('خطأ في مسح البيانات:', error);
    return false;
  }
};

export const refreshUserProfile = async () => {
  try {
    // مسح البيانات المحلية القديمة فقط
    await AsyncStorage.removeItem('userSession');
    await AsyncStorage.removeItem('userData');
    await AsyncStorage.removeItem('@sanad_current_user');
    
    console.log('✅ تم مسح البيانات المحلية');
    return { success: true, profile: null };
  } catch (error) {
    console.error('خطأ في تحديث البيانات:', error);
    return { success: false, error: error.message };
  }
};

export const showDataResetDialog = () => {
  Alert.alert(
    'إعادة تعيين البيانات',
    'هل تريد مسح جميع البيانات المحفوظة محلياً وإعادة بدء التطبيق؟\n\nهذا سيساعد في حل مشاكل البيانات القديمة.',
    [
      {
        text: 'إلغاء',
        style: 'cancel'
      },
      {
        text: 'مسح البيانات',
        style: 'destructive',
        onPress: async () => {
          const success = await clearAllAppData();
          if (success) {
            Alert.alert('تم', 'تم مسح البيانات بنجاح. يرجى إعادة تشغيل التطبيق.');
          } else {
            Alert.alert('خطأ', 'حدث خطأ أثناء مسح البيانات.');
          }
        }
      }
    ]
  );
};
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';

export default function DatabaseTestScreen() {
  const [loading, setLoading] = React.useState(false);

  const runDatabaseTests = async () => {
    setLoading(true);
    try {
      console.log('🚀 بدء اختبارات قاعدة البيانات...');

      // اختبار: جلب بيانات المتبرعين
      console.log('📋 اختبار: جلب بيانات المتبرعين');
      const { data: donors, error: donorsError } = await supabase
        .from('donor_profiles')
        .select('id, name, phone, contact_preference')
        .limit(5);

      if (donorsError) {
        console.error('❌ خطأ في جلب المتبرعين:', donorsError);
        Alert.alert('خطأ', 'فشل في جلب بيانات المتبرعين: ' + donorsError.message);
      } else {
        console.log('✅ تم جلب المتبرعين:', donors);
        Alert.alert('نجح', `تم جلب ${donors?.length || 0} متبرع بنجاح`);
      }

      console.log('✅ انتهت جميع الاختبارات');

    } catch (error: any) {
      console.error('❌ خطأ في الاختبارات:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء الاختبارات: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkContactTimes = async () => {
    try {
      console.log('🔍 فحص أوقات الاتصال...');
      const { data: donors, error } = await supabase
        .from('donor_profiles')
        .select('id, name, contact_preference, morning_from, morning_to, evening_from, evening_to')
        .limit(10);

      if (error) {
        console.error('❌ خطأ في جلب البيانات:', error);
        Alert.alert('خطأ', 'فشل في جلب بيانات أوقات الاتصال');
        return;
      }

      console.log('📊 بيانات أوقات الاتصال:', donors);

      const summary = donors?.map(d => ({
        name: d.name,
        preference: d.contact_preference,
        morning: d.contact_preference === 'morning' || d.contact_preference === 'anytime' ?
          `${d.morning_from || '08:00'} - ${d.morning_to || '12:00'}` : 'غير محدد',
        evening: d.contact_preference === 'evening' || d.contact_preference === 'anytime' ?
          `${d.evening_from || '18:00'} - ${d.evening_to || '22:00'}` : 'غير محدد'
      }));

      Alert.alert('أوقات الاتصال', `تم فحص ${donors?.length || 0} متبرع\n\n${summary?.map(s =>
        `${s.name}: ${s.preference}\nصباح: ${s.morning}\nمساء: ${s.evening}\n---`
      ).join('\n') || 'لا توجد بيانات'}`);

    } catch (error: any) {
      console.error('❌ خطأ في فحص أوقات الاتصال:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء الفحص');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>اختبار قاعدة البيانات</Text>
        <Text style={styles.subtitle}>اختبار وظائف أوقات الاتصال والإصلاحات</Text>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={runDatabaseTests}
          disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? 'جاري الاختبار...' : '🚀 تشغيل جميع الاختبارات'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={checkContactTimes}>
          <Text style={styles.buttonText}>🔍 فحص أوقات الاتصال</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            console.log('📋 سجل الإخراج:');
            console.log('يمكنك الآن فحص سجل الإخراج في وحدة التحكم للتأكد من النتائج');
            Alert.alert('سجل الإخراج', 'تحقق من وحدة التحكم (Console) لرؤية تفاصيل العمليات');
          }}>
          <Text style={styles.buttonText}>📋 عرض سجل الإخراج</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#E53E3E',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#E53E3E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
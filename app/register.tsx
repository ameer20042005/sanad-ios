import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Snackbar } from 'react-native-paper';
import ListPicker from '@/components/ListPicker';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Droplet, User, Phone, MapPin, ArrowLeft } from 'lucide-react-native';
import AdBanner from '@/components/AdBanner';
import ContactTimePicker from '@/components/ContactTimePicker';
import TimePreview from '@/components/TimePreview';
import NavigationHelper from '@/lib/navigationHelper';
import AuthManager from '@/lib/authManager';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import NoInternetModal from '@/components/NoInternetModal';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// البيانات الجغرافية للمحافظات والمدن العراقية
const iraqiGovernorates = {
  'بغداد': ['الكرخ', 'الرصافة', 'الأعظمية', 'الكاظمية', 'الشعب', 'الثورة', 'الكرادة', 'المنصور', 'الدورة', 'أبو غريب', 'المحمودية', 'التاجي'],
  'البصرة': ['الهارثة', 'الزبير', 'الفاو', 'القرنة', 'أبو الخصيب', 'شط العرب', 'المدينة', 'الدير', 'الرميلة'],
  'نينوى': ['الموصل', 'تلعفر', 'بعشيقة', 'حمدانية', 'الشيخان', 'سنجار', 'القيارة', 'الحضر', 'الحمدانية', 'برطلة'],
  'أربيل': ['أربيل المركز', 'سوران', 'شقلاوة', 'كويسنجق', 'خبات', 'مخمور', 'ميركة سور', 'رواندوز'],
  'كركوك': ['كركوك المركز', 'الحويجة', 'داقوق', 'دبس', 'الرياض', 'الملتقى'],
  'الأنبار': ['الرمادي', 'الفلوجة', 'هيت', 'حديثة', 'عانة', 'راوة', 'القائم', 'الرطبة', 'عكاشات'],
  'النجف': ['النجف المركز', 'الكوفة', 'المناذرة', 'أبو صخير'],
  'كربلاء': ['كربلاء المركز', 'الهندية', 'عين التمر', 'الجدول الغربي'],
  'بابل': ['الحلة', 'المسيب', 'المحاويل', 'الهاشمية', 'القاسم'],
  'ذي قار': ['الناصرية', 'الشطرة', 'سوق الشيوخ', 'الرفاعي', 'قلعة سكر', 'الجبايش'],
  'واسط': ['الكوت', 'الحي', 'الصويرة', 'العزيزية', 'النعمانية', 'بدرة', 'جصان'],
  'ميسان': ['العمارة', 'المجر الكبير', 'قلعة صالح', 'الميمونة', 'الكحلاء', 'علي الغربي'],
  'الديوانية': ['الديوانية المركز', 'عفك', 'الشامية', 'الحمزة', 'نفر', 'السنية'],
  'صلاح الدين': ['تكريت', 'سامراء', 'بيجي', 'الدور', 'الشرقاط', 'بلد', 'الطوز', 'سليمان بك'],
  'ديالى': ['بعقوبة', 'المقدادية', 'الخالص', 'بلدروز', 'كفري', 'خانقين', 'جلولاء', 'قزانية'],
  'المثنى': ['السماوة', 'الرميثة', 'الخضر', 'السلمان', 'الوركاء'],
  'دهوك': ['دهوك المركز', 'زاخو', 'عقرة', 'أميدي', 'سيميل', 'الشيخان'],
  'السليمانية': ['السليمانية المركز', 'حلبجة', 'رانية', 'دوكان', 'كلار', 'شارباژێر', 'پشدەر']
};

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bloodType: 'A+',
    governorate: '',
    city: '',
    contactPreference: 'anytime',
    morningFrom: '08:00',
    morningTo: '12:00',
    eveningFrom: '18:00',
    eveningTo: '22:00',
    notes: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');
  const [showNoInternetModal, setShowNoInternetModal] = useState(false);
  const { hasInternetConnection } = useNetworkStatus();

  // دالة لإظهار رسائل التنبيه
  const showSnackbar = (message: string, type: 'success' | 'error' = 'success') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };

  // دالة لتحديث بيانات النموذج
  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      
      // إذا تم تغيير المحافظة، قم بإعادة تعيين المدينة
      if (field === 'governorate') {
        newData.city = '';
      }
      
      return newData;
    });
  };

  // التحقق من صحة البيانات
  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'يرجى إدخال الاسم الكامل';
    }
    
    if (!formData.phone.trim()) {
      return 'يرجى إدخال رقم الهاتف';
    }
    
    // التحقق من صحة رقم الهاتف العراقي
    const phoneRegex = /^(07[3-9]\d{8}|07[0-2]\d{8})$/;
    if (!phoneRegex.test(formData.phone)) {
      return 'يرجى إدخال رقم هاتف عراقي صحيح (مثال: 07901234567)';
    }
    
    if (!formData.governorate) {
      return 'يرجى اختيار المحافظة';
    }
    
    if (!formData.city) {
      return 'يرجى اختيار المدينة';
    }
    
    return null;
  };

  // دالة التسجيل
  const handleRegister = async () => {
    // التحقق من الاتصال بالإنترنت
    if (!(await hasInternetConnection())) {
      setShowNoInternetModal(true);
      return;
    }

    // التحقق من صحة البيانات
    const validationError = validateForm();
    if (validationError) {
      showSnackbar(validationError, 'error');
      return;
    }

    setLoading(true);

    try {
      // إعداد بيانات المتبرع
      const donorData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        blood_type: formData.bloodType as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-',
        governorate: formData.governorate,
        city: formData.city,
        contact_preference: formData.contactPreference as 'anytime' | 'morning' | 'evening',
        morning_from: formData.contactPreference === 'morning' || formData.contactPreference === 'anytime' ? formData.morningFrom : null,
        morning_to: formData.contactPreference === 'morning' || formData.contactPreference === 'anytime' ? formData.morningTo : null,
        evening_from: formData.contactPreference === 'evening' || formData.contactPreference === 'anytime' ? formData.eveningFrom : null,
        evening_to: formData.contactPreference === 'evening' || formData.contactPreference === 'anytime' ? formData.eveningTo : null,
        notes: formData.notes.trim() || null,
        is_active: true,
      };

      // إنشاء ملف المتبرع باستخدام AuthManager
      const result = await AuthManager.createDonorProfile(donorData);
      
      if (!result.success) {
        showSnackbar(result.error || 'حدث خطأ أثناء حفظ البيانات', 'error');
        return;
      }

      // نجح حفظ بيانات المتبرع
      showSnackbar('تم التسجيل بنجاح! مرحباً بك في سند 🎉');
      
      // الانتقال للصفحة الرئيسية بعد ثانيتين
      setTimeout(() => {
        NavigationHelper.replaceWith('/(tabs)');
      }, 2000);

    } catch (error: any) {
      console.error('خطأ كامل:', error);
      
      let errorMessage = 'حدث خطأ غير متوقع';
      
      if (error?.code === '23505') {
        errorMessage = 'رقم الهاتف مسجل مسبقاً';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AdBanner />
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* رأس الصفحة */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>تسجيل متبرع جديد</Text>
          <TouchableOpacity onPress={() => NavigationHelper.safeGoBack()} style={styles.backButton}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* البطاقة الرئيسية */}
        <Card style={styles.mainCard}>
          <Card.Content style={styles.cardContent}>
            {/* العنوان التوضيحي */}
            <View style={styles.titleContainer}>
              <Text style={styles.mainTitle}>تسجيل متبرع جديد</Text>
              <Text style={styles.subtitle}>سجل بياناتك للانضمام لمجتمع المنقذين</Text>
            </View>

            {/* الاسم الكامل */}
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>الاسم الكامل</Text>
              <TextInput
                style={styles.textInput}
                placeholder="أدخل اسمك الثلاثي أو الرباعي"
                value={formData.name}
                onChangeText={(value) => updateFormData('name', value)}
                textAlign="right"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* رقم الهاتف */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>رقم الهاتف</Text>
              <TextInput
                style={styles.textInput}
                placeholder="07XXXXXXXX"
                value={formData.phone}
                onChangeText={(value) => updateFormData('phone', value)}
                keyboardType="phone-pad"
                textAlign="right"
                maxLength={11}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* فصيلة الدم */}
            <ListPicker
              label="فصيلة الدم"
              value={formData.bloodType}
              options={bloodTypes.map(type => ({ label: type, value: type }))}
              onChange={(value) => updateFormData('bloodType', value)}
              title="اختر فصيلة الدم"
            />

            {/* المحافظة */}
            <ListPicker
              label="المحافظة"
              value={formData.governorate}
              placeholder="اختر المحافظة"
              options={Object.keys(iraqiGovernorates).map(gov => ({ label: gov, value: gov }))}
              onChange={(value) => updateFormData('governorate', value)}
              title="اختر المحافظة"
            />

            {/* المدينة */}
            <ListPicker
              label="المدينة"
              value={formData.city}
              placeholder={formData.governorate ? "اختر المدينة" : "اختر المحافظة أولاً"}
              options={formData.governorate && iraqiGovernorates[formData.governorate as keyof typeof iraqiGovernorates]
                ? iraqiGovernorates[formData.governorate as keyof typeof iraqiGovernorates].map(city => ({ label: city, value: city }))
                : []}
              onChange={(value) => updateFormData('city', value)}
              disabled={!formData.governorate}
              title="اختر المدينة"
            />
            {!formData.governorate && (
              <Text style={styles.helperText}>يرجى اختيار المحافظة أولاً</Text>
            )}

            {/* أوقات الاتصال المفضلة */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>أوقات الاتصال المفضلة</Text>
              <ContactTimePicker
                value={{
                  type: formData.contactPreference as 'anytime' | 'morning' | 'evening',
                  morningFrom: formData.morningFrom,
                  morningTo: formData.morningTo,
                  eveningFrom: formData.eveningFrom,
                  eveningTo: formData.eveningTo,
                }}
                onChange={(preference) => {
                  setFormData(prev => ({
                    ...prev,
                    contactPreference: preference.type,
                    morningFrom: preference.morningFrom || '08:00',
                    morningTo: preference.morningTo || '12:00',
                    eveningFrom: preference.eveningFrom || '18:00',
                    eveningTo: preference.eveningTo || '22:00',
                  }));
                }}
              />
            </View>

            {/* معاينة أوقات الاتصال */}
            <TimePreview
              contactPreference={formData.contactPreference as 'anytime' | 'morning' | 'evening'}
              morningFrom={formData.morningFrom}
              morningTo={formData.morningTo}
              eveningFrom={formData.eveningFrom}
              eveningTo={formData.eveningTo}
            />

            {/* ملاحظات إضافية */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>ملاحظات إضافية (اختياري)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="أي معلومات إضافية تود إضافتها..."
                value={formData.notes}
                onChangeText={(value) => updateFormData('notes', value)}
                textAlign="right"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* زر التسجيل */}
            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.registerButton}
              contentStyle={styles.registerButtonContent}
              labelStyle={styles.registerButtonText}
            >
              {loading ? 'جاري التسجيل...' : 'تسجيل كمتبرع'}
            </Button>

            {/* معلومات إضافية */}
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                💡 ملاحظة: بياناتك آمنة ومحمية، وسيتم استخدامها فقط للتواصل عند الحاجة للتبرع
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* رسائل التنبيه */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        style={[
          styles.snackbar,
          snackbarType === 'error' ? styles.errorSnackbar : styles.successSnackbar
        ]}
        action={{
          label: 'إغلاق',
          onPress: () => setSnackbarVisible(false),
          textColor: '#FFFFFF'
        }}
      >
        <Text style={styles.snackbarText}>{snackbarMessage}</Text>
      </Snackbar>

      {/* نافذة عدم الاتصال */}
      <NoInternetModal
        visible={showNoInternetModal}
        onClose={() => setShowNoInternetModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  mainCard: {
    margin: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    padding: 24,
  },
  titleContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    paddingRight: 150,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    textAlign: 'right',
    writingDirection: 'ltr',
    
  },
  pickerContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    position: 'relative',
    overflow: 'hidden',
    minHeight: 60,
    justifyContent: 'center',
  },
  picker: {
    height: 60,
    color: '#111827',
    backgroundColor: 'transparent',
  },
  disabledPicker: {
    opacity: 0.5,
  },

  helperText: {
    fontSize: 12,
    color: '#EF4444',
    textAlign: 'right',
    marginTop: 4,
  },
  registerButton: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    marginTop: 20,
    elevation: 2,
  },
  registerButtonContent: {
    paddingVertical: 8,
  },
  registerButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  infoContainer: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  infoText: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'right',
    lineHeight: 20,
  },
  snackbar: {
    marginBottom: 20,
    marginHorizontal: 16,
  },
  successSnackbar: {
    backgroundColor: '#059669',
  },
  errorSnackbar: {
    backgroundColor: '#DC2626',
  },
  snackbarText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'right',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
});
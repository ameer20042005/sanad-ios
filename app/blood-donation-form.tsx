import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  I18nManager,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Surface,
  useTheme,
} from 'react-native-paper';
import ListPicker from '@/components/ListPicker';
import { supabase } from '@/lib/supabase';
import { setupRTL } from '@/lib/rtl';
import AuthManager from '@/lib/authManager';
import { useAuth } from '@/contexts/AuthContext';
import { Droplet, User, Phone, MapPin, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import NavigationHelper from '@/lib/navigationHelper';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdBanner from '@/components/AdBanner';
import { TouchableOpacity } from 'react-native';
import { sendBloodDonationRequestNotification } from '@/lib/notificationService';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import NoInternetModal from '@/components/NoInternetModal';

// Iraqi governorates and their cities
const iraqiLocations: { [key: string]: string[] } = {
  'بغداد': ['الكاظمية', 'الأعظمية', 'المدينة', 'الكرخ', 'الرصافة', 'الصدر', 'الشعلة', 'الحرية'],
  'البصرة': ['البصرة المركز', 'الزبير', 'أبو الخصيب', 'القرنة', 'شط العرب', 'الفاو', 'المدينة'],
  'نينوى': ['الموصل', 'تلعفر', 'الحمدانية', 'الشيخان', 'سنجار', 'تلكيف', 'القيارة'],
  'أربيل': ['أربيل المركز', 'كويسنجق', 'شقلاوة', 'صلاح الدين', 'دهوك', 'رواندوز', 'مخمور'],
  'النجف': ['النجف المركز', 'الكوفة', 'المناذرة', 'أبو صخير', 'الحيدرية'],
  'كربلاء': ['كربلاء المركز', 'عين تمر', 'الهندية', 'الحر', 'الجدول الغربي'],
  'الأنبار': ['الرمادي', 'الفلوجة', 'هيت', 'حديثة', 'عانة', 'راوة', 'القائم'],
  'بابل': ['الحلة', 'المسيب', 'الهاشمية', 'المحاويل', 'الإسكندرية', 'مدحتية'],
  'كركوك': ['كركوك المركز', 'الحويجة', 'داقوق', 'دبس', 'الرياض', 'مكشوط'],
  'واسط': ['الكوت', 'الحي', 'الصويرة', 'النعمانية', 'الأزيزية', 'بدرة'],
  'صلاح الدين': ['تكريت', 'سامراء', 'بيجي', 'الدور', 'الطوز', 'بلد'],
  'القادسية': ['الديوانية', 'الشامية', 'عفك', 'الحمزة', 'غماس', 'السنية'],
  'ديالى': ['بعقوبة', 'المقدادية', 'خانقين', 'كفري', 'المندلي', 'جلولاء'],
  'المثنى': ['السماوة', 'الرميثة', 'الخضر', 'السلمان', 'الوركاء'],
  'ذي قار': ['الناصرية', 'الشطرة', 'سوق الشيوخ', 'الرفاعي', 'قلعة سكر'],
  'ميسان': ['العمارة', 'المجر الكبير', 'الميمونة', 'علي الشرقي', 'قلعة صالح'],
  'دهوك': ['دهوك المركز', 'زاخو', 'عقرة', 'سيميل', 'الشيخان', 'العمادية'],
  'السليمانية': ['السليمانية المركز', 'حلبجة', 'رانية', 'دوكان', 'كلار', 'دربنديخان'],
};

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function BloodDonationFormScreen() {
  const theme = useTheme();
  const { profile, isGuest } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    governorate: '',
    city: '',
    bloodType: '',
  });

  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNoInternetModal, setShowNoInternetModal] = useState(false);
  const { hasInternetConnection } = useNetworkStatus();

  useEffect(() => {
    setupRTL();
    
    // التحقق من وضع الضيف
    if (isGuest) {
      Alert.alert(
        'تسجيل الدخول مطلوب',
        'لإرسال طلب تبرع دم، يجب عليك تسجيل الدخول أو إنشاء حساب جديد.',
        [
          {
            text: 'إنشاء حساب',
            onPress: () => router.replace('/register')
          },
          {
            text: 'تسجيل الدخول',
            onPress: () => router.replace('/login')
          }
        ]
      );
    }
  }, [isGuest]);

  useEffect(() => {
    if (formData.governorate) {
      setAvailableCities(iraqiLocations[formData.governorate] || []);
      setFormData(prev => ({ ...prev, city: '' }));
    }
  }, [formData.governorate]);

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال الاسم الكامل');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال رقم الهاتف');
      return false;
    }
    if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
      Alert.alert('خطأ', 'يرجى إدخال رقم هاتف صحيح');
      return false;
    }
    if (!formData.governorate) {
      Alert.alert('خطأ', 'يرجى اختيار المحافظة');
      return false;
    }
    if (!formData.city) {
      Alert.alert('خطأ', 'يرجى اختيار المدينة');
      return false;
    }
    if (!formData.bloodType) {
      Alert.alert('خطأ', 'يرجى اختيار فصيلة الدم');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    // التحقق من الاتصال بالإنترنت
    if (!(await hasInternetConnection())) {
      setShowNoInternetModal(true);
      return;
    }

    // ✅ الحماية الأولى: منع الضيوف فوراً
    if (isGuest) {
      Alert.alert(
        'تسجيل الدخول مطلوب ⚠️',
        'لإرسال طلب تبرع دم، يجب عليك تسجيل الدخول أو إنشاء حساب جديد.',
        [
          {
            text: 'إنشاء حساب',
            onPress: () => router.replace('/register')
          },
          {
            text: 'تسجيل الدخول',
            onPress: () => router.replace('/login')
          },
          { text: 'إلغاء', style: 'cancel' }
        ]
      );
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // ✅ الحماية الثانية: التحقق من المستخدم المسجل
      const { profile: currentProfile } = await AuthManager.getCurrentUser();
      
      if (!currentProfile || !currentProfile.id) {
        console.error('❌ محاولة إرسال طلب بدون ملف متبرع:', { currentProfile });
        Alert.alert(
          'تسجيل الدخول مطلوب',
          'يجب تسجيل الدخول بحساب متبرع لإرسال طلب التبرع.',
          [
            { text: 'موافق', onPress: () => router.replace('/login') }
          ]
        );
        return;
      }
      
      // ✅ الحماية الثالثة: التأكد من وجود donor_id قبل الإدراج
      if (!currentProfile.id) {
        console.error('❌ donor_id غير موجود في الملف الشخصي');
        Alert.alert('خطأ', 'حدث خطأ في التحقق من بيانات المستخدم. يرجى تسجيل الدخول مجدداً.');
        return;
      }
      
      const insertObj = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        governorate: formData.governorate,
        city: formData.city,
        blood_type: formData.bloodType,
        donor_id: currentProfile.id, // ✅ لن يصل هنا إلا إذا كان donor_id موجود
      };
      
      console.log('📤 إرسال طلب تبرع:', insertObj);
      
      const { error } = await supabase
        .from('blood_donation_requests')
        .insert([insertObj]);

      if (error) {
        console.error('Error inserting request:', error);
        Alert.alert('خطأ', 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
        return;
      }

      // إرسال إشعار محلي فوري
      try {
        await sendBloodDonationRequestNotification(
          formData.name.trim(),
          formData.bloodType,
          `${formData.city}، ${formData.governorate}`,
          formData.phone.trim()
        );
        console.log('تم إرسال الإشعار بنجاح');
      } catch (notifError) {
        console.error('خطأ في إرسال الإشعار:', notifError);
        // لا نعرض رسالة خطأ للمستخدم لأن الطلب تم إرساله بنجاح
      }

      Alert.alert(
        'نجح الإرسال ✅', 
        'تم إرسال الطلب بنجاح! يمكنك مشاهدة جميع الطلبات من تاب "طلبات التبرع"',
        [
          {
            text: 'موافق',
            onPress: () => {
              // Clear form
              setFormData({
                name: '',
                phone: '',
                governorate: '',
                city: '',
                bloodType: '',
              });
              // Navigate back
              try {
                if (router.canGoBack && router.canGoBack()) {
                  NavigationHelper.safeGoBack();
                } else {
                  NavigationHelper.goHome();
                }
              } catch (error) {
                NavigationHelper.goHome();
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('خطأ', 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AdBanner />
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>طلب تبرع دم</Text>
        <TouchableOpacity onPress={() => NavigationHelper.safeGoBack()}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
      </View>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}>
      <Surface style={styles.header} elevation={1}>
        <Droplet size={32} color={theme.colors.primary} />
        <Title style={[styles.title, { color: theme.colors.onSurface }]}>طلب تبرع دم</Title>
        <Paragraph style={styles.subtitle}>املأ البيانات التالية لإرسال طلب تبرع دم</Paragraph>
      </Surface>

      <Card style={styles.form}>
        <Card.Content>
          {/* Name Input */}
          <View style={styles.inputContainer}>
            <TextInput
              label="الاسم الكامل"
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              mode="outlined"
              style={[styles.textInput, { writingDirection: 'rtl' }]}
              right={<TextInput.Icon icon={() => <User size={20} color={theme.colors.primary} />} />}
            />
          </View>

          {/* Phone Input */}
          <View style={styles.inputContainer}>
            <TextInput
              label="رقم الهاتف"
              value={formData.phone}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
              mode="outlined"
              keyboardType="phone-pad"
              style={[styles.textInput, { writingDirection: 'rtl' }]}
              placeholder="07xxxxxxxxx"
              right={<TextInput.Icon icon={() => <Phone size={20} color={theme.colors.primary} />} />}
            />
          </View>

          {/* Governorate Picker */}
          <ListPicker
            label="المحافظة"
            value={formData.governorate}
            placeholder="اختر المحافظة"
            options={Object.keys(iraqiLocations).map(gov => ({ label: gov, value: gov }))}
            onChange={(value: string) => setFormData(prev => ({ ...prev, governorate: value }))}
            title="اختر المحافظة"
          />

          {/* City Picker */}
          <ListPicker
            label="المدينة"
            value={formData.city}
            placeholder="اختر المدينة"
            options={availableCities.map(city => ({ label: city, value: city }))}
            onChange={(value: string) => setFormData(prev => ({ ...prev, city: value }))}
            disabled={!formData.governorate}
            title="اختر المدينة"
          />

          {/* Blood Type Picker */}
          <ListPicker
            label="فصيلة الدم"
            value={formData.bloodType}
            placeholder="اختر فصيلة الدم"
            options={bloodTypes.map(type => ({ label: type, value: type }))}
            onChange={(value: string) => setFormData(prev => ({ ...prev, bloodType: value }))}
            title="اختر فصيلة الدم"
          />

          {/* Submit Button */}
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            style={styles.submitButton}
            labelStyle={styles.submitButtonText}>
            إرسال الطلب
          </Button>
        </Card.Content>
      </Card>
      </ScrollView>
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
    backgroundColor: '#FFFFFF',
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#ffffffff',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  container: {
    flex: 1,
    writingDirection: 'rtl',
  },
  header: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    margin: 16,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  textInput: {
    textAlign: 'right',
    direction: 'rtl',
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
    paddingRight: 200,
  },
  pickerContainer: {
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 60,
    justifyContent: 'center',
  },
  picker: {
    height: 60,
    textAlign: 'right',
    backgroundColor: 'transparent',
  },
  submitButton: {
    marginTop: 16,
    borderRadius: 12,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
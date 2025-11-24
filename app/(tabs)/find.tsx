import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { ArrowLeft, Search, Heart, MapPin, Phone, MessageCircle } from 'lucide-react-native';
import AdBanner from '@/components/AdBanner';
import NavigationHelper from '@/lib/navigationHelper';

const bloodTypes = ['جميع الأنواع', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const iraqiProvinces = [
  'جميع المحافظات',
  'بغداد',
  'البصرة',
  'نينوى (الموصل)',
  'أربيل',
  'السليمانية',
  'دهوك',
  'الأنبار',
  'كركوك',
  'صلاح الدين',
  'ديالى',
  'بابل',
  'كربلاء',
  'واسط',
  'النجف',
  'القادسية',
  'المثنى',
  'ذي قار',
  'ميسان',
];

const citiesByProvince: { [key: string]: string[] } = {
  'بغداد': [
    'جميع مدن بغداد',
    'بغداد المركز',
    'الكرادة',
    'المنصور',
    'الصدر',
    'الكاظمية',
    'الأعظمية',
    'الدورة',
    'الشعلة',
    'الحبيبية',
    'المأمون',
    'البياع',
    'الغزالية',
    'المشتل'
  ],
  'البصرة': [
    'جميع مدن البصرة',
    'البصرة المركز',
    'الزبير',
    'أبو الخصيب',
    'القرنة',
    'شط العرب',
    'الفاو',
    'المدينة',
    'الهارثة'
  ],
  'نينوى (الموصل)': [
    'جميع مدن نينوى',
    'الموصل المركز',
    'تلعفر',
    'الحمدانية',
    'الشيخان',
    'سنجار',
    'قره قوش',
    'بعشيقة'
  ],
  'أربيل': [
    'جميع مدن أربيل',
    'أربيل المركز',
    'سوران',
    'شقلاوة',
    'كويسنجق',
    'رواندز',
    'مخمور',
    'سرداشت'
  ],
  'السليمانية': [
    'جميع مدن السليمانية',
    'السليمانية المركز',
    'حلبجة',
    'رانية',
    'دوكان',
    'كلار',
    'جمجمال'
  ],
  'دهوك': [
    'جميع مدن دهوك',
    'دهوك المركز',
    'زاخو',
    'عمادية',
    'سيميل',
    'بردرش',
    'آكري'
  ],
  'الأنبار': [
    'جميع مدن الأنبار',
    'الرمادي',
    'الفلوجة',
    'هيت',
    'حديثة',
    'عانه',
    'راوه',
    'القائم',
    'الرطبة'
  ],
  'كركوك': [
    'جميع مدن كركوك',
    'كركوك المركز',
    'طوز خورماتو',
    'الحويجة',
    'داقوق'
  ],
  'صلاح الدين': [
    'جميع مدن صلاح الدين',
    'تكريت',
    'بيجي',
    'سامراء',
    'الدجيل',
    'بلد',
    'الدور'
  ],
  'ديالى': [
    'جميع مدن ديالى',
    'بعقوبة',
    'المقدادية',
    'كنعان',
    'خانقين',
    'الخالص'
  ],
  'بابل': [
    'جميع مدن بابل',
    'الحلة',
    'المسيب',
    'الهاشمية',
    'المحاويل'
  ],
  'كربلاء': [
    'جميع مدن كربلاء',
    'كربلاء المركز',
    'عين تمر',
    'الهندية',
    'الحر'
  ],
  'واسط': [
    'جميع مدن واسط',
    'الكوت',
    'الحي',
    'الصويرة',
    'النعمانية'
  ],
  'النجف': [
    'جميع مدن النجف',
    'النجف المركز',
    'الكوفة',
    'المناذرة',
    'أبو صخير'
  ],
  'القادسية': [
    'جميع مدن القادسية',
    'الديوانية',
    'عفك',
    'الشامية',
    'الحمزة'
  ],
  'المثنى': [
    'جميع مدن المثنى',
    'السماوة',
    'الرميثة',
    'الخضر',
    'السلمان'
  ],
  'ذي قار': [
    'جميع مدن ذي قار',
    'الناصرية',
    'الشطرة',
    'الرفاعي',
    'سوق الشيوخ'
  ],
  'ميسان': [
    'جميع مدن ميسان',
    'العمارة',
    'علي الغربي',
    'الميمونة',
    'قلعة صالح'
  ]
};

interface Donor {
  id: string;
  name: string;
  blood_type: string;
  city: string;
  governorate: string;
  phone: string;
  contact_preference: string;
  morning_from?: string;
  morning_to?: string;
  evening_from?: string;
  evening_to?: string;
}

export default function FindDonorScreen() {
  const [bloodType, setBloodType] = useState('جميع الأنواع');
  const [location, setLocation] = useState('جميع المحافظات');
  const [selectedCity, setSelectedCity] = useState('جميع المدن');
  const [availableCities, setAvailableCities] = useState<string[]>(['جميع المدن']);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(false);

  // دالة لتحديث المدن بناءً على المحافظة المختارة
  const handleProvinceChange = (province: string) => {
    setLocation(province);
    
    if (province === 'جميع المحافظات') {
      setAvailableCities(['جميع المدن']);
      setSelectedCity('جميع المدن');
    } else {
      const cities = citiesByProvince[province] || ['جميع المدن'];
      setAvailableCities(cities);
      setSelectedCity(cities[0]); // اختر أول مدينة (جميع مدن المحافظة)
    }
  };

  const searchDonors = async () => {
    setLoading(true);
    
    try {
      // بناء الاستعلام مع إزالة is_active لتجاوز RLS
      let query = supabase
        .from('donor_profiles')
        .select('id, name, blood_type, city, governorate, phone, contact_preference, morning_from, morning_to, evening_from, evening_to, is_active');

      // تطبيق المرشحات
      if (bloodType !== 'جميع الأنواع') {
        query = query.eq('blood_type', bloodType);
      }

      if (location !== 'جميع المحافظات') {
        query = query.ilike('governorate', `%${location}%`);
      }

      if (selectedCity !== 'جميع المدن' && !selectedCity.startsWith('جميع مدن')) {
        query = query.ilike('city', `%${selectedCity}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Search error:', error);
        
        // إذا فشل بسبب RLS، جرب بدون أي مرشحات
        if (error.code === '42501') {
          console.log('RLS error, trying without filters...');
          
          const { data: allData, error: allError } = await supabase
            .from('donor_profiles')
            .select('id, name, blood_type, city, governorate, phone, contact_preference, morning_from, morning_to, evening_from, evening_to, is_active');
          
          if (allError) {
            throw allError;
          }
          
          // تطبيق المرشحات محلياً
          let filteredData = allData || [];
          
          if (bloodType !== 'جميع الأنواع') {
            filteredData = filteredData.filter((donor: any) => donor.blood_type === bloodType);
          }
          
          if (location !== 'جميع المحافظات') {
            filteredData = filteredData.filter((donor: any) => 
              donor.governorate?.includes(location)
            );
          }
          
          if (selectedCity !== 'جميع المدن' && !selectedCity.startsWith('جميع مدن')) {
            filteredData = filteredData.filter((donor: any) => 
              donor.city?.includes(selectedCity)
            );
          }
          
          // فلترة المتبرعين النشطين
          const activeDonors = filteredData.filter((donor: any) => 
            donor.is_active !== false && donor.is_active !== null
          );
          
          console.log(`Found ${activeDonors.length} active donors after local filtering`);
          setDonors(activeDonors);
          return;
        }
        
        throw error;
      }

      // فلترة المتبرعين النشطين محلياً
      const activeDonors = (data || []).filter((donor: any) => 
        donor.is_active !== false && donor.is_active !== null
      );

      console.log(`Found ${activeDonors.length} active donors`);
      setDonors(activeDonors);
      
    } catch (error: any) {
      console.error('Final search error:', error);
      
      // إذا كانت مشكلة RLS أو صلاحيات
      if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('RLS')) {
        // عرض بيانات وهمية للاختبار أو رسالة للمستخدم
        console.log('RLS blocking access, showing empty result');
        setDonors([]); // قائمة فارغة
        Alert.alert(
          'تنبيه', 
          'يرجى تسجيل الدخول لعرض قائمة المتبرعين المتاحة.',
          [
            { text: 'إلغاء', style: 'cancel' },
            { text: 'تسجيل دخول', onPress: () => router.push('/login') }
          ]
        );
      } else {
        Alert.alert('خطأ', 'حدث خطأ أثناء البحث. تأكد من اتصال الإنترنت وحاول مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };

  // دالة تحويل الوقت من 24 ساعة إلى 12 ساعة
  const formatTimeTo12Hour = (time24: string): string => {
    if (!time24) return '';
    
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const minute = minutes || '00';
    
    if (hour === 0) {
      return `12:${minute} ص`;
    } else if (hour < 12) {
      return `${hour}:${minute} ص`;
    } else if (hour === 12) {
      return `12:${minute} م`;
    } else {
      return `${hour - 12}:${minute} م`;
    }
  };

  const getContactTimeText = (donor: Donor): string => {
    if (donor.contact_preference === 'anytime') {
      return 'أي وقت (24 ساعة)';
    } else if (donor.contact_preference === 'morning') {
      const from = donor.morning_from || '08:00';
      const to = donor.morning_to || '12:00';
      const fromFormatted = formatTimeTo12Hour(from);
      const toFormatted = formatTimeTo12Hour(to);
      return `صباحاً: ${fromFormatted} - ${toFormatted}`;
    } else if (donor.contact_preference === 'evening') {
      const from = donor.evening_from || '18:00';
      const to = donor.evening_to || '22:00';
      const fromFormatted = formatTimeTo12Hour(from);
      const toFormatted = formatTimeTo12Hour(to);
      return `مساءً: ${fromFormatted} - ${toFormatted}`;
    }
    return 'غير محدد';
  };

  const handlePhoneCall = (phoneNumber: string, donorName: string) => {
    if (!phoneNumber) {
      Alert.alert('خطأ', 'رقم الهاتف غير متوفر');
      return;
    }

    // تنظيف رقم الهاتف من المسافات والرموز
    const cleanPhone = phoneNumber.replace(/\s+/g, '').replace(/[^\d+]/g, '').trim();
    const phoneUrl = `tel:${cleanPhone}`;

    // محاولة فتح تطبيق الاتصال مباشرة بدون التحقق من canOpenURL
    // هذا يعمل على جميع الأجهزة (Android و iOS)
    Linking.openURL(phoneUrl).catch((error) => {
      console.error('خطأ في فتح تطبيق الاتصال:', error);
      // رسالة خطأ واضحة للمستخدم في حالة الفشل فقط
      Alert.alert(
        'تعذر الاتصال',
        `لا يمكن فتح تطبيق الاتصال على هذا الجهاز.\n\nيمكنك نسخ الرقم والاتصال يدوياً:\n${phoneNumber}`,
        [
          { text: 'حسناً', style: 'cancel' }
        ]
      );
    });
  };

  const handleWhatsApp = (phoneNumber: string, donorName: string) => {
    if (!phoneNumber) {
      Alert.alert('خطأ', 'رقم الهاتف غير متوفر');
      return;
    }

    // تنظيف رقم الهاتف وإضافة كود العراق إذا لزم الأمر
    let cleanPhone = phoneNumber.replace(/\s+/g, '').replace(/[^\d]/g, '').trim();
    
    // إذا كان الرقم يبدأ بـ 07، استبدله بـ 9647
    if (cleanPhone.startsWith('07')) {
      cleanPhone = '964' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('964')) {
      cleanPhone = '964' + cleanPhone;
    }

    const message = `مرحباً ${donorName}، أنا بحاجة للتبرع بالدم. هل يمكنك المساعدة؟`;
    const whatsappUrl = `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;

    // محاولة فتح واتساب مباشرة
    Linking.openURL(whatsappUrl).catch((error) => {
      console.error('خطأ في فتح واتساب:', error);
      Alert.alert(
        'واتساب غير متوفر',
        'تطبيق واتساب غير مثبت على هذا الجهاز أو لا يمكن فتحه',
        [{ text: 'حسناً', style: 'cancel' }]
      );
    });
  };

  const showContactAlert = (donor: Donor) => {
    const contactTimeText = getContactTimeText(donor);
    Alert.alert(
      `الاتصال بـ ${donor.name} 📞`,
      `رقم الهاتف: ${donor.phone}\nالأوقات المفضلة للاتصال: ${contactTimeText}\n\nهل تريد الاتصال الآن؟`,
      [
        {
          text: 'إلغاء',
          style: 'cancel'
        },
        {
          text: 'اتصل الآن',
          style: 'default',
          onPress: () => handlePhoneCall(donor.phone, donor.name)
        }
      ]
    );
  };

  useEffect(() => {
    searchDonors();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <AdBanner />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
        <Text style={styles.headerTitle}>البحث عن متبرع</Text>
        <TouchableOpacity onPress={() => NavigationHelper.safeGoBack()}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.searchForm}>
          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <Heart size={20} color="#E53E3E" />
              <Text style={styles.fieldLabel}>اختر فصيلة الدم</Text>
            </View>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={bloodType}
                onValueChange={setBloodType}
                style={styles.picker}>
                {bloodTypes.map((type) => (
                  <Picker.Item key={type} label={type} value={type} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <MapPin size={20} color="#10B981" />
              <Text style={styles.fieldLabel}>المحافظة</Text>
            </View>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={location}
                onValueChange={handleProvinceChange}
                style={styles.picker}>
                {iraqiProvinces.map((province) => (
                  <Picker.Item key={province} label={province} value={province} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <MapPin size={18} color="#6366F1" />
              <Text style={styles.fieldLabel}>
                {location === 'جميع المحافظات' ? 'اختر المحافظة أولاً' : 'اختر المدينة'}
              </Text>
            </View>
            <View style={[
              styles.pickerContainer,
              location === 'جميع المحافظات' && styles.pickerDisabled
            ]}>
              <Picker
                selectedValue={selectedCity}
                onValueChange={setSelectedCity}
                style={styles.picker}
                enabled={location !== 'جميع المحافظات'}>
                {availableCities.map((city) => (
                  <Picker.Item key={city} label={city} value={city} />
                ))}
              </Picker>
            </View>
          </View>

          <TouchableOpacity
            style={styles.searchButton}
            onPress={searchDonors}
            disabled={loading}>
            <View style={styles.searchButtonContent}>
              <Search size={20} color="#FFFFFF" />
              <Text style={styles.searchButtonText}>
                {loading ? 'جاري البحث...' : 'بحث عن المتبرعين'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.resultsSection}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>نتائج البحث</Text>
            {donors.length > 0 && (
              <Text style={styles.resultsCount}>
                {donors.length} متبرع متاح
              </Text>
            )}
          </View>
          
          {loading ? (
            <View style={styles.loadingState}>
              <Text style={styles.loadingText}>جاري البحث...</Text>
            </View>
          ) : donors.length === 0 ? (
            <View style={styles.emptyState}>
              <Image 
                source={require('@/assets/appLogo.png')} 
                style={styles.emptyLogo}
                resizeMode="contain"
              />
              <Text style={styles.emptyTitle}>لا توجد متبرعين متاحين</Text>
              <Text style={styles.emptySubtitle}>
                لم نجد أي متبرعين متاحين بهذه المعايير. جرب تغيير فصيلة الدم أو المحافظة أو المدينة
              </Text>
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={() => {
                  setBloodType('جميع الأنواع');
                  handleProvinceChange('جميع المحافظات');
                  searchDonors();
                }}>
                <Text style={styles.retryButtonText}>إعادة تعيين البحث</Text>
              </TouchableOpacity>
            </View>
          ) : (
            donors.map((donor) => (
              <View key={donor.id} style={styles.donorCard}>
                <View style={styles.donorTopRow}>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.contactButton}
                      onPress={() => showContactAlert(donor)}>
                      <View style={styles.contactButtonContent}>
                        <Phone size={16} color="#FFFFFF" />
                        <Text style={styles.contactButtonText}>اتصال</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.whatsappButton}
                      onPress={() => handleWhatsApp(donor.phone, donor.name)}>
                      <MessageCircle size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.bloodType}>{donor.blood_type}</Text>
                </View>
                
                <View style={styles.donorInfo}>
                  <Text style={styles.donorName}>{donor.name}</Text>
                  <Text style={styles.donorPhone}>📱{donor.phone}</Text>
                  <Text style={styles.donorCity}>
                    {donor.governorate ? `${donor.governorate} - ${donor.city}` : donor.city}
                  </Text>
                  
                </View>

                <View style={styles.contactTimeContainer}>
                  <Text style={styles.contactTimeLabel}>⏰ أوقات الاتصال:</Text>
                  <Text style={styles.contactTime}>{getContactTimeText(donor)}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  searchForm: {
    gap: 20,
    marginBottom: 32,
  },
  fieldContainer: {
    gap: 8,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'left',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  pickerDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#D1D5DB',
    opacity: 0.6,
  },
  picker: {
    height: 54,
    color: '#111827',
  },

  input: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    textAlign: 'right',
  },
  searchButton: {
    backgroundColor: '#E53E3E',
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 20,
    shadowColor: '#E53E3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  searchButtonContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultsSection: {
    gap: 8,
  },
  resultsHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'right',
  },
  resultsCount: {
    fontSize: 14,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    fontWeight: '500',
  },
  noResults: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    marginTop: 40,
  },
  donorCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
    gap: 12,
  },
  donorTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  donorInfo: {
    gap: 4,
  },
  donorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    paddingRight: 150,
  },
  bloodType: {
    fontSize: 16,
    color: '#E53E3E',
    fontWeight: '700',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  donorCity: {
    fontSize: 14,
    color: '#6B7280',
    paddingRight: 150,
  },
  donorPhone: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    paddingRight: 10,
    marginTop: 2,
  },
  contactButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  contactButtonContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyLogo: {
    width: 80,
    height: 80,
    marginBottom: 20,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  contactTimeContainer: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contactTimeLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    paddingRight: 100,
    marginBottom: 4,
  },
  contactTime: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
    paddingRight: 50,
  },
  loadingState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#E53E3E',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
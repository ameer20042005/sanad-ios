import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Snackbar } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { DonorProfile } from '@/lib/supabase';
import NavigationHelper from '@/lib/navigationHelper';
import AdBanner from '@/components/AdBanner';
import ContactTimePicker from '@/components/ContactTimePicker';
import TimePreview from '@/components/TimePreview';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Droplet,
  Edit3,
  Save,
  X,
  Clock,
  LogOut,
  Shield,
  Calendar,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react-native';
import { Switch } from 'react-native';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import NoInternetModal from '@/components/NoInternetModal';

// فصائل الدم المتاحة
const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// بيانات المحافظات والمدن العراقية
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

export default function ProfileScreen() {
  const { profile, loading, updateProfile, signOut, isGuest } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<DonorProfile>>(profile || {});
  const [saving, setSaving] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');
  const [showNoInternetModal, setShowNoInternetModal] = useState(false);
  const { hasInternetConnection } = useNetworkStatus();

  // تحديث النموذج عند تغيير البروفايل
  useEffect(() => {
    if (profile) {
      setEditForm(profile);
    }
  }, [profile]);

  // إظهار رسائل التنبيه
  const showSnackbar = (message: string, type: 'success' | 'error' = 'success') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };

  // التحقق من المصادقة
  useEffect(() => {
    if (!loading && !profile && !isGuest) {
      showSnackbar('يرجى تسجيل الدخول للوصول إلى ملفك الشخصي', 'error');
      NavigationHelper.replaceWith('/login');
    }
  }, [profile, loading, isGuest]);

  // إضافة منطق لتحديث الحالة عند استلام البيانات
  useEffect(() => {
    if (!loading && profile) {
      console.log('تم استلام البيانات:', profile);
      setEditForm(profile); // تحديث النموذج بالبيانات المستلمة
    }
  }, [profile, loading]);

  // تسجيل الخروج
  const handleLogout = async () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد من تسجيل الخروج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'تسجيل الخروج', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              NavigationHelper.replaceWith('/login');
            } catch (error) {
              console.error('خطأ في تسجيل الخروج:', error);
              showSnackbar('حدث خطأ غير متوقع', 'error');
            }
          }
        }
      ]
    );
  };

  // حفظ التغييرات
  const handleSave = async () => {
    // التحقق من الاتصال بالإنترنت
    if (!(await hasInternetConnection())) {
      setShowNoInternetModal(true);
      return;
    }

    // التحقق من البيانات المطلوبة
    if (!editForm.name?.trim() || !editForm.phone?.trim() || 
        !editForm.governorate?.trim() || !editForm.city?.trim() ||
        !editForm.blood_type?.trim()) {
      showSnackbar('يرجى ملء جميع الحقول المطلوبة', 'error');
      return;
    }

    // التحقق من صحة رقم الهاتف
    const phoneRegex = /^(07[3-9]\d{8}|07[0-2]\d{8})$/;
    if (!phoneRegex.test(editForm.phone.trim())) {
      showSnackbar('يرجى إدخال رقم هاتف عراقي صحيح', 'error');
      return;
    }

    setSaving(true);

    try {
      const updateData = {
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
        governorate: editForm.governorate.trim(),
        city: editForm.city.trim(),
        blood_type: editForm.blood_type,
        contact_preference: editForm.contact_preference || 'anytime',
        morning_from: editForm.morning_from,
        morning_to: editForm.morning_to,
        evening_from: editForm.evening_from,
        evening_to: editForm.evening_to,
        notes: editForm.notes?.trim() || null,
      };

      const result = await updateProfile(updateData);
      if (result.success) {
        setEditing(false);
        showSnackbar('تم حفظ التغييرات بنجاح! 🎉');
      } else {
        showSnackbar(result.error || 'حدث خطأ أثناء حفظ البيانات', 'error');
      }

    } catch (error: any) {
      console.error('خطأ في حفظ البيانات:', error);
      showSnackbar(error?.message || 'حدث خطأ غير متوقع', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditForm(profile);
    }
    setEditing(false);
  };

  // دالة لتحديث بيانات النموذج مع إعادة تعيين المدينة عند تغيير المحافظة
  const updateFormData = (field: string, value: string) => {
    setEditForm((prev) => {
      const newData = { ...prev, [field]: value };
      
      // إذا تم تغيير المحافظة، قم بإعادة تعيين المدينة
      if (field === 'governorate') {
        newData.city = '';
      }
      
      return newData;
    });
  };

  // تغيير حالة الاستعداد للتبرع
  const toggleAvailability = async () => {
    if (!profile) return;
    
    // التحقق من الاتصال بالإنترنت
    if (!(await hasInternetConnection())) {
      setShowNoInternetModal(true);
      return;
    }
    
    const currentAvailability = (profile as any).is_active !== false;
    const newAvailability = !currentAvailability;
    
    console.log('تغيير حالة التبرع:', { currentAvailability, newAvailability });
    
    Alert.alert(
      'تغيير حالة الاستعداد للتبرع',
      `هل تريد ${newAvailability ? 'تفعيل' : 'إلغاء'} استعدادك للتبرع؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تأكيد',
          onPress: async () => {
            try {
              setSaving(true);
              const res = await updateProfile({ is_active: newAvailability });
              if (!res.success) throw new Error(res.error || 'فشل تحديث الحالة');
              showSnackbar(`تم ${newAvailability ? 'تفعيل' : 'إلغاء'} استعدادك للتبرع بنجاح! 🎉`);
            } catch (error) {
              console.error('خطأ في تغيير حالة الاستعداد:', error);
              showSnackbar('حدث خطأ أثناء تغيير حالة الاستعداد', 'error');
            } finally {
              setSaving(false);
            }
          }
        }
      ]
    );
  };

  const getContactTimeText = (): string => {
    if (!profile) return 'غير محدد';
    
    const contactPref = profile.contact_preference || 'anytime';
    
    if (contactPref === 'anytime') {
      return 'أي وقت (صباحاً ومساءً)';
    } else if (contactPref === 'morning') {
      const morningFrom = profile.morning_from || '08:00';
      const morningTo = profile.morning_to || '12:00';
      return `صباحاً: ${morningFrom} - ${morningTo}`;
    } else if (contactPref === 'evening') {
      const eveningFrom = profile.evening_from || '18:00';
      const eveningTo = profile.evening_to || '22:00';
      return `مساءً: ${eveningFrom} - ${eveningTo}`;
    }
    return 'غير محدد';
  };

  const getDonationStatusColor = () => {
    if (!profile) return '#9CA3AF';
    
    const isActive = (profile as any)?.is_active !== false;
    return isActive ? '#10B981' : '#EF4444';
  };

  const getDonationStatusText = () => {
    if (!profile) return 'غير محدد';
    const isActive = (profile as any)?.is_active !== false;
    return isActive ? 'متاح للتبرع' : 'غير متاح';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AdBanner />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DC2626" />
          <Text style={styles.loadingText}>جاري تحميل الملف الشخصي...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isGuest) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AdBanner />
        <View style={styles.loadingContainer}>
          <Shield size={48} color='#DC2626' />
          <Text style={styles.errorText}>لا يمكن الوصول إلى الملف الشخصي أثناء التصفح كضيف</Text>
          <Button
            mode='contained'
            onPress={() => NavigationHelper.replaceWith('/login')}
            style={styles.loginButton}
            labelStyle={styles.loginButtonText}
          >
            تسجيل الدخول
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AdBanner />
        <View style={styles.loadingContainer}>
          <Shield size={48} color="#DC2626" />
          <Text style={styles.errorText}>لم يتم العثور على بيانات الملف الشخصي</Text>
          <Button
            mode="contained"
            onPress={() => NavigationHelper.replaceWith('/register')}
            style={styles.loginButton}
            labelStyle={styles.loginButtonText}
          >
            تسجيل جديد
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AdBanner />
      
          {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => NavigationHelper.safeGoBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>الملف الشخصي</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => {
              if (editing) {
                handleCancel();
              } else {
                setEditing(true);
              }
            }}
            style={[styles.actionButton, editing && styles.cancelButton]}
          >
            {editing ? <X size={20} color="#DC2626" /> : <Edit3 size={20} color="#DC2626" />}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleLogout} style={styles.actionButton}>
            <LogOut size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Editing Banner */}
        {editing && (
          <Card style={styles.editingBanner}>
            <Card.Content style={styles.editingBannerContent}>
              <Text style={styles.editingBannerText}>
                📝 وضع التحرير نشط - يمكنك تعديل البيانات الآن
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Profile Header Card */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <View style={styles.profileHeader}>
              <Text style={styles.profileName}>{String(profile.name || '')}</Text>
              <Text style={styles.profileEmail}>{String(profile.phone || '')}</Text>
              
              <View style={styles.profileBadges}>
                <View style={styles.bloodTypeContainer}>
                  <Droplet size={16} color="#DC2626" />
                  <Text style={styles.bloodType}>{String(profile.blood_type || '')}</Text>
                </View>
                
                <View style={styles.statusContainer}>
                  <View style={[styles.statusDot, { backgroundColor: getDonationStatusColor() }]} />
                  <Text style={[styles.statusText, { color: getDonationStatusColor() }]}>
                    {String(getDonationStatusText())}
                  </Text>
                </View>
              </View>


            </View>
          </Card.Content>
        </Card>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المعلومات الشخصية</Text>

          <Card style={styles.infoCard}>
            <Card.Content>
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <User size={20} color="#6B7280" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>الاسم الكامل<Text style={styles.requiredStar}>*</Text></Text>
                  {editing ? (
                    <TextInput
                      style={styles.editInput}
                      value={editForm.name || ''}
                      onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                      placeholder="أدخل الاسم الكامل"
                      textAlign="right"
                    />
                  ) : (
                    <Text style={styles.infoValue}>{String(profile.name || '')}</Text>
                  )}
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Phone size={20} color="#6B7280" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>رقم الهاتف<Text style={styles.requiredStar}>*</Text></Text>
                  {editing ? (
                    <TextInput
                      style={styles.editInput}
                      value={editForm.phone || ''}
                      onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
                      keyboardType="phone-pad"
                      placeholder="07901234567"
                      textAlign="right"
                      maxLength={11}
                    />
                  ) : (
                    <Text style={styles.infoValue}>{String(profile.phone || '')}</Text>
                  )}
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Droplet size={20} color="#6B7280" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>فصيلة الدم</Text>
                  {editing ? (
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={editForm.blood_type || ''}
                        style={styles.picker}
                        onValueChange={(itemValue: string) => updateFormData('blood_type', itemValue)}
                      >
                        <Picker.Item label="اختر فصيلة الدم" value="" color="#9CA3AF" />
                        {bloodTypes.map((type) => (
                          <Picker.Item key={type} label={type} value={type} />
                        ))}
                      </Picker>
                    </View>
                  ) : (
                    <Text style={styles.infoValue}>{String(profile.blood_type || '')}</Text>
                  )}
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* معلومات الموقع */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات الموقع</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <MapPin size={20} color="#6B7280" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>المحافظة<Text style={styles.requiredStar}>*</Text></Text>
                {editing ? (
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={editForm.governorate || ''}
                      style={styles.picker}
                      onValueChange={(itemValue: string) => updateFormData('governorate', itemValue)}
                    >
                      <Picker.Item label="اختر المحافظة" value="" color="#9CA3AF" />
                      {Object.keys(iraqiGovernorates).map((governorate) => (
                        <Picker.Item key={governorate} label={governorate} value={governorate} />
                      ))}
                    </Picker>
                  </View>
                ) : (
                  <Text style={styles.infoValue}>{String(profile.governorate || '')}</Text>
                )}
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <MapPin size={20} color="#6B7280" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>المدينة</Text>
                {editing ? (
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={editForm.city || ''}
                      style={[
                        styles.picker,
                        !editForm.governorate && styles.disabledPicker
                      ]}
                      onValueChange={(itemValue: string) => updateFormData('city', itemValue)}
                      enabled={!!editForm.governorate}
                    >
                      <Picker.Item 
                        label={editForm.governorate ? "اختر المدينة" : "اختر المحافظة أولاً"} 
                        value="" 
                        color="#9CA3AF" 
                      />
                      {editForm.governorate && iraqiGovernorates[editForm.governorate as keyof typeof iraqiGovernorates]?.map((city) => (
                        <Picker.Item key={city} label={city} value={city} />
                      ))}
                    </Picker>
                  </View>
                ) : (
                  <Text style={styles.infoValue}>{String(profile.city || '')}</Text>
                )}
              </View>
            </View>
            {editing && !editForm.governorate && (
              <Text style={styles.helperText}>يرجى اختيار المحافظة أولاً</Text>
            )}
          </View>
        </View>

        {/* أوقات الاتصال المفضلة */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>أوقات الاتصال المفضلة</Text>

          <View style={styles.infoCard}>
            {editing ? (
              <>
                <ContactTimePicker
                  value={{
                    type: (editForm.contact_preference as 'anytime' | 'morning' | 'evening') || 'anytime',
                    morningFrom: editForm.morning_from || undefined,
                    morningTo: editForm.morning_to || undefined,
                    eveningFrom: editForm.evening_from || undefined,
                    eveningTo: editForm.evening_to || undefined,
                  }}
                  onChange={(preference) => {
                    setEditForm({
                      ...editForm,
                      contact_preference: preference.type,
                      morning_from: preference.morningFrom || null,
                      morning_to: preference.morningTo || null,
                      evening_from: preference.eveningFrom || null,
                      evening_to: preference.eveningTo || null,
                    });
                  }}
                />
                
                <TimePreview
                  contactPreference={(editForm.contact_preference as 'anytime' | 'morning' | 'evening') || 'anytime'}
                  morningFrom={editForm.morning_from || undefined}
                  morningTo={editForm.morning_to || undefined}
                  eveningFrom={editForm.evening_from || undefined}
                  eveningTo={editForm.evening_to || undefined}
                />
              </>
            ) : (
              <>
                <View style={styles.infoItem}>
                  <View style={styles.infoIcon}>
                    <Clock size={20} color="#6B7280" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>أوقات الاتصال</Text>
                    <Text style={styles.infoValue}>{String(getContactTimeText())}</Text>
                  </View>
                </View>

                <TimePreview
                  contactPreference={profile.contact_preference || 'anytime'}
                  morningFrom={profile.morning_from || undefined}
                  morningTo={profile.morning_to || undefined}
                  eveningFrom={profile.evening_from || undefined}
                  eveningTo={profile.evening_to || undefined}
                />
              </>
            )}
          </View>
        </View>

        {/* معلومات حالة الحساب */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات الحساب والتبرع</Text>
          
          <Card style={styles.infoCard}>
            <Card.Content>
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Shield size={20} color="#6B7280" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>الحساب مفعل</Text>
                  <Text style={styles.infoValue}>
                    {String((profile as any)?.is_active !== false ? 'نعم' : 'لا')}
                  </Text>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  {(profile as any)?.is_active !== false ? (
                    <ToggleRight size={20} color="#10B981" />
                  ) : (
                    <ToggleLeft size={20} color="#EF4444" />
                  )}
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>متاح للتبرع</Text>
                  <View style={styles.availabilityRow}>
                    <Switch
                      value={(profile as any)?.is_active !== false}
                      onValueChange={toggleAvailability}
                      trackColor={{ false: '#EF4444', true: '#10B981' }}
                      thumbColor={(profile as any)?.is_active !== false ? '#FFFFFF' : '#FFFFFF'}
                      disabled={saving}
                    />
                    <Text style={[styles.infoValue, {
                      color: (profile as any)?.is_active !== false ? '#10B981' : '#EF4444'
                    }]}>
                      {String((profile as any)?.is_active !== false ? 'متاح' : 'غير متاح')}
                    </Text>
                  </View>
                </View>
              </View>
              

              
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Calendar size={20} color="#6B7280" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>آخر تحديث</Text>
                  <Text style={styles.infoValue}>
                    {profile.updated_at 
                      ? new Date(profile.updated_at).toLocaleString('ar-EG')
                      : 'غير متوفر'
                    }
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* الملاحظات */}
        {(editing || profile?.notes) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ملاحظات إضافية</Text>
            
            <View style={styles.infoCard}>
              {editing ? (
                <TextInput
                  style={[styles.editInput, styles.notesInput]}
                  value={editForm.notes || ''}
                  onChangeText={(text) => setEditForm({ ...editForm, notes: text })}
                  placeholder="أي معلومات إضافية تريد مشاركتها..."
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              ) : (
                <Text style={styles.notesText}>
                  {String(profile?.notes || 'لا توجد ملاحظات إضافية')}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* زر الحفظ */}
        {editing && (
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Save size={20} color="#FFFFFF" />
            )}
            <Text style={styles.saveButtonText}>
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* نافذة عدم الاتصال */}
      <NoInternetModal
        visible={showNoInternetModal}
        onClose={() => setShowNoInternetModal(false)}
      />

      {/* Snackbar */}
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
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 26,
  },
  loginButton: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  cancelButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  editingBanner: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  editingBannerContent: {
    padding: 16,
    backgroundColor: '#FEF2F2',
  },
  editingBannerText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  profileCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileContent: {
    padding: 24,
  },
  profileHeader: {
    alignItems: 'center',
    gap: 12,
  },
  profileName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  profileBadges: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  bloodTypeContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  bloodType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  statusContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  lastDonationContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F9FE',
    borderRadius: 12,
  },
  lastDonationText: {
    fontSize: 14,
    color: '#0369A1',
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'left',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  infoContent: {
    flex: 1,
    alignItems: 'flex-end',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'right',
    paddingRight: 120,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'left',
  },
  requiredStar: {
    color: '#DC2626',
    marginRight: 2,
  },
  editInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
    textAlign: 'right',
    width: '100%',
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  notesText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'right',
    lineHeight: 24,
  },
  saveButton: {
    backgroundColor: '#E53E3E',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#E53E3E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 30,
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
  availabilityRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  pickerContainer: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    width: '100%',
    minHeight: 60,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  picker: {
    height: 60,
    color: '#111827',
    fontSize: 16,
    textAlign: 'right',
  },
  disabledPicker: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  helperText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
    fontStyle: 'italic',
  },
});
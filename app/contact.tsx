import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Mail, MapPin } from 'lucide-react-native';
import AdBanner from '@/components/AdBanner';
import NavigationHelper from '@/lib/navigationHelper';

export default function ContactScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const contactInfo = {
    email: 'acountsanad@gmail.com',
    address: 'العراق :السماوة',
  };

  const handleSubmit = async () => {
    if (!fullName.trim() || !email.trim() || !message.trim()) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          full_name: fullName.trim(),
          email: email.trim(),
          message: message.trim(),
        });

      if (error) throw error;

      Alert.alert(
        'تم الإرسال بنجاح',
        'شكراً لك! تم إرسال رسالتك بنجاح. سنتواصل معك قريباً.',
        [
          {
            text: 'موافق',
            onPress: () => {
              setFullName('');
              setEmail('');
              setMessage('');
              try {
                if (router.canGoBack && router.canGoBack()) {
                  NavigationHelper.safeGoBack();
                } else {
                  NavigationHelper.goHome();
                }
              } catch (error) {
                NavigationHelper.goHome();
              }
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('خطأ', error.message || 'حدث خطأ أثناء إرسال الرسالة');
    } finally {
      setLoading(false);
    }
  };


  const handleEmail = () => {
    Linking.openURL(`mailto:${contactInfo.email}`);
  };



  return (
    <SafeAreaView style={styles.safeArea}>
      <AdBanner />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>اتصل بنا</Text>
          <TouchableOpacity onPress={() => {
            try {
              if (router.canGoBack && router.canGoBack()) {
                NavigationHelper.safeGoBack();
              } else {
                NavigationHelper.goHome();
              }
            } catch (error) {
              NavigationHelper.goHome();
            }
          }}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
        </View>

      <View style={styles.content}>
        {/* معلومات الاتصال */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات الاتصال</Text>
          

          <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
            <View style={styles.contactContent}>
              <View style={styles.contactText}>
                <Text style={styles.contactTitle}>البريد الإلكتروني</Text>
                <Text style={styles.contactValue}>{contactInfo.email}</Text>
              </View>
              <View style={[styles.iconContainer, { backgroundColor: '#FEF2F2' }]}>
                <Mail size={24} color="#E53E3E" />
              </View>
            </View>
          </TouchableOpacity>

          

          <View style={styles.contactItem}>
            <View style={styles.contactContent}>
              <View style={styles.contactText}>
                <Text style={styles.contactTitle}>العنوان</Text>
                <Text style={styles.contactValue}>{contactInfo.address}</Text>
              </View>
              <View style={[styles.iconContainer, { backgroundColor: '#F3F4F6' }]}>
                <MapPin size={24} color="#6B7280" />
              </View>
            </View>
          </View>
        </View>

        {/* نموذج إرسال رسالة */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إرسال رسالة</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>الاسم الكامل</Text>
            <TextInput
              style={styles.input}
              placeholder="أدخل اسمك الكامل"
              value={fullName}
              onChangeText={setFullName}
              textAlign="right"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>البريد الإلكتروني</Text>
            <TextInput
              style={styles.input}
              placeholder="ادخل البريد الالكتروني"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              textAlign="right"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>الرسالة</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="اكتب رسالتك هنا"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={5}
              textAlign="right"
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}>
            <Text style={styles.submitButtonText}>
              {loading ? 'جاري الإرسال...' : 'إرسال الرسالة'}
            </Text>
          </TouchableOpacity>
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
    direction: 'ltr',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    direction: 'rtl',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    direction: 'ltr',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'right',
  },
  contactItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  contactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'right',
  },
  input: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    textAlign: 'right',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    textAlign: 'right',
  },
  submitButton: {
    backgroundColor: '#E53E3E',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#E53E3E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
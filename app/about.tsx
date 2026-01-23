import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Surface,
  Button,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  ArrowLeft, 
  Heart, 
  Users, 
  Shield, 
  Code, 
  Mail, 
  ExternalLink,
  Droplet,
  Star,
  MessageCircle,
  Phone
} from 'lucide-react-native';
import { setupRTL } from '@/lib/rtl';

export default function AboutScreen() {
  // تفعيل RTL بشكل دائم
  useEffect(() => {
    setupRTL();
  }, []);
  const appVersion = '15.2.0';
  const developers = [
    {
      name: 'عمار صائب الخزاعي',
      role: 'المؤسس والمالك',
      email: '',
      phone: '',
    },
    {
      name: 'الدكتور ذو الفقار حسين منديل',
      role: 'الدكتور المشرف على التطبيق',
      email: '',
      phone: '',
    },
    {
      name: 'المهندس امير وسام',
      role: 'مطور التطبيق',
      email: 'ameer20051975@gmail.com',
      phone: '07811109151',
    }

  ];

  const features = [
    {
      icon: Droplet,
      title: 'طلبات التبرع',
      description: 'إرسال وإدارة طلبات التبرع بالدم'
    },
    {
      icon: Users,
      title: 'البحث عن المتبرعين',
      description: 'العثور على متبرعين مناسبين في منطقتك'
    },
    {
      icon: Heart,
      title: 'الحملات الطبية',
      description: 'متابعة الحملات والفعاليات الطبية'
    },
    {
      icon: Shield,
      title: 'الأمان والخصوصية',
      description: 'حماية بياناتك بأعلى معايير الأمان'
    }
  ];

  const handleEmailPress = (email: string) => {
    const url = `mailto:${email}?subject=${encodeURIComponent('استفسار من تطبيق سند')}`;
    
    // فتح تطبيق البريد مباشرة بدون التحقق من canOpenURL
    Linking.openURL(url).catch((error) => {
      console.error('خطأ في فتح الإيميل:', error);
    });
  };

  const handleLinkPress = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  const handleWhatsAppPress = (phone: string) => {
    // إزالة جميع الرموز ما عدا الأرقام
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    
    const message = 'مرحباً، أريد التواصل معك بخصوص تطبيق سند';
    const whatsappUrl = `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
    
    // محاولة فتح واتساب مباشرة
    Linking.openURL(whatsappUrl).catch((error) => {
      console.error('خطأ في فتح WhatsApp:', error);
      // إذا فشل، نحاول WhatsApp Web كبديل
      Linking.openURL(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`).catch((webError) => {
        console.error('فشل فتح WhatsApp Web:', webError);
      });
    });
  };

  const handlePhoneCall = (phone: string) => {
    // تنظيف رقم الهاتف من المسافات ولكن الحفاظ على + و الأرقام
    const cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '').trim();
    const phoneUrl = `tel:${cleanPhone}`;

    // فتح تطبيق الاتصال مباشرة بدون التحقق من canOpenURL
    Linking.openURL(phoneUrl).catch((error) => {
      console.error('خطأ في فتح تطبيق الاتصال:', error);
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>حول التطبيق</Text>
          <TouchableOpacity onPress={() => {
            try {
              if (router.canGoBack && router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)');
              }
            } catch (error) {
              router.replace('/(tabs)');
            }
          }}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* App Logo & Info */}
        <Surface style={styles.appInfoCard} elevation={2}>
          <View style={styles.appLogoContainer}>
            <Droplet size={48} color="#DC2626" />
          </View>
          <Title style={styles.appName}>تطبيق سند</Title>
          <Paragraph style={styles.appDescription}>
            تطبيق شامل للتبرع بالدم والعثور على المتبرعين في العراق
          </Paragraph>
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>الإصدار {appVersion}</Text>
          </View>
        </Surface>

        {/* Features */}
        <Card style={styles.featuresCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>مميزات التطبيق</Title>
            <Divider style={styles.divider} />
            
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <feature.icon size={24} color="#DC2626" />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Developers */}
        <Card style={styles.developersCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>فريق التطوير</Title>
            <Divider style={styles.divider} />
            
            {developers.map((dev, index) => (
              <View key={index} style={styles.developerItem}>
                <View style={styles.developerInfo}>
                  <Text style={styles.developerName}>{dev.name}</Text>
                  <Text style={styles.developerRole}>{dev.role}</Text>
                </View>
                {(dev.email || dev.phone) && (
                  <View style={styles.contactButtonsContainer}>
                    {dev.email && (
                      <TouchableOpacity
                        style={styles.emailButton}
                        onPress={() => handleEmailPress(dev.email)}>
                        <Mail size={20} color="#DC2626" />
                      </TouchableOpacity>
                    )}
                    {dev.phone && (
                      <>
                        <TouchableOpacity
                          style={styles.phoneButton}
                          onPress={() => handlePhoneCall(dev.phone)}>
                          <Phone size={20} color="#3B82F6" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.whatsappButton}
                          onPress={() => handleWhatsAppPress(dev.phone)}>
                          <MessageCircle size={20} color="#25D366" />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                )}
                {dev.phone && (
                  <Text style={styles.developerPhoneSeparate}>{dev.phone}</Text>
                )}
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Mission */}
        <Card style={styles.missionCard}>
          <Card.Content>
            <View style={styles.missionHeader}>
              <Heart size={24} color="#DC2626" />
              <Title style={styles.sectionTitle}>رسالتنا</Title>
            </View>
            <Divider style={styles.divider} />
            
            <Paragraph style={styles.missionText}>
              نهدف إلى تسهيل عملية التبرع بالدم وربط المتبرعين بالمحتاجين في العراق من خلال منصة رقمية آمنة وسهلة الاستخدام، لإنقاذ أرواح الناس وخدمة المجتمع.
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Contact & Support */}
        <Card style={styles.contactCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>التواصل والدعم</Title>
            <Divider style={styles.divider} />
            
            <View style={styles.contactButtons}>
              <Button
                mode="outlined"
                onPress={() => router.push('/contact')}
                style={styles.contactButton}
                icon={() => <Mail size={16} color="#DC2626" />}>
                تواصل معنا
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Credits */}
        <Surface style={styles.creditsCard} elevation={1}>
          <View style={styles.creditsContent}>
            <Star size={20} color="#F59E0B" />
            <Text style={styles.creditsText}>
              صُنع بـ ❤️ لخدمة المجتمع العراقي
            </Text>
          </View>
          <Text style={styles.copyrightText}>
            © 2025 تطبيق سند. جميع الحقوق محفوظة.
          </Text>
        </Surface>
      </ScrollView>
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
    writingDirection: 'ltr',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  appInfoCard: {
    margin: 16,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  appLogoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  versionContainer: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  versionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  featuresCard: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'left',
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
    alignItems: 'flex-start',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'left',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'left',
    lineHeight: 20,
  },
  developersCard: {
    margin: 16,
    marginTop: 0,
  },
  developerItem: {
    flexDirection: 'column',
    paddingVertical: 12,
    gap: 12,
  },
  developerInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '100%',
    marginBottom: 8,
  },
  developerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'left',
    marginBottom: 4,
  },
  developerRole: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'left',
    marginTop: 2,
  },
  developerPhone: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'left',
    marginTop: 2,
    fontWeight: '500',
  },
  developerPhoneSeparate: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'left',
    paddingRight: 100,
    fontWeight: '500',
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    width: '100%',
  },
  contactButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  emailButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  whatsappButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  missionCard: {
    margin: 16,
    marginTop: 0,
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  missionText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'left',
    lineHeight: 24,
  },
  contactCard: {
    margin: 16,
    marginTop: 0,
  },
  contactButtons: {
    flexDirection: 'column',
    gap: 12,
  },
  contactButton: {
    borderColor: '#DC2626',
  },
  creditsCard: {
    margin: 16,
    marginTop: 0,
    marginBottom: 32,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  creditsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  creditsText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    marginRight: 8,
    textAlign: 'center',
  },
  copyrightText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
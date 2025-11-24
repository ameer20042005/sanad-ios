import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdBanner from '@/components/AdBanner';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const { isGuest } = useAuth();

  const handleDonationRequest = () => {
    if (isGuest) {
      Alert.alert(
        'تسجيل الدخول مطلوب ⚠️',
        'لإرسال طلب تبرع دم، يجب عليك تسجيل الدخول أو إنشاء حساب جديد.',
        [
          { text: 'إلغاء', style: 'cancel' },
          {
            text: 'تسجيل الدخول',
            onPress: () => router.push('/login'),
          },
          {
            text: 'إنشاء حساب',
            onPress: () => router.push('/register'),
          },
        ]
      );
    } else {
      router.push('/blood-donation-form');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logoBackground}>
                <Image
                  source={require('@/assets/appLogo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            </View>
            <Text style={styles.title}>مرحباً بك في تطبيق سند</Text>
            <Text style={styles.subtitle}>تطبيق التبرع بالدم</Text>

            {/* القرآنية الآية */}
            <View style={styles.quranicVerseContainer}>
              <Text style={styles.quranicVerse}>
                ﴿ وَمَنْ أَحْيَاهَا فَكَأَنَّمَا أَحْيَا النَّاسَ جَمِيعًا ﴾
              </Text>
              <Text style={styles.verseSurah}>سورة المائدة - الآية 32</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.donationButton]}
              onPress={handleDonationRequest}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonEmoji}>🩸</Text>
                <Text style={styles.buttonText}>طلب تبرع دم</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.smallButton, styles.findButton]}
                onPress={() => router.push('/find')}
              >
                <Text style={styles.buttonEmoji}>🔍</Text>
                <Text style={styles.smallButtonText}>البحث عن متبرع</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.smallButton,
                  styles.campaignButton,
                ]}
                onPress={() => router.push('/campaigns')}
              >
                <Text style={styles.buttonEmoji}>📢</Text>
                <Text style={styles.smallButtonText}>الحملات</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.button, styles.emergencyButton]}
              onPress={() => router.push('/blood-donation')}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonEmoji}>🚨</Text>
                <Text style={styles.buttonText}>طلبات عاجلة للتبرع</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Blood Donation Guidelines */}
          <View style={styles.guidelinesSection}>
            <View style={styles.guidelinesHeader}>
              <Text style={styles.guidelinesTitle}>شروط التبرع بالدم</Text>
              <Text style={styles.guidelinesSubtitle}>
                وُضعت لضمان سلامة المتبرع والمستفيد، وتشمل الجوانب الصحية
                والعمرية ونمط الحياة. إليك التفاصيل بشكل منظم 👇
              </Text>
            </View>

            {/* Basic Requirements */}
            <View style={styles.guidelineCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardEmoji}>🩸</Text>
                <Text style={styles.cardTitle}>أولاً: الشروط الأساسية</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.bulletPoint}>
                  • أن يكون العمر بين 18 و65 سنة.
                </Text>
                <Text style={styles.bulletPoint}>
                  • أن لا يقل الوزن عن 50 كغم.
                </Text>
                <Text style={styles.bulletPoint}>
                  • أن يكون ضغط الدم، النبض، ونسبة الهيموغلوبين ضمن المعدل
                  الطبيعي.
                </Text>
                <Text style={styles.bulletPoint}>
                  • أن يكون المتبرع بصحة جيدة، ولا يعاني من أي مرض معدٍ أو حاد
                  وقت التبرع.
                </Text>
              </View>
            </View>

            {/* Time Intervals */}
            <View style={[styles.guidelineCard, styles.timeCard]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardEmoji}>⏰</Text>
                <Text style={styles.cardTitle}>
                  ثانياً: الفترات المسموح بها
                </Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.bulletPoint}>
                  • يمكن التبرع بالدم كل 3 أشهر للرجال.
                </Text>
                <Text style={styles.bulletPoint}>
                  • وكل 4 أشهر للنساء (بسبب فقدان الدم الشهري أثناء الدورة).
                </Text>
              </View>
            </View>

            {/* Restrictions */}
            <View style={[styles.guidelineCard, styles.restrictionCard]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardEmoji}>🚫</Text>
                <Text style={styles.cardTitle}>
                  ثالثاً: الحالات التي يُمنع فيها التبرع
                </Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.bulletPoint}>
                  • الإصابة بـ أمراض معدية مثل: التهاب الكبد الفيروسي (B أو C)،
                  الإيدز، الملاريا، الزهري.
                </Text>
                <Text style={styles.bulletPoint}>
                  • بعد إجراء عملية جراحية كبيرة خلال آخر 6 أشهر.
                </Text>
                <Text style={styles.bulletPoint}>
                  • بعد الوشم أو الثقب بأقل من 6 أشهر.
                </Text>
                <Text style={styles.bulletPoint}>
                  • إذا كان المتبرع يتناول بعض الأدوية أو يعاني من فقر دم حاد.
                </Text>
                <Text style={styles.bulletPoint}>
                  • في حالة الحمل أو الرضاعة.
                </Text>
              </View>
            </View>

            {/* Tips */}
            <View style={[styles.guidelineCard, styles.tipsCard]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardEmoji}>🥗</Text>
                <Text style={styles.cardTitle}>
                  رابعاً: نصائح قبل وبعد التبرع
                </Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.sectionTitle}>قبل التبرع:</Text>
                <Text style={styles.bulletPoint}>
                  • تناول وجبة خفيفة قبل التبرع بساعتين.
                </Text>
                <Text style={styles.bulletPoint}>
                  • شرب كمية كافية من الماء.
                </Text>
                <Text style={styles.bulletPoint}>
                  • تجنّب التدخين أو المجهود الشديد قبل التبرع.
                </Text>

                <Text style={[styles.sectionTitle, { marginTop: 12 }]}>
                  بعد التبرع:
                </Text>
                <Text style={styles.bulletPoint}>
                  • الراحة لمدة 10–15 دقيقة.
                </Text>
                <Text style={styles.bulletPoint}>
                  • شرب سوائل كثيرة خلال اليوم.
                </Text>
                <Text style={styles.bulletPoint}>
                  • تجنب رفع أشياء ثقيلة باليد المستخدمة في السحب لبضع ساعات.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  // Header Section
  headerSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  logoContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  logoBackground: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Quranic Verse Styles
  quranicVerseContainer: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#059669',
    shadowColor: '#059669',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
  },
  quranicVerse: {
    fontSize: 15,
    fontWeight: '600',
    color: '#059669',
    textAlign: 'center',
    lineHeight: 26,
    fontFamily: 'System',
    letterSpacing: 0.5,
  },
  verseSurah: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '600',
  },

  // Button Styles
  buttonContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 30,
  },
  button: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  emergencyButton: {
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  smallButton: {
    flex: 1,
    paddingVertical: 16,
  },
  smallButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  findButton: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
  },
  campaignButton: {
    backgroundColor: '#7C3AED',
    shadowColor: '#7C3AED',
  },
  donationButton: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },

  // Guidelines Section
  guidelinesSection: {
    marginTop: 20,
  },
  guidelinesHeader: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  guidelinesTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 12,
  },
  guidelinesSubtitle: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Guideline Cards
  guidelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  timeCard: {
    borderLeftColor: '#F59E0B',
  },
  restrictionCard: {
    borderLeftColor: '#EF4444',
  },
  tipsCard: {
    borderLeftColor: '#10B981',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    textAlign: 'left',
  },
  cardContent: {
    gap: 8,
  },
  bulletPoint: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    textAlign: 'left',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
    textAlign: 'left',
  },
});

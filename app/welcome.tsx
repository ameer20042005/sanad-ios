import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { Heart, Users, MapPin, Clock } from 'lucide-react-native';
import AdBanner from '@/components/AdBanner';

export default function WelcomeScreen() {


  return (
    <SafeAreaView style={styles.safeArea}>
      <AdBanner />
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Card */}
        <Card style={styles.mainCard}>
          <Card.Content style={styles.cardContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Heart size={50} color="#DC2626" fill="#DC2626" />
              </View>
              <Text style={styles.mainTitle}>مرحباً بك في سند</Text>
              <Text style={styles.subtitle}>
                منصة التبرع بالدم الأولى في العراق
              </Text>
            </View>

            {/* Features */}
            <View style={styles.featuresContainer}>
              <View style={styles.feature}>
                <View style={styles.featureIcon}>
                  <Users size={24} color="#DC2626" />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>مجتمع المنقذين</Text>
                  <Text style={styles.featureDescription}>
                    انضم لآلاف المتبرعين الذين يساعدون في إنقاذ الأرواح يومياً
                  </Text>
                </View>
              </View>

              <View style={styles.feature}>
                <View style={styles.featureIcon}>
                  <MapPin size={24} color="#DC2626" />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>بحث جغرافي دقيق</Text>
                  <Text style={styles.featureDescription}>
                    اعثر على متبرعين قريبين منك في جميع أنحاء العراق
                  </Text>
                </View>
              </View>

              <View style={styles.feature}>
                <View style={styles.featureIcon}>
                  <Clock size={24} color="#DC2626" />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>استجابة سريعة</Text>
                  <Text style={styles.featureDescription}>
                    تواصل مباشر مع المتبرعين في حالات الطوارئ
                  </Text>
                </View>
              </View>
            </View>

            {/* Call to Action */}
            <View style={styles.ctaContainer}>
              <Text style={styles.ctaTitle}>كن جزءاً من قصة إنقاذ</Text>
              <Text style={styles.ctaText}>
                أكمل بيانات المتبرع الخاصة بك لتصبح جزءاً من شبكة المنقذين
              </Text>


            </View>

            {/* Info Note */}
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                💡 يمكنك إكمال بيانات المتبرع لاحقاً من صفحة الإعدادات
              </Text>
            </View>
          </Card.Content>
        </Card>
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
  },
  scrollContent: {
    paddingBottom: 30,
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
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 28,
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
  featuresContainer: {
    marginBottom: 30,
  },
  feature: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  featureIcon: {
    marginLeft: 16,
    marginTop: 4,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'right',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
    lineHeight: 20,
  },
  ctaContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  continueButton: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    marginBottom: 12,
    minWidth: 200,
    elevation: 2,
  },
  continueButtonContent: {
    paddingVertical: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  skipButton: {
    minWidth: 200,
  },
  skipButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoContainer: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoText: {
    fontSize: 12,
    color: '#1E40AF',
    textAlign: 'right',
    lineHeight: 18,
  },
});
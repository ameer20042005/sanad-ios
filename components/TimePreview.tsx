import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  I18nManager,
} from 'react-native';
import { Sun, Moon, Clock, Sunrise, Sunset } from 'lucide-react-native';

interface TimePreviewProps {
  contactPreference: 'anytime' | 'morning' | 'evening';
  morningFrom?: string;
  morningTo?: string;
  eveningFrom?: string;
  eveningTo?: string;
  style?: any;
}

const formatTimeFor12Hour = (time24: string): string => {
  if (!time24) return '';
  
  const [hours, minutes] = time24.split(':').map(Number);
  
  if (hours === 0) {
    return `12:${minutes.toString().padStart(2, '0')} ص`;
  } else if (hours < 12) {
    return `${hours}:${minutes.toString().padStart(2, '0')} ص`;
  } else if (hours === 12) {
    return `12:${minutes.toString().padStart(2, '0')} م`;
  } else {
    return `${hours - 12}:${minutes.toString().padStart(2, '0')} م`;
  }
};

export default function TimePreview({
  contactPreference,
  morningFrom,
  morningTo,
  eveningFrom,
  eveningTo,
  style,
}: TimePreviewProps) {
  const renderAnytimePreview = () => (
    <View style={[styles.previewCard, styles.anytimeCard]}>
      <View style={styles.previewHeader}>
        <Clock size={16} color="#059669" />
        <Text style={[styles.previewTitle, { color: '#059669' }]}>متاح في أي وقت</Text>
      </View>
      <Text style={styles.previewDescription}>
        يمكن التواصل معك على مدار 24 ساعة في أي وقت مناسب
      </Text>
      <View style={styles.timeGrid}>
        <View style={styles.timeSlot}>
          <Sunrise size={14} color="#F59E0B" />
          <Text style={styles.timeSlotText}>6:00 ص - 12:00 م</Text>
        </View>
        <View style={styles.timeSlot}>
          <Sun size={14} color="#EF4444" />
          <Text style={styles.timeSlotText}>12:00 م - 6:00 م</Text>
        </View>
        <View style={styles.timeSlot}>
          <Sunset size={14} color="#7C3AED" />
          <Text style={styles.timeSlotText}>6:00 م - 12:00 ص</Text>
        </View>
      </View>
    </View>
  );

  const renderMorningPreview = () => (
    <View style={[styles.previewCard, styles.morningCard]}>
      <View style={styles.previewHeader}>
        <Sun size={16} color="#F59E0B" />
        <Text style={[styles.previewTitle, { color: '#F59E0B' }]}>أوقات صباحية</Text>
      </View>
      <Text style={styles.previewDescription}>
        تفضيل الاتصال في الساعات الصباحية فقط
      </Text>
      <View style={styles.selectedTimeRange}>
        <View style={styles.timeDisplay}>
          <Text style={styles.timeLabel}>من</Text>
          <Text style={styles.timeValue}>{formatTimeFor12Hour(morningFrom || '08:00')}</Text>
        </View>
        <View style={styles.timeSeparator}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>إلى</Text>
          <View style={styles.separatorLine} />
        </View>
        <View style={styles.timeDisplay}>
          <Text style={styles.timeLabel}>إلى</Text>
          <Text style={styles.timeValue}>{formatTimeFor12Hour(morningTo || '12:00')}</Text>
        </View>
      </View>
    </View>
  );

  const renderEveningPreview = () => (
    <View style={[styles.previewCard, styles.eveningCard]}>
      <View style={styles.previewHeader}>
        <Moon size={16} color="#7C3AED" />
        <Text style={[styles.previewTitle, { color: '#7C3AED' }]}>أوقات مسائية</Text>
      </View>
      <Text style={styles.previewDescription}>
        تفضيل الاتصال في الساعات المسائية فقط
      </Text>
      <View style={styles.selectedTimeRange}>
        <View style={styles.timeDisplay}>
          <Text style={styles.timeLabel}>من</Text>
          <Text style={styles.timeValue}>{formatTimeFor12Hour(eveningFrom || '18:00')}</Text>
        </View>
        <View style={styles.timeSeparator}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>إلى</Text>
          <View style={styles.separatorLine} />
        </View>
        <View style={styles.timeDisplay}>
          <Text style={styles.timeLabel}>إلى</Text>
          <Text style={styles.timeValue}>{formatTimeFor12Hour(eveningTo || '22:00')}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {contactPreference === 'anytime' && renderAnytimePreview()}
      {contactPreference === 'morning' && renderMorningPreview()}
      {contactPreference === 'evening' && renderEveningPreview()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  previewCard: {
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  anytimeCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
    borderColor: '#A7F3D0',
  },
  morningCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 2,
    borderColor: '#FDE68A',
  },
  eveningCard: {
    backgroundColor: '#F3E8FF',
    borderWidth: 2,
    borderColor: '#DDD6FE',
  },
  previewHeader: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    justifyContent: I18nManager.isRTL ? 'flex-start' : 'flex-end',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: I18nManager.isRTL ? 'left' : 'right',
  },
  previewDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: I18nManager.isRTL ? 'left' : 'right',
    marginBottom: 10,
    lineHeight: 16,
  },
  timeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  timeSlot: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 8,
    padding: 6,
    gap: 4,
  },
  timeSlotText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  selectedTimeRange: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  timeDisplay: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 10,
    padding: 10,
    gap: 2,
  },
  timeLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  timeValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  timeSeparator: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  separatorLine: {
    width: 24,
    height: 2,
    backgroundColor: '#D1D5DB',
    borderRadius: 1,
  },
  separatorText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
});
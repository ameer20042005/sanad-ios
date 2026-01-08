import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
  I18nManager,
} from 'react-native';
import { Clock, ChevronDown, Check, X } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

interface TimePickerInputProps {
  value?: string;
  onTimeChange: (time: string) => void;
  label: string;
  placeholder?: string;
  style?: any;
  disabled?: boolean;
}

interface TimeOption {
  value: string;
  label12: string;
  label24: string;
  period?: 'AM' | 'PM';
}

const generateTimeOptions = (): TimeOption[] => {
  const options: TimeOption[] = [];
  
  for (let hour = 6; hour <= 23; hour++) {
    for (let minute of [0, 30]) {
      const hour24 = hour;
      const minute24 = minute;
      
      // تنسيق 24 ساعة
      const timeValue = `${hour24.toString().padStart(2, '0')}:${minute24.toString().padStart(2, '0')}`;
      
      // تنسيق 12 ساعة
      let hour12 = hour24;
      let period: 'AM' | 'PM' = 'AM';
      
      if (hour24 === 0) {
        hour12 = 12;
        period = 'AM';
      } else if (hour24 < 12) {
        hour12 = hour24;
        period = 'AM';
      } else if (hour24 === 12) {
        hour12 = 12;
        period = 'PM';
      } else {
        hour12 = hour24 - 12;
        period = 'PM';
      }
      
      const label12 = `${hour12}:${minute24.toString().padStart(2, '0')} ${period === 'AM' ? 'ص' : 'م'}`;
      const label24 = timeValue;
      
      options.push({
        value: timeValue,
        label12,
        label24,
        period
      });
    }
  }
  
  return options;
};

const timeOptions = generateTimeOptions();

export default function TimePickerInput({
  value = '08:00',
  onTimeChange,
  label,
  placeholder = 'اختر الوقت',
  style,
  disabled = false
}: TimePickerInputProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tempSelection, setTempSelection] = useState(value);

  // العثور على الوقت الحالي من الخيارات
  const currentTimeOption = timeOptions.find(option => option.value === value);
  
  // تحديد النص المعروض (12 ساعة فقط)
  const getDisplayText = () => {
    if (!value || !currentTimeOption) return placeholder;
    return currentTimeOption.label12;
  };

  // فتح المودال
  const openModal = () => {
    if (disabled) return;
    setTempSelection(value);
    setIsModalVisible(true);
  };

  // إغلاق المودال وحفظ التغييرات
  const confirmSelection = () => {
    onTimeChange(tempSelection);
    setIsModalVisible(false);
  };

  // إغلاق المودال بدون حفظ
  const cancelSelection = () => {
    setTempSelection(value);
    setIsModalVisible(false);
  };

  // تصفية الخيارات حسب الفترة المحددة
  const getFilteredOptions = (period?: 'AM' | 'PM') => {
    if (!period) {
      return timeOptions;
    }
    return timeOptions.filter(option => option.period === period);
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.inputButton,
          disabled && styles.inputButtonDisabled
        ]}
        onPress={openModal}
        disabled={disabled}
      >
        <View style={styles.inputContent}>
          <View style={styles.iconContainer}>
            <Clock size={20} color={disabled ? '#9CA3AF' : '#E53E3E'} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.label}>{label}</Text>
            <Text style={[
              styles.valueText,
              !currentTimeOption && styles.placeholderText,
              disabled && styles.disabledText
            ]}>
              {getDisplayText()}
            </Text>
          </View>
          <ChevronDown 
            size={20} 
            color={disabled ? '#9CA3AF' : '#6B7280'} 
          />
        </View>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={cancelSelection}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={cancelSelection} style={styles.headerButton}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>اختيار الوقت</Text>
              <TouchableOpacity onPress={confirmSelection} style={styles.headerButton}>
                <Check size={24} color="#E53E3E" />
              </TouchableOpacity>
            </View>

            {/* عرض الأوقات بتنسيق 12 ساعة مع فترات منفصلة */}
            <View style={styles.twelveHourContainer}>
              <View style={styles.periodSection}>
                <Text style={styles.periodTitle}>🌅 صباحاً</Text>
                <ScrollView style={styles.timeList} showsVerticalScrollIndicator={false}>
                  {getFilteredOptions('AM').map((option) => (
                    <TouchableOpacity
                      key={`am-${option.value}`}
                      style={[
                        styles.timeOption,
                        tempSelection === option.value && styles.timeOptionSelected
                      ]}
                      onPress={() => setTempSelection(option.value)}
                    >
                      <Text style={[
                        styles.timeOptionText,
                        tempSelection === option.value && styles.timeOptionTextSelected
                      ]}>
                        {option.label12}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.periodSection}>
                <Text style={styles.periodTitle}>🌙 مساءً</Text>
                <ScrollView style={styles.timeList} showsVerticalScrollIndicator={false}>
                  {getFilteredOptions('PM').map((option) => (
                    <TouchableOpacity
                      key={`pm-${option.value}`}
                      style={[
                        styles.timeOption,
                        tempSelection === option.value && styles.timeOptionSelected
                      ]}
                      onPress={() => setTempSelection(option.value)}
                    >
                      <Text style={[
                        styles.timeOptionText,
                        tempSelection === option.value && styles.timeOptionTextSelected
                      ]}>
                        {option.label12}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* معاينة الاختيار */}
            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>الوقت المحدد:</Text>
              <Text style={styles.previewValue}>
                {timeOptions.find(opt => opt.value === tempSelection)?.label12 || 'غير محدد'}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  inputButton: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  inputButtonDisabled: {
    backgroundColor: '#F3F4F6',
    opacity: 0.7,
  },
  inputContent: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  textContainer: {
    flex: 1,
    alignItems: I18nManager.isRTL ? 'flex-start' : 'flex-end',
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: I18nManager.isRTL ? 'left' : 'right',
    fontWeight: '500',
  },
  valueText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    textAlign: I18nManager.isRTL ? 'left' : 'right',
    letterSpacing: 0.5,
  },
  placeholderText: {
    color: '#9CA3AF',
    fontWeight: '400',
  },
  disabledText: {
    color: '#9CA3AF',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FAFAFA',
  },
  headerButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },

  // 12 hour format styles
  twelveHourContainer: {
    flexDirection: 'row',
    height: 400,
    paddingHorizontal: 10,
  },
  periodSection: {
    flex: 1,
    marginHorizontal: 5,
  },
  periodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  timeList: {
    maxHeight: 320,
  },

  // Time option styles
  timeOption: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    marginVertical: 2,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center',
  },
  timeOptionSelected: {
    backgroundColor: '#FEE2E2',
    borderColor: '#E53E3E',
    borderWidth: 2,
  },
  timeOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 2,
  },
  timeOptionTextSelected: {
    color: '#E53E3E',
    fontWeight: 'bold',
  },

  // Preview styles
  previewContainer: {
    padding: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  previewValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E53E3E',
    textAlign: 'center',
  },
});
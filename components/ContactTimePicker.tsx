import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  I18nManager,
} from 'react-native';
import { Clock, ChevronDown, Check, X, Sun, Moon, Clock12 } from 'lucide-react-native';
import TimePickerInput from './TimePickerInput';

interface ContactTimePreference {
  type: 'anytime' | 'morning' | 'evening';
  morningFrom?: string;
  morningTo?: string;
  eveningFrom?: string;
  eveningTo?: string;
}

interface ContactTimePickerProps {
  value: ContactTimePreference;
  onChange: (preference: ContactTimePreference) => void;
  disabled?: boolean;
  style?: any;
}

const contactOptions = [
  {
    type: 'anytime' as const,
    icon: Clock12,
    title: 'أي وقت',
    subtitle: 'متاح للاتصال على مدار 24 ساعة',
    color: '#059669',
    bgColor: '#ECFDF5',
  },
  {
    type: 'morning' as const,
    icon: Sun,
    title: 'صباحاً فقط',
    subtitle: 'تفضيل الاتصال في الأوقات الصباحية',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
  },
  {
    type: 'evening' as const,
    icon: Moon,
    title: 'مساءً فقط',
    subtitle: 'تفضيل الاتصال في الأوقات المسائية',
    color: '#7C3AED',
    bgColor: '#F3E8FF',
  },
];

export default function ContactTimePicker({
  value,
  onChange,
  disabled = false,
  style,
}: ContactTimePickerProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tempPreference, setTempPreference] = useState<ContactTimePreference>(value);

  const getCurrentOptionText = () => {
    const option = contactOptions.find(opt => opt.type === value.type);
    if (!option) return 'غير محدد';
    
    let text = option.title;
    
    if (value.type === 'morning' && value.morningFrom && value.morningTo) {
      text += ` (${value.morningFrom} - ${value.morningTo})`;
    } else if (value.type === 'evening' && value.eveningFrom && value.eveningTo) {
      text += ` (${value.eveningFrom} - ${value.eveningTo})`;
    }
    
    return text;
  };

  const openModal = () => {
    if (disabled) return;
    setTempPreference({ ...value });
    setIsModalVisible(true);
  };

  const confirmSelection = () => {
    onChange(tempPreference);
    setIsModalVisible(false);
  };

  const cancelSelection = () => {
    setTempPreference({ ...value });
    setIsModalVisible(false);
  };

  const updatePreferenceType = (type: ContactTimePreference['type']) => {
    let newPreference: ContactTimePreference = { type };
    
    if (type === 'morning') {
      newPreference = {
        ...newPreference,
        morningFrom: tempPreference.morningFrom || '08:00',
        morningTo: tempPreference.morningTo || '12:00',
      };
    } else if (type === 'evening') {
      newPreference = {
        ...newPreference,
        eveningFrom: tempPreference.eveningFrom || '18:00',
        eveningTo: tempPreference.eveningTo || '22:00',
      };
    }
    
    setTempPreference(newPreference);
  };

  const updateTimeRange = (field: keyof ContactTimePreference, time: string) => {
    setTempPreference(prev => ({
      ...prev,
      [field]: time
    }));
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.mainButton,
          disabled && styles.mainButtonDisabled
        ]}
        onPress={openModal}
        disabled={disabled}
      >
        <View style={styles.mainButtonContent}>
          <View style={styles.iconContainer}>
            <Clock size={20} color={disabled ? '#9CA3AF' : '#E53E3E'} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.label}>أوقات الاتصال المفضلة</Text>
            <Text style={[
              styles.valueText,
              disabled && styles.disabledText
            ]}>
              {getCurrentOptionText()}
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
              <Text style={styles.modalTitle}>أوقات الاتصال المفضلة</Text>
              <TouchableOpacity onPress={confirmSelection} style={styles.headerButton}>
                <Check size={24} color="#E53E3E" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* خيارات التفضيل */}
              <View style={styles.optionsContainer}>
                {contactOptions.map((option) => {
                  const IconComponent = option.icon;
                  const isSelected = tempPreference.type === option.type;
                  
                  return (
                    <TouchableOpacity
                      key={option.type}
                      style={[
                        styles.optionCard,
                        isSelected && styles.optionCardSelected,
                        { borderColor: isSelected ? option.color : '#E5E7EB' }
                      ]}
                      onPress={() => updatePreferenceType(option.type)}
                    >
                      <View style={[
                        styles.optionIconContainer,
                        { backgroundColor: option.bgColor }
                      ]}>
                        <IconComponent size={24} color={option.color} />
                      </View>
                      
                      <View style={styles.optionTextContainer}>
                        <Text style={[
                          styles.optionTitle,
                          isSelected && { color: option.color }
                        ]}>
                          {option.title}
                        </Text>
                        <Text style={styles.optionSubtitle}>
                          {option.subtitle}
                        </Text>
                      </View>
                      
                      {isSelected && (
                        <View style={[
                          styles.selectedIndicator,
                          { backgroundColor: option.color }
                        ]}>
                          <Check size={16} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* إعدادات الوقت للصباح */}
              {tempPreference.type === 'morning' && (
                <View style={styles.timeSettingsContainer}>
                  <View style={styles.timeSettingsHeader}>
                    <Sun size={20} color="#F59E0B" />
                    <Text style={styles.timeSettingsTitle}>أوقات الاتصال الصباحية</Text>
                  </View>
                  
                  <View style={styles.timeRangeContainer}>
                    <TimePickerInput
                      label="من الساعة"
                      value={tempPreference.morningFrom || '08:00'}
                      onTimeChange={(time) => updateTimeRange('morningFrom', time)}
                    />
                    
                    <TimePickerInput
                      label="إلى الساعة"
                      value={tempPreference.morningTo || '12:00'}
                      onTimeChange={(time) => updateTimeRange('morningTo', time)}
                    />
                  </View>
                </View>
              )}

              {/* إعدادات الوقت للمساء */}
              {tempPreference.type === 'evening' && (
                <View style={styles.timeSettingsContainer}>
                  <View style={styles.timeSettingsHeader}>
                    <Moon size={20} color="#7C3AED" />
                    <Text style={styles.timeSettingsTitle}>أوقات الاتصال المسائية</Text>
                  </View>
                  
                  <View style={styles.timeRangeContainer}>
                    <TimePickerInput
                      label="من الساعة"
                      value={tempPreference.eveningFrom || '18:00'}
                      onTimeChange={(time) => updateTimeRange('eveningFrom', time)}
                    />
                    
                    <TimePickerInput
                      label="إلى الساعة"
                      value={tempPreference.eveningTo || '22:00'}
                      onTimeChange={(time) => updateTimeRange('eveningTo', time)}
                    />
                  </View>
                </View>
              )}

              {/* معاينة التفضيل */}
              <View style={styles.previewContainer}>
                <Text style={styles.previewTitle}>معاينة التفضيل:</Text>
                <View style={styles.previewBox}>
                  {tempPreference.type === 'anytime' && (
                    <Text style={styles.previewText}>
                      متاح للاتصال في أي وقت على مدار 24 ساعة
                    </Text>
                  )}
                  {tempPreference.type === 'morning' && (
                    <Text style={styles.previewText}>
                      متاح للاتصال صباحاً من {tempPreference.morningFrom} إلى {tempPreference.morningTo}
                    </Text>
                  )}
                  {tempPreference.type === 'evening' && (
                    <Text style={styles.previewText}>
                      متاح للاتصال مساءً من {tempPreference.eveningFrom} إلى {tempPreference.eveningTo}
                    </Text>
                  )}
                </View>
              </View>
            </ScrollView>
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
  mainButton: {
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
  mainButtonDisabled: {
    backgroundColor: '#F3F4F6',
    opacity: 0.7,
  },
  mainButtonContent: {
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
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textAlign: I18nManager.isRTL ? 'left' : 'right',
    letterSpacing: 0.3,
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
    maxHeight: '90%',
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
  modalContent: {
    maxHeight: '100%',
  },

  // Options styles
  optionsContainer: {
    padding: 20,
    gap: 12,
  },
  optionCard: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  optionCardSelected: {
    backgroundColor: '#FEFEFE',
    borderWidth: 2,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  optionTextContainer: {
    flex: 1,
    alignItems: I18nManager.isRTL ? 'flex-start' : 'flex-end',
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: I18nManager.isRTL ? 'left' : 'right',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: I18nManager.isRTL ? 'left' : 'right',
    lineHeight: 20,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Time settings styles
  timeSettingsContainer: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  timeSettingsHeader: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  timeSettingsTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#374151',
  },
  timeRangeContainer: {
    gap: 12,
  },

  // Preview styles
  previewContainer: {
    margin: 20,
    marginTop: 0,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    textAlign: I18nManager.isRTL ? 'left' : 'right',
  },
  previewBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: I18nManager.isRTL ? 0 : 4,
    borderRightWidth: I18nManager.isRTL ? 4 : 0,
    borderLeftColor: '#3B82F6',
    borderRightColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  previewText: {
    fontSize: 15,
    color: '#1E40AF',
    textAlign: I18nManager.isRTL ? 'left' : 'right',
    lineHeight: 22,
    fontWeight: '600',
  },
});
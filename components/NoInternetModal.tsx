import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WifiOff, X } from 'lucide-react-native';

interface NoInternetModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function NoInternetModal({ visible, onClose }: NoInternetModalProps) {
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [scaleAnim] = React.useState(new Animated.Value(0.8));

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === 'android'}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* زر الإغلاق */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="إغلاق"
              accessibilityRole="button"
            >
              <X size={24} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>

          {/* أيقونة عدم الاتصال */}
          <View style={styles.iconContainer}>
            <WifiOff size={64} color="#EF4444" strokeWidth={2} />
          </View>

          {/* العنوان */}
          <Text style={styles.title}>الاتصال غير متوفر</Text>

          {/* الرسالة */}
          <Text style={styles.message}>
            يبدو أنك غير متصل بالإنترنت حالياً.{'\n'}
            يرجى التحقق من اتصالك بالشبكة والمحاولة مرة أخرى.
          </Text>

          {/* زر الموافقة */}
          <TouchableOpacity
            style={styles.button}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>حسناً</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    ...Platform.select({
      ios: {
        paddingTop: 0,
        paddingBottom: 0,
      },
    }),
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.3,
        shadowRadius: 15,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    padding: 8,
    zIndex: 10,
    ...Platform.select({
      ios: {
        top: 12,
        left: 12,
      },
    }),
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});


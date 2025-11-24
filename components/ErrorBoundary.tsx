import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // تجاهل أخطاء keep-awake في وضع التطوير
    const errorMessage = error.message?.toLowerCase() || '';
    const isKeepAwakeError = errorMessage.includes('keep awake') || 
                           errorMessage.includes('unable to activate') ||
                           errorMessage.includes('getglobalhandler') ||
                           errorMessage.includes('errorutils');
    
    if (isKeepAwakeError) {
      console.warn('Keep awake related error caught and ignored:', error.message);
      return { hasError: false, error: null };
    }
    
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // تجاهل أخطاء keep-awake والأخطاء المتعلقة بها
    const errorMessage = error.message?.toLowerCase() || '';
    const isKeepAwakeError = errorMessage.includes('keep awake') || 
                           errorMessage.includes('unable to activate') ||
                           errorMessage.includes('getglobalhandler') ||
                           errorMessage.includes('errorutils');
    
    if (isKeepAwakeError) {
      console.warn('Keep awake related error caught and ignored in componentDidCatch:', error.message);
      this.setState({ hasError: false, error: null });
      return;
    }

    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <AlertTriangle size={48} color="#DC2626" />
            <Text style={styles.title}>حدث خطأ غير متوقع</Text>
            <Text style={styles.message}>
              {this.state.error.message || 'خطأ غير معروف'}
            </Text>
            <TouchableOpacity style={styles.button} onPress={this.handleRestart}>
              <Text style={styles.buttonText}>المحاولة مرة أخرى</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ErrorBoundary;
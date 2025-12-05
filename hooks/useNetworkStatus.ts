import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(null);

  useEffect(() => {
    // الحصول على الحالة الأولية
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
      setIsInternetReachable(state.isInternetReachable);
    });

    // الاستماع لتغييرات الاتصال
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      setIsInternetReachable(state.isInternetReachable);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // التحقق من وجود اتصال بالإنترنت (يتم التحقق بشكل متزامن للحصول على الحالة الحالية)
  const hasInternetConnection = async () => {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected === true && state.isInternetReachable === true;
    } catch (error) {
      console.error('Error checking network status:', error);
      // في حالة الخطأ، نفترض وجود اتصال لتجنب منع المستخدم
      return true;
    }
  };

  return {
    isConnected,
    isInternetReachable,
    hasInternetConnection,
  };
}


import { useEffect } from 'react';

type FrameworkReadyGlobal = typeof globalThis & {
  frameworkReady?: () => void;
};

export function useFrameworkReady() {
  useEffect(() => {
    try {
      (globalThis as FrameworkReadyGlobal).frameworkReady?.();
    } catch (error: any) {
      // تجاهل أخطاء keep-awake والأخطاء الأخرى في framework ready
      if (error?.message?.includes('keep awake') || error?.message?.includes('Unable to activate')) {
        console.warn('Framework ready keep-awake warning ignored:', error.message);
      } else {
        console.warn('Framework ready error (non-critical):', error);
      }
    }
  }, []);
}

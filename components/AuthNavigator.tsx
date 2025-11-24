import React from 'react';

// AuthNavigator معطّل مؤقتاً لحل مشكلة التوجيه المتكرر
// سيتم التعامل مع التوجيه يدوياً في كل صفحة
export default function AuthNavigator({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
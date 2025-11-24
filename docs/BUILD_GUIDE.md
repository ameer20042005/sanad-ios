# 📦 دليل بناء التطبيق (iOS)

هذا الدليل يشرح كيفية بناء تطبيق Sanad لأجهزة iOS.

## 🚀 طريقتان للبناء

### ⚡ الطريقة 1: EAS Build (الموصى بها)

#### المتطلبات:
```bash
npm install -g eas-cli
eas login
```

#### البناء للإنتاج (App Store):
```bash
# بناء للنشر على App Store
eas build --platform ios --profile production
```

#### البناء للتطوير:
```bash
# بناء للاختبار على الأجهزة
eas build --platform ios --profile development

# بناء للمحاكي
eas build --platform ios --profile development --simulator
```

#### البناء للمعاينة (TestFlight):
```bash
eas build --platform ios --profile preview
```

---

### 🔧 الطريقة 2: البناء المحلي

#### المتطلبات:
- macOS مع Xcode مثبت
- حساب Apple Developer (للبناء على أجهزة حقيقية)

#### 1. تجهيز المشروع:
```bash
npx expo prebuild --clean --platform ios
```

#### 2. فتح المشروع في Xcode:
```bash
open ios/sanad.xcworkspace
```

#### 3. البناء من Xcode:
1. اختر الجهاز المستهدف (محاكي أو جهاز حقيقي)
2. اضغط على Product → Build
3. للأرشفة: Product → Archive

---

## 🔐 ملاحظات مهمة

### قبل البناء:

1. ✅ تحديث `buildNumber` في `app.json`:
   ```json
   "ios": {
     "buildNumber": "1.0.1"  // زد الرقم
   }
   ```

2. ✅ تحديث `version`:
   ```json
   "version": "1.0.1"
   ```

3. ✅ تأكد من إعدادات Bundle Identifier:
   ```json
   "ios": {
     "bundleIdentifier": "com.urjowan.sanad"
   }
   ```

### بعد البناء:
- 📱 اختبر التطبيق على جهاز iOS حقيقي
- 📝 سجل رقم الإصدار
- 🔔 اختبر الإشعارات

---

## 🐛 حل المشاكل

### خطأ في الشهادات (Certificates):
```bash
# إعادة إنشاء الشهادات
eas credentials

# اختر iOS → Production/Development
# ثم اختر "Set up new credentials"
```

### خطأ في Bundle Identifier:
```bash
# تحقق من app.json
grep bundleIdentifier app.json

# تأكد من تطابقه مع Apple Developer Console
```

### مسح Cache:
```bash
# مسح cache Expo
npx expo start --clear

# مسح build iOS
rm -rf ios/build
```

### خطأ في CocoaPods:
```bash
cd ios
pod install --repo-update
cd ..
```

---

## 📲 رفع على App Store

### 1. التحضير:
- تأكد من اكتمال معلومات التطبيق في App Store Connect
- جهز لقطات الشاشة (Screenshots)
- اكتب وصف التطبيق

### 2. الرفع عبر EAS:
```bash
# البناء والرفع التلقائي
eas build --platform ios --profile production --auto-submit
```

### 3. الرفع اليدوي:
1. افتح [App Store Connect](https://appstoreconnect.apple.com)
2. اختر التطبيق
3. انتقل إلى "TestFlight" أو "App Store"
4. ارفع ملف IPA أو استخدم Xcode Organizer
5. املأ التفاصيل وأرسل للمراجعة

---

## 🧪 اختبار عبر TestFlight

### 1. رفع النسخة:
```bash
eas build --platform ios --profile preview
eas submit --platform ios
```

### 2. إضافة المختبرين:
1. افتح App Store Connect
2. اذهب إلى TestFlight
3. أضف المختبرين الداخليين أو الخارجيين
4. شارك رابط الاختبار

---

## ✨ نصائح

- استخدم TestFlight للاختبار قبل النشر الرسمي
- احتفظ بسجل لجميع أرقام الإصدارات
- اختبر على أجهزة iOS مختلفة (iPhone, iPad)
- راجع [دليل الإشعارات](NOTIFICATIONS_GUIDE.md) لإعداد Push Notifications
- تأكد من اختبار جميع الميزات قبل الإرسال للمراجعة

---

## 📚 مصادر إضافية

- [Expo EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

---

**آخر تحديث**: نوفمبر 2025

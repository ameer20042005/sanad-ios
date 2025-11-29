# إصلاح مشكلة Crash على iPad

## المشكلة
تم رفض التطبيق من Apple بسبب crash عند التشغيل على:
- **iPad Air 11" (M3)**
- **iPadOS 26.1**

## الأسباب المحتملة التي تم إصلاحها

### 1. إعدادات iPad غير مكتملة في `app.json`

**المشكلة:**
- `orientation: "portrait"` فقط - يمنع iPad من العمل بشكل صحيح
- عدم وجود إعدادات `infoPlist` كافية لدعم iPad
- `UIRequiresFullScreen` غير محدد (قد يسبب مشاكل)

**الحل:**
- تغيير `orientation` إلى `"default"` لدعم جميع الاتجاهات
- إضافة `UIRequiresFullScreen: false` للسماح لـ iPad بالعمل في Split View
- إضافة `UISupportedInterfaceOrientations` و `UISupportedInterfaceOrientations~ipad` لدعم جميع الاتجاهات
- إضافة `UIRequiredDeviceCapabilities` للتوافق مع iPad

### 2. مشكلة في Native Modules (expo-notifications)

**المشكلة:**
- استدعاء `registerForPushNotificationsAsync()` مباشرة في `useEffect` بدون معالجة أخطاء كافية
- عدم وجود تأخير لضمان أن التطبيق جاهز تماماً
- عدم فحص Platform قبل الاستدعاء

**الحل:**
- إضافة `try-catch` شامل حول جميع استدعاءات الإشعارات
- إضافة تأخير 500ms قبل تسجيل الإشعارات
- فحص `Platform.OS` قبل الاستدعاء
- إضافة `mounted` flag لمنع استدعاءات بعد unmount

### 3. expo-camera غير مضاف في plugins

**المشكلة:**
- `expo-camera` موجود في `package.json` لكن غير موجود في `plugins` في `app.json`
- هذا قد يسبب crash على iPad إذا تم استخدامه بدون إعدادات الصلاحيات

**الحل:**
- إضافة `expo-camera` plugin في `app.json` مع `cameraPermission`
- إضافة `NSCameraUsageDescription` في `infoPlist`

### 4. تحسينات إضافية

- إزالة `remote-notification` المكرر في `UIBackgroundModes`
- إضافة `NSUserNotificationsUsageDescription` في `infoPlist` (مطلوب من Apple)
- تحسين معالجة الأخطاء في `notificationService.ts` لدعم web platform

## التغييرات المطبقة

### `app.json`
```json
{
  "orientation": "default",  // كان "portrait"
  "ios": {
    "infoPlist": {
      "UIRequiresFullScreen": false,
      "UISupportedInterfaceOrientations": [...],
      "UISupportedInterfaceOrientations~ipad": [...],
      "NSUserNotificationsUsageDescription": "...",
      "NSCameraUsageDescription": "..."
    }
  },
  "plugins": [
    ["expo-camera", { "cameraPermission": "..." }]
  ]
}
```

### `app/_layout.tsx`
- إضافة `mounted` flag
- إضافة `try-catch` شامل
- إضافة تأخير 500ms قبل تسجيل الإشعارات
- فحص `Platform.OS` قبل الاستدعاء

### `lib/notificationService.ts`
- إضافة فحص `Platform.OS === 'web'` في بداية الدالة

## خطوات البناء التالية

1. **تنظيف Build:**
   ```bash
   npx expo prebuild --clean
   ```

2. **بناء جديد:**
   ```bash
   eas build --platform ios --profile production
   ```

3. **اختبار على iPad:**
   - تأكد من اختبار التطبيق على iPad قبل الإرسال
   - اختبر جميع الاتجاهات (Portrait, Landscape)
   - اختبر Split View و Slide Over

## ملاحظات مهمة

- تأكد من أن جميع Assets موجودة (appLogo.png, notificationsound.mp3)
- تأكد من أن buildNumber تم تحديثه (حالياً: "2")
- بعد البناء، اختبر التطبيق على iPad قبل الإرسال إلى App Store

## المراجع

- [Expo iPad Support](https://docs.expo.dev/guides/tablet-support/)
- [iOS Info.plist Keys](https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/)
- [Expo Notifications Setup](https://docs.expo.dev/versions/latest/sdk/notifications/)


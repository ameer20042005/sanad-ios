# إصلاح خطأ Metro Bundler - assets/images

## المشكلة

```
Error: ENOENT: no such file or directory, scandir 'assets/images'
```

**السبب:**
- `assetBundlePatterns: ["**/*"]` في `app.json` يجعل Metro bundler يبحث عن جميع المجلدات في `assets`
- Metro يحاول الوصول إلى `assets/images` لكن المجلد غير موجود
- هذا يسبب خطأ عند تشغيل `expo start` أو بناء التطبيق

## الحل

تم إنشاء المجلد `assets/images` مع ملف `.gitkeep`:

```
assets/
  ├── appLogo.png
  ├── notificationsound.mp3
  └── images/
      └── .gitkeep
```

## الخطوات المطبقة

1. ✅ إنشاء مجلد `assets/images`
2. ✅ إضافة ملف `.gitkeep` للحفاظ على المجلد في Git
3. ✅ التحقق من أن `assetBundlePatterns` صحيح

## ملاحظات

- المجلد `assets/images` جاهز لإضافة صور إضافية في المستقبل
- ملف `.gitkeep` يضمن أن المجلد يُحفظ في Git حتى لو كان فارغاً
- لا حاجة لتعديل `assetBundlePatterns` - الإعداد `**/*` صحيح

## إذا أردت إضافة صور لاحقاً

ضع الصور في `assets/images/` واستخدمها في الكود:

```typescript
// في الكود
<Image source={require('@/assets/images/my-image.png')} />
```

أو:

```typescript
import MyImage from '@/assets/images/my-image.png';
<Image source={MyImage} />
```


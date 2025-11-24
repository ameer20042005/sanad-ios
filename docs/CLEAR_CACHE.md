# تنظيف الـ Cache وإعادة تشغيل التطبيق

قم بتشغيل الأوامر التالية لمسح جميع الـ cache وإعادة تشغيل التطبيق:

```powershell
# 1. إيقاف جميع عمليات Metro و Expo
Get-Process | Where-Object {$_.ProcessName -like "*node*" -or $_.ProcessName -like "*expo*"} | Stop-Process -Force

# 2. مسح cache المشروع
Remove-Item -Path .expo -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path node_modules\.cache -Recurse -Force -ErrorAction SilentlyContinue

# 3. مسح cache Metro Bundler
npx expo start -c

# أو استخدم الأمر الكامل:
npx expo start --clear
```

## خطوات إضافية إذا استمرت المشكلة:

```powershell
# إعادة تثبيت node_modules
Remove-Item -Path node_modules -Recurse -Force
npm install

# أو
yarn install
```

## السبب:
التطبيق يستخدم نسخة قديمة من `AuthNavigator.tsx` التي تحتوي على:
- `const { user, loading, profile } = useAuth();` (القديم)

بدلاً من:
- `const { profile, loading } = useAuth();` (الجديد)

بعد مسح الـ cache، سيتم تحميل النسخة الجديدة من الكود.

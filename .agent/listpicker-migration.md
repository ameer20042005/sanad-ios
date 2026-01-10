# تحديث قوائم إدخال البيانات - استخدام ListPicker

## الملخص
تم استبدال جميع قوائم `Picker` من مكتبة `@react-native-picker/picker` بمكون `ListPicker` المخصص في جميع صفحات التطبيق لضمان التوافق الكامل مع iOS.

## الملفات المحدثة

### 1. app/register.tsx
- ✅ استبدال Picker لفصيلة الدم بـ ListPicker
- ✅ استبدال Picker للمحافظة بـ ListPicker
- ✅ استبدال Picker للمدينة بـ ListPicker

### 2. app/profile.tsx
- ✅ استبدال Picker لفصيلة الدم بـ ListPicker (في وضع التحرير)
- ✅ استبدال Picker للمحافظة بـ ListPicker (في وضع التحرير)
- ✅ استبدال Picker للمدينة بـ ListPicker (في وضع التحرير)

### 3. app/(tabs)/find.tsx
- ✅ استبدال Picker لفصيلة الدم بـ ListPicker
- ✅ استبدال Picker للمحافظة بـ ListPicker
- ✅ استبدال Picker للمدينة بـ ListPicker

### 4. app/blood-donation-form.tsx
- ✅ استبدال Picker للمحافظة بـ ListPicker
- ✅ استبدال Picker للمدينة بـ ListPicker
- ✅ استبدال Picker لفصيلة الدم بـ ListPicker

## مميزات ListPicker

1. **التوافق الكامل مع iOS**: يستخدم Modal بدلاً من Picker الأصلي
2. **دعم RTL**: يدعم اتجاه النص من اليمين لليسار بشكل كامل
3. **تصميم موحد**: واجهة مستخدم متسقة عبر جميع المنصات
4. **سهولة الاستخدام**: واجهة بسيطة وسهلة الاستخدام
5. **التخصيص**: يمكن تخصيص العنوان والنص البديل

## الاستخدام

```tsx
<ListPicker
  label="فصيلة الدم"
  value={formData.bloodType}
  placeholder="اختر فصيلة الدم"
  options={bloodTypes.map(type => ({ label: type, value: type }))}
  onChange={(value) => updateFormData('bloodType', value)}
  disabled={false}
  title="اختر فصيلة الدم"
/>
```

## الخصائص (Props)

- `label`: النص الذي يظهر فوق القائمة
- `value`: القيمة المحددة حالياً
- `placeholder`: النص البديل عند عدم وجود قيمة محددة
- `options`: مصفوفة من الخيارات بصيغة `{ label: string, value: string }`
- `onChange`: دالة يتم استدعاؤها عند تغيير القيمة
- `disabled`: تعطيل القائمة (اختياري)
- `title`: عنوان النافذة المنبثقة (اختياري)
- `style`: أنماط إضافية (اختياري)

## ملاحظات

- تم إزالة جميع الاستيرادات من `@react-native-picker/picker`
- جميع الأخطاء المتعلقة بـ Picker تم حلها
- المكون يعمل بشكل صحيح على iOS وAndroid
- يدعم وضع RTL تلقائياً باستخدام `I18nManager.isRTL`

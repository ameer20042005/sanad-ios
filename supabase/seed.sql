-- بيانات تجريبية لتطبيق سند - التبرع بالدم
-- هذا الملف يحتوي على بيانات أولية للاختبار

-- لاحظ: لا يمكن إدراج بيانات في جدول donor_profiles مباشرة 
-- لأنه يتطلب user_id من جدول auth.users
-- سيتم إنشاء البيانات عند تسجيل المستخدمين الجدد

-- إدراج بعض طلبات التبرع التجريبية (بدون user_id للاختبار)
INSERT INTO public.blood_donation_requests (
  name,
  phone,
  governorate,
  city,
  blood_type
) VALUES 
(
  'أحمد محمد علي',
  '07901234567',
  'بغداد',
  'المنصور',
  'A+'
),
(
  'فاطمة حسن',
  '07801234567',
  'بغداد',
  'الرصافة',
  'O-'
),
(
  'عمر إبراهيم',
  '07701234567',
  'البصرة',
  'المعقل',
  'B+'
),
(
  'زينب محمود',
  '07601234567',
  'نينوى',
  'الموصل',
  'AB+'
);

-- إدراج المزيد من الطلبات في محافظات مختلفة
INSERT INTO public.blood_donation_requests (
  name,
  phone,
  governorate,
  city,
  blood_type
) VALUES 
(
  'حسام الدين علي',
  '07501234567',
  'النجف',
  'النجف المركز',
  'A-'
),
(
  'لينا عبد الله',
  '07401234567',
  'كربلاء',
  'كربلاء المركز',
  'O+'
);

-- تحديث بعض البيانات لتبدو أكثر واقعية
UPDATE public.blood_donation_requests 
SET created_at = CURRENT_TIMESTAMP - INTERVAL '2 hours'
WHERE name = 'أحمد محمد علي';

UPDATE public.blood_donation_requests 
SET created_at = CURRENT_TIMESTAMP - INTERVAL '30 minutes'
WHERE name = 'فاطمة حسن';

UPDATE public.blood_donation_requests 
SET created_at = CURRENT_TIMESTAMP - INTERVAL '1 day'
WHERE name = 'عمر إبراهيم';
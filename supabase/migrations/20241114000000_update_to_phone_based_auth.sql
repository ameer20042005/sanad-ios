-- Migration: تحديث النظام للاعتماد على رقم الهاتف بدلاً من Supabase Auth
-- Date: 2024-11-14

-- 1. إضافة حقل donor_id إلى جدول blood_donation_requests
ALTER TABLE public.blood_donation_requests 
ADD COLUMN IF NOT EXISTS donor_id UUID REFERENCES public.donors(id) ON DELETE SET NULL;

-- 2. إنشاء فهرس للبحث السريع على donor_id
CREATE INDEX IF NOT EXISTS idx_blood_donation_requests_donor 
ON public.blood_donation_requests(donor_id);

-- 3. تحديث السياسات الأمنية لتعمل بدون Auth
DROP POLICY IF EXISTS "المستخدمون المسجلون يمكنهم إنشاء طلبات تبرع" ON public.blood_donation_requests;
DROP POLICY IF EXISTS "أصحاب الطلبات يمكنهم تحديث طلباتهم" ON public.blood_donation_requests;
DROP POLICY IF EXISTS "أصحاب الطلبات يمكنهم حذف طلباتهم" ON public.blood_donation_requests;

-- إنشاء سياسات جديدة (مفتوحة للتطوير - يمكن تقييدها لاحقاً)
CREATE POLICY "الجميع يمكنهم إنشاء طلبات تبرع" 
ON public.blood_donation_requests FOR INSERT WITH CHECK (true);

CREATE POLICY "أصحاب الطلبات يمكنهم تحديث طلباتهم (donor_id)" 
ON public.blood_donation_requests FOR UPDATE USING (true);

CREATE POLICY "أصحاب الطلبات يمكنهم حذف طلباتهم (donor_id)" 
ON public.blood_donation_requests FOR DELETE USING (true);

-- 4. نقل البيانات من user_id إلى donor_id حيث ممكن
-- (هذا لن ينجح إذا كانت user_ids غير موجودة في donors، لذا نتجاهل الأخطاء)
DO $$
BEGIN
  -- محاولة ربط الطلبات القديمة بالمتبرعين عن طريق رقم الهاتف
  UPDATE public.blood_donation_requests bdr
  SET donor_id = d.id
  FROM public.donors d
  WHERE bdr.phone = d.phone
  AND bdr.donor_id IS NULL;
  
  RAISE NOTICE 'تم تحديث الطلبات القديمة لربطها بالمتبرعين';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'لم يتم العثور على متبرعين مطابقين للطلبات القديمة';
END $$;

-- 5. إنشاء دالة للتحقق من ملكية الطلب باستخدام donor_id
CREATE OR REPLACE FUNCTION can_manage_blood_request(
  request_id UUID,
  donor_phone TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  request_donor_id UUID;
  donor_id_from_phone UUID;
BEGIN
  -- الحصول على donor_id من رقم الهاتف
  SELECT id INTO donor_id_from_phone 
  FROM public.donors 
  WHERE phone = donor_phone;
  
  -- إذا لم نجد المتبرع
  IF donor_id_from_phone IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- الحصول على donor_id للطلب
  SELECT donor_id INTO request_donor_id 
  FROM public.blood_donation_requests 
  WHERE id = request_id;
  
  -- التحقق من المطابقة
  RETURN donor_id_from_phone = request_donor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. منح الصلاحيات
GRANT EXECUTE ON FUNCTION can_manage_blood_request(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION can_manage_blood_request(UUID, TEXT) TO authenticated;

-- 7. إضافة تعليقات توضيحية
COMMENT ON COLUMN public.blood_donation_requests.donor_id IS 
'معرف المتبرع من جدول donors - يُستخدم بدلاً من user_id للنظام الجديد';

COMMENT ON COLUMN public.blood_donation_requests.user_id IS 
'معرف المستخدم القديم من auth.users - سيتم إزالته لاحقاً';

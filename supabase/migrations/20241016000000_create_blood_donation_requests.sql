-- إنشاء جدول blood_donation_requests الجديد
-- Migration: 20241016000000_create_blood_donation_requests

-- إنشاء جدول طلبات التبرع الجديد مع التركيز على البساطة
CREATE TABLE IF NOT EXISTS public.blood_donation_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- البيانات الأساسية للطلب
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  governorate TEXT NOT NULL,
  city TEXT NOT NULL,
  blood_type TEXT NOT NULL CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  
  -- تواريخ النظام
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء فهارس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_blood_donation_requests_blood_type ON public.blood_donation_requests(blood_type);
CREATE INDEX IF NOT EXISTS idx_blood_donation_requests_location ON public.blood_donation_requests(governorate, city);
CREATE INDEX IF NOT EXISTS idx_blood_donation_requests_user ON public.blood_donation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_blood_donation_requests_created ON public.blood_donation_requests(created_at);

-- إعداد Row Level Security (RLS)
ALTER TABLE public.blood_donation_requests ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
-- الجميع يمكنهم رؤية طلبات التبرع
CREATE POLICY "الجميع يمكنهم رؤية طلبات التبرع" 
ON public.blood_donation_requests FOR SELECT USING (true);

-- المستخدمون المسجلون يمكنهم إنشاء طلبات تبرع
CREATE POLICY "المستخدمون المسجلون يمكنهم إنشاء طلبات تبرع" 
ON public.blood_donation_requests FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- أصحاب الطلبات يمكنهم تحديث طلباتهم
CREATE POLICY "أصحاب الطلبات يمكنهم تحديث طلباتهم" 
ON public.blood_donation_requests FOR UPDATE USING (auth.uid() = user_id);

-- أصحاب الطلبات يمكنهم حذف طلباتهم
CREATE POLICY "أصحاب الطلبات يمكنهم حذف طلباتهم" 
ON public.blood_donation_requests FOR DELETE USING (auth.uid() = user_id);

-- دالة لتحديث updated_at تلقائياً (إعادة استخدام الدالة الموجودة)
CREATE TRIGGER update_blood_donation_requests_updated_at 
BEFORE UPDATE ON public.blood_donation_requests 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- دالة للتحقق من صلاحية حذف طلب التبرع
CREATE OR REPLACE FUNCTION can_delete_blood_donation_request(
  request_id UUID,
  current_user_id TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  request_user_id UUID;
  current_auth_id UUID;
BEGIN
  -- الحصول على معرف المستخدم المصادق عليه
  current_auth_id := auth.uid();
  
  -- إذا لم يكن المستخدم مسجل الدخول
  IF current_auth_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- الحصول على معرف صاحب الطلب
  SELECT user_id INTO request_user_id 
  FROM public.blood_donation_requests 
  WHERE id = request_id;
  
  -- إذا لم نجد الطلب
  IF request_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- التحقق من أن المستخدم المصادق عليه هو صاحب الطلب
  RETURN current_auth_id = request_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة لحذف طلب التبرع مع التحقق من الصلاحيات
CREATE OR REPLACE FUNCTION delete_blood_donation_request(
  request_id UUID,
  current_user_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  request_user_id UUID;
  current_auth_id UUID;
  deleted_count INTEGER;
BEGIN
  -- الحصول على معرف المستخدم المصادق عليه
  current_auth_id := auth.uid();
  
  -- إذا لم يكن المستخدم مسجل الدخول
  IF current_auth_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- الحصول على معرف صاحب الطلب
  SELECT user_id INTO request_user_id 
  FROM public.blood_donation_requests 
  WHERE id = request_id;
  
  -- إذا لم نجد الطلب
  IF request_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- التحقق من أن المستخدم المصادق عليه هو صاحب الطلب
  IF current_auth_id != request_user_id THEN
    RETURN FALSE;
  END IF;
  
  -- حذف الطلب
  DELETE FROM public.blood_donation_requests 
  WHERE id = request_id AND user_id = current_auth_id;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- منح الصلاحيات
GRANT ALL ON public.blood_donation_requests TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- منح صلاحيات تنفيذ الدوال
GRANT EXECUTE ON FUNCTION can_delete_blood_donation_request(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_blood_donation_request(UUID, TEXT) TO authenticated;

-- نسخ البيانات من donation_requests إلى blood_donation_requests (إذا كان الجدول موجود)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'donation_requests') THEN
    INSERT INTO public.blood_donation_requests (
      user_id, name, phone, governorate, city, blood_type, created_at, updated_at
    )
    SELECT 
      requester_user_id as user_id,
      patient_name as name,
      contact_phone as phone,
      governorate,
      city,
      blood_type,
      created_at,
      updated_at
    FROM public.donation_requests
    WHERE NOT EXISTS (
      SELECT 1 FROM public.blood_donation_requests 
      WHERE blood_donation_requests.phone = donation_requests.contact_phone
      AND blood_donation_requests.created_at = donation_requests.created_at
    );
  END IF;
END $$;
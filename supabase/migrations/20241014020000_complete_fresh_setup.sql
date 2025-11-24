-- إعداد تطبيق سند - التبرع بالدم
-- Migration: 20241014020000_complete_fresh_setup

-- تمكين UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- إنشاء جدول بيانات المتبرعين (مرتبط مع auth.users)
CREATE TABLE IF NOT EXISTS public.donor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- البيانات الشخصية
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  blood_type TEXT NOT NULL CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  
  -- الموقع الجغرافي
  governorate TEXT NOT NULL,
  city TEXT NOT NULL,
  
  -- تفضيلات الاتصال
  contact_preference TEXT NOT NULL CHECK (contact_preference IN ('anytime', 'morning', 'evening')),
  morning_from TIME,
  morning_to TIME,
  evening_from TIME,
  evening_to TIME,
  
  -- ملاحظات إضافية
  notes TEXT,
  
  -- معلومات النظام
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- فهارس للبحث السريع
  CONSTRAINT unique_user_profile UNIQUE (user_id)
);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_donor_profiles_blood_type ON public.donor_profiles(blood_type);
CREATE INDEX IF NOT EXISTS idx_donor_profiles_location ON public.donor_profiles(governorate, city);
CREATE INDEX IF NOT EXISTS idx_donor_profiles_phone ON public.donor_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_donor_profiles_active ON public.donor_profiles(is_active);

-- جدول طلبات التبرع (الجدول الحالي donors يصبح للطلبات)
CREATE TABLE IF NOT EXISTS public.donation_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- بيانات الطلب
  patient_name TEXT NOT NULL,
  blood_type TEXT NOT NULL CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  hospital_name TEXT NOT NULL,
  hospital_address TEXT NOT NULL,
  
  -- الموقع المطلوب
  governorate TEXT NOT NULL,
  city TEXT NOT NULL,
  
  -- تفاصيل الحالة
  urgency_level TEXT NOT NULL DEFAULT 'medium' CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  contact_phone TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  
  -- حالة الطلب
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'cancelled', 'expired')),
  
  -- تواريخ مهمة
  needed_by TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  fulfilled_at TIMESTAMP WITH TIME ZONE
);

-- فهارس لطلبات التبرع
CREATE INDEX IF NOT EXISTS idx_donation_requests_blood_type ON public.donation_requests(blood_type);
CREATE INDEX IF NOT EXISTS idx_donation_requests_location ON public.donation_requests(governorate, city);
CREATE INDEX IF NOT EXISTS idx_donation_requests_status ON public.donation_requests(status);
CREATE INDEX IF NOT EXISTS idx_donation_requests_urgency ON public.donation_requests(urgency_level);

-- إعداد Row Level Security (RLS)
ALTER TABLE public.donor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_requests ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان للملفات الشخصية للمتبرعين
CREATE POLICY "المستخدمون يمكنهم رؤية ملفاتهم الشخصية" 
ON public.donor_profiles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "المستخدمون يمكنهم إنشاء ملفاتهم الشخصية" 
ON public.donor_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "المستخدمون يمكنهم تحديث ملفاتهم الشخصية" 
ON public.donor_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "المستخدمون يمكنهم حذف ملفاتهم الشخصية" 
ON public.donor_profiles FOR DELETE USING (auth.uid() = user_id);

-- سياسة للسماح للمستخدمين المسجلين برؤية ملفات المتبرعين النشطة (للبحث)
CREATE POLICY "المستخدمون المسجلون يمكنهم البحث في ملفات المتبرعين النشطة" 
ON public.donor_profiles FOR SELECT USING (
  auth.role() = 'authenticated' AND is_active = true
);

-- سياسات طلبات التبرع
CREATE POLICY "الجميع يمكنهم رؤية طلبات التبرع النشطة" 
ON public.donation_requests FOR SELECT USING (status = 'active');

CREATE POLICY "المستخدمون المسجلون يمكنهم إنشاء طلبات تبرع" 
ON public.donation_requests FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "أصحاب الطلبات يمكنهم تحديث طلباتهم" 
ON public.donation_requests FOR UPDATE USING (auth.uid() = requester_user_id);

-- دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إضافة محفزات التحديث التلقائي
CREATE TRIGGER update_donor_profiles_updated_at 
BEFORE UPDATE ON public.donor_profiles 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donation_requests_updated_at 
BEFORE UPDATE ON public.donation_requests 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- منح الصلاحيات
GRANT ALL ON public.donor_profiles TO authenticated;
GRANT ALL ON public.donation_requests TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

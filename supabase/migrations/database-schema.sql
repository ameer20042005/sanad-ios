-- تصميم قاعدة البيانات لتطبيق سند - التبرع بالدم

-- جدول المستخدمين (يتم إدارته تلقائياً بواسطة Supabase Auth)
-- auth.users table handled by Supabase automatically

-- جدول بيانات المتبرعين (مرتبط مع auth.users)
CREATE TABLE IF NOT EXISTS donor_profiles (
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
CREATE INDEX IF NOT EXISTS idx_donor_profiles_blood_type ON donor_profiles(blood_type);
CREATE INDEX IF NOT EXISTS idx_donor_profiles_location ON donor_profiles(governorate, city);
CREATE INDEX IF NOT EXISTS idx_donor_profiles_phone ON donor_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_donor_profiles_active ON donor_profiles(is_active);

-- جدول طلبات التبرع
CREATE TABLE IF NOT EXISTS donation_requests (
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
CREATE INDEX IF NOT EXISTS idx_donation_requests_blood_type ON donation_requests(blood_type);
CREATE INDEX IF NOT EXISTS idx_donation_requests_location ON donation_requests(governorate, city);
CREATE INDEX IF NOT EXISTS idx_donation_requests_status ON donation_requests(status);
CREATE INDEX IF NOT EXISTS idx_donation_requests_urgency ON donation_requests(urgency_level);

-- جدول استجابات المتبرعين
CREATE TABLE IF NOT EXISTS donor_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES donation_requests(id) ON DELETE CASCADE,
  donor_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- نوع الاستجابة
  response_type TEXT NOT NULL CHECK (response_type IN ('interested', 'confirmed', 'declined')),
  message TEXT,
  
  -- معلومات الاستجابة
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- منع الاستجابات المكررة
  CONSTRAINT unique_donor_request_response UNIQUE (request_id, donor_user_id)
);

-- فهارس لاستجابات المتبرعين
CREATE INDEX IF NOT EXISTS idx_donor_responses_request ON donor_responses(request_id);
CREATE INDEX IF NOT EXISTS idx_donor_responses_donor ON donor_responses(donor_user_id);
CREATE INDEX IF NOT EXISTS idx_donor_responses_type ON donor_responses(response_type);

-- جدول تاريخ التبرعات (اختياري - لتتبع التبرعات المكتملة)
CREATE TABLE IF NOT EXISTS donation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_id UUID REFERENCES donation_requests(id) ON DELETE SET NULL,
  
  -- تفاصيل التبرع
  donation_date DATE NOT NULL,
  hospital_name TEXT NOT NULL,
  blood_units INTEGER DEFAULT 1,
  notes TEXT,
  
  -- معلومات النظام
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- فهارس لتاريخ التبرعات
CREATE INDEX IF NOT EXISTS idx_donation_history_donor ON donation_history(donor_user_id);
CREATE INDEX IF NOT EXISTS idx_donation_history_date ON donation_history(donation_date);

-- جدول الإشعارات
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- محتوى الإشعار
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('donation_request', 'response', 'reminder', 'system')),
  
  -- بيانات إضافية (JSON)
  data JSONB,
  
  -- حالة الإشعار
  is_read BOOLEAN DEFAULT false,
  
  -- معلومات النظام
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- فهارس للإشعارات
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- إعداد Row Level Security (RLS)
ALTER TABLE donor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE donor_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان للملفات الشخصية للمتبرعين
CREATE POLICY "المستخدمون يمكنهم رؤية ملفاتهم الشخصية" 
ON donor_profiles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "المستخدمون يمكنهم إنشاء ملفاتهم الشخصية" 
ON donor_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "المستخدمون يمكنهم تحديث ملفاتهم الشخصية" 
ON donor_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "المستخدمون يمكنهم حذف ملفاتهم الشخصية" 
ON donor_profiles FOR DELETE USING (auth.uid() = user_id);

-- سياسة للسماح للمستخدمين المسجلين برؤية ملفات المتبرعين النشطة (للبحث)
CREATE POLICY "المستخدمون المسجلون يمكنهم البحث في ملفات المتبرعين النشطة" 
ON donor_profiles FOR SELECT USING (
  auth.role() = 'authenticated' AND is_active = true
);

-- سياسات طلبات التبرع
CREATE POLICY "الجميع يمكنهم رؤية طلبات التبرع النشطة" 
ON donation_requests FOR SELECT USING (status = 'active');

CREATE POLICY "المستخدمون المسجلون يمكنهم إنشاء طلبات تبرع" 
ON donation_requests FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "أصحاب الطلبات يمكنهم تحديث طلباتهم" 
ON donation_requests FOR UPDATE USING (auth.uid() = requester_user_id);

-- سياسات استجابات المتبرعين
CREATE POLICY "المتبرعون يمكنهم الاستجابة للطلبات" 
ON donor_responses FOR INSERT WITH CHECK (auth.uid() = donor_user_id);

CREATE POLICY "المستخدمون يمكنهم رؤية استجاباتهم" 
ON donor_responses FOR SELECT USING (
  auth.uid() = donor_user_id OR 
  auth.uid() IN (SELECT requester_user_id FROM donation_requests WHERE id = request_id)
);

-- سياسات تاريخ التبرعات
CREATE POLICY "المتبرعون يمكنهم رؤية تاريخ تبرعاتهم" 
ON donation_history FOR SELECT USING (auth.uid() = donor_user_id);

CREATE POLICY "المتبرعون يمكنهم إضافة تبرعاتهم" 
ON donation_history FOR INSERT WITH CHECK (auth.uid() = donor_user_id);

-- سياسات الإشعارات
CREATE POLICY "المستخدمون يمكنهم رؤية إشعاراتهم فقط" 
ON notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "المستخدمون يمكنهم تحديث إشعاراتهم" 
ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- دوال مساعدة

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
BEFORE UPDATE ON donor_profiles 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donation_requests_updated_at 
BEFORE UPDATE ON donation_requests 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donor_responses_updated_at 
BEFORE UPDATE ON donor_responses 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donation_history_updated_at 
BEFORE UPDATE ON donation_history 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- دالة للبحث عن المتبرعين
CREATE OR REPLACE FUNCTION search_donors(
  p_blood_type TEXT DEFAULT NULL,
  p_governorate TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  phone TEXT,
  blood_type TEXT,
  governorate TEXT,
  city TEXT,
  contact_preference TEXT,
  morning_from TIME,
  morning_to TIME,
  evening_from TIME,
  evening_to TIME
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dp.id,
    dp.name,
    dp.phone,
    dp.blood_type,
    dp.governorate,
    dp.city,
    dp.contact_preference,
    dp.morning_from,
    dp.morning_to,
    dp.evening_from,
    dp.evening_to
  FROM donor_profiles dp
  WHERE 
    dp.is_active = true
    AND (p_blood_type IS NULL OR dp.blood_type = p_blood_type)
    AND (p_governorate IS NULL OR dp.governorate = p_governorate)
    AND (p_city IS NULL OR dp.city = p_city)
  ORDER BY dp.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- منح صلاحيات استخدام الدالة للمستخدمين المسجلين
GRANT EXECUTE ON FUNCTION search_donors TO authenticated;
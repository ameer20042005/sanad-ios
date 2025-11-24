-- حل مشكلة RLS للضيوف في صفحة البحث عن متبرعين
-- يجب تشغيل هذا في SQL Editor في Supabase

-- إضافة سياسة للسماح للضيوف بقراءة المتبرعين النشطين
CREATE POLICY "public_read_active_donors" 
ON "public"."donor_profiles" 
FOR SELECT 
TO public 
USING (is_active = true);

-- أو يمكنك تعديل السياسة الموجودة بدلاً من إنشاء واحدة جديدة
-- DROP POLICY "users_own_profile" ON "public"."donor_profiles";
-- CREATE POLICY "users_own_profile" 
-- ON "public"."donor_profiles" 
-- FOR ALL 
-- TO public 
-- USING ((auth.uid() = user_id) OR (is_active = true))
-- WITH CHECK (auth.uid() = user_id);
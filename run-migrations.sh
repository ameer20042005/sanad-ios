# تشغيل migrations قاعدة البيانات

# تأكد من أن Supabase CLI مثبت ومُعد
# npm install -g supabase

# ربط المشروع بـ Supabase (إذا لم يكن مربوطاً مسبقاً)
# supabase link --project-ref YOUR_PROJECT_REF

# تشغيل جميع الـ migrations
supabase db push

# أو تشغيل migration محدد
# supabase db push --db-url YOUR_DATABASE_URL

# للتحقق من حالة الـ migrations
supabase migration list

# إعادة تعيين قاعدة البيانات وإعادة تشغيل جميع الـ migrations (احذر - هذا سيحذف جميع البيانات!)
# supabase db reset
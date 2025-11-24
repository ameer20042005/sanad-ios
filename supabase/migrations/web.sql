-- Consolidated Database Setup Migration
-- This migration combines all database setup requirements for the ads gallery hub
-- Date: 2025-10-12

-- ============================================
-- 1. ADS TABLE SETUP
-- ============================================

-- Create ads table for mobile app advertisements (if not exists)
CREATE TABLE IF NOT EXISTS public.ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  click_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add scheduling columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'ads' AND column_name = 'start_date') THEN
    ALTER TABLE public.ads ADD COLUMN start_date TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'ads' AND column_name = 'end_date') THEN
    ALTER TABLE public.ads ADD COLUMN end_date TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Add check constraint to ensure end_date is after start_date (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE table_name = 'ads' AND constraint_name = 'ads_date_check') THEN
    ALTER TABLE public.ads
    ADD CONSTRAINT ads_date_check CHECK (end_date IS NULL OR start_date IS NULL OR end_date > start_date);
  END IF;
END $$;

-- ============================================
-- 2. AD ANALYTICS TABLE SETUP
-- ============================================

-- Create analytics table for tracking ad performance (if not exists)
CREATE TABLE IF NOT EXISTS public.ad_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'click')),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- 3. CONTACT MESSAGES TABLE SETUP
-- ============================================

-- Create contact_messages table for storing contact form submissions (if not exists)
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- 4. STORAGE BUCKET SETUP
-- ============================================

-- Create images bucket for ad images (if not exists)
INSERT INTO storage.buckets (id, name, public)
SELECT 'images', 'images', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'images');

-- ============================================
-- 5. ROW LEVEL SECURITY SETUP
-- ============================================

-- Enable Row Level Security for all tables
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. ADS TABLE POLICIES
-- ============================================

-- Create policies for ads (only authenticated users can manage)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ads' AND policyname = 'Authenticated users can view all ads') THEN
    CREATE POLICY "Authenticated users can view all ads" 
    ON public.ads 
    FOR SELECT 
    USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ads' AND policyname = 'Authenticated users can manage ads') THEN
    CREATE POLICY "Authenticated users can manage ads" 
    ON public.ads 
    FOR ALL
    USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- ============================================
-- 7. AD ANALYTICS POLICIES
-- ============================================

-- Create policies for analytics (only authenticated users can view)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ad_analytics' AND policyname = 'Authenticated users can view analytics') THEN
    CREATE POLICY "Authenticated users can view analytics" 
    ON public.ad_analytics 
    FOR SELECT 
    USING (auth.uid() IS NOT NULL);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ad_analytics' AND policyname = 'Anyone can insert analytics') THEN
    CREATE POLICY "Anyone can insert analytics" 
    ON public.ad_analytics 
    FOR INSERT 
    WITH CHECK (true);
  END IF;
END $$;

-- ============================================
-- 8. CONTACT MESSAGES POLICIES
-- ============================================

-- Create policies for contact_messages
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contact_messages' AND policyname = 'Anyone can insert contact messages') THEN
    CREATE POLICY "Anyone can insert contact messages"
    ON public.contact_messages
    FOR INSERT
    WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contact_messages' AND policyname = 'Authenticated users can view contact messages') THEN
    CREATE POLICY "Authenticated users can view contact messages"
    ON public.contact_messages
    FOR SELECT
    USING (auth.uid() IS NOT NULL);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contact_messages' AND policyname = 'Authenticated users can update contact messages') THEN
    CREATE POLICY "Authenticated users can update contact messages"
    ON public.contact_messages
    FOR UPDATE
    USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- ============================================
-- 9. STORAGE BUCKET POLICIES
-- ============================================

-- Set up RLS policies for images bucket
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Images are publicly accessible') THEN
    CREATE POLICY "Images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'images');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can upload images') THEN
    CREATE POLICY "Authenticated users can upload images" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'images'
      AND auth.role() = 'authenticated'
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can update their images') THEN
    CREATE POLICY "Authenticated users can update their images" ON storage.objects
    FOR UPDATE USING (
      bucket_id = 'images'
      AND auth.role() = 'authenticated'
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can delete their images') THEN
    CREATE POLICY "Authenticated users can delete their images" ON storage.objects
    FOR DELETE USING (
      bucket_id = 'images'
      AND auth.role() = 'authenticated'
    );
  END IF;
END $$;

-- ============================================
-- 10. FUNCTIONS SETUP
-- ============================================

-- Create function to update timestamps for ads table
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create function to update timestamps for contact_messages table
CREATE OR REPLACE FUNCTION public.update_contact_messages_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================
-- 11. TRIGGERS SETUP
-- ============================================

-- Create trigger for automatic timestamp updates on ads table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers 
                 WHERE trigger_name = 'update_ads_updated_at' AND event_object_table = 'ads') THEN
    CREATE TRIGGER update_ads_updated_at
    BEFORE UPDATE ON public.ads
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Create trigger for automatic timestamp updates on contact_messages table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers 
                 WHERE trigger_name = 'update_contact_messages_updated_at' AND event_object_table = 'contact_messages') THEN
    CREATE TRIGGER update_contact_messages_updated_at
    BEFORE UPDATE ON public.contact_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_contact_messages_updated_at_column();
  END IF;
END $$;

-- ============================================
-- 12. INDEXES SETUP
-- ============================================

-- Indexes for ads table (create if not exists)
CREATE INDEX IF NOT EXISTS idx_ads_active ON public.ads(is_active);
CREATE INDEX IF NOT EXISTS idx_ads_start_date ON public.ads(start_date);
CREATE INDEX IF NOT EXISTS idx_ads_end_date ON public.ads(end_date);

-- Indexes for ad_analytics table (create if not exists)
CREATE INDEX IF NOT EXISTS idx_analytics_ad_id ON public.ad_analytics(ad_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.ad_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.ad_analytics(created_at);

-- Indexes for contact_messages table (create if not exists)
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_messages_is_read ON public.contact_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON public.contact_messages(email);

-- ============================================
-- 13. COMMENTS AND DOCUMENTATION
-- ============================================

-- Add table comments for documentation
COMMENT ON TABLE public.ads IS 'Stores advertisement data for the mobile app';
COMMENT ON TABLE public.ad_analytics IS 'Tracks ad performance metrics including views and clicks';
COMMENT ON TABLE public.contact_messages IS 'Stores contact form submissions from users';

-- Add column comments for better understanding
COMMENT ON COLUMN public.ads.start_date IS 'When the ad should start being displayed (NULL means immediately)';
COMMENT ON COLUMN public.ads.end_date IS 'When the ad should stop being displayed (NULL means no end date)';
COMMENT ON COLUMN public.contact_messages.is_read IS 'Indicates whether the admin has read this message';

-- Migration completed successfully
-- This migration consolidates the following individual migrations:
-- - 20250921085344_ffd1281f-d468-4c97-b276-decd9b5a34d5.sql (ads and analytics tables)
-- - 20250921210000_create_contact_messages_table.sql (contact messages table)
-- - 20250922000000_create_images_bucket.sql (storage bucket setup)
-- - 20251002000000_add_ad_scheduling.sql (ad scheduling columns)ا
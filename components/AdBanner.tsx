import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { ExternalLink, X } from 'lucide-react-native';

interface Ad {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  click_url: string;
  is_active: boolean;
  created_at: string;
}

interface AdBannerProps {
  style?: any;
}

export default function AdBanner({ style }: AdBannerProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        // قمع أخطاء الشبكة - غير حرجة
        const isNetworkError = error.message?.includes('Network') || 
                               error.message?.includes('network') || 
                               error.message?.includes('fetch') ||
                               error.details?.includes('Network') ||
                               error.details?.includes('network');
        
        if (!isNetworkError) {
          console.log('Error fetching ads:', error);
        }
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        setAds(data);
        // تسجيل مشاهدة للإعلان الأول
        await trackAdView(data[0].id);
      }
    } catch (error: any) {
      // قمع أخطاء الشبكة - غير حرجة
      const isNetworkError = error?.message?.includes('Network') || 
                             error?.message?.includes('network') || 
                             error?.message?.includes('fetch') ||
                             error?.details?.includes('Network') ||
                             error?.details?.includes('network');
      
      if (!isNetworkError) {
        console.log('Error fetching ads:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const trackAdView = async (adId: string) => {
    try {
      await supabase
        .from('ad_analytics')
        .insert({
          ad_id: adId,
          event_type: 'view',
          ip_address: null,
          user_agent: null,
        });
    } catch (error) {
      console.log('Error tracking ad view:', error);
    }
  };

  const trackAdClick = async (adId: string) => {
    try {
      await supabase
        .from('ad_analytics')
        .insert({
          ad_id: adId,
          event_type: 'click',
          ip_address: null,
          user_agent: null,
        });
    } catch (error) {
      console.log('Error tracking ad click:', error);
    }
  };

  const handleAdClick = async (ad: Ad) => {
    // تسجيل النقرة
    await trackAdClick(ad.id);
    
    // فتح الرابط
    if (ad.click_url) {
      try {
        await Linking.openURL(ad.click_url);
      } catch (error) {
        Alert.alert('خطأ', 'لا يمكن فتح الرابط');
      }
    }
  };

  const nextAd = async () => {
    if (ads.length > 1) {
      const newIndex = (currentAdIndex + 1) % ads.length;
      setCurrentAdIndex(newIndex);
      // تسجيل مشاهدة للإعلان الجديد
      await trackAdView(ads[newIndex].id);
    }
  };

  const closeAd = () => {
    setIsVisible(false);
  };

  // دالة لتدوير الإعلانات تلقائياً كل 10 ثوان
  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        nextAd();
      }, 10000); // 10 ثوان

      return () => clearInterval(interval);
    }
  }, [ads, currentAdIndex]);

  if (loading || !isVisible || ads.length === 0) {
    return null;
  }

  const currentAd = ads[currentAdIndex];

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.adContainer}
        onPress={() => handleAdClick(currentAd)}
        activeOpacity={0.8}>
        
        {currentAd.image_url ? (
          <Image
            source={{ uri: currentAd.image_url }}
            style={styles.adImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.adPlaceholder}>
            <ExternalLink size={40} color="#6B7280" />
            <Text style={styles.placeholderText}>إعلان</Text>
          </View>
        )}
        
        <View style={styles.adLabel}>
          <Text style={styles.adLabelText}>إعلان</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.closeButton} onPress={closeAd}>
        <X size={18} color="#FFFFFF" />
      </TouchableOpacity>

      {ads.length > 1 && (
        <View style={styles.dotsContainer}>
          {ads.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentAdIndex ? styles.activeDot : styles.inactiveDot
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  adContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  adImage: {
    width: '100%',
    height: 120,
  },
  adPlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  adLabel: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  adLabelText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: '#E53E3E',
  },
  inactiveDot: {
    backgroundColor: '#D1D5DB',
  },
});
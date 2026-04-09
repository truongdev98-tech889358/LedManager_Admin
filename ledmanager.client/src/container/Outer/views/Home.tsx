
import { useEffect, useState } from 'react';
import { getBanners } from '@/container/Banners/apis';
import HeroBanner from '@/components/HeroBanner/HeroBanner';
import { Spin } from 'antd';

const Home = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const data = await getBanners({ isActive: true });
      // Filter for Hero type if API doesn't filtering by default, or just take the first one for now
      // Assuming the API returns a list and we want the 'Hero' ones.
      // Based on API signature it returns { items: [], ... }
      if (data && data.items) {
          const heroBanners = data.items.filter((b: any) => b.bannerType === 'Hero' && b.isActive);
          setBanners(heroBanners);
      }
    } catch (error) {
      console.error("Error fetching banners", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}><Spin size="large" /></div>;
  }

  return (
    <div>
      {banners.length > 0 ? (
        banners.map((banner: any) => (
          <HeroBanner 
            key={banner.id}
            {...banner}
          />
        ))
      ) : (
        // Fallback or empty state if no active banners
         <div style={{padding: 50, textAlign: 'center'}}>No active banners</div>
      )}
      
      {/* Other Home Page Sections could go here */}
    </div>
  );
};

export default Home;

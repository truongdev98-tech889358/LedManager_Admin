
import React from 'react';
import styles from './HeroBanner.module.scss';
import { BASE_URL } from '@/configs/constants';

interface BannerProps {
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  link?: string;
  buttonText?: string;
  buttonLink?: string;
  buttonText2?: string;
  buttonLink2?: string;
  textPosition?: string;
  showOverlay?: boolean;
}

const HeroBanner: React.FC<BannerProps> = ({
  title,
  description,
  imageUrl,
  buttonText,
  buttonLink,
  buttonText2,
  buttonLink2,
}) => {
  
  // Helper to split title for the specific "STAND OUT" effect if plain text matches
  // If title is specifically "STAND OUT", we render it with special logic.
  // Otherwise, we render normally.
  
  const renderTitle = () => {
    if (title.toUpperCase() === 'STAND OUT') {
        return (
            <h1 className={styles.title}>
                <span className={styles.outlineText}>STAND</span>
                <span className={styles.solidText}>OUT</span>
            </h1>
        )
    }
    return <h1 className={styles.title} style={{ fontSize: '4rem' }}>{title}</h1>;
  };

  const bgImage = imageUrl.startsWith('http') ? imageUrl : `${BASE_URL}${imageUrl}`;

  return (
    <div 
      className={styles.bannerContainer}
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className={styles.content}>
        {renderTitle()}
        
        {description && <p className={styles.description}>{description}</p>}
        
        <div className={styles.buttonGroup}>
            {buttonText && (
                <button 
                  className={styles.btnPrimary}
                  onClick={() => buttonLink && (window.location.href = buttonLink)}
                >
                    {buttonText}
                </button>
            )}
            
            {buttonText2 && (
                <button 
                  className={styles.btnSecondary}
                  onClick={() => buttonLink2 && (window.location.href = buttonLink2)}
                >
                    {buttonText2}
                </button>
            )}
        </div>

        {/* Hardcoded ratings for visual match with design */}
        <div className={styles.ratings}>
            <div>
                <span style={{fontSize: '2rem', fontWeight: 'bold'}}>4.9</span>
                <span style={{color: '#ffcc00'}}> ★★★★★</span>
                <div style={{fontSize: '0.8rem', opacity: 0.7}}>Based on 1000+ Reviews Globally</div>
            </div>
            {/* Google Reviews Logo Placeholder */}
            <div>
               <span style={{fontWeight: 'bold'}}>Google</span><br/>
               REVIEWS
            </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;

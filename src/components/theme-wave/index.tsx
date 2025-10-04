import React, { useEffect, useState } from 'react';
import './index.scss';

interface ThemeWaveProps {
  isActive: boolean;
  triggerPosition: { x: number; y: number } | null;
  onAnimationComplete: () => void;
}

const ThemeWave: React.FC<ThemeWaveProps> = ({ 
  isActive, 
  triggerPosition, 
  onAnimationComplete 
}) => {
  const [waveKey, setWaveKey] = useState(0);

  useEffect(() => {
    if (isActive && triggerPosition) {
      setWaveKey(prev => prev + 1);
      
      // Reset animation after it completes
      const timer = setTimeout(() => {
        onAnimationComplete();
      }, 800); // Match animation duration

      return () => clearTimeout(timer);
    }
  }, [isActive, triggerPosition, onAnimationComplete]);

  if (!isActive || !triggerPosition) {
    return null;
  }

  return (
    <div className="theme-wave-overlay">
      <div
        key={waveKey}
        className="theme-wave"
        style={{
          left: triggerPosition.x,
          top: triggerPosition.y,
        }}
      />
    </div>
  );
};

export default ThemeWave;

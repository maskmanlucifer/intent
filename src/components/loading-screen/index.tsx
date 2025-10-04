import React from 'react';
import './index.scss';

interface LoadingScreenProps {
  isVisible: boolean;
  theme: 'light' | 'dark';
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isVisible, theme }) => {
  if (!isVisible) return null;

  return (
    <div className={`loading-screen ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      {/* Fog overlay effect */}
      <div className="fog-overlay">
        <div className="fog-layer fog-layer-1"></div>
        <div className="fog-layer fog-layer-2"></div>
        <div className="fog-layer fog-layer-3"></div>
      </div>
      
      {/* Minimal loading indicator */}
      <div className="loading-indicator">
        <div className="loading-dot"></div>
        <div className="loading-dot"></div>
        <div className="loading-dot"></div>
      </div>
    </div>
  );
};

export default LoadingScreen;

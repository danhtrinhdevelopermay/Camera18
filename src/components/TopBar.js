import React from 'react';
import '../styles/TopBar.css';

const TopBar = ({ flashMode, onFlashToggle, cameraMode, isRecording }) => {
  const getFlashIcon = () => {
    switch (flashMode) {
      case 'on':
        return '⚡';
      case 'off':
        return '⚡';
      case 'auto':
      default:
        return 'A⚡';
    }
  };

  return (
    <div className="top-bar ios-glass-dark">
      <div className="top-bar-left">
        <button 
          className={`flash-button ${flashMode}`}
          onClick={onFlashToggle}
        >
          <span className="flash-icon">{getFlashIcon()}</span>
          {flashMode === 'auto' && <span className="flash-text">AUTO</span>}
        </button>
      </div>
      
      <div className="top-bar-center">
        {isRecording && (
          <div className="recording-indicator animate-fade-in">
            <div className="recording-dot"></div>
            <span>Đang quay</span>
          </div>
        )}
      </div>
      
      <div className="top-bar-right">
        <button className="settings-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 8V12L15 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TopBar;
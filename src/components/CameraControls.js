import React, { useState } from 'react';
import { useSpring, animated } from 'react-spring';
import '../styles/CameraControls.css';

const CameraControls = ({
  cameraMode,
  onCameraModeChange,
  isRecording,
  onCapture,
  onCameraFlip,
  isFrontCamera,
  showModeSelector,
  onToggleModeSelector
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  
  const modes = [
    { id: 'video', label: 'VIDEO', icon: '📹' },
    { id: 'photo', label: 'ẢNH', icon: '📸' },
    { id: 'portrait', label: 'CHÂN DUNG', icon: '👤' }
  ];

  // Animation for capture button
  const captureButtonAnimation = useSpring({
    transform: isCapturing ? 'scale(0.9)' : 'scale(1)',
    config: { duration: 100 }
  });

  // Animation for mode selector
  const modeSelectorAnimation = useSpring({
    opacity: showModeSelector ? 1 : 0,
    transform: showModeSelector ? 'translateY(0px)' : 'translateY(20px)',
    config: { tension: 300, friction: 30 }
  });

  const handleCapture = async () => {
    setIsCapturing(true);
    
    // Add haptic feedback simulation
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    await onCapture();
    
    setTimeout(() => {
      setIsCapturing(false);
    }, 200);
  };

  const getCaptureButtonContent = () => {
    if (cameraMode === 'video') {
      return isRecording ? (
        <div className="stop-recording-button">
          <div className="stop-icon"></div>
        </div>
      ) : (
        <div className="record-button">
          <div className="record-dot"></div>
        </div>
      );
    }
    
    return (
      <div className="photo-button">
        <div className="photo-button-inner"></div>
      </div>
    );
  };

  return (
    <div className="camera-controls">
      {/* Mode selector */}
      <animated.div 
        style={modeSelectorAnimation}
        className="mode-selector ios-glass-dark"
      >
        {modes.map((mode) => (
          <button
            key={mode.id}
            className={`mode-button ${cameraMode === mode.id ? 'active' : ''}`}
            onClick={() => onCameraModeChange(mode.id)}
          >
            <span className="mode-icon">{mode.icon}</span>
            <span className="mode-label">{mode.label}</span>
          </button>
        ))}
      </animated.div>

      {/* Main controls */}
      <div className="main-controls">
        <div className="control-left">
          <button className="thumbnail-button ios-glass">
            <div className="thumbnail-placeholder">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="white" strokeWidth="2"/>
                <circle cx="8.5" cy="8.5" r="1.5" fill="white"/>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="white" strokeWidth="2"/>
              </svg>
            </div>
          </button>
        </div>

        <div className="control-center">
          <animated.button
            style={captureButtonAnimation}
            className={`capture-button ${cameraMode} ${isRecording ? 'recording' : ''}`}
            onClick={handleCapture}
          >
            {getCaptureButtonContent()}
          </animated.button>
          
          <button 
            className="mode-toggle-button"
            onClick={() => onToggleModeSelector(!showModeSelector)}
          >
            <span className="current-mode">{cameraMode.toUpperCase()}</span>
            <svg 
              className={`chevron ${showModeSelector ? 'up' : 'down'}`} 
              width="12" 
              height="8" 
              viewBox="0 0 12 8"
            >
              <path d="M1 1L6 6L11 1" stroke="white" strokeWidth="2" fill="none"/>
            </svg>
          </button>
        </div>

        <div className="control-right">
          <button 
            className="flip-button ios-glass"
            onClick={onCameraFlip}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M16 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" stroke="white" strokeWidth="2"/>
              <path d="M8 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3" stroke="white" strokeWidth="2"/>
              <line x1="12" y1="9" x2="12" y2="15" stroke="white" strokeWidth="2"/>
              <path d="m9 12 3-3 3 3" stroke="white" strokeWidth="2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraControls;
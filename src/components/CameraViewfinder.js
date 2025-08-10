import React, { forwardRef, useState, useEffect, useRef } from 'react';
import '../styles/CameraViewfinder.css';

// Check if running on Capacitor mobile
const isCapacitor = () => {
  return window.Capacitor && window.Capacitor.isNativePlatform();
};

const CameraViewfinder = forwardRef(({ 
  canvasRef, 
  zoomLevel, 
  onZoomChange, 
  cameraMode 
}, videoRef) => {
  const [focusPoint, setFocusPoint] = useState(null);
  const [showFocusRing, setShowFocusRing] = useState(false);
  const containerRef = useRef(null);
  const lastTouchDistance = useRef(0);

  const handleTouchStart = (e) => {
    e.preventDefault();
    
    if (e.touches.length === 1) {
      // Single touch - focus
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;
      
      setFocusPoint({ x, y });
      setShowFocusRing(true);
      
      setTimeout(() => {
        setShowFocusRing(false);
      }, 600);
    } else if (e.touches.length === 2) {
      // Pinch to zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      lastTouchDistance.current = distance;
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      if (lastTouchDistance.current > 0) {
        const scale = distance / lastTouchDistance.current;
        const newZoom = zoomLevel * scale;
        onZoomChange(newZoom);
      }
      
      lastTouchDistance.current = distance;
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = zoomLevel * delta;
    onZoomChange(newZoom);
  };

  const getGridLines = () => {
    return (
      <div className="grid-overlay">
        <div className="grid-line grid-vertical" style={{ left: '33.33%' }}></div>
        <div className="grid-line grid-vertical" style={{ left: '66.66%' }}></div>
        <div className="grid-line grid-horizontal" style={{ top: '33.33%' }}></div>
        <div className="grid-line grid-horizontal" style={{ top: '66.66%' }}></div>
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className="camera-viewfinder"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onWheel={handleWheel}
    >
      {isCapacitor() ? (
        // Mobile - camera preview in specific container
        <div className="mobile-camera-container">
          <div id="cameraPreview" className="camera-preview-container"></div>
          <div className="camera-overlay-ui">
            <div className="camera-status">
              <small>Live Camera Preview (In Container)</small>
            </div>
            <div className="debug-info" style={{
              position: 'absolute',
              bottom: '200px',
              left: '20px',
              right: '20px',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '10px',
              borderRadius: '8px',
              fontSize: '12px',
              zIndex: 200
            }}>
              <div>Capacitor: {window.Capacitor ? 'Yes' : 'No'}</div>
              <div>Native: {window.Capacitor?.isNativePlatform() ? 'Yes' : 'No'}</div>
              <div>CameraPreview: {window.CameraPreview ? 'Available' : 'Not found'}</div>
              <div>Plugins: {window.Capacitor?.Plugins ? Object.keys(window.Capacitor.Plugins).join(', ') : 'None'}</div>
              <div>Screen: {window.innerWidth}x{window.innerHeight}</div>
              <div style={{marginTop: '5px', color: '#00ff00'}}>Plugin Status: DETECTED! Testing preview...</div>
            </div>
          </div>
        </div>
      ) : (
        // Web - show video stream
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="camera-video"
          style={{
            transform: `scale(${zoomLevel})`,
          }}
        />
      )}
      
      <canvas
        ref={canvasRef}
        className="camera-canvas"
        style={{ display: 'none' }}
      />
      
      {/* Grid lines */}
      {getGridLines()}
      
      {/* Zoom indicator */}
      {zoomLevel > 1 && (
        <div className="zoom-indicator ios-glass">
          <span>{zoomLevel.toFixed(1)}x</span>
        </div>
      )}
      
      {/* Focus ring */}
      {focusPoint && (
        <div
          className={`focus-ring ${showFocusRing ? 'active' : ''}`}
          style={{
            left: focusPoint.x,
            top: focusPoint.y,
          }}
        />
      )}
      
      {/* Camera mode overlay */}
      <div className="camera-mode-overlay">
        {cameraMode === 'portrait' && (
          <div className="portrait-indicator">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="3" stroke="white" strokeWidth="2"/>
              <path d="M16 21v-2a4 4 0 0 0-8 0v2" stroke="white" strokeWidth="2"/>
            </svg>
            <span>Chân dung</span>
          </div>
        )}
      </div>
      
      {/* Camera border blur effect */}
      <div className="camera-border-blur"></div>
    </div>
  );
});

CameraViewfinder.displayName = 'CameraViewfinder';

export default CameraViewfinder;
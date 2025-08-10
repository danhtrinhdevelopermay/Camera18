import React, { useState, useRef, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import CameraControls from './CameraControls';
import CameraViewfinder from './CameraViewfinder';
import TopBar from './TopBar';
import '../styles/CameraScreen.css';

// Capacitor Camera import for mobile
let Camera = null;
try {
  if (window.Capacitor) {
    Camera = window.Capacitor.Plugins.Camera;
  }
} catch (e) {
  console.log('Capacitor not available, using web APIs');
}

const CameraScreen = ({
  onPhotoCapture,
  isRecording,
  onToggleRecording,
  cameraMode,
  onCameraModeChange
}) => {
  const [flashMode, setFlashMode] = useState('auto'); // auto, on, off
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Animation for capture effect
  const captureAnimation = useSpring({
    transform: isCapturing ? 'scale(0.95)' : 'scale(1)',
    config: { duration: 150 }
  });

  // Initialize camera
  useEffect(() => {
    initializeCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isFrontCamera]);

  const isCapacitor = () => {
    return window.Capacitor && window.Capacitor.isNativePlatform();
  };

  const initializeCamera = async () => {
    try {
      if (isCapacitor() && Camera) {
        // Mobile - use Capacitor Camera for preview (or show camera placeholder)
        console.log('Running on mobile - Capacitor Camera available');
        // For now, we'll show the camera icon until we implement live preview
        return;
      } else {
        // Web - use MediaDevices API
        const constraints = {
          video: {
            facingMode: isFrontCamera ? 'user' : 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: cameraMode === 'video'
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const handleCapture = async () => {
    if (cameraMode === 'photo') {
      setIsCapturing(true);
      
      try {
        if (isCapacitor() && Camera) {
          // Mobile - use Capacitor Camera API
          const image = await Camera.getPhoto({
            quality: 90,
            allowEditing: false,
            resultType: 'DataUrl',
            source: 'Camera',
            direction: isFrontCamera ? 'Front' : 'Back'
          });
          
          // Create blob from base64
          const response = await fetch(image.dataUrl);
          const blob = await response.blob();
          
          setTimeout(() => {
            setIsCapturing(false);
            onPhotoCapture(blob);
          }, 300);
          
        } else {
          // Web - capture from video
          const canvas = canvasRef.current;
          const video = videoRef.current;
          const context = canvas.getContext('2d');
          
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0);
          
          // Convert to blob
          canvas.toBlob((blob) => {
            const photoData = {
              blob,
              url: URL.createObjectURL(blob),
              timestamp: Date.now(),
              mode: cameraMode,
              flash: flashMode,
              frontCamera: isFrontCamera
            };
            
            onPhotoCapture(photoData);
            setIsCapturing(false);
          }, 'image/jpeg', 0.9);
        }
      } catch (error) {
        console.error('Error capturing photo:', error);
        setIsCapturing(false);
      }
    } else if (cameraMode === 'video') {
      onToggleRecording();
    }
  };

  const handleFlashToggle = () => {
    const modes = ['auto', 'on', 'off'];
    const currentIndex = modes.indexOf(flashMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setFlashMode(modes[nextIndex]);
  };

  const handleCameraFlip = () => {
    setIsFrontCamera(!isFrontCamera);
  };

  const handleZoomChange = (newZoom) => {
    setZoomLevel(Math.max(1, Math.min(10, newZoom)));
  };

  return (
    <div className="camera-screen">
      <animated.div style={captureAnimation} className="camera-container">
        <TopBar
          flashMode={flashMode}
          onFlashToggle={handleFlashToggle}
          cameraMode={cameraMode}
          isRecording={isRecording}
        />
        
        <CameraViewfinder
          ref={videoRef}
          canvasRef={canvasRef}
          zoomLevel={zoomLevel}
          onZoomChange={handleZoomChange}
          cameraMode={cameraMode}
        />
        
        <CameraControls
          cameraMode={cameraMode}
          onCameraModeChange={onCameraModeChange}
          isRecording={isRecording}
          onCapture={handleCapture}
          onCameraFlip={handleCameraFlip}
          isFrontCamera={isFrontCamera}
          showModeSelector={showModeSelector}
          onToggleModeSelector={setShowModeSelector}
        />
      </animated.div>
    </div>
  );
};

export default CameraScreen;
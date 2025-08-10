import React, { useState, useRef, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import CameraControls from './CameraControls';
import CameraViewfinder from './CameraViewfinder';
import TopBar from './TopBar';
import '../styles/CameraScreen.css';

// Capacitor Camera imports for mobile
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { CameraPreview } from '@capacitor-community/camera-preview';
import { Capacitor } from '@capacitor/core';

const isCapacitor = () => {
  return typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform();
};

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
      // Cleanup for web
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      // Cleanup for mobile
      if (isCapacitor()) {
        CameraPreview.stop().catch(console.error);
      }
    };
  }, [isFrontCamera]);



  const initializeCamera = async () => {
    try {
      if (isCapacitor()) {
        // Mobile: Request camera permissions first, then start preview
        console.log('Requesting camera permissions...');
        
        // Explicitly request camera permissions
        const permissions = await CameraPreview.requestPermissions();
        console.log('Camera permissions result:', permissions);
        
        if (permissions.camera !== 'granted') {
          console.error('Camera permission denied');
          alert('Ứng dụng cần quyền truy cập camera để hoạt động. Vui lòng cấp quyền trong Cài đặt.');
          return;
        }

        console.log('Starting Capacitor camera preview...');
        await CameraPreview.start({
          position: isFrontCamera ? 'front' : 'rear',
          width: window.innerWidth,
          height: window.innerHeight,
          toBack: true,
          paddingBottom: 0,
          rotateWhenOrientationChanged: true,
          storeToFile: false,
          disableExifHeaderStripping: false
        });
        console.log('Camera preview started successfully');
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
      if (isCapacitor()) {
        alert('Không thể truy cập camera. Vui lòng kiểm tra quyền ứng dụng trong Cài đặt.');
      }
    }
  };

  const handleCapture = async () => {
    if (cameraMode === 'photo') {
      setIsCapturing(true);
      
      try {
        if (isCapacitor()) {
          // Mobile - capture from camera preview
          const result = await CameraPreview.capture({
            quality: 90,
            width: 1920,
            height: 1080
          });
          
          // Create photo data object with blob
          const response = await fetch(`data:image/jpeg;base64,${result.value}`);
          const blob = await response.blob();
          
          const photoData = {
            blob,
            url: `data:image/jpeg;base64,${result.value}`,
            timestamp: Date.now(),
            mode: cameraMode,
            flash: flashMode,
            frontCamera: isFrontCamera
          };
          
          setTimeout(() => {
            setIsCapturing(false);
            onPhotoCapture(photoData);
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

  const handleCameraFlip = async () => {
    setIsFrontCamera(!isFrontCamera);
    
    // Switch camera on mobile
    if (isCapacitor()) {
      try {
        await CameraPreview.flip();
      } catch (error) {
        console.error('Error flipping camera:', error);
      }
    }
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
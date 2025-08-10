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
  onCameraModeChange,
  cameraReady
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

  // Initialize camera when ready or camera settings change
  useEffect(() => {
    if (cameraReady || !isCapacitor()) {
      console.log('Initializing camera with ready state:', cameraReady);
      initializeCamera();
    }
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
  }, [isFrontCamera, cameraReady]);



  const initializeCamera = async () => {
    console.log('🎥 initializeCamera called - isCapacitor:', isCapacitor());
    console.log('🔧 cameraReady state:', cameraReady);
    console.log('📱 isFrontCamera:', isFrontCamera);
    
    try {
      if (isCapacitor()) {
        // Mobile: Check if CameraPreview is available
        if (!window.CameraPreview) {
          console.error('❌ CameraPreview plugin not available');
          return;
        }
        
        console.log('✅ CameraPreview plugin found');
        
        // Check permissions first
        let hasPermission = false;
        
        try {
          const currentPermissions = await Camera.checkPermissions();
          console.log('📋 Current camera permissions:', currentPermissions);
          
          if (currentPermissions.camera === 'granted') {
            hasPermission = true;
            console.log('✅ Camera permissions already granted');
          } else {
            console.log('❌ Camera permissions not granted:', currentPermissions.camera);
          }
        } catch (error) {
          console.error('❌ Error checking Camera permissions:', error);
        }
        
        // Try CameraPreview permissions if Camera API failed
        if (!hasPermission) {
          try {
            console.log('🔄 Trying CameraPreview permission check...');
            const permissions = await CameraPreview.requestPermissions();
            console.log('📋 CameraPreview permissions result:', permissions);
            
            if (permissions.camera === 'granted') {
              hasPermission = true;
              console.log('✅ CameraPreview permissions granted');
            }
          } catch (error) {
            console.error('❌ CameraPreview permission check failed:', error);
          }
        }
        
        if (!hasPermission) {
          console.error('❌ No camera permissions available, cannot start preview');
          return;
        }

        console.log('Starting Capacitor camera preview...');
        
        // Stop any existing preview first
        try {
          await CameraPreview.stop();
          console.log('Stopped existing camera preview');
        } catch (e) {
          console.log('No existing preview to stop');
        }
        
        const startOptions = {
          position: isFrontCamera ? 'front' : 'rear',
          width: Math.round(window.innerWidth),
          height: Math.round(window.innerHeight),
          x: 0,
          y: 0,
          toBack: true, // Use toBack: true for better compatibility
          paddingBottom: 0,
          rotateWhenOrientationChanged: true,
          storeToFile: false,
          disableExifHeaderStripping: false,
          enableHighResolution: true,
          enableOpacity: false
        };
        
        console.log('Camera preview options:', startOptions);
        await CameraPreview.start(startOptions);
        console.log('Camera preview started successfully with toBack: true');
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
      // Don't show alerts - permissions should be handled by system dialog
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
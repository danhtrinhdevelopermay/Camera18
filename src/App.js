import React, { useState, useRef, useEffect } from 'react';
import CameraScreen from './components/CameraScreen';
import PhotoPreview from './components/PhotoPreview';
import './styles/App.css';

// Capacitor imports for permission handling  
import { CameraPreview } from '@capacitor-community/camera-preview';
import { Camera, CameraPermissionType } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

const isCapacitor = () => {
  return typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform();
};

const App = () => {
  const [currentView, setCurrentView] = useState('camera'); // camera, preview
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraMode, setCameraMode] = useState('photo'); // photo, video, portrait
  const [permissionRequested, setPermissionRequested] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  // Request camera permissions on app start for mobile
  useEffect(() => {
    const requestInitialPermissions = async () => {
      if (isCapacitor() && !permissionRequested) {
        setPermissionRequested(true);
        try {
          console.log('🎥 App started - requesting camera permissions...');
          console.log('📱 Detected Capacitor platform:', window.Capacitor?.platform);
          
          // Try both permission APIs to ensure compatibility
          let permissionsGranted = false;
          
          // Check current permissions first
          console.log('📷 Checking current camera permissions...');
          let needsPermission = true;
          
          try {
            const currentPermissions = await Camera.checkPermissions();
            console.log('Current permissions status:', currentPermissions);
            
            if (currentPermissions.camera === 'granted') {
              needsPermission = false;
              permissionsGranted = true;
              setCameraReady(true);
              console.log('✅ Camera permissions already granted');
            }
          } catch (error) {
            console.log('❌ Error checking permissions:', error);
          }
          
          // Request permissions if needed - this will show system dialog
          if (needsPermission) {
            try {
              console.log('📱 Requesting camera permissions (system dialog should appear)...');
              
              // This will trigger the native Android permission dialog immediately
              const permissionResult = await Camera.requestPermissions({
                permissions: ['camera']
              });
              
              console.log('✅ Permission request result:', permissionResult);
              
              if (permissionResult.camera === 'granted') {
                permissionsGranted = true;
                console.log('🎉 Camera permissions granted by user!');
                // Signal that camera is ready to initialize
                setCameraReady(true);
              } else if (permissionResult.camera === 'denied') {
                console.log('❌ Camera permissions denied by user');
              } else if (permissionResult.camera === 'prompt-with-rationale') {
                console.log('ℹ️ Need to show rationale to user');
                // Try requesting again after showing rationale
                const secondRequest = await Camera.requestPermissions({
                  permissions: ['camera']
                });
                if (secondRequest.camera === 'granted') {
                  permissionsGranted = true;
                  setCameraReady(true);
                }
              }
            } catch (error) {
              console.log('❌ Camera permission request failed:', error);
            }
          }
          
          // Also try CameraPreview as backup
          if (!permissionsGranted) {
            try {
              console.log('📷 Trying CameraPreview permissions as fallback...');
              const previewPermissions = await CameraPreview.requestPermissions();
              console.log('CameraPreview permissions result:', previewPermissions);
              
              if (previewPermissions.camera === 'granted') {
                permissionsGranted = true;
                console.log('✅ CameraPreview permissions granted!');
              }
            } catch (error) {
              console.log('❌ CameraPreview permissions also failed:', error);
            }
          }
          
          // Don't show any custom alerts - let the system handle permissions
          if (!permissionsGranted) {
            console.warn('⚠️ Camera permissions not granted');
          } else {
            console.log('🎉 Camera permissions successfully obtained');
            // Ensure camera ready state is set
            setCameraReady(true);
          }
        } catch (error) {
          console.error('💥 Error requesting initial permissions:', error);
        }
      }
    };

    requestInitialPermissions();
  }, [permissionRequested]);

  const handlePhotoCapture = (photoData) => {
    setCapturedPhoto(photoData);
    setCurrentView('preview');
  };

  const handleBackToCamera = () => {
    setCurrentView('camera');
    setCapturedPhoto(null);
  };

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="app">
      {currentView === 'camera' && (
        <CameraScreen
          onPhotoCapture={handlePhotoCapture}
          isRecording={isRecording}
          onToggleRecording={handleToggleRecording}
          cameraMode={cameraMode}
          onCameraModeChange={setCameraMode}
          cameraReady={cameraReady}
        />
      )}
      
      {currentView === 'preview' && capturedPhoto && (
        <PhotoPreview
          photo={capturedPhoto}
          onBack={handleBackToCamera}
        />
      )}
    </div>
  );
};

export default App;
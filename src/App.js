import React, { useState, useRef, useEffect } from 'react';
import CameraScreen from './components/CameraScreen';
import PhotoPreview from './components/PhotoPreview';
import './styles/App.css';

// Capacitor imports for permission handling
import { CameraPreview } from '@capacitor-community/camera-preview';
import { Camera } from '@capacitor/camera';
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
          
          try {
            // First try CameraPreview permissions
            console.log('📷 Requesting CameraPreview permissions...');
            const previewPermissions = await CameraPreview.requestPermissions();
            console.log('✅ CameraPreview permissions result:', previewPermissions);
            
            if (previewPermissions.camera === 'granted') {
              permissionsGranted = true;
              console.log('✅ CameraPreview permissions granted!');
            }
          } catch (error) {
            console.log('❌ CameraPreview permissions failed, trying Camera API:', error);
          }
          
          // Also try Camera API permissions as fallback
          if (!permissionsGranted) {
            try {
              console.log('📷 Requesting Camera API permissions...');
              const cameraPermissions = await Camera.requestPermissions();
              console.log('✅ Camera API permissions result:', cameraPermissions);
              
              if (cameraPermissions.camera === 'granted') {
                permissionsGranted = true;
                console.log('✅ Camera API permissions granted!');
              }
            } catch (error) {
              console.log('❌ Camera API permissions failed:', error);
            }
          }
          
          if (!permissionsGranted) {
            console.warn('⚠️ Camera permissions not granted');
            alert('Ứng dụng camera cần quyền truy cập camera để hoạt động.\n\n🔧 Vui lòng:\n1. Mở Cài đặt điện thoại\n2. Tìm "iOS Camera App"\n3. Cấp quyền Camera\n4. Khởi động lại ứng dụng');
          } else {
            console.log('🎉 Camera permissions granted successfully');
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
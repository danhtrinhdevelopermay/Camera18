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
  const [cameraReady, setCameraReady] = useState(!isCapacitor()); // Web is ready immediately
  const [showPermissionInfo, setShowPermissionInfo] = useState(false);

  // Request camera permissions on app start for mobile
  useEffect(() => {
    const requestInitialPermissions = async () => {
      if (isCapacitor() && !permissionRequested) {
        setPermissionRequested(true);
        setShowPermissionInfo(true); // Show info while requesting
        
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
                setCameraReady(true);
                setShowPermissionInfo(false); // Hide info on success
              } else if (permissionResult.camera === 'denied') {
                console.log('❌ Camera permissions denied by user');
                setShowPermissionInfo(false);
              } else if (permissionResult.camera === 'prompt-with-rationale') {
                console.log('ℹ️ Need to show rationale to user');
                const secondRequest = await Camera.requestPermissions({
                  permissions: ['camera']
                });
                if (secondRequest.camera === 'granted') {
                  permissionsGranted = true;
                  setCameraReady(true);
                  setShowPermissionInfo(false);
                } else {
                  setShowPermissionInfo(false);
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
          
          // Handle final permission status
          if (!permissionsGranted) {
            console.warn('⚠️ Camera permissions not granted');
            setShowPermissionInfo(false);
          } else {
            console.log('🎉 Camera permissions successfully obtained');
            setCameraReady(true);
            setShowPermissionInfo(false);
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
      {showPermissionInfo && (
        <div className="permission-info-overlay">
          <div className="permission-info-card">
            <h3>🎥 Yêu cầu quyền camera</h3>
            <p>Đang đợi bạn cấp quyền camera qua popup hệ thống Android...</p>
            <p className="permission-note">
              <strong>Lưu ý:</strong> Popup cấp quyền chỉ xuất hiện khi app chạy trên điện thoại Android thực, 
              không phải trên web browser này.
            </p>
            <button 
              onClick={() => setShowPermissionInfo(false)}
              className="permission-close-btn"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
      
      {!isCapacitor() && (
        <div className="web-info-banner">
          <p>
            ℹ️ Đang chạy trên web - Để test popup cấp quyền, cần build thành APK và cài trên Android
          </p>
        </div>
      )}
      
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
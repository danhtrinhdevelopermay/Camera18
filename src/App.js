import React, { useState, useRef, useEffect } from 'react';
import CameraScreen from './components/CameraScreen';
import PhotoPreview from './components/PhotoPreview';
import './styles/App.css';

const App = () => {
  const [currentView, setCurrentView] = useState('camera'); // camera, preview
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraMode, setCameraMode] = useState('photo'); // photo, video, portrait

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
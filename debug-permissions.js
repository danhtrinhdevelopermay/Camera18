// Debug script để test camera permissions
// Chạy trong browser console hoặc thêm vào app để debug

console.log('=== DEBUG CAMERA PERMISSIONS ===');

const isCapacitor = () => {
  const result = typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform();
  console.log('Is Capacitor Environment:', result);
  console.log('Window.Capacitor:', window.Capacitor);
  return result;
};

const testPermissions = async () => {
  console.log('Testing camera permissions...');
  
  if (isCapacitor()) {
    console.log('Running on mobile platform');
    
    // Test CameraPreview permissions
    try {
      const { CameraPreview } = window.Capacitor.Plugins;
      console.log('CameraPreview plugin:', CameraPreview);
      
      const permissions = await CameraPreview.requestPermissions();
      console.log('CameraPreview permissions result:', permissions);
    } catch (error) {
      console.error('CameraPreview permissions error:', error);
    }
    
    // Test Camera permissions
    try {
      const { Camera } = window.Capacitor.Plugins;
      console.log('Camera plugin:', Camera);
      
      const permissions = await Camera.requestPermissions();
      console.log('Camera permissions result:', permissions);
    } catch (error) {
      console.error('Camera permissions error:', error);
    }
    
  } else {
    console.log('Running on web platform');
    
    // Test web permissions
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      console.log('Web camera access granted:', stream);
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Web camera access error:', error);
    }
  }
};

// Auto run when loaded
if (typeof window !== 'undefined') {
  window.testCameraPermissions = testPermissions;
  console.log('Camera permission test loaded. Run testCameraPermissions() to test.');
}

export { testPermissions, isCapacitor };
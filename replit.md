# iOS 18 Camera App

## Project Overview
Ứng dụng camera mô phỏng giao diện iOS 18 với hiệu ứng Gaussian blur được xây dựng bằng React và React Native Web. Ứng dụng có đầy đủ tính năng chụp ảnh, quay video, chế độ chân dung và các hiệu ứng filter với giao diện người dùng giống iOS 18.

## Features
- ✅ Giao diện camera giống iOS 18 với hiệu ứng Gaussian blur
- ✅ Chụp ảnh với các chế độ: Photo, Video, Portrait
- ✅ Hiệu ứng blur và frosted glass theo phong cách iOS 18
- ✅ Zoom bằng pinch gesture và mouse wheel
- ✅ Tự động focus khi tap vào màn hình
- ✅ Flash modes: Auto, On, Off
- ✅ Flip camera (front/back)
- ✅ Preview ảnh với editing tools
- ✅ Filter effects: Vivid, Warm, Cool, Dramatic, Mono, Vintage
- ✅ Editing tools: Brightness, Contrast, Saturation, Blur, Vignette
- ✅ Save edited photos

## Tech Stack
- **Frontend**: React 18, React Native Web
- **Animations**: React Spring
- **Build Tool**: Webpack 5
- **Styling**: CSS3 with backdrop-filter for blur effects
- **Camera API**: MediaDevices getUserMedia API
- **Canvas API**: For image processing and filters

## Project Structure
```
src/
├── components/
│   ├── CameraScreen.js      # Main camera interface
│   ├── CameraViewfinder.js  # Video display with zoom/focus
│   ├── CameraControls.js    # Camera controls and mode selector
│   ├── TopBar.js           # Flash and settings controls
│   └── PhotoPreview.js     # Photo editing and preview
├── styles/
│   ├── global.css          # Global styles and blur utilities
│   ├── App.css
│   ├── CameraScreen.css
│   ├── CameraViewfinder.css
│   ├── CameraControls.css
│   ├── TopBar.css
│   └── PhotoPreview.css
├── App.js                  # Main app component
└── index.js               # Entry point
```

## Key Features Implementation

### iOS 18 Blur Effects
- Sử dụng `backdrop-filter: blur()` và `-webkit-backdrop-filter: blur()`
- Frosted glass effect với `saturate(180%) blur(20px)`
- Gradient overlays cho vignette effect
- CSS animations cho smooth transitions

### Camera Functionality
- MediaDevices API để truy cập camera
- Canvas API để capture và xử lý ảnh
- Real-time video preview với zoom support
- Touch gestures cho focus và zoom

### Photo Editing
- Real-time filter preview
- Adjustable editing parameters
- Canvas-based image processing
- Export functionality

## User Preferences
- Ngôn ngữ: Tiếng Việt
- Giao diện: iOS 18 style với blur effects
- Tính năng: Camera app hoàn chỉnh với editing tools

## Recent Changes
- 2025-08-09: Tạo dự án iOS 18 camera app từ đầu
- Implemented complete camera interface với blur effects
- Added photo editing với multiple filters và tools
- Responsive design cho mobile và desktop
- 2025-08-10: Setup GitHub Actions workflow cho build APK
- Added Capacitor configuration để build Android APK
- Created complete build pipeline với automated APK generation
- 2025-08-10: TRIỆT ĐỂ SỬA LỖI CAMERA MOBILE
  - Cài đặt đúng @capacitor/camera, @capacitor/core, @capacitor/android
  - Sửa import Camera API với CameraResultType, CameraSource constants
  - Tạo Android permissions: AndroidManifest.xml với CAMERA permissions
  - Thêm file_paths.xml cho FileProvider
  - Debug info trong mobile placeholder để kiểm tra Capacitor detection
  - Cập nhật GitHub Actions để copy Android configuration files
  - **LIVE CAMERA PREVIEW**: Implement @capacitor-community/camera-preview
  - Camera preview hiển thị trực tiếp trong app (không mở camera bên ngoài)
  - CameraPreview.start() cho live preview, CameraPreview.capture() cho chụp ảnh
  - Camera flip và zoom support trong mobile app

## APK Build Setup
- ✅ GitHub Actions workflow (.github/workflows/build-android.yml)
- ✅ Capacitor configuration (capacitor.config.js)
- ✅ Android build configuration (android.json) 
- ✅ Production webpack build setup
- ✅ Automated APK artifact upload
- ✅ Complete documentation trong README.md

## Next Steps
- Push code lên GitHub repository
- Trigger GitHub Actions build
- Download APK từ Artifacts
- Test APK trên Android device
# iOS 18 Camera App

Ứng dụng camera mô phỏng giao diện iOS 18 với hiệu ứng Gaussian blur, được xây dựng bằng React và có thể build thành APK Android.

## 🚀 Tính năng

- ✅ Giao diện camera giống iOS 18 với hiệu ứng blur
- ✅ Chụp ảnh với các chế độ: Photo, Video, Portrait  
- ✅ Zoom bằng pinch gesture và mouse wheel
- ✅ Tự động focus khi tap vào màn hình
- ✅ Flash modes: Auto, On, Off
- ✅ Flip camera (front/back)
- ✅ Photo editing với filters và tools
- ✅ Responsive design cho mobile và desktop

## 🛠️ Tech Stack

- **Frontend**: React 18, React Native Web
- **Animations**: React Spring  
- **Build**: Webpack 5
- **Mobile**: Capacitor (for APK build)
- **Styling**: CSS3 với backdrop-filter blur effects

## 📱 Build APK với GitHub Actions

### 1. Push code lên GitHub
```bash
git add .
git commit -m "Add iOS 18 camera app"
git push origin main
```

### 2. GitHub Actions sẽ tự động:
- Install dependencies
- Build React app
- Setup Android SDK
- Initialize Capacitor
- Build APK file
- Upload APK artifact

### 3. Download APK
- Vào tab "Actions" trong GitHub repo
- Chọn build run mới nhất
- Download APK từ "Artifacts" section

## 🏃‍♂️ Chạy local

```bash
# Install dependencies  
npm install

# Start development server
npx webpack serve --mode development --port 5000 --host 0.0.0.0

# Build for production
npx webpack --mode production
```

## 📂 Cấu trúc dự án

```
src/
├── components/
│   ├── CameraScreen.js      # Main camera interface
│   ├── CameraViewfinder.js  # Video display with zoom/focus
│   ├── CameraControls.js    # Camera controls and mode selector
│   ├── TopBar.js           # Flash and settings controls
│   └── PhotoPreview.js     # Photo editing and preview
├── styles/                 # CSS files with blur effects
├── App.js                  # Main app component
└── index.js               # Entry point
```

## 🎨 iOS 18 Design Features

- **Gaussian Blur**: backdrop-filter CSS cho hiệu ứng blur
- **Frosted Glass**: Transparent overlays với blur effects
- **Smooth Animations**: React Spring cho transitions
- **iOS-style Controls**: Buttons và UI elements giống iOS 18

## 📄 Licenses

MIT License - Xem LICENSE file để biết thêm chi tiết.
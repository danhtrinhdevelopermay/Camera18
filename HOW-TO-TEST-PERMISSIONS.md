# Hướng dẫn Test Camera Permissions trên Android

## Tại sao không có popup permission khi chạy trên web?

**Popup cấp quyền camera chỉ xuất hiện khi app chạy trên điện thoại Android thực**, không phải trên web browser. Đây là cách hoạt động của Capacitor framework:

- **Web browser**: Sử dụng `navigator.mediaDevices.getUserMedia()` - browser tự động xử lý permissions
- **Android app**: Sử dụng `@capacitor/camera` API - cần xin quyền qua Android system dialog

## Cách build APK để test permissions

### 1. Build production bundle
```bash
npm run build:production
```

### 2. Sync với Android platform
```bash
npx cap sync android
```

### 3. Build APK
```bash
cd android
./gradlew assembleDebug
```

### 4. Tìm APK file
APK sẽ được tạo tại: `android/app/build/outputs/apk/debug/app-debug.apk`

### 5. Cài đặt trên Android
- Copy APK file vào điện thoại
- Bật "Unknown sources" trong Settings
- Cài đặt APK
- Mở app

## Quy trình permission trên Android thực

Khi mở app lần đầu trên Android:

1. **App khởi động** → tự động kiểm tra permissions
2. **Hiện system dialog** → "Allow [App] to access camera?"
3. **User chọn "Allow"** → app bắt đầu camera preview  
4. **User chọn "Deny"** → hiện thông báo lỗi

## Alternative: Sử dụng GitHub Actions

Thay vì build local, có thể dùng GitHub Actions để auto-build APK:

1. Push code lên GitHub repository
2. GitHub Actions sẽ tự động build APK
3. Download APK từ Actions Artifacts
4. Cài đặt trên Android

## Debug commands

Để kiểm tra permission status trong app:

```javascript
// Trong browser console hoặc app
const checkPermissions = async () => {
  if (window.Capacitor?.isNativePlatform()) {
    const { Camera } = window.Capacitor.Plugins;
    const permissions = await Camera.checkPermissions();
    console.log('Camera permissions:', permissions);
  } else {
    console.log('Running on web - no native permissions needed');
  }
};

checkPermissions();
```

## Troubleshooting

### Nếu popup vẫn không hiện trên Android:
1. Kiểm tra `AndroidManifest.xml` có khai báo `CAMERA` permission
2. Đảm bảo app target SDK đúng version
3. Clear app data và thử lại
4. Kiểm tra logs trong Android Studio Logcat

### Permission bị deny permanently:
1. Vào Settings → Apps → [App Name] → Permissions
2. Manually enable Camera permission
3. Restart app

## Files liên quan

- `capacitor.config.js` - Cấu hình Capacitor
- `android/app/src/main/AndroidManifest.xml` - Android permissions
- `src/App.js` - Permission handling logic
- `.github/workflows/build-android.yml` - GitHub Actions build script
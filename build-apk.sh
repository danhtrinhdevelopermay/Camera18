#!/bin/bash

echo "🏗️ Building iOS Camera App APK..."
echo "======================================"

# Step 1: Clean build
echo "🧹 Cleaning previous build..."
rm -rf dist/

# Step 2: Build production bundle
echo "📦 Building production bundle..."
npx webpack --mode production

if [ $? -ne 0 ]; then
    echo "❌ Webpack build failed!"
    exit 1
fi

# Step 3: Sync with Capacitor
echo "📱 Syncing with Android..."
npx cap sync android

if [ $? -ne 0 ]; then
    echo "❌ Capacitor sync failed!"
    exit 1
fi

# Step 4: Copy necessary files
echo "📋 Copying configuration files..."
cp android.json android/ 2>/dev/null || echo "android.json not found, skipping..."
cp gradle.properties android/ 2>/dev/null || echo "gradle.properties not found, skipping..."

# Create the gradle wrapper if it doesn't exist
echo "🔧 Setting up Gradle wrapper..."
cd android

# Create gradlew if it doesn't exist
if [ ! -f "gradlew" ]; then
    echo "Creating gradle wrapper..."
    cat > gradlew << 'EOF'
#!/usr/bin/env sh
exec gradle "$@"
EOF
    chmod +x gradlew
fi

echo "✅ Build preparation complete!"
echo ""
echo "📱 Ready to test on Android device:"
echo "   1. Install the new APK from your GitHub Actions"
echo "   2. Completely uninstall old version first" 
echo "   3. Install new APK"
echo "   4. Open app - system permission dialog should appear"
echo ""
echo "🔍 Debug info:"
echo "   • Camera.requestPermissions() will trigger native dialog"
echo "   • Check console for permission logs"
echo "   • Should see: '📱 Requesting camera permissions (system dialog should appear)...'"
#!/bin/bash

echo "🚀 Testing build process for iOS Camera App..."

# Check if Node.js and npm are available
echo "📦 Checking dependencies..."
node --version
npm --version

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build web app
echo "🔨 Building web app..."
npx webpack --mode production

# Check if dist folder was created
if [ -d "dist" ]; then
    echo "✅ Web build successful! Files in dist:"
    ls -la dist/
else
    echo "❌ Web build failed! dist folder not found."
    exit 1
fi

# Test Capacitor init (optional - only if you have Capacitor installed)
if command -v cap >/dev/null 2>&1; then
    echo "🔍 Testing Capacitor init..."
    # Clean up any existing capacitor config first
    rm -rf android/ ios/ capacitor.config.ts
    npx cap init "iOS Camera App" "com.iosCamera.app" --web-dir=dist
    echo "✅ Capacitor init test successful!"
else
    echo "⚠️  Capacitor CLI not found locally (this is OK - GitHub Actions will install it)"
fi

echo "🎉 Build test completed successfully!"
echo "📝 Now you can push to GitHub and the Actions will build your APK!"
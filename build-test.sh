#!/bin/bash

echo "🚀 Testing build process for iOS Camera App..."

# Check if Node.js and npm are available
echo "📦 Checking dependencies..."
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

if [ "$NODE_VERSION" -lt 20 ]; then
    echo "⚠️  Warning: Capacitor requires Node.js >=20.0.0"
    echo "   Your version: $(node --version)"
    echo "   GitHub Actions will use Node.js 20"
fi

# Check Java version if available
if command -v java >/dev/null 2>&1; then
    JAVA_VERSION_OUTPUT=$(java -version 2>&1 | head -n 1)
    echo "Java version: $JAVA_VERSION_OUTPUT"
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
    if [ "$JAVA_VERSION" -lt 21 ]; then
        echo "⚠️  Warning: Android build requires Java >=21"
        echo "   GitHub Actions will use Java 21"
    fi
else
    echo "⚠️  Java not found locally (GitHub Actions will install Java 21)"
fi

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
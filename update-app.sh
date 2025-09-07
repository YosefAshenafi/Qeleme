#!/bin/bash

# Qelem App Update Script
echo "🚀 Qelem App Update Script"
echo "=========================="

# Check if version is provided
if [ -z "$1" ]; then
    echo "Usage: ./update-app.sh <version>"
    echo "Example: ./update-app.sh 1.0.1"
    exit 1
fi

NEW_VERSION=$1
echo "📱 Updating to version: $NEW_VERSION"

# Extract version number for versionCode
VERSION_CODE=$(echo $NEW_VERSION | sed 's/\.//g')
echo "📊 Version Code: $VERSION_CODE"

# Update app.json
echo "📝 Updating app.json..."
sed -i '' "s/\"version\": \"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" app.json
sed -i '' "s/\"versionCode\": [0-9]*/\"versionCode\": $VERSION_CODE/" app.json

# Update build.gradle
echo "🔧 Updating build.gradle..."
sed -i '' "s/versionCode [0-9]*/versionCode $VERSION_CODE/" android/app/build.gradle
sed -i '' "s/versionName \"[^\"]*\"/versionName \"$NEW_VERSION\"/" android/app/build.gradle

echo "✅ Version numbers updated!"

# Clean and build
echo "🧹 Cleaning previous build..."
cd android
./gradlew clean

echo "🔨 Building new AAB..."
./gradlew bundleRelease

if [ $? -eq 0 ]; then
    echo "🎉 Build successful!"
    echo "📦 New AAB location: android/app/build/outputs/bundle/release/app-release.aab"
    echo ""
    echo "📋 Next steps:"
    echo "1. Upload the AAB to Google Play Console"
    echo "2. Add release notes"
    echo "3. Review and publish"
else
    echo "❌ Build failed. Please check the errors above."
fi





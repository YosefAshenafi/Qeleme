#!/bin/bash

# Android SDK Setup Script
echo "Setting up Android development environment..."

# Common Android SDK locations
ANDROID_SDK_PATHS=(
    "$HOME/Library/Android/sdk"
    "$HOME/Android/Sdk"
    "/usr/local/android-sdk"
    "/opt/android-sdk"
)

# Find Android SDK
ANDROID_SDK=""
for path in "${ANDROID_SDK_PATHS[@]}"; do
    if [ -d "$path" ]; then
        ANDROID_SDK="$path"
        echo "Found Android SDK at: $ANDROID_SDK"
        break
    fi
done

if [ -z "$ANDROID_SDK" ]; then
    echo "Android SDK not found. Please install Android Studio first."
    echo "Download from: https://developer.android.com/studio"
    exit 1
fi

# Set environment variables
export ANDROID_HOME="$ANDROID_SDK"
export ANDROID_SDK_ROOT="$ANDROID_SDK"
export PATH="$PATH:$ANDROID_HOME/emulator"
export PATH="$PATH:$ANDROID_HOME/tools"
export PATH="$PATH:$ANDROID_HOME/tools/bin"
export PATH="$PATH:$ANDROID_HOME/platform-tools"

echo "Environment variables set:"
echo "ANDROID_HOME=$ANDROID_HOME"
echo "ANDROID_SDK_ROOT=$ANDROID_SDK_ROOT"

# Create local.properties file
echo "Creating local.properties file..."
cat > android/local.properties << EOF
sdk.dir=$ANDROID_SDK
EOF

echo "local.properties created successfully!"
echo ""
echo "To make these changes permanent, add the following to your ~/.zshrc or ~/.bash_profile:"
echo ""
echo "export ANDROID_HOME=\"$ANDROID_SDK\""
echo "export ANDROID_SDK_ROOT=\"$ANDROID_SDK\""
echo "export PATH=\"\$PATH:\$ANDROID_HOME/emulator\""
echo "export PATH=\"\$PATH:\$ANDROID_HOME/tools\""
echo "export PATH=\"\$PATH:\$ANDROID_HOME/tools/bin\""
echo "export PATH=\"\$PATH:\$ANDROID_HOME/platform-tools\""





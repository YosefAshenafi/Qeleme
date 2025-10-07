# Qelem Android Build Makefile
# Quick commands for building and managing releases

.PHONY: help clean build release install uninstall version bump-version

# Default target
help:
	@echo "🚀 Qelem Android Build Commands"
	@echo "================================"
	@echo ""
	@echo "📱 Build Commands:"
	@echo "  make build        - Build release APK"
	@echo "  make aab          - Build release AAB (for Google Play)"
	@echo "  make clean        - Clean previous builds"
	@echo "  make release      - Clean + Build release APK"
	@echo "  make release-aab  - Clean + Build release AAB"
	@echo ""
	@echo "📦 Install Commands:"
	@echo "  make install      - Install APK to connected device"
	@echo "  make uninstall    - Uninstall app from device"
	@echo ""
	@echo "🔧 Version Management:"
	@echo "  make version      - Show current version info"
	@echo "  make bump-version - Increment version and build"
	@echo ""
	@echo "📁 File Locations:"
	@echo "  APK: android/app/build/outputs/apk/release/app-release.apk"
	@echo "  AAB: android/app/build/outputs/bundle/release/app-release.aab"
	@echo ""

# Start the app
start:
	@echo "🚀 Starting the app..."
	npx expo start -i
	@echo "✅ App started successfully!"

# Clean previous builds
clean:
	@echo "🧹 Cleaning previous builds..."
	cd android && ./gradlew clean
	@echo "✅ Clean completed!"

# Build release APK
build:
	@echo "🔨 Building release APK..."
	cd android && ./gradlew assembleRelease
	@echo "✅ Build completed!"
	@echo "📦 APK location: android/app/build/outputs/apk/release/app-release.apk"

# Build release AAB (for Google Play)
aab:
	@echo "🔨 Building release AAB..."
	cd android && ./gradlew bundleRelease
	@echo "✅ AAB build completed!"
	@echo "📦 AAB location: android/app/build/outputs/bundle/release/app-release.aab"

# Clean and build (recommended for releases)
release: clean build
	@echo "🎉 Release build completed!"
	@ls -lh android/app/build/outputs/apk/release/app-release.apk

# Clean and build AAB (for Google Play releases)
release-aab: clean aab
	@echo "🎉 AAB release build completed!"
	@ls -lh android/app/build/outputs/bundle/release/app-release.aab

# Install APK to connected device
install:
	@echo "📱 Installing APK to device..."
	@if [ -f android/app/build/outputs/apk/release/app-release.apk ]; then \
		adb install -r android/app/build/outputs/apk/release/app-release.apk; \
		echo "✅ App installed successfully!"; \
	else \
		echo "❌ APK not found. Run 'make build' first."; \
		exit 1; \
	fi

# Uninstall app from device
uninstall:
	@echo "🗑️  Uninstalling app from device..."
	adb uninstall com.yosefashenafi.Qelem
	@echo "✅ App uninstalled!"

# Show version information
version:
	@echo "📋 Current Version Information:"
	@echo "=============================="
	@echo "App Version: $$(grep '"version"' app.json | cut -d'"' -f4)"
	@echo "Version Code: $$(grep '"versionCode"' app.json | cut -d':' -f2 | tr -d ' ,')"
	@echo "Package: com.yosefashenafi.Qelem"
	@echo "Version: 1.0.2 (Code: 5)"
	@if [ -f android/app/build/outputs/apk/release/app-release.apk ]; then \
		echo "APK Size: $$(ls -lh android/app/build/outputs/apk/release/app-release.apk | awk '{print $$5}')"; \
		echo "APK Date: $$(ls -l android/app/build/outputs/apk/release/app-release.apk | awk '{print $$6, $$7, $$8}')"; \
	fi

# Bump version and build
bump-version:
	@echo "📈 Bumping version..."
	@current_version=$$(grep '"version"' app.json | cut -d'"' -f4); \
	current_code=$$(grep '"versionCode"' app.json | cut -d':' -f2 | tr -d ' ,'); \
	new_code=$$((current_code + 1)); \
	new_version=$$(echo $$current_version | awk -F. '{print $$1"."$$2"."$$3+1}'); \
	echo "Current: $$current_version ($$current_code) -> New: $$new_version ($$new_code)"; \
	sed -i '' "s/\"version\": \"$$current_version\"/\"version\": \"$$new_version\"/" app.json; \
	sed -i '' "s/\"versionCode\": $$current_code/\"versionCode\": $$new_code/" app.json; \
	sed -i '' "s/versionCode $$current_code/versionCode $$new_code/" android/app/build.gradle; \
	sed -i '' "s/versionName \"$$current_version\"/versionName \"$$new_version\"/" android/app/build.gradle; \
	echo "✅ Version updated to $$new_version ($$new_code)"; \
	make release

# Quick development build (debug)
debug:
	@echo "🔧 Building debug APK..."
	cd android && ./gradlew assembleDebug
	@echo "✅ Debug build completed!"
	@echo "📦 APK location: android/app/build/outputs/apk/debug/app-debug.apk"

# Check if device is connected
check-device:
	@echo "📱 Checking connected devices..."
	@adb devices | grep -q "device$$" && echo "✅ Device connected!" || echo "❌ No device connected. Connect your phone via USB and enable USB debugging."

# Full release process (clean, build, install)
deploy: release install
	@echo "🚀 App deployed successfully!"

# Show APK info
apk-info:
	@if [ -f android/app/build/outputs/apk/release/app-release.apk ]; then \
		echo "📦 APK Information:"; \
		echo "=================="; \
		ls -lh android/app/build/outputs/apk/release/app-release.apk; \
		echo ""; \
		echo "📋 APK Details:"; \
		aapt dump badging android/app/build/outputs/apk/release/app-release.apk | grep -E "(package|versionCode|versionName)"; \
	else \
		echo "❌ APK not found. Run 'make build' first."; \
	fi

# Show AAB info
aab-info:
	@if [ -f android/app/build/outputs/bundle/release/app-release.aab ]; then \
		echo "📦 AAB Information:"; \
		echo "=================="; \
		ls -lh android/app/build/outputs/bundle/release/app-release.aab; \
		echo ""; \
		echo "📋 AAB Details:"; \
		aapt dump badging android/app/build/outputs/bundle/release/app-release.aab | grep -E "(package|versionCode|versionName)"; \
	else \
		echo "❌ AAB not found. Run 'make aab' first."; \
	fi

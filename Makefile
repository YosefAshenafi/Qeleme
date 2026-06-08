# MegaTest — build & release helpers.  Run `make` (or `make help`) for the list.

.DEFAULT_GOAL := help

ANDROID_DIR := android
APK_RELEASE := $(ANDROID_DIR)/app/build/outputs/apk/release/app-release.apk
AAB_RELEASE := $(ANDROID_DIR)/app/build/outputs/bundle/release/app-release.aab
APK_DEBUG   := $(ANDROID_DIR)/app/build/outputs/apk/debug/app-debug.apk
IPA_DIR     := build/ipa

.PHONY: help install \
	server-install server-dev server-build server-deploy \
	android-keystore android-apk android-aab android-debug-apk android-install android-clean \
	ios-run ios-ipa ios-testflight ios-submit ios-credentials

help:
	@echo "MegaTest — make targets"
	@echo ""
	@echo "  install              Install JS dependencies (bun)"
	@echo ""
	@echo "  API gateway (server/):"
	@echo "    server-install       Install gateway dependencies"
	@echo "    server-dev           Run Next.js gateway on :3000"
	@echo "    server-build         Production build of the gateway"
	@echo "    server-deploy        Deploy gateway to Vercel (production)"
	@echo ""
	@echo "  Android (local):"
	@echo "    android-keystore   Generate a release keystore (interactive), then create android/keystore.properties"
	@echo "    android-apk        Build a signed RELEASE APK (prints the output path)"
	@echo "    android-aab        Build a signed RELEASE bundle for Play Store (prints the output path)"
	@echo "    android-debug-apk  Build a debug APK (prints the output path)"
	@echo "    android-install    adb install the release APK to a device/emulator"
	@echo "    android-clean      Clean the Android build"
	@echo ""
	@echo "  iOS:"
	@echo "    ios-run            Build & run a Release build on a simulator/device"
	@echo "    ios-ipa            Archive + export a release .ipa locally (prints the output path)"
	@echo "    ios-testflight     Cloud build for TestFlight (EAS)"
	@echo "    ios-submit         Submit the latest build to TestFlight (EAS)"
	@echo "    ios-credentials    Configure iOS signing via EAS"

install:
	bun install

# ----- API gateway ---------------------------------------------------------

server-install:
	cd server && bun install

server-dev:
	cd server && bun run dev

server-build:
	cd server && bun run build

server-deploy:
	cd server && vercel --prod --yes

# ----- Android (local) -----------------------------------------------------

# Generate a release keystore (interactive: keytool prompts for passwords + name).
# Won't overwrite an existing keystore. After generating, copy the example:
#   cp android/keystore.properties.example android/keystore.properties
android-keystore:
	@test ! -f $(ANDROID_DIR)/app/release.keystore || (echo "release.keystore already exists — delete it first to regenerate." && exit 1)
	keytool -genkeypair -v -keystore $(ANDROID_DIR)/app/release.keystore -alias megatest -keyalg RSA -keysize 2048 -validity 10000
	@echo "Next: cp $(ANDROID_DIR)/keystore.properties.example $(ANDROID_DIR)/keystore.properties and fill in the passwords."

# Build a signed release APK (signed with android/keystore.properties).
android-apk:
	cd $(ANDROID_DIR) && ./gradlew assembleRelease
	@printf '\n✅ Signed release APK\n   path: %s\n   url:  file://%s\n   size: %s\n' "$(CURDIR)/$(APK_RELEASE)" "$(CURDIR)/$(APK_RELEASE)" "$$(du -h '$(CURDIR)/$(APK_RELEASE)' 2>/dev/null | cut -f1)"

# Build a signed release App Bundle for Google Play.
android-aab:
	cd $(ANDROID_DIR) && ./gradlew bundleRelease
	@printf '\n✅ Signed release AAB\n   path: %s\n   url:  file://%s\n   size: %s\n' "$(CURDIR)/$(AAB_RELEASE)" "$(CURDIR)/$(AAB_RELEASE)" "$$(du -h '$(CURDIR)/$(AAB_RELEASE)' 2>/dev/null | cut -f1)"

android-debug-apk:
	cd $(ANDROID_DIR) && ./gradlew assembleDebug
	@printf '\n✅ Debug APK\n   path: %s\n   url:  file://%s\n   size: %s\n' "$(CURDIR)/$(APK_DEBUG)" "$(CURDIR)/$(APK_DEBUG)" "$$(du -h '$(CURDIR)/$(APK_DEBUG)' 2>/dev/null | cut -f1)"

android-install:
	adb install -r $(CURDIR)/$(APK_RELEASE)

android-clean:
	cd $(ANDROID_DIR) && ./gradlew clean

# ----- iOS -----------------------------------------------------------------

ios-run:
	npx expo run:ios --configuration Release

ios-ipa:
	mkdir -p build
	cd ios && xcodebuild -workspace MegaTest.xcworkspace -scheme MegaTest -configuration Release -archivePath ../build/MegaTest.xcarchive -allowProvisioningUpdates CODE_SIGN_STYLE=Automatic DEVELOPMENT_TEAM=29R8J276N2 archive
	cd .. && xcodebuild -exportArchive -archivePath build/MegaTest.xcarchive -exportPath $(IPA_DIR) -exportOptionsPlist ios/ExportOptions.plist
	@printf '\n✅ Exported iOS .ipa\n   path: %s\n   url:  file://%s\n' "$(CURDIR)/$(IPA_DIR)" "$(CURDIR)/$(IPA_DIR)"

ios-testflight:
	npx eas build -p ios --profile testflight

ios-submit:
	npx eas submit -p ios --profile testflight

ios-credentials:
	npx eas credentials -p ios

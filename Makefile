# MegaTest — build & release helpers.  Run `make` (or `make help`) for the list.

.DEFAULT_GOAL := help

ANDROID_DIR := android
APK_RELEASE := $(ANDROID_DIR)/app/build/outputs/apk/release/app-release.apk
AAB_RELEASE := $(ANDROID_DIR)/app/build/outputs/bundle/release/app-release.aab
APK_DEBUG   := $(ANDROID_DIR)/app/build/outputs/apk/debug/app-debug.apk
IPA_DIR     := build/ipa

# lintVitalAnalyzeRelease breaks on stale partial results under
# node_modules/*/android/build ("Failed to create MD5 hash ... does not exist").
# It is a pre-release lint check, not needed to produce a working APK.
# Re-enable for a build with: make apk GRADLE_RELEASE_ARGS=
GRADLE_RELEASE_ARGS ?= -x lintVitalAnalyzeRelease -x lintVitalRelease

APK_OUT_DIR := build/apk
APP_VERSION := $(shell node -p "require('./app.json').expo.version" 2>/dev/null || echo dev)
APK_TEST    := $(APK_OUT_DIR)/megatest-$(APP_VERSION)-test.apk

.PHONY: help install \
	server-install server-dev server-build server-deploy \
	apk apk-install check-android android-debug-keystore \
	android-keystore android-apk android-apk-debugkey android-aab android-debug-apk android-install android-clean \
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
	@echo "  Test APK (what you usually want):"
	@echo "    apk                Build a phone-installable test APK -> $(APK_OUT_DIR)/"
	@echo "    apk-install        Same, then adb install to the connected phone"
	@echo ""
	@echo "  Android (local):"
	@echo "    android-keystore   Generate a release keystore (interactive), then create android/keystore.properties"
	@echo "    android-apk        Build a signed RELEASE APK (prints the output path)"
	@echo "    android-apk-debugkey  RELEASE APK signed with the debug key — installs without the Play Protect warning (local testing only)"
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

# ----- Test APK (one-shot) -------------------------------------------------

# The native Android project is tracked in git. If it goes missing, restore it
# from history — regenerating it with `expo prebuild` drops the hand-maintained
# launcher icons and native edits.
check-android:
	@test -d $(ANDROID_DIR) || ( \
		echo "ERROR: $(ANDROID_DIR)/ is missing."; \
		echo "Restore it from git (it is tracked), e.g.:"; \
		echo "    git log --diff-filter=D --oneline -- android   # find the commit that removed it"; \
		echo "    git checkout <commit>^ -- android"; \
		echo "Do NOT run 'expo prebuild' — it regenerates the native project and drops the"; \
		echo "hand-maintained launcher icons and pbxproj edits."; \
		exit 1 )

# android/app/debug.keystore is git-ignored, so a fresh clone won't have one.
# Recreate the standard Android debug key (CN=Android Debug, password 'android').
android-debug-keystore:
	@test -f $(ANDROID_DIR)/app/debug.keystore || ( \
		echo "[generating standard debug keystore -> $(ANDROID_DIR)/app/debug.keystore]"; \
		keytool -genkeypair -v -keystore $(ANDROID_DIR)/app/debug.keystore \
			-storepass android -alias androiddebugkey -keypass android \
			-keyalg RSA -keysize 2048 -validity 10000 \
			-dname "CN=Android Debug,O=Android,C=US" >/dev/null )

# One-shot phone-testable APK: release build signed with the debug key (no Play
# Protect "unknown developer" warning), copied to build/apk/ under a stable name.
apk: check-android android-debug-keystore android-apk-debugkey
	@mkdir -p $(APK_OUT_DIR)
	@cp $(APK_RELEASE) $(APK_TEST)
	@printf '\n📦 Test APK ready (v%s)\n   path: %s\n   url:  file://%s\n   size: %s\n\n   Install: make apk-install   (or: adb install -r %s)\n' "$(APP_VERSION)" "$(CURDIR)/$(APK_TEST)" "$(CURDIR)/$(APK_TEST)" "$$(du -h '$(CURDIR)/$(APK_TEST)' 2>/dev/null | cut -f1)" "$(APK_TEST)"

apk-install: apk
	adb install -r $(CURDIR)/$(APK_TEST)

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
	cd $(ANDROID_DIR) && ./gradlew assembleRelease $(GRADLE_RELEASE_ARGS)
	@printf '\n✅ Signed release APK\n   path: %s\n   url:  file://%s\n   size: %s\n' "$(CURDIR)/$(APK_RELEASE)" "$(CURDIR)/$(APK_RELEASE)" "$$(du -h '$(CURDIR)/$(APK_RELEASE)' 2>/dev/null | cut -f1)"

# Build a RELEASE APK signed with the DEBUG key (CN=Android Debug) instead of the
# release keystore, so it installs without the Play Protect "unknown developer"
# warning — handy for local testing / sharing with a few people. NOT for publishing:
# debug-signed builds can't be uploaded to Play and can't be updated by a real-key build.
# Temporarily sets aside keystore.properties (build.gradle then falls back to debug.keystore)
# and always restores it, even on build failure or Ctrl-C.
android-apk-debugkey:
	@cd $(ANDROID_DIR) && \
		trap 'if [ -f keystore.properties.mkbak ]; then mv -f keystore.properties.mkbak keystore.properties; fi' INT TERM; \
		if [ -f keystore.properties ]; then mv keystore.properties keystore.properties.mkbak; echo "[keystore.properties set aside -> signing with debug.keystore]"; fi; \
		./gradlew assembleRelease $(GRADLE_RELEASE_ARGS); status=$$?; \
		if [ -f keystore.properties.mkbak ]; then mv -f keystore.properties.mkbak keystore.properties; echo "[restored keystore.properties]"; fi; \
		exit $$status
	@printf '\n✅ Release APK signed with the DEBUG key (CN=Android Debug) — installs without the Play Protect warning. Local testing only.\n   path: %s\n   url:  file://%s\n   size: %s\n' "$(CURDIR)/$(APK_RELEASE)" "$(CURDIR)/$(APK_RELEASE)" "$$(du -h '$(CURDIR)/$(APK_RELEASE)' 2>/dev/null | cut -f1)"

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

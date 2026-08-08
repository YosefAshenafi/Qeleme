# MegaTest
#
#   make apk   → local Android APK
#   make ios   → publish to TestFlight (EAS)

.DEFAULT_GOAL := help

ANDROID_DIR := android
APK_RELEASE := $(ANDROID_DIR)/app/build/outputs/apk/release/app-release.apk
GRADLE_RELEASE_ARGS ?= -x lintVitalAnalyzeRelease -x lintVitalRelease
APK_OUT_DIR := build/apk
APP_VERSION := $(shell node -p "require('./app.json').expo.version" 2>/dev/null || echo dev)
APK_TEST := $(APK_OUT_DIR)/megatest-$(APP_VERSION)-test.apk

.PHONY: help apk ios

help:
	@echo "  make apk   Local Android APK -> $(APK_OUT_DIR)/"
	@echo "  make ios   Build & publish to TestFlight"

apk:
	@test -d $(ANDROID_DIR) || (echo "ERROR: $(ANDROID_DIR)/ is missing."; exit 1)
	@test -f $(ANDROID_DIR)/app/debug.keystore || keytool -genkeypair -v \
		-keystore $(ANDROID_DIR)/app/debug.keystore \
		-storepass android -alias androiddebugkey -keypass android \
		-keyalg RSA -keysize 2048 -validity 10000 \
		-dname "CN=Android Debug,O=Android,C=US" >/dev/null
	@cd $(ANDROID_DIR) && \
		trap 'if [ -f keystore.properties.mkbak ]; then mv -f keystore.properties.mkbak keystore.properties; fi' INT TERM; \
		if [ -f keystore.properties ]; then mv keystore.properties keystore.properties.mkbak; fi; \
		./gradlew assembleRelease $(GRADLE_RELEASE_ARGS); status=$$?; \
		if [ -f keystore.properties.mkbak ]; then mv -f keystore.properties.mkbak keystore.properties; fi; \
		exit $$status
	@mkdir -p $(APK_OUT_DIR)
	@cp $(APK_RELEASE) $(APK_TEST)
	@printf '\n📦 APK ready (v%s)\n   %s\n' "$(APP_VERSION)" "$(CURDIR)/$(APK_TEST)"

ios:
	npx eas build -p ios --profile testflight --auto-submit
	@printf '\n✅ Submitted to TestFlight.\n   https://appstoreconnect.apple.com/apps/6761431135/testflight/ios\n'

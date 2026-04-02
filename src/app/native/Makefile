.PHONY: install genkey debug release clean build-ios build-ios-testflight submit-testflight apk-dir

install:
	bun install

genkey:
	keytool -genkey -v -keystore android/app/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"

debug:
	cd android && ./gradlew assembleDebug --no-daemon

release:
	cd android && ./gradlew assembleRelease --no-daemon

clean:
	cd android && ./gradlew clean

build-ios:
	npx expo run:ios --configuration Release --device "iPhone 16 Pro"

build-ios-testflight:
	npx eas build -p ios --profile testflight

submit-testflight:
	npx eas submit -p ios --profile testflight

setup-ios-credentials:
	npx eas credentials -p ios

testflight-ipa:
	mkdir -p build
	cd ios && xcodebuild -workspace MegaTest.xcworkspace -scheme MegaTest -configuration Release -archivePath ../build/MegaTest.xcarchive -allowProvisioningUpdates CODE_SIGN_STYLE=Automatic DEVELOPMENT_TEAM=29R8J276N2 archive
	cd .. && xcodebuild -exportArchive -archivePath build/MegaTest.xcarchive -exportPath build/ipa -exportOptionsPlist ios/ExportOptions.plist

apk-dir:
	@echo "APKs available at: android/app/build/outputs/apk/debug/app-debug.apk"
	@echo "                    android/app/build/outputs/apk/release/app-release.apk"
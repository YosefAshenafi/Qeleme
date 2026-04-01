.PHONY: install genkey debug release clean

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

apk-dir:
	@echo "APKs available at: android/app/build/outputs/apk/debug/app-debug.apk"
	@echo "                    android/app/build/outputs/apk/release/app-release.apk"
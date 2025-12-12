# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Expo modules
-keep class expo.modules.** { *; }
-keep class com.facebook.react.bridge.** { *; }

# Image picker
-keep class expo.modules.imagepicker.** { *; }

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep React Native classes
-keep class com.facebook.react.uimanager.** { *; }
-keep class com.facebook.react.views.** { *; }

# Keep your app's main classes
-keep class com.qelemapp.qelem.** { *; }
-keep class com.qelemapp.qelem.MainApplication { *; }
-keep class com.qelemapp.qelem.MainActivity { *; }

# Hermes specific rules
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# Reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.common.** { *; }

# Gesture Handler
-keep class com.swmansion.gesturehandler.** { *; }

# Preserve line number information for debugging
-keepattributes SourceFile,LineNumberTable

# Keep all annotations
-keepattributes *Annotation*

# Keep generic signatures
-keepattributes Signature

# For crash reporting (preserve stack traces)
-keepattributes EnclosingMethod

# Don't warn about missing classes
-dontwarn com.facebook.react.**
-dontwarn com.swmansion.**
-dontwarn expo.modules.**

# Keep JavaScript interface for WebView
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep Enums
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep Parcelables
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# Keep Serializable
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Add any project specific keep options here:

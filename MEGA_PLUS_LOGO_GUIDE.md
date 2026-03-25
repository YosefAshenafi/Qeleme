# Mega+ Logo Asset Creation Guide

## Overview
The splash screen has been updated to use "Mega+" branding instead of "Qelem". This guide provides instructions for creating the necessary logo assets.

## Design Specifications

### Splash Screen Icon
- **Size**: 150x150 pixels
- **Design**: White square with rounded corners (20px radius)
- **Content**: Dark grey (#4B5563) "M+" text in the center
- **Font**: Bold, modern sans-serif
- **Background**: Transparent

### App Icon
- **Size**: 1024x1024 pixels (for adaptive icon generation)
- **Design**: Same as splash screen icon (white square, rounded corners, "M+")
- **Background**: Transparent

## Required Assets

### 1. Splash Screen Logo
Replace the placeholder file:
```
/Users/yosef/Documents/Projects/Qeleme/assets/images/logo/mega-plus-logo.png
```

### 2. App Icon
Update the main app icon:
```
/Users/yosef/Documents/Projects/Qeleme/assets/images/logo/app-icon.png
```

### 3. Android Splash Screen Assets
Create multiple sizes for Android:
- `/android/app/src/main/res/drawable-mdpi/splashscreen_logo.png` (48x48)
- `/android/app/src/main/res/drawable-hdpi/splashscreen_logo.png` (72x72)
- `/android/app/src/main/res/drawable-xhdpi/splashscreen_logo.png` (96x96)
- `/android/app/src/main/res/drawable-xxhdpi/splashscreen_logo.png` (144x144)
- `/android/app/src/main/res/drawable-xxxhdpi/splashscreen_logo.png` (192x192)

### 4. iOS Splash Screen Asset
Update the iOS splash screen image:
```
/Users/yosef/Documents/Projects/Qeleme/ios/Qelem/Images.xcassets/SplashScreenLogo.imageset/SplashScreenLogo.png
```

## Color Scheme
- **Background**: #2563EB (Blue)
- **Icon Background**: #FFFFFF (White)
- **Text**: #4B5563 (Dark Grey)

## Implementation Notes
- The React Native splash screen component now renders the design programmatically
- The background watermark "M" is created using a large, semi-transparent text element
- All configuration files have been updated to use the new branding
- Package identifiers and app names have been changed from "Qelem" to "Mega+"

## Next Steps
1. Create the logo assets according to the specifications above
2. Replace the placeholder files with the new assets
3. Run a clean build to ensure all changes take effect
4. Test the splash screen on both iOS and Android devices

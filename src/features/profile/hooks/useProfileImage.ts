import { useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/core/providers/AuthProvider';

// Owns the profile picture flow: permission prompt, camera/gallery pickers,
// persistence to AsyncStorage, and restoring a saved image on mount.
export function useProfileImage() {
  const { user, login } = useAuth();
  const { t } = useTranslation();

  const uploadProfileImage = async (imageUri: string) => {
    try {
      await AsyncStorage.setItem('@profile_image', imageUri);

      const updatedUser = {
        ...user!,
        profileImage: imageUri,
      };

      await login(updatedUser);

      Alert.alert(
        t('profile.imagePicker.success', { defaultValue: 'Success' }),
        t('profile.imagePicker.successMessage', { defaultValue: 'Profile picture updated successfully!' })
      );
    } catch {
      Alert.alert(
        t('profile.imagePicker.error', { defaultValue: 'Error' }),
        t('profile.imagePicker.errorMessage', { defaultValue: 'Failed to update profile picture. Please try again.' })
      );
    }
  };

  const handleImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          t('profile.imagePicker.permissionRequired', { defaultValue: 'Permission Required' }),
          t('profile.imagePicker.permissionMessage', { defaultValue: 'Please grant permission to access your photo library to change your profile picture.' })
        );
        return;
      }

      Alert.alert(
        t('profile.imagePicker.selectPhoto', { defaultValue: 'Select Photo' }),
        '',
        [
          {
            text: t('profile.imagePicker.cancel', { defaultValue: 'Cancel' }),
            style: 'cancel',
          },
          {
            text: t('profile.imagePicker.camera', { defaultValue: 'Camera' }),
            onPress: async () => {
              try {
                const cameraResult = await ImagePicker.launchCameraAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.7,
                });

                if (!cameraResult.canceled && cameraResult.assets && cameraResult.assets[0]) {
                  await uploadProfileImage(cameraResult.assets[0].uri);
                }
              } catch {
                Alert.alert(
                  t('profile.imagePicker.cameraError', { defaultValue: 'Camera Error' }),
                  t('profile.imagePicker.cameraErrorMessage', { defaultValue: 'Failed to access camera. Please check permissions.' })
                );
              }
            },
          },
          {
            text: t('profile.imagePicker.gallery', { defaultValue: 'Gallery' }),
            onPress: async () => {
              try {
                const libraryResult = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.7,
                });

                if (!libraryResult.canceled && libraryResult.assets && libraryResult.assets[0]) {
                  await uploadProfileImage(libraryResult.assets[0].uri);
                }
              } catch {
                Alert.alert(
                  t('profile.imagePicker.galleryError', { defaultValue: 'Gallery Error' }),
                  t('profile.imagePicker.galleryErrorMessage', { defaultValue: 'Failed to access gallery. Please check permissions.' })
                );
              }
            },
          },
        ]
      );
    } catch {
      Alert.alert(
        t('profile.imagePicker.error', { defaultValue: 'Error' }),
        t('profile.imagePicker.errorMessage', { defaultValue: 'Failed to select image. Please try again.' })
      );
    }
  };

  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        const savedProfileImage = await AsyncStorage.getItem('@profile_image');
        if (savedProfileImage && user && !user.profileImage) {
          const updatedUser = {
            ...user,
            profileImage: savedProfileImage,
          };
          await login(updatedUser);
        }
      } catch {
      }
    };

    if (user) {
      loadProfileImage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return { handleImagePicker };
}

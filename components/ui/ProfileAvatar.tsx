import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { IconSymbol } from './IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

interface ProfileAvatarProps {
  size?: number;
  showEditButton?: boolean;
  onPress?: () => void;
  colors: {
    tint: string;
    background: string;
  };
}

export function ProfileAvatar({ 
  size = 40, 
  showEditButton = false,
  onPress,
  colors 
}: ProfileAvatarProps) {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    loadProfileImage();
  }, []);

  const loadProfileImage = async () => {
    try {
      const imageUri = await AsyncStorage.getItem('profileImage');
      if (imageUri) {
        setProfileImage(imageUri);
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/profile');
    }
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      style={[
        styles.container, 
        { 
          width: size, 
          height: size,
          backgroundColor: colors.tint + '20'
        }
      ]}
    >
      {profileImage ? (
        <Image
          source={{ uri: profileImage }}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        />
      ) : (
        <IconSymbol name="person.fill" size={size * 0.6} color={colors.tint} />
      )}
      {showEditButton && (
        <View style={styles.editButton}>
          <IconSymbol name="pencil.circle.fill" size={24} color={colors.tint} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
}); 
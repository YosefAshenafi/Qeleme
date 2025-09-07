import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface PasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: boolean;
  editable?: boolean;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoCorrect?: boolean;
  textContentType?: TextInputProps['textContentType'];
  autoComplete?: TextInputProps['autoComplete'];
  spellCheck?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  keyboardAppearance?: TextInputProps['keyboardAppearance'];
  style?: any;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChangeText,
  placeholder,
  error = false,
  editable = true,
  autoCapitalize = 'none',
  autoCorrect = false,
  textContentType = 'password',
  autoComplete = 'off',
  spellCheck = false,
  keyboardType = 'default',
  keyboardAppearance = 'default',
  style,
}) => {
  const { isDarkMode } = useTheme();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[
      styles.inputContainer,
      error && styles.inputError,
      { 
        backgroundColor: isDarkMode ? '#2C2C2E' : '#F9FAFB',
        borderColor: error ? '#EF4444' : (isDarkMode ? '#3C3C3E' : '#E5E7EB'),
      },
      style
    ]}>
      <Ionicons 
        name="lock-closed-outline" 
        size={20} 
        color={isDarkMode ? '#A0A0A5' : '#6B7280'} 
        style={styles.inputIcon} 
      />
      <TextInput
        style={[
          styles.input,
          { color: isDarkMode ? '#FFFFFF' : '#1F2937' }
        ]}
        placeholder={placeholder}
        placeholderTextColor={isDarkMode ? '#A0A0A5' : '#9CA3AF'}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!isPasswordVisible}
        editable={editable}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        textContentType={textContentType}
        autoComplete={autoComplete}
        spellCheck={spellCheck}
        keyboardType={keyboardType}
        keyboardAppearance={keyboardAppearance}
      />
      <TouchableOpacity
        onPress={togglePasswordVisibility}
        style={styles.eyeIconContainer}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
          size={20}
          color={isDarkMode ? '#A0A0A5' : '#6B7280'}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 60,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#1F2937',
  },
  eyeIconContainer: {
    padding: 4,
    marginLeft: 8,
  },
});

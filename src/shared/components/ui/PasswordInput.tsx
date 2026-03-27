import React, { useState } from 'react';
import { StyleProp, StyleSheet, TextInput, TouchableOpacity, View, TextInputProps, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/core/providers/ThemeProvider';
import { ThemedText } from '@/shared/components/ThemedText';
import { getColors } from '@/shared/constants/Colors';

interface PasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: boolean;
  errorMessage?: string;
  editable?: boolean;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoCorrect?: boolean;
  textContentType?: TextInputProps['textContentType'];
  autoComplete?: TextInputProps['autoComplete'];
  spellCheck?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  keyboardAppearance?: TextInputProps['keyboardAppearance'];
  colors?: ReturnType<typeof getColors>;
  isDarkMode?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChangeText,
  placeholder,
  error = false,
  errorMessage,
  editable = true,
  autoCapitalize = 'none',
  autoCorrect = false,
  textContentType = 'password',
  autoComplete = 'off',
  spellCheck = false,
  keyboardType = 'default',
  keyboardAppearance = 'default',
  colors,
  isDarkMode: isDarkModeOverride,
  style,
}) => {
  const { isDarkMode: contextDarkMode } = useTheme();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isDarkMode = isDarkModeOverride ?? contextDarkMode;
  const resolvedColors = colors ?? getColors(isDarkMode);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View>
      <View style={[
        styles.inputContainer,
        error && styles.inputError,
        { 
          backgroundColor: isDarkMode ? resolvedColors.card : '#F9FAFB',
          borderColor: error ? '#EF4444' : (isDarkMode ? resolvedColors.border : '#E5E7EB'),
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
      {errorMessage && (
        <ThemedText style={[styles.errorText, { color: '#F44336' }]}>{errorMessage}</ThemedText>
      )}
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
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

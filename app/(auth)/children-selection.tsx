import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, ScrollView, TextInput } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getColors } from '../../constants/Colors';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '../../components/ThemedText';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

export default function ChildrenSelectionScreen() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const [inputValue, setInputValue] = useState('1');
  const [numberOfChildren, setNumberOfChildren] = useState(1);
  const [error, setError] = useState('');

  const handleIncrement = () => {
    const newValue = numberOfChildren + 1;
    if (newValue <= 5) { // Maximum 5 children
      setNumberOfChildren(newValue);
      setInputValue(newValue.toString());
    }
  };

  const handleDecrement = () => {
    if (numberOfChildren > 1) {
      const newValue = numberOfChildren - 1;
      setNumberOfChildren(newValue);
      setInputValue(newValue.toString());
    }
  };

  const handleNumberChange = (text: string) => {
    setInputValue(text); // Always update the input value
    
    if (text === '') {
      return;
    }

    const number = parseInt(text);
    if (!isNaN(number)) {
      if (number >= 1 && number <= 5) {
        setNumberOfChildren(number);
      } else if (number > 5) {
        setNumberOfChildren(5);
        setInputValue('5');
      } else {
        setNumberOfChildren(1);
        setInputValue('1');
      }
    }
  };

  const handleInputBlur = () => {
    if (inputValue === '' || parseInt(inputValue) < 1) {
      setInputValue('1');
      setNumberOfChildren(1);
    }
  };

  const handleContinue = () => {
    if (numberOfChildren < 1) {
      setError(t('signup.errors.minimumOneChild'));
      return;
    }

    // Initialize children data structure
    const initialChildrenData = Array(numberOfChildren).fill(null).map(() => ({
      fullName: '',
      username: '',
      grade: '',
      password: '',
      confirmPassword: '',
      region: '',
      plan: '3' // Default to free plan
    }));

    router.push({
      pathname: '/(auth)/signup',
      params: { 
        numberOfChildren: numberOfChildren.toString(),
        childrenData: JSON.stringify(initialChildrenData),
        role: 'parent'
      }
    });
  };

  return (
    <LinearGradient
      colors={isDarkMode ? ['#000000', '#1C1C1E'] : ['#F8F9FA', '#FFFFFF']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#A0A0A5' : '#1F2937'} />
            </TouchableOpacity>
            <View style={styles.languageToggleContainer}>
              <LanguageToggle colors={colors} />
            </View>
            <View style={styles.titleContainer}>
              <ThemedText style={[styles.title, { color: colors.text }]}>
                {t('signup.childrenSelection.title')}
              </ThemedText>
              <ThemedText style={[styles.subtitle, { color: colors.text + '80' }]}>
                {t('signup.childrenSelection.subtitle')}
              </ThemedText>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={[styles.label, { color: colors.text }]}>
              {t('signup.childrenSelection.howManyChildren')}
            </ThemedText>
            <View style={[styles.numberInputContainer, { 
              backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF',
              borderColor: isDarkMode ? '#3C3C3E' : '#E5E7EB',
            }]}>
              <TouchableOpacity 
                onPress={handleDecrement}
                style={[styles.button, { opacity: numberOfChildren === 1 ? 0.5 : 1 }]}
                disabled={numberOfChildren === 1}
              >
                <Ionicons name="remove" size={24} color="#4F46E5" />
              </TouchableOpacity>
              <View style={styles.numberDisplay}>
                <TextInput
                  style={[styles.input, { 
                    color: colors.text,
                  }]}
                  value={inputValue}
                  onChangeText={handleNumberChange}
                  onBlur={handleInputBlur}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              </View>
              <TouchableOpacity 
                onPress={handleIncrement}
                style={[styles.button, { opacity: numberOfChildren === 5 ? 0.5 : 1 }]}
                disabled={numberOfChildren === 5}
              >
                <Ionicons name="add" size={24} color="#4F46E5" />
              </TouchableOpacity>
            </View>
            <ThemedText style={[styles.hint, { color: colors.text + '80' }]}>
              {t('signup.childrenSelection.enterNumberGreaterThanOne')}
            </ThemedText>
            {error ? (
              <ThemedText style={[styles.error, { color: '#EF4444' }]}>
                {error}
              </ThemedText>
            ) : null}
          </View>

          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: '#4F46E5' }]}
            onPress={handleContinue}
          >
            <ThemedText style={styles.continueButtonText}>
              {t('signup.childrenSelection.continue')}
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    marginBottom: 16,
  },
  titleContainer: {
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    paddingTop: 10,
  },
  subtitle: {
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    height: 56,
  },
  button: {
    width: 56,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberDisplay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
    height: '100%',
    padding: 0,
  },
  hint: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  continueButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  languageToggleContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    marginTop: 8,
    marginRight: 16,
  },
}); 
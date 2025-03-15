import { StyleSheet, TextInput, TouchableOpacity, View, Image } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import Checkbox from 'expo-checkbox';

import { ThemedText } from '@/components/ThemedText';

export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [grade, setGrade] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSignup = () => {
    // TODO: Implement signup logic
    if (!acceptTerms) {
      // Show error about accepting terms
      return;
    }
    if (password !== confirmPassword) {
      // Show error about password mismatch
      return;
    }
    // Proceed with signup
    router.replace('/(tabs)');
  };

  return (
    <LinearGradient
      colors={['#4A1E8C', '#8B3FB5']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.card}>
            <ThemedText style={styles.title}>Sign Up</ThemedText>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Full Name</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Phone Number</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Enter phone number (09..."
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Password</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Enter password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Confirm Password</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Enter confirm password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Grade</ThemedText>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={grade}
                    onValueChange={(itemValue: string) => setGrade(itemValue)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select your grade" value="" />
                    <Picker.Item label="Grade 9" value="9" />
                    <Picker.Item label="Grade 10" value="10" />
                    <Picker.Item label="Grade 11" value="11" />
                    <Picker.Item label="Grade 12" value="12" />
                  </Picker>
                </View>
              </View>

              <View style={styles.termsContainer}>
                <Checkbox
                  value={acceptTerms}
                  onValueChange={setAcceptTerms}
                  color={acceptTerms ? '#6B54AE' : undefined}
                  style={styles.checkbox}
                />
                <ThemedText style={styles.termsText}>
                  I accept the Terms and Conditions
                </ThemedText>
              </View>
              
              <TouchableOpacity 
                style={styles.signupButton} 
                onPress={handleSignup}
              >
                <ThemedText style={styles.buttonText}>Create an account</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.loginLink} 
            onPress={() => router.push('/(auth)/login')}
          >
            <ThemedText style={styles.loginLinkText}>
              Already have an account? Login here
            </ThemedText>
          </TouchableOpacity>
        </View>
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
    padding: 20,
    gap: 16,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    color: '#000',
  },
  form: {
    width: '100%',
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    color: '#000',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  termsText: {
    fontSize: 14,
    color: '#000',
  },
  signupButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#6B54AE',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#fff',
    fontSize: 14,
  },
}); 
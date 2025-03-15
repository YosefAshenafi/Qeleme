import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // TODO: Implement actual login logic here
    // For now, just navigate to the dashboard
    router.replace('/(tabs)');
  };

  return (
    <LinearGradient
      colors={['#5A2E98', '#7B3FB5']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.card}>
            <ThemedText style={styles.title}>Sign in</ThemedText>
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Phone number (09...)"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              
              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <ThemedText style={styles.buttonText}>Log In</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => {}}>
                <ThemedText style={styles.forgotPassword}>Forgot your password?</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.signupCard}>
            <ThemedText style={styles.newUserText}>I'm a new User</ThemedText>
            <TouchableOpacity 
              style={styles.signupButton} 
              onPress={() => router.push('/(auth)/signup')}
            >
              <ThemedText style={styles.buttonText}>Sign Up</ThemedText>
            </TouchableOpacity>
          </View>
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
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#6B54AE',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPassword: {
    color: '#6B54AE',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
  signupCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  newUserText: {
    fontSize: 16,
    color: '#000',
  },
  signupButton: {
    backgroundColor: '#6B54AE',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
}); 
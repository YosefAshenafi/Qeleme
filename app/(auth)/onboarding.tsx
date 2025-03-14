import { StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function OnboardingScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ThemedText type="title">Welcome to Qelem</ThemedText>
        <ThemedText style={styles.subtitle}>Your personal learning companion</ThemedText>
        
        <Link href="/(auth)/login" style={styles.button}>
          <ThemedText style={styles.buttonText}>Login</ThemedText>
        </Link>
        
        <Link href="/(auth)/signup" style={styles.button}>
          <ThemedText style={styles.buttonText}>Sign Up</ThemedText>
        </Link>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 20,
    backgroundColor: '#fff',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#6B54AE',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 
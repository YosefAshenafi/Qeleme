import { StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function SignupScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ThemedText type="title">Sign Up</ThemedText>
        <ThemedView style={styles.form}>
          {/* Add signup form components here */}
        </ThemedView>
        
        <Link href="/(auth)/login" style={styles.link}>
          <ThemedText type="link">Already have an account? Login</ThemedText>
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
  form: {
    width: '100%',
    gap: 15,
  },
  link: {
    marginTop: 20,
  },
}); 
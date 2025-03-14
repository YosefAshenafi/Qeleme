import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '@/components/Header';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeworkScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Homework Help" />
      <ThemedView style={styles.container}>
        <ThemedView style={styles.content}>
          {/* Add homework help content here */}
        </ThemedView>
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
    padding: 20,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    marginTop: 20,
  },
}); 
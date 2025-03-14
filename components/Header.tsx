import { StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

type HeaderProps = {
  title: string;
  subtitle?: string;
};

export function Header({ title, subtitle }: HeaderProps) {
  const colorScheme = useColorScheme();

  return (
    <ThemedView style={styles.header}>
      <ThemedView style={styles.headerContent}>
        <ThemedText type="title" style={styles.title}>
          {title}
        </ThemedText>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <IconSymbol 
            size={32} 
            name="person.circle.fill" 
            color={Colors[colorScheme ?? 'light'].tint} 
          />
        </TouchableOpacity>
      </ThemedView>
      {subtitle && (
        <ThemedText style={styles.subtitle}>
          {subtitle}
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    gap: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  profileButton: {
    padding: 8,
  },
}); 
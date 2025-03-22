import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';

type HeaderProps = {
  title: string;
  subtitle?: string;
};

export function Header({ title, subtitle }: HeaderProps) {
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);

  return (
    <ThemedView style={[styles.header, { backgroundColor: colors.background }]}>
      <ThemedView style={[styles.headerContent, { backgroundColor: colors.background }]}>
        <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
          {title}
        </ThemedText>
      </ThemedView>
      {subtitle && (
        <ThemedText style={[styles.subtitle, { color: colors.text + '80' }]}>
          {subtitle}
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  },
}); 
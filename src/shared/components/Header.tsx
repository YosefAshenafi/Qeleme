import { StyleSheet } from 'react-native';
import { ThemedText } from '@/shared/components/ThemedText';
import { ThemedView } from '@/shared/components/ThemedView';
import { useTheme } from '@/core/providers/ThemeProvider';
import { getColors } from '@/shared/constants/Colors';

type HeaderProps = {
  title: string;
  subtitle?: string;
  /** When set, overrides the default screen background (e.g. auth-aligned canvas). */
  backgroundColor?: string;
};

export function Header({ title, subtitle, backgroundColor }: HeaderProps) {
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const bg = backgroundColor ?? colors.background;

  return (
    <ThemedView style={[styles.header, { backgroundColor: bg }]}>
      <ThemedView style={[styles.headerContent, { backgroundColor: bg }]}>
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
    paddingTop: 10,
    paddingBottom: 20,
    gap: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 40,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
}); 
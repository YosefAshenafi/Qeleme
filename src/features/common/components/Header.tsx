import { ThemedText } from '@/features/common/components/ThemedText';
import { ThemedView } from '@/features/common/components/ThemedView';
import { useTheme } from '@/core/providers/ThemeProvider';
import { getColors } from '@/features/common/constants/Colors';
import { HeaderStyles as styles } from './Header.styles';

type HeaderProps = {
  title: string;
  subtitle?: string;
  
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
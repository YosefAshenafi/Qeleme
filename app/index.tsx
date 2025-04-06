import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  if (isAuthenticated) {
    // Redirect KG users to KG dashboard, others to tabs
    if (user?.grade === 'KG') {
      return <Redirect href="/kg-dashboard" />;
    }
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/onboarding" />;
} 
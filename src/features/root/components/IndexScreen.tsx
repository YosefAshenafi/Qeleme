import { Redirect } from 'expo-router';
import { useAuth } from '@/core/providers/AuthProvider';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '@/core/providers/ThemeProvider';
import { getColors } from '@/features/common/constants/Colors';

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
    
    if (typeof user?.grade === 'string' && user.grade.toLowerCase().includes('kg')) {
      return <Redirect href="/kg-dashboard" />;
    }
    
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/welcome" />;
} 
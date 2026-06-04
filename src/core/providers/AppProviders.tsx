import { useEffect, useState, type ReactNode } from 'react';
import { Image, View } from 'react-native';

import { initI18n } from '@/core/i18n';
import { AuthProvider } from '@/core/providers/AuthProvider';
import { LanguageProvider } from '@/core/providers/LanguageProvider';
import { ThemeProvider } from '@/core/providers/ThemeProvider';

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    initI18n()
      .catch(() => undefined)
      .finally(() => {
        if (isMounted) {
          setIsReady(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0F4BD7', justifyContent: 'center', alignItems: 'center' }}>
        <Image source={require('@/assets/images/logo.png')} style={{ width: 150, height: 150 }} />
      </View>
    );
  }

  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

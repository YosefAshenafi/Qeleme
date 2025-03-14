import { StyleSheet, View, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { router, useLocalSearchParams } from 'expo-router';

import { Header } from '@/components/Header';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ResultScreen() {
  const params = useLocalSearchParams();
  const score = Number(params.score);
  const total = Number(params.total);
  const percentage = Math.round((score / total) * 100);
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Celebration animation
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    if (percentage >= 90) {
      // Start confetti animation for high scores
      Animated.loop(
        Animated.sequence([
          Animated.timing(confettiAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(confettiAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const confettiScale = confettiAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 1],
  });

  const getMessage = () => {
    if (percentage >= 90) return "Outstanding! You're a genius!";
    if (percentage >= 70) return "Great job! You're doing well!";
    if (percentage >= 50) return "Not bad! Keep practicing!";
    return "Keep learning! You can do better!";
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Quiz Results" />
      <ThemedView style={styles.container}>
        <View style={styles.resultCard}>
          <LinearGradient
            colors={['#F3E5F5', '#E1BEE7']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          
          {percentage >= 90 && (
            <Animated.View style={[styles.confettiContainer, { transform: [{ scale: confettiScale }] }]}>
              <IconSymbol name="sparkles" size={24} color="#FFD700" style={styles.confettiLeft} />
              <IconSymbol name="sparkles" size={24} color="#FFD700" style={styles.confettiRight} />
            </Animated.View>
          )}
          
          <View style={styles.trophyContainer}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }, { rotate: spin }] }}>
              <IconSymbol name="trophy.fill" size={80} color="#6B54AE" />
            </Animated.View>
          </View>
          
          <ThemedText style={styles.scoreText}>
            {score}/{total}
          </ThemedText>
          
          <ThemedText style={styles.percentageText}>
            {percentage}%
          </ThemedText>
          
          <ThemedText style={styles.messageText}>
            {getMessage()}
          </ThemedText>
        </View>

        <ThemedView style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.retryButton]}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.homeButton]}
            onPress={() => router.push('/(tabs)')}
          >
            <ThemedText style={styles.homeButtonText}>Back to Home</ThemedText>
          </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  resultCard: {
    width: SCREEN_WIDTH - 40,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    backgroundColor: '#F3E5F5',
    paddingBottom: 60,
    paddingTop: 30,
  },
  trophyContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  scoreText: {
    paddingTop: 30,
    fontSize: 50,
    fontWeight: '700',
    color: '#6B54AE',
    marginBottom: 8,
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  percentageText: {
    paddingTop: 20,
    fontSize: 30,
    fontWeight: '600',
    color: '#6B54AE',
    marginBottom: 16,
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  messageText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#6B54AE',
    lineHeight: 24,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  actionButtons: {
    marginTop: 20,
    width: '100%',
    gap: 16,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: '#6B54AE',
  },
  homeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6B54AE',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  homeButtonText: {
    color: '#6B54AE',
    fontSize: 16,
    fontWeight: '600',
  },
  confettiContainer: {
    position: 'absolute',
    top: 20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  confettiLeft: {
    transform: [{ rotate: '-45deg' }],
  },
  confettiRight: {
    transform: [{ rotate: '45deg' }],
  },
}); 
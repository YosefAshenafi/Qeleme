import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

import { Header } from '@/components/Header';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';

export default function PictureMCQResultScreen() {
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const params = useLocalSearchParams();
  const score = Number(params.score) || 0;
  const totalQuestions = Number(params.totalQuestions) || 0;
  const percentage = Math.round((score / totalQuestions) * 100);

  // Animation values
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const bounceAnim = React.useRef(new Animated.Value(0)).current;
  const confettiAnim = React.useRef(new Animated.Value(0)).current;
  const celebrationRef = React.useRef<LottieView>(null);

  useEffect(() => {
    // Start animations when component mounts
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    if (percentage >= 70 && celebrationRef.current) {
      celebrationRef.current.play();
    }
  }, [percentage]);

  const getMessage = () => {
    if (percentage >= 90) return "Outstanding! You're a Master! 🌟";
    if (percentage >= 70) return "Amazing Job! Keep Shining! 🎉";
    if (percentage >= 50) return "Good Progress! Keep Going! 💪";
    return "Keep Learning! You've Got This! 📚";
  };

  const getGradientColors = () => {
    if (percentage >= 90) return ['#FFD700', '#FFA500'] as const;
    if (percentage >= 70) return ['#4CAF50', '#45B649'] as const;
    if (percentage >= 50) return ['#2196F3', '#03A9F4'] as const;
    return ['#FF9800', '#F57C00'] as const;
  };

  const spin = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title="Results 🎯" />
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Main Result Card */}
          <Animated.View style={[styles.resultCard, { 
            transform: [{ scale: scaleAnim }],
            borderColor: colors.tint,
            backgroundColor: colors.card,
          }]}>
            <LinearGradient
              colors={getGradientColors()}
              style={[StyleSheet.absoluteFill, { opacity: 0 }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            
            {/* Trophy Animation */}
            <View style={styles.trophyContainer}>
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <IconSymbol 
                  name="trophy.fill"
                  size={120} 
                  color="#FFA500" 
                />
              </Animated.View>
            </View>

            {percentage >= 70 && (
              <LottieView
                ref={celebrationRef}
                source={require('../../assets/lottie/confetti.json')}
                autoPlay
                loop
                style={styles.celebration}
                speed={0.7}
              />
            )}
            
            {/* Score Display */}
            <View style={styles.scoreContainer}>
              <ThemedText style={[styles.scoreLabel, { color: colors.tint }]}>
                Your Score
              </ThemedText>
              <ThemedText style={[styles.scoreText, { color: colors.tint }]}>
                {score}/{totalQuestions}
              </ThemedText>
              <View style={[styles.percentageContainer, { 
                backgroundColor: colors.card,
                borderColor: colors.tint 
              }]}>
                <ThemedText style={[styles.percentageText, { color: colors.tint }]}>
                  {percentage}%
                </ThemedText>
              </View>
            </View>
            
            {/* Performance Message */}
            <View style={[styles.messageContainer, { 
              backgroundColor: colors.card,
              borderColor: colors.tint 
            }]}>
              <ThemedText style={[styles.messageText, { color: colors.tint }]}>
                {getMessage()}
              </ThemedText>
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <ThemedView style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.playAgainButton, { backgroundColor: colors.tint }]}
              onPress={() => router.back()}
            >
              <ThemedText style={styles.buttonText}>Try Again</ThemedText>
              <IconSymbol name="chevron.right" size={24} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.homeButton, { borderColor: colors.tint }]}
              onPress={() => router.push('/mcq')}
            >
              <ThemedText style={[styles.buttonText, { color: colors.tint }]}>
                More Questions
              </ThemedText>
              <IconSymbol name="house.fill" size={24} color={colors.tint} />
            </TouchableOpacity>
          </ThemedView>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    marginTop: 100,
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 24,
  },
  resultCard: {
    width: '90%',
    alignSelf: 'center',
    borderRadius: 24,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    backgroundColor: 'rgba(91, 91, 91, 0.9)',
  },
  trophyContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  celebration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    pointerEvents: 'none',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 24,
    marginBottom: 8,
    fontWeight: '600',
  },
  scoreText: {
    paddingTop: 40,
    fontSize: 52,
    fontWeight: '700',
    marginBottom: 16,
    fontFamily: 'System',
  },
  percentageContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 2,
  },
  percentageText: {
    paddingTop: 0,
    fontSize: 22,
    fontWeight: '600',
  },
  messageContainer: {
    marginTop: 10,
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
  },
  messageText: {
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 32,
    fontWeight: '600',
  },
  actionButtons: {
    marginTop: 32,
    gap: 16,
    paddingHorizontal: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  playAgainButton: {
    backgroundColor: '#4CAF50',
  },
  homeButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
}); 
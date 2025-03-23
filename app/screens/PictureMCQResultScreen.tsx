import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View, Dimensions, Animated } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';

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

  const spin = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
          Quiz Results
        </ThemedText>

        {/* Main Result Card */}
        <Animated.View style={[styles.resultCard, { 
          transform: [{ scale: scaleAnim }],
          backgroundColor: colors.card,
        }]}>
          <LinearGradient
            colors={[colors.cardGradientStart, colors.cardGradientEnd]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          
          {/* Trophy Animation */}
          <View style={styles.trophyContainer}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <IconSymbol 
                name="trophy.fill"
                size={120} 
                color={percentage >= 90 ? '#FFD700' : colors.tint}
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
          <View style={styles.resultContent}>
            <View style={styles.scoreContainer}>
              <ThemedText style={[styles.scoreLabel, { color: colors.text }]}>
                Your Score
              </ThemedText>
              <ThemedText style={[styles.scoreText, { color: colors.text }]}>
                {score}/{totalQuestions}
              </ThemedText>
            </View>

            <View style={[styles.percentageContainer, { 
              backgroundColor: colors.cardAlt,
              borderColor: colors.border 
            }]}>
              <ThemedText style={[styles.percentageText, { color: colors.text }]}>
                {percentage}%
              </ThemedText>
            </View>
            
            <View style={[styles.messageContainer, { 
              backgroundColor: colors.cardAlt,
              borderColor: colors.border 
            }]}>
              <ThemedText style={[styles.messageText, { color: colors.text }]}>
                {getMessage()}
              </ThemedText>
            </View>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <ThemedView style={[styles.actionButtons, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.tint }]}
            onPress={() => {
              router.replace({
                pathname: '/mcq',
                params: { 
                  mode: 'retry',
                  timestamp: Date.now()
                }
              });
            }}
          >
            <ThemedText style={[styles.buttonText, { color: colors.background }]}>Try Again</ThemedText>
            <Ionicons name="repeat" size={24} color={colors.background} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}
            onPress={() => {
              router.replace({
                pathname: '/mcq',
                params: { 
                  mode: 'new',
                  timestamp: Date.now()
                }
              });
            }}
          >
            <ThemedText style={[styles.buttonText, { color: colors.text }]}>New Questions</ThemedText>
            <Ionicons name="documents-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
    paddingBottom: 100,
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
    marginTop: 16,
  },
  resultContent: {
    gap: 16,
  },
  trophyContainer: {
    alignItems: 'center',
    paddingVertical: 16,
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
    paddingTop: 30,
    fontSize: 48,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  percentageContainer: {
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 2,
    marginBottom: 16,
  },
  percentageText: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  messageContainer: {
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
    width: '100%',
    gap: 12,
    marginTop: 24,
    paddingHorizontal: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  playAgainButton: {
    backgroundColor: '#4CAF50',
  },
  homeButton: {
    borderWidth: 2,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
}); 
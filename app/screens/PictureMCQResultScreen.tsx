import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Header } from '@/components/Header';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function PictureMCQResultScreen() {
  const params = useLocalSearchParams();
  const score = Number(params.score) || 0;
  const totalQuestions = Number(params.totalQuestions) || 0;
  const percentage = Math.round((score / totalQuestions) * 100);

  // Animation values
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const bounceAnim = React.useRef(new Animated.Value(0)).current;
  const confettiAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations when component mounts
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    if (percentage >= 70) {
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

  const getMessage = () => {
    if (percentage >= 90) return "Wow! You're a Super Star! 🌟";
    if (percentage >= 70) return "Amazing Job! You're Fantastic! 🎉";
    if (percentage >= 50) return "Good Try! Keep Going! 💪";
    return "Don't Give Up! You Can Do It!";
  };

  const spin = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Great Job! 🎉" />
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Main Result Card */}
          <Animated.View style={[styles.resultCard, { transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient
              colors={['#FFE0B2', '#FFCC80']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            
            {/* Trophy/Star Animation */}
            {/* <View style={styles.trophyContainer}>
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <IconSymbol 
                  name={percentage >= 70 ? "trophy.fill" : "questionmark.circle.fill"} 
                  size={120} 
                  color={percentage >= 70 ? "#FFA000" : "#FFC107"} 
                />
              </Animated.View>
            </View> */}
            
            {/* Score Display */}
            <View style={styles.scoreContainer}>
              <ThemedText style={styles.scoreLabel}>Your Score</ThemedText>
              <ThemedText style={styles.scoreText}>
                {score}/{totalQuestions}
              </ThemedText>
              <View style={styles.percentageContainer}>
                <ThemedText style={styles.percentageText}>
                  {percentage}%
                </ThemedText>
              </View>
            </View>
            
            {/* Performance Message */}
            <View style={styles.messageContainer}>
              <ThemedText style={styles.messageText}>
                {getMessage()}
              </ThemedText>
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <ThemedView style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.playAgainButton]}
              onPress={() => router.back()}
            >
              <ThemedText style={styles.playAgainButtonText}>Play Again</ThemedText>
              <IconSymbol name="chevron.right" size={24} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.homeButton]}
              onPress={() => router.push('/mcq')}
            >
              <ThemedText style={styles.homeButtonText}>Back to Questions</ThemedText>
              <IconSymbol name="house.fill" size={24} color="#FFA000" />
            </TouchableOpacity>
          </ThemedView>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    paddingTop: 80,
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  resultCard: {
    width: '90%',
    alignSelf: 'center',
    borderRadius: 24,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#FFA000',
  },
  trophyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'transparent',
  },
  scoreContainer: {
    paddingTop: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  scoreLabel: {
    paddingTop: 30,
    fontSize: 24,
    color: '#FFA000',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  scoreText: {
    paddingTop: 50,
    fontSize: 72,
    fontWeight: '700',
    color: '#FFA000',
    marginBottom: 16,
  },
  percentageContainer: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#FFA000',
  },
  percentageText: {
    paddingTop: 10,
    fontSize: 32,
    fontWeight: '600',
    color: '#FFA000',
  },
  messageContainer: {
    marginTop: 24,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#FFA000',
  },
  messageText: {
    fontSize: 24,
    textAlign: 'center',
    color: '#FFA000',
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
    padding: 20,
    borderRadius: 20,
    gap: 12,
  },
  playAgainButton: {
    backgroundColor: '#FFA000',
  },
  homeButton: {
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: '#FFA000',
  },
  playAgainButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  homeButtonText: {
    color: '#FFA000',
    fontSize: 24,
    fontWeight: '600',
  },
}); 
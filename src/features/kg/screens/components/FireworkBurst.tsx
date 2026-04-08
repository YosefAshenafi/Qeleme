import React, { useState, useEffect, useMemo } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { FIREWORK_BURST, FIREWORK_COLORS } from './fireworkBurst.constants';
import { fireworkBurstStyles as particleStyles } from './FireworkBurst.styles';

interface FireworkParticle {
  id: number;
  angle: number;
  speed: number;
  color: string;
  size: number;
}

interface FireworkBurstProps {
  visible: boolean;
  onAnimationEnd?: () => void;
  delay?: number;
}

const FireworkParticleComponent = ({ particle }: { particle: FireworkParticle }) => {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(1);
  const particleOpacity = useSharedValue(1);

  useEffect(() => {
    progress.value = 0;
    opacity.value = 1;
    particleOpacity.value = 1;

    progress.value = withTiming(1, { duration: FIREWORK_BURST.particleDurationMs, easing: Easing.out(Easing.quad) });
    opacity.value = withTiming(0, { duration: FIREWORK_BURST.particleDurationMs });
    particleOpacity.value = withDelay(
      FIREWORK_BURST.particleFadeDelayMs,
      withTiming(0, { duration: FIREWORK_BURST.particleFadeDurationMs }),
    );
  }, [particle.id]);

  const animatedStyle = useAnimatedStyle(() => {
    const x = Math.cos(particle.angle) * particle.speed * progress.value;
    const y = Math.sin(particle.angle) * particle.speed * progress.value;
    const scale = 1 - progress.value * 0.3;

    return {
      transform: [{ translateX: x }, { translateY: y }, { scale }],
      opacity: opacity.value,
    } as any;
  });

  const dotStyle = useAnimatedStyle(
    () =>
      ({
        opacity: particleOpacity.value,
      }) as any,
  );

  return (
    <Animated.View style={[particleStyles.particle, animatedStyle]}>
      <Animated.View
        style={[
          dotStyle,
          {
            backgroundColor: particle.color,
            width: particle.size,
            height: particle.size,
            borderRadius: particle.size / 2,
          },
        ]}
      />
    </Animated.View>
  );
};

export const FireworkBurst = ({ visible, onAnimationEnd, delay = FIREWORK_BURST.defaultDelayMs }: FireworkBurstProps) => {
  const [burstKey, setBurstKey] = useState(0);

  useEffect(() => {
    if (visible) {
      setBurstKey((prev) => prev + 1);
      const timer = setTimeout(() => {
        onAnimationEnd?.();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [visible, delay]);

  const fireworks = useMemo(() => {
    const bursts = [];
    const particles: FireworkParticle[] = [];

    for (let i = 0; i < FIREWORK_BURST.particleCount; i++) {
      particles.push({
        id: i,
        angle: (i / FIREWORK_BURST.particleCount) * Math.PI * 2,
        speed: 80 + Math.random() * 120,
        color: FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)],
        size: 6 + Math.random() * 6,
      });
    }
    bursts.push({ id: 0, particles });
    return bursts;
  }, [burstKey]);

  if (!visible) return null;

  return (
    <View style={particleStyles.container} pointerEvents="none">
      {fireworks.map((firework) => (
        <View key={`${burstKey}-${firework.id}`} style={particleStyles.container}>
          {firework.particles.map((particle) => (
            <FireworkParticleComponent key={`${burstKey}-${particle.id}`} particle={particle} />
          ))}
        </View>
      ))}
    </View>
  );
};

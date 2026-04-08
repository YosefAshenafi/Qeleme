import React from 'react';
import { ScrollView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/features/common/components/ui/IconSymbol';
import { ThemedText } from '@/features/common/components/ThemedText';
import { ThemedView } from '@/features/common/components/ThemedView';
import { HOME_CARD_SPACING, HOME_CARD_WIDTH, HOME_REPORT_GRADIENTS } from '@/features/home/constants/homeUi';
import type { ReportCard } from '@/features/home/types/home';
import { HomeScreenStyles as styles } from './HomeScreen.styles';

type HomeReportCarouselProps = {
  scrollViewRef: React.RefObject<ScrollView | null>;
  reportCards: ReportCard[];
  activeIndex: number;
  onScroll: (event: { nativeEvent: { contentOffset: { x: number } } }) => void;
};

export function HomeReportCarousel({ scrollViewRef, reportCards, activeIndex, onScroll }: HomeReportCarouselProps) {
  return (
    <View style={styles.carouselSection}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={HOME_CARD_WIDTH + HOME_CARD_SPACING}
        decelerationRate="fast"
        contentContainerStyle={styles.carouselContainer}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {reportCards.map((card, index) => (
          <ThemedView key={index} style={styles.reportCard}>
            <LinearGradient
              colors={HOME_REPORT_GRADIENTS[card.gradient]}
              style={styles.reportCardContent}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.reportCardHeader}>
                <View style={styles.reportCardIconContainer}>
                  <IconSymbol name={card.icon} size={24} color="#fff" />
                </View>
                <ThemedText style={styles.reportCardTitle}>{card.title}</ThemedText>
                <View style={styles.paginationDots}>
                  {reportCards.map((_, dotIndex) => (
                    <View
                      key={dotIndex}
                      style={[styles.paginationDot, dotIndex === activeIndex && styles.paginationDotActive]}
                    />
                  ))}
                </View>
              </View>
              <View style={styles.reportCardMain}>
                <ThemedText style={styles.reportCardNumber}>{card.number}</ThemedText>
                <ThemedText style={styles.reportCardSubtitle}>{card.subtitle}</ThemedText>
              </View>
              <View style={styles.reportCardStats}>
                {card.stats.map((stat, statIndex) => (
                  <View key={statIndex} style={styles.reportStatItem}>
                    <ThemedText style={styles.reportStatValue}>{stat.value}</ThemedText>
                    <ThemedText style={styles.reportStatLabel}>{stat.label}</ThemedText>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </ThemedView>
        ))}
      </ScrollView>
    </View>
  );
}

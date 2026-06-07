import { StyleSheet } from 'react-native';

export const ReportsScreenStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 16,
  },

  // Header
  headerRow: {
    gap: 2,
    marginBottom: 2,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  screenSubtitle: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Generic card
  card: {
    borderRadius: 20,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  chip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.2,
  },

  // Hero (accuracy ring + key stats)
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    borderRadius: 22,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  ringWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPercent: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  ringLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginTop: 1,
  },
  heroStats: {
    flex: 1,
    gap: 12,
  },
  heroStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroStatIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStatText: {
    flex: 1,
    gap: 1,
  },
  heroStatValue: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
    fontVariant: ['tabular-nums'],
  },
  heroStatLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Score progression chart
  emptyChart: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  emptyChartText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Practice mix
  mixBarTrack: {
    flexDirection: 'row',
    height: 14,
    borderRadius: 999,
    overflow: 'hidden',
    gap: 3,
  },
  mixSegment: {
    height: '100%',
    borderRadius: 999,
  },
  mixLegendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    marginTop: 14,
  },
  mixLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mixLegendDot: {
    width: 12,
    height: 12,
    borderRadius: 4,
  },
  mixLegendLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  mixLegendSub: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Subject performance
  subjectBarsList: {
    gap: 10,
  },
  subjectBarCard: {
    borderRadius: 16,
    padding: 14,
    gap: 11,
  },
  subjectBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  subjectBarIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectBarTitleWrap: {
    flex: 1,
    gap: 5,
  },
  subjectBarTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  subjectBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  subjectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  subjectBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  subjectBarScore: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: -0.3,
    fontVariant: ['tabular-nums'],
  },
  subjectBarTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  subjectBarFill: {
    height: '100%',
    borderRadius: 999,
  },

  // Recent activity
  recentList: {
    gap: 10,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 12,
  },
  recentIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentBody: {
    flex: 1,
    gap: 2,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  recentMeta: {
    fontSize: 12,
    fontWeight: '600',
  },
  recentRight: {
    alignItems: 'flex-end',
    gap: 3,
  },
  recentScorePill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  recentScoreText: {
    fontSize: 13,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  recentTime: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Section heading (plain, left-aligned)
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 2,
    marginTop: 2,
  },

  // Skeleton loading
  skeletonBlock: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  skeletonLine: {
    borderRadius: 8,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    paddingHorizontal: 28,
    gap: 16,
  },
  emptyIconWrap: {
    width: 84,
    height: 84,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 21,
    maxWidth: 300,
  },
});

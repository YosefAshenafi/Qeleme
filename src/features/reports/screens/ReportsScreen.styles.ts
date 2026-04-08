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
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  section: {
    gap: 10,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 12,
  },
  kpiTouchable: {
    flex: 1,
  },
  kpiCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    minHeight: 92,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  creditsCard: {
    borderRadius: 16,
    padding: 14,
    paddingBottom: 34,
    minHeight: 140,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  kpiTop: {
    alignItems: 'flex-start',
    gap: 10,
  },
  kpiIconLgWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiTitleBelow: {
    fontSize: 13,
    fontWeight: '800',
  },
  kpiBottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 8,
  },
  kpiValueCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  kpiValueCircleText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  kpiIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  kpiValue: {
    fontSize: 26,
    fontWeight: '800',
    marginTop: 6,
  },
  /** HH:MM:SS — extra line height so digits are not clipped */
  kpiValueStudyTime: {
    lineHeight: 36,
    paddingVertical: 4,
  },
  kpiDelta: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  progressCard: {
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  progressSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  progressChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  progressChipText: {
    fontSize: 12,
    fontWeight: '800',
  },
  emptyChart: {
    height: 160,
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
  subjectBarsList: {
    gap: 10,
  },
  subjectBarCard: {
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  subjectBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  subjectBarTitleWrap: {
    flex: 1,
    gap: 6,
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
  },
  subjectBarIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectBarTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  subjectBarScore: {
    fontSize: 12,
    fontWeight: '700',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 200,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 24,
  },
});

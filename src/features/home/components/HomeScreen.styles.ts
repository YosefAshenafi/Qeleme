import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 12;
const BOOK_GRID_CARD_WIDTH = (SCREEN_WIDTH - 40 - GRID_GAP) / 2;
const SUBJECT_COVER_INNER_WIDTH = Math.min(120, Math.round(BOOK_GRID_CARD_WIDTH * 0.62));
const SUBJECT_COVER_INNER_HEIGHT = Math.round(SUBJECT_COVER_INNER_WIDTH * 1.36);
const SUBJECT_GRID_TOP_BAND_HEIGHT = SUBJECT_COVER_INNER_HEIGHT + 32;
const BOOK_CARD_WIDTH = (SCREEN_WIDTH - 60) / 2.2;

export const HomeScreenStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  welcomeCard: {
    borderRadius: 20,
    paddingLeft: 0,
    paddingRight: 16,
    paddingTop: 20,
    paddingBottom: 20,
    marginBottom: 22,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  welcomeSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  quickAccessHeading: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  quickAccessRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  quickAccessCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  quickAccessIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quickAccessLabel: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  subjectsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  subjectsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
    flex: 1,
    marginRight: 12,
  },
  viewAllLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F4BD7',
  },
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    marginBottom: 8,
  },
  subjectGridCard: {
    width: BOOK_GRID_CARD_WIDTH,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 4,
  },
  subjectGridCoverWrap: {
    width: BOOK_GRID_CARD_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    position: 'relative',
    overflow: 'hidden',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  subjectGridAtmosphereRoot: {
    ...StyleSheet.absoluteFillObject,
  },
  subjectGridCoverLift: {
    zIndex: 1,
  },
  subjectGridSkeletonCover: {
    width: SUBJECT_COVER_INNER_WIDTH,
    height: SUBJECT_COVER_INNER_HEIGHT,
    borderRadius: 12,
  },
  subjectGridCardBody: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  subjectGridTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 4,
  },
  subjectGridChapters: {
    fontSize: 12,
    fontWeight: '500',
  },
  skeletonLine: {
    height: 14,
    borderRadius: 6,
    width: '90%',
    marginBottom: 8,
  },
  skeletonLineShort: {
    height: 12,
    borderRadius: 5,
    width: '55%',
  },
  quickActionsSection: {
    marginTop: 8,
    marginBottom: 50,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
    padding: 2,
    marginTop: 8,
  },
  gridItem: {
    width: '47%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  gridItemContent: {
    padding: 16,
    height: 140,
    borderRadius: 16,
    justifyContent: 'flex-start',
  },
  gridIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gridTextContainer: {
    flex: 1,
  },
  gridItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  gridItemSubtitle: {
    fontSize: 13,
  },
  gridDecoration: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
  },
  decorationDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginLeft: 4,
    opacity: 0.5,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  seeAllButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  activityList: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 14,
  },
  activityProgress: {
    height: 2,
    borderRadius: 1,
    marginTop: 8,
    width: '100%',
  },
  activityProgressBar: {
    height: '100%',
    width: '80%',
    borderRadius: 1,
  },
  activityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  activityBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bookCarouselSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  bookCarouselHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookCarouselTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  bookCarouselContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  bookCard: {
    width: BOOK_CARD_WIDTH,
    height: 220,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  bookCardContent: {
    flex: 1,
    padding: 8,
    justifyContent: 'space-between',
    position: 'relative',
  },
  bookSpine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    zIndex: 1,
  },
  bookCover: {
    width: '100%',
    height: 140,
    borderRadius: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  bookInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  bookTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 3,
    lineHeight: 16,
  },
  bookSubtitle: {
    fontSize: 11,
    marginBottom: 8,
    opacity: 0.7,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  progressBar: {
    flex: 1,
    height: 2,
    borderRadius: 1,
    marginRight: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1,
  },
  progressText: {
    fontSize: 9,
    fontWeight: '600',
    minWidth: 20,
  },
  bookCarouselSkeleton: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
  },
  bookSkeletonItem: {
    width: BOOK_CARD_WIDTH,
    alignItems: 'center',
  },
  bookSkeletonCover: {
    width: BOOK_CARD_WIDTH - 10,
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
  },
  bookSkeletonTitle: {
    width: '80%',
    height: 16,
    borderRadius: 4,
    marginBottom: 4,
  },
  bookSkeletonSubtitle: {
    width: '60%',
    height: 12,
    borderRadius: 3,
  },
});

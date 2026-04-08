import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const OnboardingScreenStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  languageToggleContainer: {
    position: 'absolute',
    top: 12,
    right: 20,
    zIndex: 4,
  },
  listContent: {
    flexGrow: 1,
  },
  slide: {
    width: SCREEN_WIDTH - 40,
    flex: 1,
    justifyContent: 'space-evenly',
    paddingTop: 54,
    paddingBottom: 18,
  },
  imageCard: {
    width: '100%',
    height: '52%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.09,
    shadowRadius: 20,
    elevation: 6,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textBlock: {
    marginTop: 8,
    gap: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 22,
    color: '#0F4BD7',
    fontWeight: '700',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
  },
  bottomContainer: {
    paddingTop: 14,
    paddingBottom: 10,
  },
  progressDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 16,
    paddingLeft: 4,
  },
  progressDot: {
    width: 9,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  progressDotActive: {
    width: 24,
    backgroundColor: '#0F4BD7',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '600',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F4BD7',
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 22,
    minWidth: 170,
  },
  nextButtonText: {
    fontSize: 15,
    color: '#fff',
    marginRight: 6,
    fontWeight: '700',
  },
});

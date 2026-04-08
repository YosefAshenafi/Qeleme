import { StyleSheet } from 'react-native';

export const BookCoverStyles = StyleSheet.create({
  bookContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  bookContainerCompact: {
    marginBottom: 0,
  },
  selectedBook: {
    transform: [{ scale: 1.05 }],
  },
  disabledBook: {
    opacity: 0.5,
  },
  bookCover: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bookCoverCompact: {
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
  },
  bookSpine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  bookContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookIcon: {
    marginBottom: 12,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 18,
  },
  bookSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 8,
  },
  bookPages: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  bookShadow: {
    position: 'absolute',
    bottom: -5,
    left: 5,
    right: 5,
    height: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    zIndex: -1,
  },
});

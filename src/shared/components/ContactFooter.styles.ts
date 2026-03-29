import { StyleSheet } from 'react-native';

export const ContactFooterStyles = StyleSheet.create({
  contactFooter: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
    alignItems: 'center',
    width: '100%',
  },
  contactFooterTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contactFooterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 8,
  },
  contactFooterLink: {
    fontSize: 14,
    fontWeight: '500',
  },
  contactFooterSeparator: {
    fontSize: 14,
    marginHorizontal: 4,
  },
});

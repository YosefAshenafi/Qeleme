import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Animated } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AccountSettings } from '../components/profile/AccountSettings';
import { StudyHistory } from '../components/profile/StudyHistory';
import { Achievements } from '../components/profile/Achievements';
import { Notifications } from '../components/profile/Notifications';
import { HelpAndSupport } from '../components/profile/HelpAndSupport';
import { PrivacyPolicy } from '../components/profile/PrivacyPolicy';
import { TermsOfService } from '../components/profile/TermsOfService';
import { ThemeChooser } from '@/components/profile/ThemeChooser';
import { getColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';

interface AccordionItemProps {
  title: string;
  icon: IconSymbolName;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  colors: any;
}

type MenuItem = {
  title: string;
  icon: IconSymbolName;
  content?: React.ReactNode;
  action?: () => void;
};

const AccordionItem: React.FC<AccordionItemProps> = ({ title, icon, children, isOpen, onToggle, colors }) => {
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <View style={[styles.accordionItem, { backgroundColor: colors.card }]}>
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={onToggle}
      >
        <View style={styles.accordionHeaderLeft}>
          <IconSymbol name={icon} size={24} color={colors.tint} />
          <Text style={[styles.accordionTitle, { color: colors.text }]}>{title}</Text>
        </View>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <IconSymbol name="chevron.right" size={20} color={colors.text} />
        </Animated.View>
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.accordionContent}>
          {children}
        </View>
      )}
    </View>
  );
};

export default function ProfileScreen() {
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const profileData = {
    englishName: 'Yosef Ashenafi',
    email: 'yosefashenafi7@gmail.com',
    role: 'Student',
    grade: '12th Grade',
    school: 'Example High School',
    joinDate: 'January 2024',
  };

  const stats = [
    { label: 'MCQs Completed', value: '156', icon: 'questionmark.circle.fill' as const },
    { label: 'Flashcards Clicked', value: '89', icon: 'rectangle.stack.fill' as const },
    { label: 'Homework Questions', value: '45', icon: 'message.fill' as const },
    { label: 'Study Hours', value: '234', icon: 'clock.fill' as const },
  ];

  const menuItems: MenuItem[] = [
    { 
      title: 'Account Settings', 
      icon: 'person.fill' as const,
      content: <AccountSettings colors={colors} profileData={profileData} />
    },
    { 
      title: 'Study History', 
      icon: 'clock.fill' as const, 
      content: <StudyHistory colors={colors} />
    },
    { 
      title: 'Achievements', 
      icon: 'trophy.fill' as const, 
      content: <Achievements colors={colors} />
    },
    { 
      title: 'Theme Settings', 
      icon: 'sun.max.fill' as const, 
      content: <ThemeChooser colors={colors} />
    },
    { 
      title: 'Notifications', 
      icon: 'bell.fill' as const, 
      content: <Notifications colors={colors} />
    },
    { 
      title: 'Help & Support', 
      icon: 'questionmark.circle.fill' as const, 
      content: <HelpAndSupport colors={colors} />
    },
    { 
      title: 'Privacy Policy', 
      icon: 'lock.fill' as const, 
      content: <PrivacyPolicy colors={colors} />
    },
    { 
      title: 'Terms of Service', 
      icon: 'doc.text.fill' as const, 
      content: <TermsOfService colors={colors} />
    },
    { 
      title: 'Logout', 
      icon: 'rectangle.portrait.and.arrow.right' as const, 
      action: () => router.replace('/(auth)/login')
    },
  ];

  const handleAccordionToggle = (title: string) => {
    setOpenAccordion(openAccordion === title ? null : title);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" backgroundColor={colors.tint} />
      <View style={[styles.header, { backgroundColor: colors.tint }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.right" size={24} color={colors.background} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: colors.tint }]}>
          <View style={styles.profileImageContainer}>
            <Image
              source={require('@/assets/images/profile/YOSEF.jpeg')}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.profileEditButton}>
              <IconSymbol name="pencil.circle.fill" size={24} color={colors.background} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.englishName, { color: colors.background }]}>{profileData.englishName}</Text>
          <Text style={[styles.email, { color: colors.background }]}>{profileData.email}</Text>
          <View style={styles.roleContainer}>
            <Text style={[styles.role, { color: colors.background }]}>{profileData.role}</Text>
            <Text style={[styles.grade, { color: colors.background }]}>{profileData.grade}</Text>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={[styles.statCard, { backgroundColor: colors.card }]}>
              <IconSymbol name={stat.icon} size={24} color={colors.tint} />
              <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            item.action ? (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, { backgroundColor: colors.card }]}
                onPress={item.action}
              >
                <View style={styles.menuItemLeft}>
                  <IconSymbol name={item.icon} size={24} color={colors.tint} />
                  <Text style={[styles.menuItemText, { color: colors.text }]}>{item.title}</Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.text} />
              </TouchableOpacity>
            ) : (
              <AccordionItem
                key={index}
                title={item.title}
                icon={item.icon}
                isOpen={openAccordion === item.title}
                onToggle={() => handleAccordionToggle(item.title)}
                colors={colors}
              >
                {item.content}
              </AccordionItem>
            )
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: 50,
  },
  scrollView: {
    flex: 1,
  },
  backButton: {
    padding: 5,
  },
  profileHeader: {
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'white',
  },
  profileEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  englishName: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    marginBottom: 10,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  role: {
    fontSize: 16,
    fontWeight: '500',
  },
  grade: {
    fontSize: 16,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    gap: 15,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    gap: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  menuContainer: {
    padding: 15,
    gap: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  accordionItem: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  accordionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  accordionContent: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
}); 
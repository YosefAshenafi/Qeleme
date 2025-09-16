import { StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, View, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Markdown from 'react-native-markdown-display';

import { Header } from '@/components/Header';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { getChatCompletion, imageToBase64, type ChatMessage } from '@/utils/openai';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  imageUri?: string;
};

type RecentActivity = {
  type: string;
  grade: string;
  subject: string;
  chapter: string;
  timestamp: number;
  details: string;
  status: string;
};

// Function to check if text contains markdown
const containsMarkdown = (text: string): boolean => {
  const markdownPatterns = [
    /^#{1,6}\s/, // Headers
    /\*\*.*\*\*/, // Bold
    /\*.*\*/, // Italic
    /`.*`/, // Inline code
    /```[\s\S]*```/, // Code blocks
    /^[-*+]\s/, // Bullet lists
    /^\d+\.\s/, // Numbered lists
    /^>\s/, // Blockquotes
    /\[.*\]\(.*\)/, // Links
    /^\|.*\|$/, // Tables
    /^---$/, // Horizontal rules
  ];
  
  return markdownPatterns.some(pattern => pattern.test(text));
};

// Custom Markdown Renderer Component
const MarkdownRenderer = ({ text, isUser, colors }: { text: string; isUser: boolean; colors: any }) => {
  const markdownStyles = {
    body: {
      color: isUser ? '#fff' : colors.text,
      fontSize: 16,
      lineHeight: 24,
    },
    heading1: {
      color: isUser ? '#fff' : colors.text,
      fontSize: 24,
      fontWeight: 'bold' as const,
      marginTop: 16,
      marginBottom: 8,
    },
    heading2: {
      color: isUser ? '#fff' : colors.text,
      fontSize: 20,
      fontWeight: 'bold' as const,
      marginTop: 12,
      marginBottom: 6,
    },
    heading3: {
      color: isUser ? '#fff' : colors.text,
      fontSize: 18,
      fontWeight: 'bold' as const,
      marginTop: 10,
      marginBottom: 5,
    },
    heading4: {
      color: isUser ? '#fff' : colors.text,
      fontSize: 16,
      fontWeight: 'bold' as const,
      marginTop: 8,
      marginBottom: 4,
    },
    heading5: {
      color: isUser ? '#fff' : colors.text,
      fontSize: 14,
      fontWeight: 'bold' as const,
      marginTop: 6,
      marginBottom: 3,
    },
    heading6: {
      color: isUser ? '#fff' : colors.text,
      fontSize: 12,
      fontWeight: 'bold' as const,
      marginTop: 4,
      marginBottom: 2,
    },
    paragraph: {
      color: isUser ? '#fff' : colors.text,
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 8,
    },
    strong: {
      fontWeight: 'bold' as const,
      color: isUser ? '#fff' : colors.text,
    },
    em: {
      fontStyle: 'italic' as const,
      color: isUser ? '#fff' : colors.text,
    },
    code_inline: {
      backgroundColor: isUser ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
      color: isUser ? '#fff' : colors.text,
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
      fontFamily: 'monospace',
      fontSize: 14,
    },
    code_block: {
      backgroundColor: isUser ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      color: isUser ? '#fff' : colors.text,
      padding: 12,
      borderRadius: 8,
      fontFamily: 'monospace',
      fontSize: 14,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: isUser ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: isUser ? 'rgba(255, 255, 255, 0.3)' : colors.tint,
      paddingLeft: 12,
      marginVertical: 8,
      backgroundColor: isUser ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
      paddingVertical: 8,
      paddingRight: 8,
    },
    bullet_list: {
      marginVertical: 8,
    },
    ordered_list: {
      marginVertical: 8,
    },
    list_item: {
      color: isUser ? '#fff' : colors.text,
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 4,
    },
    link: {
      color: isUser ? '#87CEEB' : colors.tint,
      textDecorationLine: 'underline' as const,
    },
    table: {
      borderWidth: 1,
      borderColor: isUser ? 'rgba(255, 255, 255, 0.2)' : colors.border,
      borderRadius: 8,
      marginVertical: 8,
    },
    thead: {
      backgroundColor: isUser ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    },
    th: {
      color: isUser ? '#fff' : colors.text,
      fontWeight: 'bold' as const,
      padding: 8,
      borderBottomWidth: 1,
      borderBottomColor: isUser ? 'rgba(255, 255, 255, 0.2)' : colors.border,
    },
    td: {
      color: isUser ? '#fff' : colors.text,
      padding: 8,
      borderBottomWidth: 1,
      borderBottomColor: isUser ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    },
    hr: {
      backgroundColor: isUser ? 'rgba(255, 255, 255, 0.2)' : colors.border,
      height: 1,
      marginVertical: 16,
    },
    fence: {
      backgroundColor: isUser ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      color: isUser ? '#fff' : colors.text,
      padding: 12,
      borderRadius: 8,
      fontFamily: 'monospace',
      fontSize: 14,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: isUser ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
    },
  };

  // If no markdown detected, render as plain text for better performance
  if (!containsMarkdown(text)) {
    return (
      <ThemedText style={{
        color: isUser ? '#fff' : colors.text,
        fontSize: 16,
        lineHeight: 24,
      }}>
        {text}
      </ThemedText>
    );
  }

  return (
    <Markdown style={markdownStyles}>
      {text}
    </Markdown>
  );
};

export default function HomeworkScreen() {
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const dotAnimation = useRef(new Animated.Value(0)).current;

  // Add animation sequence for thinking dots
  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnimation, {
            toValue: 3,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnimation, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      dotAnimation.setValue(0);
    }
  }, [isLoading]);

  // Add function to scroll to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100); // Small delay to ensure content is rendered
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      allowsMultipleSelection: false,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSend = async () => {
    if ((!inputText.trim() && !selectedImage) || isLoading) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      imageUri: selectedImage || undefined,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setSelectedImage(null);
    Keyboard.dismiss();
    scrollToBottom(); // Scroll to bottom when user sends a message

    try {
      setIsLoading(true);

      // Prepare the message content for the API
      const messageContent: ChatMessage['content'] = [];
      
      if (inputText.trim()) {
        messageContent.push({
          type: 'text',
          text: inputText.trim()
        });
      }

      if (selectedImage) {
        const base64Image = await imageToBase64(selectedImage);
        messageContent.push({
          type: 'image_url',
          image_url: {
            url: `data:image/jpeg;base64,${base64Image}`
          }
        });
      }

      const apiMessages: ChatMessage[] = [
        {
          role: 'system',
          content: 'You are a helpful homework assistant. Provide clear, educational explanations and guide students to understand concepts rather than just giving answers. Use markdown formatting to make your responses more readable and organized. Use headings (###), bold text (**bold**), italic text (*italic*), code blocks (```), bullet points (-), and numbered lists (1.) to structure your responses clearly.'
        },
        {
          role: 'user',
          content: messageContent
        }
      ];

      const response = await getChatCompletion(apiMessages);

      if (response) {
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.content as string,
          isUser: false,
        };
        setMessages(prev => [...prev, responseMessage]);
        scrollToBottom(); // Scroll to bottom when receiving response

        // Track homework activity
        const trackActivity = async () => {
          try {
            const activity: RecentActivity = {
              type: 'homework',
              grade: 'grade-12', // You might want to make this dynamic based on user's grade
              subject: 'General', // You might want to make this dynamic based on the subject
              chapter: 'Homework Help',
              timestamp: Date.now(),
              details: 'Asked a homework question',
              status: 'Completed'
            };
            
            // Get existing activities
            const existingActivities = await AsyncStorage.getItem('recentActivities');
            let activities: RecentActivity[] = [];
            
            if (existingActivities) {
              activities = JSON.parse(existingActivities);
            }
            
            // Add new activity and keep only last 20
            activities.unshift(activity);
            if (activities.length > 20) {
              activities = activities.slice(0, 20);
            }
            
            // Save updated activities
            await AsyncStorage.setItem('recentActivities', JSON.stringify(activities));
          } catch (error) {
            // Silently fail - activity tracking is not critical
          }
        };
        
        trackActivity();
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
      };
      setMessages(prev => [...prev, errorMessage]);
      scrollToBottom(); // Scroll to bottom when showing error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <ThemedText style={styles.headerTitle}>Homework Help</ThemedText>
      </View>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
          <ScrollView 
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={true}
            bounces={true}
            alwaysBounceVertical={true}
            overScrollMode="always"
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.messagesWrapper}>
              {messages.length === 0 && (
                <ThemedView style={[styles.emptyStateContainer, { backgroundColor: colors.background }]}>
                  <ThemedText style={[styles.emptyStateText, { color: colors.text }]}>
                    Ask me anything about your homework! Also take a picture of your homework and let's work together.
                  </ThemedText>
                </ThemedView>
              )}
              {messages.map((message) => (
                <ThemedView 
                  key={message.id} 
                  style={[
                    styles.messageContainer,
                    message.isUser 
                      ? [styles.userMessage, { backgroundColor: colors.tint }]
                      : [styles.botMessage, { backgroundColor: colors.cardAlt }]
                  ]}
                >
                  {message.imageUri && (
                    <Image 
                      source={{ uri: message.imageUri }} 
                      style={styles.messageImage}
                      resizeMode="cover"
                    />
                  )}
                  <MarkdownRenderer 
                    text={message.text}
                    isUser={message.isUser}
                    colors={colors}
                  />
                </ThemedView>
              ))}
              {isLoading && (
                <ThemedView style={[styles.messageContainer, styles.botMessage, { backgroundColor: colors.cardAlt }]}>
                  <View style={styles.thinkingContainer}>
                    <ThemedText style={[styles.messageText, { color: colors.text }]}>
                      Thinking
                    </ThemedText>
                    <Animated.View style={styles.dotsContainer}>
                      {[0, 1, 2].map((i) => (
                        <Animated.Text
                          key={i}
                          style={[
                            styles.dot,
                            {
                              opacity: dotAnimation.interpolate({
                                inputRange: [i, i + 1],
                                outputRange: [0, 1],
                                extrapolate: 'clamp',
                              }),
                              color: colors.text
                            },
                          ]}
                        >
                          .
                        </Animated.Text>
                      ))}
                    </Animated.View>
                  </View>
                </ThemedView>
              )}
            </View>
          </ScrollView>

          {selectedImage && (
            <ThemedView style={[styles.selectedImagePreviewContainer, { backgroundColor: colors.cardAlt }]}>
              <Image 
                source={{ uri: selectedImage }} 
                style={styles.selectedImagePreview} 
                resizeMode="cover"
              />
              <TouchableOpacity 
                style={[styles.removeImageButton, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
                onPress={() => setSelectedImage(null)}
              >
                <IconSymbol name="xmark.circle.fill" size={24} color="#fff" />
              </TouchableOpacity>
            </ThemedView>
          )}

          <ThemedView style={[styles.inputContainer, { 
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          }]}>
            <TextInput
              ref={inputRef}
              style={[styles.input, { 
                backgroundColor: colors.cardAlt,
                color: colors.text,
                borderColor: colors.border,
                borderWidth: 1,
              }]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask your homework question..."
              placeholderTextColor={isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
              multiline
              editable={!isLoading}
            />
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[
                  styles.imageButton, 
                  { backgroundColor: colors.cardAlt },
                  isLoading && { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)' }
                ]}
                onPress={pickImage}
                disabled={isLoading}
              >
                <IconSymbol 
                  name="photo" 
                  size={24} 
                  color={isLoading 
                    ? (isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)') 
                    : colors.tint
                  } 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.sendButton,
                  { backgroundColor: colors.tint },
                  ((!inputText.trim() && !selectedImage) || isLoading) && {
                    backgroundColor: isDarkMode ? 'rgba(107, 84, 174, 0.3)' : 'rgba(107, 84, 174, 0.5)'
                  }
                ]}
                onPress={handleSend}
                disabled={!inputText.trim() && !selectedImage || isLoading}
              >
                <IconSymbol 
                  name="paperplane.fill" 
                  size={24} 
                  color={((!inputText.trim() && !selectedImage) || isLoading)
                    ? (isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.8)')
                    : '#fff'
                  } 
                />
              </TouchableOpacity>
            </View>
          </ThemedView>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    flexGrow: 1,
  },
  messagesWrapper: {
    padding: 16,
    gap: 16,
    paddingBottom: 100,
  },
  messageContainer: {
    maxWidth: '85%',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    width: 'auto',
  },
  userMessage: {
    alignSelf: 'flex-end',
    minWidth: 100,
  },
  botMessage: {
    alignSelf: 'flex-start',
    minWidth: 100,
  },
  messageText: {
    fontSize: 16,
    flexShrink: 1,
  },
  messageImage: {
    width: 250,
    height: 200,
    borderRadius: 8,
    alignSelf: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    marginBottom: 70,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  imageButton: {
    padding: 8,
    borderRadius: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    padding: 12,
    borderRadius: 20,
    fontSize: 16,
    marginBottom: 8,
  },
  sendButton: {
    padding: 8,
    borderRadius: 8,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
  selectedImagePreviewContainer: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedImagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 12,
    padding: 4,
  },
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginLeft: 2,
  },
  dot: {
    fontSize: 16,
    marginHorizontal: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 
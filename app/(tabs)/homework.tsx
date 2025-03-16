import { StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, View, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';

import { Header } from '@/components/Header';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { getChatCompletion, imageToBase64, type ChatMessage } from '@/utils/openai';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  imageUri?: string;
};

export default function HomeworkScreen() {
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
          content: 'You are a helpful homework assistant. Provide clear, educational explanations and guide students to understand concepts rather than just giving answers.'
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
      }
    } catch (error) {
      console.error('Error getting chat completion:', error);
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
    <SafeAreaView style={styles.safeArea}>
      <Header title="Homework Help" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ThemedView style={styles.container}>
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
                <ThemedView style={styles.emptyStateContainer}>
                  <ThemedText style={styles.emptyStateText}>
                    Ask me anything about your homework!
                  </ThemedText>
                </ThemedView>
              )}
              {messages.map((message) => (
                <ThemedView 
                  key={message.id} 
                  style={[
                    styles.messageContainer,
                    message.isUser ? styles.userMessage : styles.botMessage
                  ]}
                >
                  {message.imageUri && (
                    <Image 
                      source={{ uri: message.imageUri }} 
                      style={styles.messageImage}
                      resizeMode="cover"
                    />
                  )}
                  <ThemedText style={[
                    styles.messageText,
                    message.isUser ? styles.userMessageText : styles.botMessageText
                  ]}>
                    {message.text}
                  </ThemedText>
                </ThemedView>
              ))}
              {isLoading && (
                <ThemedView style={[styles.messageContainer, styles.botMessage]}>
                  <View style={styles.thinkingContainer}>
                    <ThemedText style={[styles.messageText, styles.botMessageText]}>
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
            <ThemedView style={styles.selectedImagePreviewContainer}>
              <Image 
                source={{ uri: selectedImage }} 
                style={styles.selectedImagePreview} 
                resizeMode="cover"
              />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => setSelectedImage(null)}
              >
                <IconSymbol name="questionmark.circle.fill" size={24} color="#fff" />
              </TouchableOpacity>
            </ThemedView>
          )}

          <ThemedView style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask your homework question..."
              placeholderTextColor="#999"
              multiline
              editable={!isLoading}
            />
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.imageButton, isLoading && styles.buttonDisabled]}
                onPress={pickImage}
                disabled={isLoading}
              >
                <IconSymbol name="photo" size={24} color={isLoading ? "#999" : "#6B54AE"} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.sendButton,
                  ((!inputText.trim() && !selectedImage) || isLoading) && styles.sendButtonDisabled
                ]}
                onPress={handleSend}
                disabled={!inputText.trim() && !selectedImage || isLoading}
              >
                <IconSymbol 
                  name="paperplane.fill" 
                  size={24} 
                  color={inputText.trim() || selectedImage ? "#fff" : "#999"} 
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
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    paddingBottom: 100, // Add padding to account for input container
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    width: 'auto',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#6B54AE',
    minWidth: 100,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3E5F5',
    minWidth: 100,
  },
  messageText: {
    fontSize: 16,
    flexShrink: 1,
  },
  userMessageText: {
    color: '#fff',
  },
  botMessageText: {
    color: '#333',
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
    borderTopColor: '#E0E0E0',
    backgroundColor: '#fff',
    marginBottom: 70,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  imageButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3E5F5',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    padding: 12,
    borderRadius: 20,
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  sendButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#6B54AE',
  },
  sendButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  buttonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    color: '#333',
    marginHorizontal: 1,
  },
}); 
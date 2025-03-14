import { StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, View, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';

import { Header } from '@/components/Header';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

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
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

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

  const handleSend = () => {
    if (!inputText.trim() && !selectedImage) return;

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

    // Scroll to bottom
    scrollViewRef.current?.scrollToEnd({ animated: true });

    // TODO: Send to backend and get response
    // For now, just add a mock response
    setTimeout(() => {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm here to help you with your homework! What would you like to know?",
        isUser: false,
      };
      setMessages(prev => [...prev, responseMessage]);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Homework Help" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView 
          behavior={undefined}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={0}
        >
          <ThemedView style={styles.container}>
            <ScrollView 
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
            >
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
            </ScrollView>

            <ThemedView style={styles.inputContainer}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask your homework question..."
                placeholderTextColor="#999"
                multiline
              />
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.imageButton}
                  onPress={pickImage}
                >
                  <IconSymbol name="photo" size={24} color="#6B54AE" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.sendButton,
                    (!inputText.trim() && !selectedImage) && styles.sendButtonDisabled
                  ]}
                  onPress={handleSend}
                  disabled={!inputText.trim() && !selectedImage}
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
      </TouchableWithoutFeedback>
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
    padding: 16,
    gap: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#6B54AE',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3E5F5',
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: '#fff',
  },
  botMessageText: {
    color: '#333',
  },
  messageImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
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
}); 
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ref, push, onChildAdded } from 'firebase/database';
import { db } from '../configs/firebaseConfig';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const ChatScreen = () => {
  const route = useRoute();
  const { senderId, receiverId } = route.params;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const flatListRef = useRef(null);

  const chatPath = `chats/${senderId}_${receiverId}`;

  useEffect(() => {
    const chatRef = ref(db, chatPath);

    const unsubscribe = onChildAdded(chatRef, (snapshot) => {
      const msg = snapshot.val();
      setMessages((prev) => [...prev, msg]);

      // Auto scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => unsubscribe();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const chatRef = ref(db, chatPath);
    await push(chatRef, {
      senderId,
      message: input,
      timestamp: Date.now(),
    });

    setInput('');
  };

  const renderItem = ({ item }) => {
    const isMine = item.senderId === senderId;

    return (
      <View
        style={[
          styles.messageWrapper,
          isMine ? styles.myWrapper : styles.theirWrapper,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMine ? styles.myMessage : styles.theirMessage,
          ]}
        >
          <Text style={isMine ? styles.myText : styles.theirText}>{item.message}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.messageList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Nhắn gì đó..."
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Ionicons name="send" size={22} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  messageList: {
    padding: 10,
    paddingBottom: 20,
  },
  messageWrapper: {
    marginVertical: 6,
    flexDirection: 'row',
  },
  myWrapper: {
    justifyContent: 'flex-end',
  },
  theirWrapper: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    maxWidth: '75%',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  myMessage: {
    backgroundColor: '#4F46E5',
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    backgroundColor: '#E5E7EB',
    borderBottomLeftRadius: 4,
  },
  myText: {
    color: '#fff',
    fontSize: 16,
  },
  theirText: {
    color: '#111827',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    fontSize: 16,
    marginRight: 10,
    color: '#111827',
  },
  sendButton: {
    backgroundColor: '#4F46E5',
    padding: 10,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

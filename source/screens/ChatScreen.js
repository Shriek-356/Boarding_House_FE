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
  Image,
} from 'react-native';
import { ref, push, onChildAdded, update } from 'firebase/database';
import { db } from '../configs/firebaseConfig';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const ChatScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { sender, receiver } = route.params;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const flatListRef = useRef(null);

  const chatPath = `chats/${sender.id}_${receiver.id}`;

  useEffect(() => {
    const chatRef = ref(db, chatPath);
    const unsubscribe = onChildAdded(chatRef, (snapshot) => {
      const msg = snapshot.val();
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 99999, animated: true });
      }, 100);
    });
    return () => unsubscribe();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    const now = Date.now();
    const chatRef = ref(db, chatPath);
    await push(chatRef, {
      senderId: sender.id,
      message: input,
      timestamp: now,
    });

    // update chatRooms for both users
    const updates = {};
    updates[`/chatRooms/${sender.id}/${receiver.id}`] = {
      firstname: receiver.firstname,
      lastname: receiver.lastname,
      avatar: receiver.avatar,
      lastMessage: input,
      timestamp: now,
    };
    updates[`/chatRooms/${receiver.id}/${sender.id}`] = {
      firstname: sender.firstname,
      lastname: sender.lastname,
      avatar: sender.avatar,
      lastMessage: input,
      timestamp: now,
    };
    await update(ref(db), updates);

    setInput('');
  };

  const renderItem = ({ item }) => {
    const isMine = item.senderId === sender.id;
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
          <>
            <Text style={isMine ? styles.myText : styles.theirText}>{item.message}</Text>
            <Text style={styles.timestamp}>
              {new Date(item.timestamp).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>

        <View style={styles.receiverInfo}>
          <Image
            source={{ uri: receiver.avatar || 'https://placehold.co/40x40?text=U' }}
            style={styles.avatar}
          />
          <Text style={styles.receiverName}>{`${receiver.firstname} ${receiver.lastname}`}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
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
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 6,
    marginRight: 10,
  },
  receiverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  receiverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  messageList: {
    paddingHorizontal: 12,
    paddingVertical: 16,
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
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    maxWidth: '75%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  myMessage: {
    backgroundColor: '#6366F1',
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    backgroundColor: '#E5E7EB',
    borderBottomLeftRadius: 4,
  },
  myText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
  },
  theirText: {
    color: '#111827',
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 12,
    color: '#D1D5DB',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    paddingHorizontal: 16,
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

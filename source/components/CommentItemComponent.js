import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity } from 'react-native';
import moment from 'moment';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
const CommentItemComponent = ({ comment, level = 0, onReplySubmit }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const { user } = useContext(AuthContext);

  const handleReply = () => {
    if (!replyText.trim()) return;
    const reply = {
      id: Math.random().toString(), // fake ID
      content: replyText,
      createdAt: new Date().toISOString(),
      user: {
        username: 'Bạn', // giả định người dùng hiện tại
        avatar: user.avatar,
      },
      replies: [],
    };
    onReplySubmit(comment.id, reply);
    setReplyText('');
    setShowReplyInput(false);
  };

  return (
    <View style={[styles.commentContainer, { marginLeft: level * 16 }]}>
      <View style={styles.commentHeader}>
        {comment.user?.avatar && (
          <Image source={{ uri: comment.user.avatar }} style={styles.avatar} />
        )}
        <Text style={styles.username}>{comment.user?.username || 'Ẩn danh'}</Text>
        <Text style={styles.time}> • {moment(comment.createdAt).fromNow()}</Text>
      </View>
      <Text style={styles.content}>{comment.content}</Text>

      <TouchableOpacity onPress={() => setShowReplyInput(!showReplyInput)}>
        <Text style={styles.replyBtn}>Phản hồi</Text>
      </TouchableOpacity>

      {showReplyInput && (
        <View style={styles.replyBox}>
          <TextInput
            value={replyText}
            onChangeText={setReplyText}
            placeholder="Nhập phản hồi..."
            style={styles.input}
          />
          <TouchableOpacity onPress={handleReply} style={styles.sendBtn}>
            <Text style={styles.sendText}>Gửi</Text>
          </TouchableOpacity>
        </View>
      )}

      {comment.replies?.map((reply) => (
        <CommentItemComponent
          key={reply.id}
          comment={reply}
          level={level + 1}
          onReplySubmit={onReplySubmit}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  commentContainer: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#f4f4f4',
    borderRadius: 8,
  },
  commentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  avatar: { width: 24, height: 24, borderRadius: 12, marginRight: 8 },
  username: { fontWeight: '600', color: '#333' },
  time: { color: '#666', fontSize: 12, marginLeft: 4 },
  content: { fontSize: 14, color: '#222', marginTop: 2 },
  replyBtn: { color: '#6C5CE7', marginTop: 4 },
  replyBox: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    backgroundColor: '#fff',
  },
  sendBtn: {
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  sendText: { color: '#fff' },
});

export default CommentItemComponent;

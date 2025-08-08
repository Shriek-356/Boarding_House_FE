import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity } from 'react-native';
import moment from 'moment';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { getToken } from '../api/axiosClient';
import { addPostCommentResponse } from '../api/postCommentApi';
const CommentItemComponent = ({ comment, level = 0, onReplySubmit, postId }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const { user } = useContext(AuthContext);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const loadToken = async () => {
      const token = await getToken();
      setToken(token);
    };
    loadToken();
  }, []);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      const replyData = {
        postId: postId, // hoặc truyền vào qua props
        content: replyText,
        parentCommentId: comment.id,
      };
      console.log(replyData);
      const response = await addPostCommentResponse(replyData, token);
      console.log(response);
      const reply = {
        id: response.id, // fake ID
        content: replyText,
        createdAt: new Date().toISOString(),
        user: {
          username: 'Bạn', // giả định người dùng hiện tạiasdasd
          avatar: user.avatar,
        },
        replies: [],
      };
      onReplySubmit(comment.id, reply);
      setReplyText('');
      setShowReplyInput(false);
    } catch (err) {
      console.log(err);
    }
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

      {/* Nho truyen theo postId cho phan de quy cua comment */}
      {comment.replies?.map((reply) => (
        <CommentItemComponent
          key={reply.id}
          comment={reply}
          level={level + 1}
          onReplySubmit={onReplySubmit}
          postId={postId}
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

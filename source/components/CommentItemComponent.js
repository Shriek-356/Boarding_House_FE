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
    <View style={[styles.wrap, { marginLeft: level * 14 }]}>
      {level > 0 && <View style={styles.levelBar} />}

      <View style={styles.commentCard}>
        <View style={styles.headerRow}>
          {comment.user?.avatar && (
            <Image source={{ uri: comment.user.avatar }} style={styles.avatar} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{comment.user?.username || 'Ẩn danh'}</Text>
            <Text style={styles.time}>{moment(comment.createdAt).fromNow()}</Text>
          </View>

          {/* nút reply dạng link vẫn giữ */}
        </View>

        <Text style={styles.content}>{comment.content}</Text>

        <TouchableOpacity onPress={() => setShowReplyInput(!showReplyInput)}>
          <Text style={styles.replyLink}>Phản hồi</Text>
        </TouchableOpacity>

        {showReplyInput && (
          <View style={styles.replyRow}>
            <TextInput
              value={replyText}
              onChangeText={setReplyText}
              placeholder="Nhập phản hồi…"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
            <TouchableOpacity onPress={handleReply} style={styles.sendBtn} activeOpacity={0.9}>
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
            postId={postId}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginBottom: 12, position: 'relative' },

  levelBar: {
    position: 'absolute', left: -8, top: 12, bottom: 12,
    width: 2, backgroundColor: '#E5E7EB', borderRadius: 2,
  },

  commentCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  avatar: {
    width: 30, height: 30, borderRadius: 15, marginRight: 8,
    backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#EEF2F7',
  },
  name: { fontWeight: '700', color: '#1F2937', fontSize: 14 },
  time: { color: '#6B7280', fontSize: 12 },

  content: { fontSize: 14, color: '#111827', lineHeight: 20, marginTop: 2 },

  replyLink: { color: '#0066FF', marginTop: 8, fontWeight: '600', fontSize: 13 },

  replyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  input: {
    flex: 1, borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 22, paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: '#F9FAFB', color: '#111827',
  },
  sendBtn: {
    backgroundColor: '#0066FF', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20,
  },
  sendText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});

export default CommentItemComponent;

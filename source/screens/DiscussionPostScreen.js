import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import moment from 'moment';
import 'moment/locale/vi';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRoute, useNavigation } from '@react-navigation/native';

import CommentItemComponent from '../components/CommentItemComponent';
import { getPostComments, addPostComment } from '../api/postCommentApi';
import { AuthContext } from '../contexts/AuthContext';
import { getToken } from '../api/axiosClient';
import { addPostCommentResponse } from '../api/postCommentApi';

moment.locale('vi');

const DiscussionPostScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { post } = route.params;
  const { user } = useContext(AuthContext);

  const [comments, setComments] = useState(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      const cmts = await getPostComments(post.id);
      setComments(cmts || []);
    };
    const loadToken = async () => {
      const t = await getToken();
      setToken(t);
    };
    loadToken();
    fetchComments();
  }, [post.id]);

  const handleReplySubmit = (parentId, reply) => {
    const addRecursively = (nodes) =>
      nodes.map((node) => {
        if (node.id === parentId) {
          return { ...node, replies: [...(node.replies || []), reply] };
        }
        if (node.replies?.length) {
          return { ...node, replies: addRecursively(node.replies) };
        }
        return node;
      });
    setComments((prev) => addRecursively(prev));
  };

  const handleAddComment = async () => {
    if (!newCommentText.trim()) return;
    try {
      const res = await addPostComment({ postId: post.id, content: newCommentText }, token);
      const newCmt = {
        id: res.id,
        content: res.content,
        createdAt: res.createdAt,
        user: { username: 'Bạn', avatar: user?.avatar },
        replies: [],
      };
      setComments((prev) => [newCmt, ...(prev || [])]);
      setNewCommentText('');
    } catch (e) {
      console.log(e);
    }
  };

  const onReplySubmit = async (parentId, replyText) => {
    const res = await addPostCommentResponse(
      { postId: post.id, content: replyText, parentCommentId: parentId },
      token
    );
    const reply = {
      id: res.id,
      content: res.content,
      createdAt: res.createdAt,
      user: { username: 'Bạn', avatar: user?.avatar },
      replies: [],
    };
    handleReplySubmit(parentId, reply); // chèn vào cây
  };

  const HeaderCard = () => (
    <View style={styles.postCard}>
      {/* Tiêu đề */}
      <Text style={styles.title}>{post.title}</Text>

      {/* Author */}
      <View style={styles.authorRow}>
        <Image
          source={{ uri: post.user?.avatar || 'https://i.pravatar.cc/100?img=12' }}
          style={styles.authorAvatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.authorName}>{post.user?.username || 'Ẩn danh'}</Text>
          <Text style={styles.metaTime}>{moment(post.createdAt).fromNow()}</Text>
        </View>
      </View>

      {/* Nội dung */}
      <Text style={styles.sectionLabel}>Nội dung</Text>
      <Text style={styles.description}>{post.description}</Text>

      {/* Chips phụ (tự ẩn nếu rỗng) */}
      {(post.addressRange || post.priceRange) && (
        <View style={styles.chipsRow}>
          {post.addressRange ? (
            <View style={styles.chip}>
              <Text style={styles.chipText}>📍 {post.addressRange}</Text>
            </View>
          ) : null}
          {post.priceRange ? (
            <View style={styles.chip}>
              <Text style={styles.chipText}>💰 {post.priceRange}</Text>
            </View>
          ) : null}
        </View>
      )}

      <Text style={styles.commentHeader}>Bình luận</Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FB' }}>
      {/* Header app bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bài thảo luận của {post.user?.username || 'Ẩn danh'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        ListHeaderComponent={<HeaderCard />}
        data={comments || []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <CommentItemComponent
            comment={item}
            onReplySubmit={onReplySubmit}
            postId={post.id}
          />
        )}
        ListFooterComponent={
          <View style={styles.footerInput}>
            <TextInput
              value={newCommentText}
              onChangeText={setNewCommentText}
              placeholder="Nhập bình luận..."
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
            <TouchableOpacity onPress={handleAddComment} style={styles.sendBtn} activeOpacity={0.9}>
              <Text style={styles.sendText}>Gửi</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // màn hình
  container: { padding: 16, backgroundColor: '#F5F7FB' },

  // header bar
  header: {
    backgroundColor: '#0066FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
  },
  backBtn: { padding: 6, borderRadius: 999 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  // card bài viết
  postCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEF1F6',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 24,
    marginBottom: 8,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F8',
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#EEF1F6',
  },
  authorName: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  metaTime: { fontSize: 12, color: '#6B7280' },

  sectionLabel: { fontWeight: '800', color: '#111827', marginTop: 6, marginBottom: 6 },
  description: { fontSize: 15, color: '#1F2937', lineHeight: 22 },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F1F5FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DCE6FF',
  },
  chipText: { fontSize: 13, color: '#3B5BDB', fontWeight: '600' },

  commentHeader: { fontWeight: '800', fontSize: 18, marginTop: 14, color: '#111827' },

  // input bình luận
  footerInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingBottom: 40,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    color: '#111827',
  },
  sendBtn: {
    backgroundColor: '#0066FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    marginLeft: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  sendText: { color: '#fff', fontWeight: '700' },
});

export default DiscussionPostScreen;

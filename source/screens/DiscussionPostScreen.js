import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import moment from 'moment';
import CommentItemComponent from '../components/CommentItemComponent';
import { getPostComments } from '../api/postCommentApi';
import { useEffect, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { addPostComment } from '../api/postCommentApi';
import { getToken } from '../api/axiosClient';

const DiscussionPostScreen = () => {
  const route = useRoute();
  const { post } = route.params;
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [token,setToken] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      const comments = await getPostComments(post.id);
      console.log(comments);
      setComments(comments);
    };

    const loadToken = async () => {
      const token = await getToken();
      setToken(token);
    };
    loadToken();
    fetchComments();
  }, [])


  const handleReplySubmit = (parentId, reply) => {
    const recursiveAdd = (nodes) =>
      nodes.map((node) => {
        if (node.id === parentId) {
          return { ...node, replies: [...(node.replies || []), reply] };
        } else if (node.replies?.length > 0) {
          return { ...node, replies: recursiveAdd(node.replies) };
        }
        return node;
      });

    setComments((prev) => recursiveAdd(prev));
  };

  const handleAddComment = async () => {
    if (!newCommentText.trim()) return;
    try {
      console.log(token);
      const response = await addPostComment({ postId: post.id, content: newCommentText },token);
      const newComment = {
        id: response.id,
        content: response.content,
        createdAt: response.createdAt,
        user: { username: 'Bạn', avatar: user.avatar },
        replies: [],
      };
      setComments((prev) => [newComment, ...prev]);
      setNewCommentText('');
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <FlatList
      ListHeaderComponent={
        <View style={styles.headerContainer}>
          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.meta}>
            Người đăng: {post.user?.username || 'Ẩn danh'} •{' '}
            {moment(post.createdAt).fromNow()}
          </Text>
          <Text style={styles.label}>Nội dung:</Text>
          <Text style={styles.description}>{post.description}</Text>
          <Text style={styles.label}>
            Địa chỉ:{' '}
            <Text style={styles.normal}>
              {post.addressRange || 'Không rõ'}
            </Text>
          </Text>
          <Text style={styles.label}>
            Giá: <Text style={styles.normal}>{post.priceRange || 'Không rõ'}</Text>
          </Text>
          <Text style={styles.commentHeader}>Bình luận:</Text>
        </View>
      }
      data={comments}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <CommentItemComponent comment={item} onReplySubmit={handleReplySubmit} postId={post.id} />
      )}
      ListFooterComponent={
        <View style={styles.footerInput}>
          <TextInput
            value={newCommentText}
            onChangeText={setNewCommentText}
            placeholder="Nhập bình luận..."
            style={styles.input}
          />
          <TouchableOpacity onPress={handleAddComment} style={styles.sendBtn}>
            <Text style={styles.sendText}>Gửi</Text>
          </TouchableOpacity>
        </View>
      }
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  headerContainer: { marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  meta: { color: '#666', marginBottom: 10 },
  label: { fontWeight: '600', marginTop: 10 },
  normal: { fontWeight: '400' },
  description: { fontSize: 16, marginBottom: 12 },
  commentHeader: { fontWeight: 'bold', fontSize: 18, marginTop: 16, marginBottom: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
  },
  sendBtn: {
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 6,
  },
  sendText: { color: '#fff', fontWeight: '600' },
  footerInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingBottom: 40,
  },
});

export default DiscussionPostScreen;

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import moment from 'moment';

const DiscussionPostScreen = () => {
  const route = useRoute();
  const { postId } = route.params;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPostDetail();
  }, []);

  const fetchPostDetail = async () => {
    try {
      const response = await axios.get(`https://your-api.com/api/posts/${postId}`);
      setPost(response.data);
    } catch (error) {
      console.error('Failed to fetch post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loading} />;
  }

  if (!post) {
    return <Text style={styles.errorText}>Bài thảo luận không tồn tại.</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.meta}>
        Người đăng: {post.user?.username || 'Ẩn danh'} • {moment(post.createdAt).fromNow()}
      </Text>

      <Text style={styles.label}>Nội dung:</Text>
      <Text style={styles.description}>{post.description}</Text>

      <Text style={styles.label}>Địa chỉ: <Text style={styles.normal}>{post.addressRange || 'Không rõ'}</Text></Text>
      <Text style={styles.label}>Giá: <Text style={styles.normal}>{post.priceRange || 'Không rõ'}</Text></Text>

      <Text style={styles.commentHeader}>Bình luận:</Text>
      <FlatList
        data={post.postComments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.commentBox}>
            <Text style={styles.commentAuthor}>{item.user?.username || 'Ẩn danh'}:</Text>
            <Text>{item.content}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.noComment}>Chưa có bình luận nào.</Text>}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  loading: { flex: 1, justifyContent: 'center' },
  errorText: { textAlign: 'center', marginTop: 20, color: 'red' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  meta: { color: '#666', marginBottom: 10 },
  label: { fontWeight: '600', marginTop: 10 },
  normal: { fontWeight: '400' },
  description: { fontSize: 16, marginBottom: 12 },
  commentHeader: { fontWeight: 'bold', fontSize: 18, marginTop: 16, marginBottom: 8 },
  commentBox: {
    padding: 10,
    backgroundColor: '#f4f4f4',
    borderRadius: 8,
    marginBottom: 10,
  },
  commentAuthor: { fontWeight: '600' },
  noComment: { color: '#888', fontStyle: 'italic', textAlign: 'center' },
});

export default DiscussionPostScreen;

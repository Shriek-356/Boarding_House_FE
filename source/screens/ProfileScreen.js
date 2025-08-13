// UserProfileScreen.js
import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  View, Text, StyleSheet, Image, FlatList, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import LottieView from 'lottie-react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { getAllPosts } from '../api/postApi';
import { getAllBoardingZonesByLandlord } from '../api/boardingZoneApi';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';

import { AuthContext } from '../contexts/AuthContext';

const Tab = createMaterialTopTabNavigator();

/* -------------------- Header -------------------- */
const HeaderBlock = ({ profileUser, isCurrentUser, onMessage }) => {
  const formattedDate = new Date(profileUser.createdAt).toLocaleDateString('vi-VN');

  return (
    <View style={styles.header}>
      <View style={styles.curvedBackground} />
      <Image source={{ uri: profileUser.avatar }} style={styles.avatar} />

      {!isCurrentUser && (
        <TouchableOpacity style={styles.messageButton} onPress={onMessage}>
          <FeatherIcon name="message-circle" size={18} color="#fff" />
          <Text style={styles.messageText}>Nhắn tin</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.name}>{profileUser.firstname} {profileUser.lastname}</Text>

      <View style={styles.infoRow}>
        <FeatherIcon name="mail" size={16} color="#6B7280" />
        <Text style={styles.infoText}>{profileUser.email}</Text>
      </View>
      <View style={styles.infoRow}>
        <FeatherIcon name="calendar" size={16} color="#6B7280" />
        <Text style={styles.infoText}>Tham gia: {formattedDate}</Text>
      </View>
    </View>
  );
};

/* -------------------- TAB: Bài đăng (có refresh) -------------------- */
const PostsTab = ({ profileUserId }) => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchUserPosts = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const data = await getAllBoardingZonesByLandlord(profileUserId, page);
      if (Array.isArray(data?.content)) {
        setPosts(prev => [...prev, ...data.content]);
        setPage(prev => prev + 1);
        setHasMore(!data.last);
        setError('');
      } else {
        setHasMore(false);
        if (page === 0) setPosts([]);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        'Có lỗi xảy ra.';

      if (msg.includes('Không tìm thấy bài đăng trọ')) {
        setHasMore(false);
        if (page === 0) setPosts([]);
        setError('');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, profileUserId]);

  // REFRESH: tải lại trang 0
  const onRefresh = useCallback(async () => {
    if (loading) return;
    setRefreshing(true);
    try {
      const data = await getAllBoardingZonesByLandlord(profileUserId, 0);
      const content = Array.isArray(data?.content) ? data.content : [];
      setPosts(content);
      setPage(1);
      setHasMore(!data?.last);
      setError('');
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        'Có lỗi xảy ra.';
      setError(msg.includes('Không tìm thấy bài đăng trọ') ? '' : msg);
      setPosts([]);
      setHasMore(false);
    } finally {
      setRefreshing(false);
    }
  }, [loading, profileUserId]);

  useEffect(() => {
    fetchUserPosts();
  }, [fetchUserPosts]);

  const renderPostCard = ({ item }) => (
    <TouchableOpacity style={styles.postCardBox}>
      <Image source={{ uri: item.images?.[0] }} style={styles.postImage} />
      <View style={styles.postContent}>
        <Text numberOfLines={2} style={styles.postTitle}>{item.name}</Text>
        <Text style={styles.postAddress}>{item.address}</Text>
        <Text style={styles.postPrice}>
          {item.expectedPrice?.toLocaleString('vi-VN')}đ/tháng
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderPostCard}
      onEndReached={() => { if (!loading && hasMore) fetchUserPosts(); }}
      onEndReachedThreshold={0.3}
      ListHeaderComponent={<Text style={styles.tabTitle}>Bài đăng</Text>}
      ListFooterComponent={
        loading && hasMore ? (
          <View style={styles.loadingMoreContainer}>
            <LottieView
              source={require('../../assets/animations/loading.json')}
              autoPlay loop style={{ width: 60, height: 60 }}
            />
            <Text style={styles.loadingText}>Đang tải thêm...</Text>
          </View>
        ) : null
      }
      ListEmptyComponent={
        !loading && !refreshing ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyPrimary}>Không tìm thấy bài đăng trọ nào!</Text>
            {!!error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        ) : null
      }
      refreshing={refreshing}
      onRefresh={onRefresh}
      contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    />
  );
};

/* --------------- TAB: Bài thảo luận (có refresh) --------------- */
const DiscussionsTab = ({ profileUserId }) => {
  const navigation = useNavigation();





  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchDiscussions = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const data = await getAllPosts(page, profileUserId); // giữ nguyên signature của bạn

      if (Array.isArray(data?.content)) {
        setItems(prev => [...prev, ...data.content]);
        setPage(prev => prev + 1);
        setHasMore(!data.last);
        setError('');
      } else {
        setHasMore(false);
        if (page === 0) setItems([]);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra.';
      if (msg.includes('Không có bài thảo luận')) {
        setHasMore(false);
        if (page === 0) setItems([]);
        setError('');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, profileUserId]);

  // REFRESH
  const onRefresh = useCallback(async () => {
    if (loading) return;
    setRefreshing(true);
    try {
      const data = await getAllPosts(0, profileUserId);
      const content = Array.isArray(data?.content) ? data.content : [];
      setItems(content);
      setPage(1);
      setHasMore(!data?.last);
      setError('');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra.';
      setError(msg.includes('Không có bài thảo luận') ? '' : msg);
      setItems([]);
      setHasMore(false);
    } finally {
      setRefreshing(false);
    }
  }, [loading, profileUserId]);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  const renderDiscussion = ({ item }) => (
    <TouchableOpacity
      style={styles.postCardBox}
      onPress={() => navigation.navigate('DiscussionPost', { post: item })}
      activeOpacity={0.9}
    >
      <Text numberOfLines={2} style={styles.postTitle}>{item.title}</Text>

      <View style={styles.userInfoContainer}>
        <Image
          source={{ uri: item.user?.avatar || 'https://i.pravatar.cc/100?img=12' }}
          style={styles.avatarDiscussion}
        />
        <View style={styles.userTextContainer}>
          <Text style={styles.username}>{item.user?.username || 'Ẩn danh'}</Text>
          <Text style={styles.postTime}>{moment(item.createdAt).fromNow()}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Thảo luận</Text>
        </View>
      </View>

      <Text numberOfLines={3} style={styles.postDescription}>{item.description}</Text>

      <View style={styles.cardFooter}>
        <View style={styles.metaRow}>
          <Ionicons name="chatbubble-ellipses-outline" size={16} color="#6B7280" />
          <Text style={styles.metaText}>Xem chi tiết</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={items}
      keyExtractor={(item, idx) => String(item.id ?? idx)}
      renderItem={renderDiscussion}
      onEndReached={() => { if (!loading && hasMore) fetchDiscussions(); }}
      onEndReachedThreshold={0.3}
      ListHeaderComponent={<Text style={styles.tabTitle}>Bài thảo luận</Text>}
      ListFooterComponent={
        loading && hasMore ? (
          <View style={styles.loadingMoreContainer}>
            <LottieView
              source={require('../../assets/animations/loading.json')}
              autoPlay loop style={{ width: 60, height: 60 }}
            />
            <Text style={styles.loadingText}>Đang tải thêm...</Text>
          </View>
        ) : null
      }
      ListEmptyComponent={
        !loading && !refreshing ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyPrimary}>Chưa có bài thảo luận nào!</Text>
            {!!error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        ) : null
      }
      refreshing={refreshing}
      onRefresh={onRefresh}
      contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    />
  );
};

/* -------------------- Screen chính -------------------- */
const UserProfileScreen = () => {
  const { profileUser } = useRoute().params;
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);

  const isCurrentUser = user?.id === profileUser.id;

  const handleMessage = () => {
    if (isCurrentUser) return;
    navigation.navigate('Chat', { sender: user, receiver: profileUser });
  };

  return (
    <SafeAreaView style={styles.safeArea}>

      <HeaderBlock
        profileUser={profileUser}
        isCurrentUser={isCurrentUser}
        onMessage={handleMessage}
      />


      <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <Tab.Navigator
          screenOptions={{
            tabBarIndicatorStyle: { backgroundColor: '#4F46E5', height: 3, borderRadius: 2 },
            tabBarActiveTintColor: '#111827',
            tabBarInactiveTintColor: '#6B7280',
            tabBarLabelStyle: { fontWeight: '700', textTransform: 'none' },
            tabBarStyle: { backgroundColor: '#fff' },
            lazy: true,
          }}
        >
          <Tab.Screen
            name="PostsTab"
            options={{ title: 'Bài đăng' }}
            children={() => <PostsTab profileUserId={profileUser.id} />}
          />
          <Tab.Screen
            name="DiscussionsTab"
            options={{ title: 'Bài thảo luận' }}
            children={() => <DiscussionsTab profileUserId={profileUser.id} />}
          />
        </Tab.Navigator>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },

  /* Header */
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  curvedBackground: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 150,
    backgroundColor: '#4F46E5',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, borderColor: '#fff',
    marginBottom: 8,
  },
  name: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  infoText: { marginLeft: 6, color: '#6B7280', fontSize: 14 },

  /* Tab common */
  tabTitle: {
    fontSize: 18, fontWeight: '700',
    color: '#4F46E5',
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 16,
  },
  emptyContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyPrimary: {
    color: '#6B7280', fontSize: 15, fontStyle: 'italic',
    textAlign: 'center', paddingHorizontal: 16,
  },
  errorText: {
    marginTop: 6, color: '#EF4444', textAlign: 'center',
    paddingHorizontal: 16,
  },

  /* Card (dùng chung cho 2 tab) */
  postCardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginHorizontal: 14,
    marginBottom: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEF1F6',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  postImage: {
    width: '100%', height: 220,
    borderRadius: 8, marginBottom: 12, resizeMode: 'cover',
  },
  postContent: { padding: 10 },
  postTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 6, lineHeight: 22 },
  postAddress: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  postPrice: { color: '#EF4444', fontWeight: 'bold', marginTop: 4 },
  postDescription: { fontSize: 14, color: '#374151', marginTop: 2, marginBottom: 8, lineHeight: 20 },

  userInfoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  avatarDiscussion: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#E5E7EB', borderWidth: 1, borderColor: '#EEF1F6',
  },
  userTextContainer: { flex: 1 },
  username: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  postTime: { fontSize: 12, color: '#6B7280', marginTop: 1 },

  badge: {
    paddingHorizontal: 8, paddingVertical: 4,
    backgroundColor: '#F1F5FF', borderRadius: 12,
    borderWidth: 1, borderColor: '#DCE6FF',
  },
  badgeText: { fontSize: 12, color: '#3B5BDB', fontWeight: '700' },

  cardFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 10, borderTopWidth: 1, borderTopColor: '#EEF1F6',
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', columnGap: 6 },
  metaText: { fontSize: 13, color: '#6B7280', fontWeight: '600' },

  /* Loading more */
  loadingMoreContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: { marginLeft: 10, fontSize: 14, color: '#6B7280' },

  /* Button nhắn tin */
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    marginTop: 16,
  },
  messageText: { color: '#fff', fontSize: 14, marginLeft: 8, fontWeight: '600' },
});

export default UserProfileScreen;
import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    SafeAreaView, Image, StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import LottieView from 'lottie-react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getAllPosts, createPost } from '../api/postApi';
import { getToken } from '../api/axiosClient';
import { AuthContext } from '../contexts/AuthContext';
import CreatePostModal from '../modals/CreatePostModal';
import LoadingComponent from '../components/LoadingComponent';

// ===== Helper: khử trùng theo id / __clientId =====
const dedupe = (arr) => {
    const seen = new Set();
    return arr.filter(it => {
        const k = String(it?.id ?? it?.__clientId);
        if (!k || seen.has(k)) return false;
        seen.add(k);
        return true;
    });
};

const DiscussionListScreen = () => {
    const navigation = useNavigation();
    const { user } = useContext(AuthContext);
    const insets = useSafeAreaInsets();

    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const fetchPosts = useCallback(async () => {
        if (loading || !hasMore) return;
        setLoading(true);
        try {
            const data = await getAllPosts(page);
            if (Array.isArray(data?.content)) {
                setPosts(prev => dedupe([...prev, ...data.content]));
                setPage(prev => prev + 1);
                setHasMore(!data.last);
            }
        } catch (err) {
            console.error('Lỗi tải bài viết:', err);
        } finally {
            setLoading(false);
        }
    }, [loading, hasMore, page]);

    const refreshPosts = useCallback(async () => {
        if (loading) return;
        setLoading(true);
        try {
            const data = await getAllPosts(0);       // luôn lấy trang 0
            const list = Array.isArray(data?.content) ? data.content : [];
            setPosts(dedupe(list));                  // thay toàn bộ danh sách
            setPage(1);                              // lần sau loadMore sẽ là trang 1
            setHasMore(!data?.last);
        } catch (e) {
            console.error('Lỗi refresh:', e);
        } finally {
            setLoading(false);
        }
    }, [loading]);

    useEffect(() => {
        (async () => setToken(await getToken()))();
        fetchPosts();
    }, []);

    // Tạo bài: prepend và khử trùng (đơn giản, ít code)
    const handleCreatePost = useCallback(async ({ title, description }) => {
        try {
            const payload = { title, description };
            const res = await createPost(payload, token);
            // fallback __clientId nếu server chưa trả id
            const item = { ...res, user, __clientId: res?.id ? undefined : Date.now() };
            setPosts(prev => dedupe([item, ...prev]));
        } catch (error) {
            console.error('Lỗi tạo bài viết:', error);
        }
    }, [token, user]);

    const renderPostCard = ({ item }) => (
        <TouchableOpacity
            style={styles.postCard}
            onPress={() => navigation.navigate('DiscussionPost', { post: item })}
            activeOpacity={0.9}
        >
            <Text numberOfLines={2} style={styles.postTitle}>{item.title}</Text>

            <View style={styles.userInfoContainer}>
                <Image
                    source={{ uri: item.user?.avatar || 'https://i.pravatar.cc/100?img=12' }}
                    style={styles.avatar}
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

    const renderHeader = () => (
        <View style={[styles.header, { paddingTop: insets.top, height: insets.top + 56 }]}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text numberOfLines={1} style={styles.headerTitle}>Thảo luận</Text>
            <TouchableOpacity style={styles.createPostButton} onPress={() => setShowModal(true)}>
                <Ionicons name="add" size={18} color="#0066FF" />
                <Text style={styles.createPostText}>Tạo bài viết</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            {renderHeader()}
            <FlatList
                data={posts}
                keyExtractor={(item, idx) => String(item?.id ?? item?.__clientId ?? `tmp-${idx}`)}
                renderItem={renderPostCard}
                onEndReached={fetchPosts}
                onEndReachedThreshold={0.3}
                onRefresh={refreshPosts}
                refreshing={loading}
                ListFooterComponent={
                    loading && hasMore ? (
                        <View style={styles.loadingMoreContainer}>
                            <LottieView
                                source={require('../../assets/animations/loading.json')}
                                autoPlay
                                loop
                                style={{ width: 60, height: 60 }}
                            />
                            <Text style={styles.loadingText}>Đang tải thêm...</Text>
                        </View>
                    ) : null
                }
                contentContainerStyle={{ paddingBottom: 32, paddingTop: 8, minHeight: '100%' }}
                showsVerticalScrollIndicator={false}
            />

            <CreatePostModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleCreatePost}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F5F7FB' },

    header: {
        backgroundColor: '#0066FF',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    backBtn: { padding: 8, borderRadius: 999 },
    headerTitle: {
        flex: 1, marginHorizontal: 8, textAlign: 'center',
        color: '#FFF', fontSize: 18, fontWeight: '800',
    },
    createPostButton: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8,
        borderRadius: 22, borderWidth: 1, borderColor: '#E3E8FF',
        marginRight: 4, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 }, elevation: 2,
    },
    createPostText: { marginLeft: 6, color: '#0066FF', fontWeight: '700' },

    postCard: {
        backgroundColor: '#FFFFFF', borderRadius: 14,
        marginHorizontal: 14, marginBottom: 14, padding: 14,
        borderWidth: 1, borderColor: '#EEF1F6',
        elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 3,
    },
    postTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 6, lineHeight: 22 },
    postDescription: { fontSize: 14, color: '#374151', marginTop: 2, marginBottom: 8, lineHeight: 20 },

    userInfoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
    avatar: {
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

    loadingMoreContainer: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20,
    },
    loadingText: { marginLeft: 10, fontSize: 14, color: '#6B7280' },
});

export default DiscussionListScreen;

import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import LottieView from 'lottie-react-native';
import { getAllPosts } from '../api/postApi';

const DiscussionListScreen = () => {
    const navigation = useNavigation();
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const fetchPosts = useCallback(async () => {
        if (loading || !hasMore) return;
        setLoading(true);
        try {
            const data = await getAllPosts(page);
            if (Array.isArray(data.content)) {
                setPosts((prev) => [...prev, ...data.content]);
                setPage((prev) => prev + 1);
                setHasMore(!data.last);
            }
        } catch (err) {
            console.error('Lỗi tải bài viết:', err);
        } finally {
            setLoading(false);
        }
    }, [loading, hasMore, page]);

    // Gọi trang đầu khi load lần đầu
    useEffect(() => {
        fetchPosts();
    }, []);


    const renderPostCard = ({ item }) => (
        <TouchableOpacity
            style={styles.postCard}
            onPress={() => navigation.navigate('DiscussionPost', { postId: item.id })}
        >
            <View style={styles.postContent}>
                <Text numberOfLines={2} style={styles.postTitle}>{item.title}</Text>
                <Text style={styles.postMeta}>
                    Người đăng: {item.user?.username || 'Ẩn danh'} • {moment(item.createdAt).fromNow()}
                </Text>
                <Text numberOfLines={2} style={styles.postDescription}>{item.description}</Text>
                <View style={styles.rangeContainer}>
                    <Text style={styles.rangeText}>🏠 {item.addressRange || 'Không rõ'}</Text>
                    <Text style={styles.rangeText}>💰 {item.priceRange || 'Không rõ'}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                renderItem={renderPostCard}
                onEndReached={fetchPosts}
                onEndReachedThreshold={0.3}
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
                contentContainerStyle={{
                    paddingBottom: 32,
                    paddingTop: 8,
                    minHeight: '100%',
                }}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    postCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginHorizontal: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        height:180
    },
    postContent: {
        paddingBottom: 4,
    },
    postTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    postMeta: {
        color: '#6B7280',
        fontSize: 13,
        marginBottom: 8,
    },
    postDescription: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 10,
    },
    rangeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    rangeText: {
        fontSize: 13,
        color: '#6B7280',
    },
    loadingMoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    loadingText: {
        marginLeft: 10,
        fontSize: 14,
        color: '#6B7280',
    },
});

export default DiscussionListScreen;

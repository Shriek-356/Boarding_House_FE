import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
    Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import LottieView from 'lottie-react-native';
import { getAllPosts } from '../api/postApi';
import Ionicons from 'react-native-vector-icons/Ionicons';

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

                <View style={styles.userInfoContainer}>
                    <Image
                        source={{ uri: item.user?.avatar || 'https://i.pravatar.cc/100?img=12' }}
                        style={styles.avatar}
                    />
                    <View style={styles.userTextContainer}>
                        <Text style={styles.username}>
                            {item.user?.username || 'Ẩn danh'}
                        </Text>
                        <Text style={styles.postTime}>
                            {moment(item.createdAt).fromNow()}
                        </Text>
                    </View>
                </View>

                <Text numberOfLines={2} style={styles.postDescription}>
                    {item.description}
                </Text>

                <View style={styles.rangeContainer}>
                    <Text style={styles.rangeText}>🏠 {item.addressRange || 'Không rõ'}</Text>
                    <Text style={styles.rangeText}>💰 {item.priceRange || 'Không rõ'}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Thảo luận</Text>

            <TouchableOpacity
                style={styles.rightIcon}
                onPress={() => navigation.navigate('CreateDiscussionPost')}
            >
                <Ionicons name="add-circle-outline" size={26} color="#FFF" />
            </TouchableOpacity>
        </View>
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
                ListHeaderComponent={renderHeader}
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
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },

    postTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },

    metaContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },

    avatarText: {
        fontSize: 13,
        color: '#4B5563',
    },

    timeText: {
        fontSize: 13,
        color: '#6B7280',
    },

    postDescription: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 10,
    },

    rangeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 10,
        marginTop: 8,
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
    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },

    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E5E7EB',
    },

    userTextContainer: {
        marginLeft: 10,
        flex: 1,
    },

    username: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },

    postTime: {
        fontSize: 12,
        color: '#6B7280',
    },
    header: {
        backgroundColor: '#0066FF',
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        marginTop:15
    },
    backButton: {
        position: 'absolute',
        left: 15,
        top: 18,
        zIndex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
    rightIcon: {
        position: 'absolute',
        right: 15,
        top: 18,
        zIndex: 1,
    },
});

export default DiscussionListScreen;

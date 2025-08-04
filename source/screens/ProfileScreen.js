import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { getAllBoardingZonesByLandlord } from '../api/boardingZoneApi';
import LottieView from 'lottie-react-native';

const UserProfileScreen = () => {
    const { user } = useRoute().params;

    //Nhớ bổ sungg check đó có phải là user hiện tại không
    // Nếu không phải thì không hiện nút nhắn tin
    //
    //
    //
    // Nếu không phải thì không hiện nút nhắn tin
    //
    //
    //
    //
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const fetchUserPosts = useCallback(async () => {
        if (loading || !hasMore) return;
        setLoading(true);
        try {
            const data = await getAllBoardingZonesByLandlord(user.id, page);
            if (Array.isArray(data.content)) {
                setPosts((prev) => [...prev, ...data.content]);
                setPage((prev) => prev + 1);
                setHasMore(!data.last);
            }
        } catch (err) {
            console.error('Lỗi tải bài đăng:', err);
        } finally {
            setLoading(false);
        }
    }, [loading, hasMore, page, user.id]);

    useEffect(() => {
        fetchUserPosts();
    }, []);

    const formattedDate = new Date(user.createdAt).toLocaleDateString('vi-VN');

    const handleMessage = () => {
        // TODO: Điều hướng đến màn hình chat với user.id (landlord)
        console.log('Nhắn tin với:', user.id);
        // Ví dụ:
        // navigation.navigate('ChatScreen', { receiverId: user.id, name: user.name });
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.curvedBackground} />
            <Image
                source={{ uri: user.avatar }}
                style={styles.avatar}
            />
            <TouchableOpacity style={styles.messageButton} onPress={() => handleMessage()}>
                <Icon name="message-circle" size={18} color="#fff" />
                <Text style={styles.messageText}>Nhắn tin</Text>
            </TouchableOpacity>
            <Text style={styles.name}>{user.name}</Text>
            <View style={styles.infoRow}>
                <Icon name="mail" size={16} color="#6B7280" />
                <Text style={styles.infoText}>{user.email}</Text>
            </View>
            <View style={styles.infoRow}>
                <Icon name="calendar" size={16} color="#6B7280" />
                <Text style={styles.infoText}>Tham gia: {formattedDate}</Text>
            </View>

            <Text style={styles.sectionTitle}>Bài đăng</Text>
        </View>
    );

    const renderPostCard = ({ item }) => (
        <TouchableOpacity style={styles.postCard}>
            <Image source={{ uri: item.images[0] }} style={styles.postImage} />
            <View style={styles.postContent}>
                <Text numberOfLines={2} style={styles.postTitle}>{item.name}</Text>
                <Text style={styles.postAddress}>{item.address}</Text>
                <Text style={styles.postPrice}>{item.expectedPrice.toLocaleString('vi-VN')}đ/tháng</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <>
            <SafeAreaView style={styles.safeArea}>
                <FlatList
                    data={posts}
                    keyExtractor={(item) => item.id}
                    renderItem={renderPostCard}
                    ListHeaderComponent={renderHeader}
                    onEndReached={fetchUserPosts}
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
                        minHeight: '100%',
                    }}
                    showsVerticalScrollIndicator={false}
                />
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        alignItems: 'center',
        paddingTop: 80,
        paddingBottom: 20,
        backgroundColor: '#fff',
        marginBottom: 12,
    },
    curvedBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 150,
        backgroundColor: '#4F46E5',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#fff',
        marginBottom: 8,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    infoText: {
        marginLeft: 6,
        color: '#6B7280',
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4F46E5',
        alignSelf: 'flex-start',
        marginTop: 24,
        marginLeft: 16,
    },
    postCard: {
        backgroundColor: '#fff',
        flexDirection: 'column',
        borderRadius: 12,
        marginHorizontal: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
    },
    postImage: {
        width: '100%',
        height: 220,
        borderRadius: 8,
        marginBottom: 12,
        resizeMode: 'cover',
    },
    postContent: {
        padding: 10,
    },
    postTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
    },
    postAddress: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 4,
    },
    postPrice: {
        color: '#EF4444',
        fontWeight: 'bold',
        marginTop: 4,
    },
    emptyText: {
        textAlign: 'center',
        color: '#888',
        marginTop: 40,
        fontSize: 16,
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
    messageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4F46E5',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 999,
        marginTop: 16,
    },
    messageText: {
        color: '#fff',
        fontSize: 14,
        marginLeft: 8,
        fontWeight: '600',
    },
});

export default UserProfileScreen;

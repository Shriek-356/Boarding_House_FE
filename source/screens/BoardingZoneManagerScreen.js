import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    FlatList,
    TouchableOpacity,
    Alert,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import LottieView from 'lottie-react-native';
import { getAllBoardingZonesByLandlord } from '../api/boardingZoneApi';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
const HeaderBar = ({ onAdd }) => (
    <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Dãy trọ / Toà nhà</Text>
        <TouchableOpacity style={styles.headerAddBtn} onPress={onAdd}>
            <FeatherIcon name="plus" size={18} color="#fff" />
            <Text style={styles.headerAddText}>Thêm Trọ mới</Text>
        </TouchableOpacity>
    </View>
);

const BoardingZoneManagerScreen = () => {
    const navigation = useNavigation();
    const { user } = useContext(AuthContext);
    const profileUserId = user?.id;

    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    // ====== FETCH (giữ logic của bạn) ======
    const fetchUserPosts = useCallback(async () => {
        if (loading || !hasMore || !profileUserId) return;
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

    const onRefresh = useCallback(async () => {
        if (loading || !profileUserId) return;
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
        if (!profileUserId) return;
        setPosts([]); setPage(0); setHasMore(true); setError('');
        fetchUserPosts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profileUserId]);

    // ====== HANDLERS UI ======
    const onView = (item) => navigation.navigate('ZoneManagement', { item });
    const onEdit = (item) => navigation.navigate('EditBoardingZone', { item });
    const onAdd = () => navigation.navigate('CreateBoardingZone');

    const onToggleVisible = async (id, next) => {
        try {
            // await updateZoneVisibility(id, next); // nếu có API
            setPosts(prev => prev.map(p => (p.id === id ? { ...p, isVisible: next } : p)));
        } catch {
            Alert.alert('Lỗi', 'Không cập nhật được trạng thái hiển thị');
        }
    };

    const onDelete = (id) => {
        Alert.alert('Xác nhận', 'Xoá dãy trọ này?', [
            { text: 'Huỷ' },
            {
                text: 'Xoá',
                style: 'destructive',
                onPress: async () => {
                    try {
                        // await deleteZone(id); // nếu có API
                        setPosts(prev => prev.filter(p => p.id !== id));
                    } catch {
                        Alert.alert('Lỗi', 'Không xoá được dãy trọ');
                    }
                },
            },
        ]);
    };

    // ====== ITEM ======
    const renderPostCard = ({ item }) => {
        const address =
            item.address ||
            [item.street, item.ward, item.district, item.province].filter(Boolean).join(', ');

        const status = String(item.status || '').toUpperCase();
        const isApproved = status === 'APPROVED';
        const isRejected = status === 'REJECTED';

        return (
            <View style={styles.card}>
                <View style={styles.leftCol}>
                    {item.images?.length ? (
                        <Image source={{ uri: item.images[0] }} style={styles.image} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <FeatherIcon name="home" size={22} color="#94A3B8" />
                        </View>
                    )}
                    <View style={styles.badgesRow}>
                        <View style={[
                            styles.chip,
                            isApproved ? styles.chipApproved : isRejected ? styles.chipRejected : styles.chipPending
                        ]}>
                            <Text style={styles.chipText}>
                                {isApproved ? 'Đã duyệt' : isRejected ? 'Bị từ chối' : 'Chờ duyệt'}
                            </Text>
                        </View>
                        {item.isVisible ? (
                            <View style={[styles.chip, styles.chipMuted]}>
                                <Text style={[styles.chipText, { color: '#0F172A' }]}>Đang ẩn</Text>
                            </View>
                        ) : <View style={[styles.chip, styles.chipMuted]}>
                            <Text style={[styles.chipText, { color: '#0F172A' }]}>Đang hiển thị</Text>
                        </View>}
                    </View>
                </View>

                <View style={styles.rightCol}>
                    <Text numberOfLines={2} style={styles.title}>{item.name}</Text>
                    <Text numberOfLines={1} style={styles.address}>{address || '—'}</Text>
                    <Text style={styles.price}>
                        {item.expectedPrice?.toLocaleString('vi-VN')}đ/tháng
                    </Text>

                    <View style={styles.actionsRow}>
                        {/* Left actions */}
                        <View style={styles.leftActions}>
                            <TouchableOpacity style={styles.pillBtn} onPress={() => onView(item)}>
                                <Text style={styles.pillBtnText}>Xem</Text>
                                <FeatherIcon name="chevron-right" size={16} color="#0F172A" />
                            </TouchableOpacity>
                        </View>

                        {/* Right actions */}
                        <View style={styles.rightActions}>
                            <TouchableOpacity style={styles.iconBtn} onPress={() => onEdit(item)}>
                                <FeatherIcon name="edit-3" size={18} color="#0F172A" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconBtn} onPress={() => onToggleVisible(item.id, !item.isVisible)}>
                                <FeatherIcon name={item.isVisible ? 'eye' : 'eye-off'} size={18} color="#0F172A" />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.iconBtn, styles.iconBtnDanger]} onPress={() => onDelete(item.id)}>
                                <FeatherIcon name="trash-2" size={18} color="#DC2626" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    // ====== EMPTY ======
    const EmptyState = () => (
        <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
                <FeatherIcon name="home" size={42} color={PRIMARY} />
            </View>
            <Text style={styles.emptyTitle}>BẠN CHƯA CÓ NHÀ TRỌ NÀO</Text>
            <Text style={styles.emptyDesc}>
                Hãy tạo mới để bắt đầu quản lý phòng thuê, khách và hợp đồng.
            </Text>
            <TouchableOpacity
                style={styles.primaryBtn}
                onPress={onAdd}
            >
                <FeatherIcon name="plus" size={18} color="#fff" />
                <Text style={styles.primaryBtnText}>Thêm Trọ mới</Text>
            </TouchableOpacity>
        </View>
    );

    // ====== RENDER ======
    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <HeaderBar onAdd={onAdd} />

            <FlatList
                data={posts}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderPostCard}
                onEndReached={() => { if (!loading && hasMore) fetchUserPosts(); }}
                onEndReachedThreshold={0.3}
                ListEmptyComponent={!loading && !refreshing ? <EmptyState /> : null}
                ListFooterComponent={
                    loading && hasMore && posts.length > 0 ? (
                        <View style={styles.loadingMore}>
                            <LottieView
                                source={require('../../assets/animations/loading.json')}
                                autoPlay loop style={{ width: 56, height: 56 }}
                            />
                            <Text style={styles.loadingText}>Đang tải thêm...</Text>
                        </View>
                    ) : null
                }
                refreshing={refreshing}
                onRefresh={onRefresh}
                contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 16, flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
            />

            {loading && posts.length === 0 && (
                <View style={styles.loadingOverlay}>
                    <LottieView
                        source={require('../../assets/animations/loading.json')}
                        autoPlay loop style={{ width: 80, height: 80 }}
                    />
                    <Text style={styles.loadingText}>Đang tải dãy trọ...</Text>
                </View>
            )}

            {!!error && (
                <Text style={[styles.muted, { textAlign: 'center', marginVertical: 8, paddingHorizontal: 16 }]}>{error}</Text>
            )}
        </SafeAreaView>
    );
};

export default BoardingZoneManagerScreen;

/* ========== STYLES ========== */
const PRIMARY = '#2563EB';
const BORDER = '#E2E8F0';
const BG = '#F8FAFC';
const TEXT = '#0F172A';
const MUTED = '#64748B';

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG },

    headerBar: {
        paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: BORDER,
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: TEXT },
    headerAddBtn: {
        height: 36, paddingHorizontal: 12, borderRadius: 10,
        backgroundColor: PRIMARY, flexDirection: 'row', alignItems: 'center',
    },
    headerAddText: { color: '#fff', fontWeight: '600', marginLeft: 6 },

    card: {
        flexDirection: 'row', padding: 12, marginTop: 12,
        borderRadius: 16, backgroundColor: '#fff',
        borderWidth: 1, borderColor: BORDER,
        shadowColor: '#0F172A', shadowOpacity: 0.06, shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 }, elevation: 2,
    },

    leftCol: { width: 96, marginRight: 12, position: 'relative' },
    image: { width: '100%', aspectRatio: 1, borderRadius: 12, backgroundColor: '#EDF2F7' },
    imagePlaceholder: {
        width: '100%', aspectRatio: 1, borderRadius: 12,
        backgroundColor: '#EDF2F7', alignItems: 'center', justifyContent: 'center',
    },

    badgesRow: {
        position: 'absolute', top: 6, left: 6,
        flexDirection: 'row', flexWrap: 'wrap',
    },
    chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, marginRight: 4, marginBottom: 4 },
    chipText: { fontSize: 10, fontWeight: '700' },
    chipApproved: { backgroundColor: '#D1FAE5', color: '#065F46' },
    chipRejected: { backgroundColor: '#FEE2E2', color: '#991B1B' },
    chipPending: { backgroundColor: '#E5E7EB', color: '#374151' },
    chipMuted: { backgroundColor: '#F1F5F9', color: '#334155' },

    rightCol: { flex: 1, justifyContent: 'space-between' },
    title: { fontSize: 16, fontWeight: '700', color: TEXT },
    address: { marginTop: 2, color: MUTED, fontSize: 12 },
    price: { marginTop: 4, color: PRIMARY, fontWeight: '700', fontSize: 14 },

    actionsRow: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', marginTop: 8,
    },
    leftActions: {
        flexDirection: 'row', alignItems: 'center',
    },
    pillBtn: {
        height: 32, paddingHorizontal: 10, borderRadius: 8,
        backgroundColor: '#F1F5F9', flexDirection: 'row',
        alignItems: 'center',
    },
    pillBtnText: { color: TEXT, fontWeight: '600', marginRight: 4, fontSize: 13 },

    rightActions: {
        flexDirection: 'row', alignItems: 'center',
        marginLeft: 'auto',
    },
    iconBtn: {
        width: 32, height: 32, borderRadius: 8,
        backgroundColor: '#EFF2F6', alignItems: 'center', justifyContent: 'center',
        marginLeft: 6,
    },
    iconBtnDanger: { backgroundColor: '#FFE4E6', borderColor: '#FFE4E6' },

    emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    emptyIcon: {
        width: 90, height: 90, borderRadius: 999,
        backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: TEXT, marginBottom: 8, textAlign: 'center' },
    emptyDesc: { color: MUTED, textAlign: 'center', marginBottom: 24, paddingHorizontal: 16 },
    primaryBtn: {
        height: 48, paddingHorizontal: 20, borderRadius: 12,
        backgroundColor: PRIMARY, flexDirection: 'row', alignItems: 'center',
    },
    primaryBtnText: { color: '#fff', fontWeight: '700', marginLeft: 8, fontSize: 15 },

    loadingMore: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
    loadingText: { color: MUTED, marginTop: 6, fontSize: 13 },
    loadingOverlay: {
        position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
        backgroundColor: 'rgba(248, 250, 252, 0.8)',
        alignItems: 'center', justifyContent: 'center',
    },

    muted: { color: MUTED, fontSize: 13 },
});
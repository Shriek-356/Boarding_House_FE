import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity,
    FlatList, Image, ActivityIndicator, Keyboard, Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { searchUser } from '../api/userApi';
import { useDebounced } from '../utils/debounced';
import { useNavigation } from '@react-navigation/native';

const COLORS = {
    bg: '#FFFFFF',
    text: '#0F172A',
    sub: '#64748B',
    stroke: '#E2E8F0',
    primary: '#1E88E5',
    chipBg: '#F1F5F9',
    chipBorder: '#E2E8F0',
};

export default function UserSearchScreen() {
    const [q, setQ] = useState('');
    const debouncedQ = useDebounced(q, 350);
    const navigation = useNavigation();
    const [data, setData] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [initial, setInitial] = useState(true);
    const [error, setError] = useState('');
    const loadingRef = useRef(false);

    const fetchPage = useCallback(async ({ kw, p = 0, append = false }) => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);
        try {
            const res = await searchUser(kw, p);
            const content = Array.isArray(res?.content) ? res.content : [];
            setData(prev => (append ? [...prev, ...content] : content));
            setPage(p + 1);
            setHasMore(!res?.last);
            setError('');
        } catch (e) {
            if (!append) setData([]);
            setHasMore(false);
            setError(e?.message || 'Có lỗi xảy ra khi tìm người dùng.');
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, []); // <-- không phụ thuộc vào state

    // Tự tìm khi người dùng dừng gõ
    useEffect(() => {
        if (!debouncedQ?.trim()) {
            setInitial(true);
            setData([]); setPage(0); setHasMore(false); setError('');
            return;
        }
        setInitial(false);
        fetchPage({ kw: debouncedQ.trim(), p: 0, append: false });
        // phụ thuộc CHỈ vào debouncedQ
    }, [debouncedQ]);

    const loadMore = () => {
        if (!hasMore || loadingRef.current || !debouncedQ?.trim()) return;
        fetchPage({ kw: debouncedQ.trim(), p: page, append: true });
    };

    const onSubmit = () => {
        Keyboard.dismiss();
        if (!q.trim()) return;
        fetchPage({ kw: q.trim(), p: 0, append: false });
    };

    const onRefresh = async () => {
        if (!debouncedQ?.trim()) return;
        setRefreshing(true);
        await fetchPage({ kw: debouncedQ.trim(), p: 0, append: false });
        setRefreshing(false);
    };

    const renderItem = ({ item }) => {
        const avatarSrc = item?.avatar
            ? { uri: item.avatar }
            : require('../../assets/images/logo.avif');
        const fullName = `${item?.firstname || ''} ${item?.lastname || ''}`.trim();
        const roles = (item?.userRoles || []).map(x => x?.role?.name).filter(Boolean);

        return (
            <TouchableOpacity
                style={styles.row}
                activeOpacity={0.85}
                onPress={() => {
                    navigation.navigate('Profile', { profileUser: item })
                }}
            >
                <Image source={avatarSrc} style={styles.avatar} />
                <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={styles.name}>{fullName || '—'}</Text>
                    <Text numberOfLines={1} style={styles.sub}>
                        @{item?.username} • {item?.email}
                    </Text>
                    {!!item?.phone && <Text style={[styles.sub, { marginTop: 2 }]}>{item.phone}</Text>}
                    {!!roles.length && (
                        <View style={styles.rolesWrap}>
                            {roles.map(r => (
                                <View key={r} style={styles.roleChip}>
                                    <Text style={styles.roleChipText}>{r}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
                <Icon name="chevron-right" size={22} color={COLORS.sub} />
            </TouchableOpacity>
        );
    };

    const ListEmpty = () => {
        if (initial) {
            return (
                <View style={styles.emptyBox}>
                    <Icon name="account-search" size={28} color={COLORS.sub} />
                    <Text style={styles.emptyText}>Nhập tên, username, email hoặc SĐT để tìm…</Text>
                </View>
            );
        }
        if (loading) return null;
        return (
            <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>{error || 'Không tìm thấy người dùng phù hợp'}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safe}>
            {/* Header tìm kiếm */}
            <View style={styles.searchBar}>
                <Icon name="arrow-left" size={22} color={COLORS.text} onPress={() => navigation.goBack()} />
                <View style={styles.inputWrap}>
                    <Icon name="magnify" size={20} color={COLORS.sub} />
                    <TextInput
                        style={styles.input}
                        placeholder="Tìm kiếm người dùng…"
                        placeholderTextColor={COLORS.sub}
                        value={q}
                        onChangeText={setQ}
                        returnKeyType="search"
                        onSubmitEditing={onSubmit}
                        autoFocus
                    />
                    {q?.length > 0 && (
                        <TouchableOpacity onPress={() => setQ('')}>
                            <Icon name="close-circle" size={18} color={COLORS.sub} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Danh sách kết quả */}
            <FlatList
                data={data}
                keyExtractor={(u) => String(u.id)}
                renderItem={renderItem}
                ItemSeparatorComponent={() => <View style={styles.sep} />}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListHeaderComponent={loading && data.length === 0 ? <ActivityIndicator style={{ marginVertical: 12 }} /> : null}
                ListEmptyComponent={<ListEmpty />}
                refreshing={refreshing}
                onRefresh={onRefresh}
                onEndReached={loadMore}
                onEndReachedThreshold={0.3}
                ListFooterComponent={
                    loading && data.length > 0
                        ? <ActivityIndicator style={{ marginVertical: 12 }} />
                        : null
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.bg },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 12,
        paddingVertical: Platform.select({ ios: 10, android: 8 }),
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: COLORS.stroke,
        backgroundColor: '#fff',
    },
    inputWrap: {
        flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8,
        borderWidth: 1, borderColor: COLORS.stroke,
    },
    input: { flex: 1, color: COLORS.text, paddingVertical: 0 },
    row: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 12, alignItems: 'center', backgroundColor: '#fff' },
    sep: { height: StyleSheet.hairlineWidth, backgroundColor: COLORS.stroke },
    avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12, backgroundColor: '#EEE' },
    name: { fontSize: 15, fontWeight: '700', color: COLORS.text },
    sub: { fontSize: 12.5, color: COLORS.sub, marginTop: 2 },
    rolesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
    roleChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
    roleChipText: { fontSize: 11, color: '#334155', fontWeight: '600' },
    emptyBox: { alignItems: 'center', paddingVertical: 24 },
    emptyText: { color: COLORS.sub, marginTop: 8 },
});

// ZoneManagementScreen.js
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Alert, ScrollView
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LottieView from 'lottie-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

// TODO: nối API thật của bạn
// import { getRoomsByZone, deleteRoom, updateRoomVisibility } from '../api/roomApi';

const PRIMARY = '#2563EB';
const BORDER  = '#E2E8F0';
const BG      = '#F8FAFC';
const TEXT    = '#0F172A';
const MUTED   = '#64748B';

const MENU = [
  { key: 'rooms',     label: 'Phòng',      icon: 'home' },
  { key: 'tenants',   label: 'Khách thuê', icon: 'users' },
  { key: 'contracts', label: 'Hợp đồng',   icon: 'file-text' },
  { key: 'bills',     label: 'Hoá đơn',    icon: 'credit-card' },
  { key: 'comments',  label: 'Bình luận',  icon: 'message-circle' },
];

const statusStyle = (status) => {
  switch (String(status || '').toUpperCase()) {
    case 'VACANT':      return { bg: '#DCFCE7', fg: '#166534', text: 'Trống' };
    case 'OCCUPIED':    return { bg: '#FEE2E2', fg: '#991B1B', text: 'Đang ở' };
    case 'RESERVED':    return { bg: '#FEF3C7', fg: '#92400E', text: 'Giữ chỗ' };
    case 'MAINTENANCE': return { bg: '#E5E7EB', fg: '#374151', text: 'Bảo trì' };
    default:            return { bg: '#E5E7EB', fg: '#374151', text: (status || '—') };
  }
};

export default function ZoneManagementScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const zoneId = route.params?.id;
  const zoneName = route.params?.name || 'Dãy trọ';

  const [active, setActive] = useState('rooms');

  // ===== Header stats (tuỳ biến theo dữ liệu thật) =====
  const [stats, setStats] = useState({ total: 0, vacant: 0, occupied: 0 });

  // ===== Panels =====
  const Panel = useMemo(() => {
    switch (active) {
      case 'rooms':     return <RoomsPanel zoneId={zoneId} onStats={setStats} />;
      case 'tenants':   return <PlaceholderPanel
                                icon="users"
                                title="Chưa có khách thuê"
                                desc="Thêm khách thuê để bắt đầu quản lý hợp đồng và hoá đơn."
                                primaryText="Thêm khách thuê"
                                onPrimary={() => navigation.navigate('CreateTenant', { zoneId })}
                              />;
      case 'contracts': return <PlaceholderPanel icon="file-text" title="Chưa có hợp đồng" desc="Tạo hợp đồng cho phòng đã có khách." primaryText="Tạo hợp đồng" onPrimary={() => {}} />;
      case 'bills':     return <PlaceholderPanel icon="credit-card" title="Chưa có hoá đơn" desc="Tạo hoá đơn tiền phòng, điện, nước..." primaryText="Tạo hoá đơn" onPrimary={() => {}} />;
      case 'comments':  return <PlaceholderPanel icon="message-circle" title="Chưa có bình luận" desc="Phản hồi từ người thuê sẽ hiển thị tại đây." />;
      default:          return null;
    }
  }, [active, zoneId, navigation]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{zoneName}</Text>
          <Text style={styles.headerSub}>
            Tổng {stats.total} • Trống {stats.vacant} • Đang ở {stats.occupied}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.headerAction}
          onPress={() => navigation.goBack()}
        >
          <Feather name="x" size={18} color={TEXT} />
        </TouchableOpacity>
      </View>

      {/* Menu pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.menuWrap}
      >
        {MENU.map(item => {
          const activeTab = item.key === active;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.menuItem, activeTab && styles.menuItemActive]}
              onPress={() => setActive(item.key)}
            >
              <Feather
                name={item.icon}
                size={16}
                color={activeTab ? '#fff' : TEXT}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.menuText, activeTab && styles.menuTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {Panel}
      </View>

      {/* Floating Add (tùy tab) */}
      {active === 'rooms' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CreateRoom', { zoneId })}
        >
          <Feather name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

/* ========== ROOMS PANEL ========== */
function RoomsPanel({ zoneId, onStats }) {
  const [rooms, setRooms] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  const computeStats = useCallback((list) => {
    const total = list.length;
    const vacant = list.filter(r => String(r.status).toUpperCase() === 'VACANT').length;
    const occupied = list.filter(r => String(r.status).toUpperCase() === 'OCCUPIED').length;
    onStats?.({ total, vacant, occupied });
  }, [onStats]);

  const fetchRooms = useCallback(async () => {
    if (loading || !hasMore || !zoneId) return;
    setLoading(true);
    try {
      // TODO: gọi API thật của bạn
      // const res = await getRoomsByZone(zoneId, page, filter === 'ALL' ? undefined : filter);
      // const content = Array.isArray(res?.content) ? res.content : [];
      // Fake data demo:
      const content = page > 0 ? [] : [
        {
          id: 'r1', name: 'Phòng 101', price: 2500000,
          status: 'VACANT', isVisible: true, images: []
        },
        {
          id: 'r2', name: 'Phòng 102', price: 2800000,
          status: 'OCCUPIED', isVisible: true, images: []
        },
      ];
      setRooms(prev => [...prev, ...content]);
      setHasMore(content.length > 0 && content.length >= 10 ? true : false);
      setPage(prev => prev + 1);
      setError('');
      computeStats([...rooms, ...content]);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Có lỗi xảy ra.';
      setError(msg);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [zoneId, page, filter, loading, hasMore, computeStats, rooms]);

  const onRefresh = useCallback(async () => {
    if (loading || !zoneId) return;
    setRefreshing(true);
    try {
      // const res = await getRoomsByZone(zoneId, 0, filter === 'ALL' ? undefined : filter);
      // const content = Array.isArray(res?.content) ? res.content : [];
      const content = []; // demo empty
      setRooms(content);
      setHasMore(false);
      setPage(1);
      setError('');
      computeStats(content);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Có lỗi xảy ra.';
      setError(msg);
      setRooms([]);
      setHasMore(false);
      computeStats([]);
    } finally {
      setRefreshing(false);
    }
  }, [zoneId, filter, loading, computeStats]);

  useEffect(() => {
    setRooms([]); setPage(0); setHasMore(true); setError('');
    if (zoneId) fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoneId, filter]);

  const onView = (id) => {}; // navigation.navigate('RoomDetail', { id });
  const onEdit = (id) => {}; // navigation.navigate('EditRoom', { id });

  const onToggleVisible = async (id, next) => {
    try {
      // await updateRoomVisibility(id, next);
      setRooms(prev => prev.map(r => (r.id === id ? { ...r, isVisible: next } : r)));
    } catch {
      Alert.alert('Lỗi', 'Không cập nhật được trạng thái hiển thị');
    }
  };

  const onDelete = (id) => {
    Alert.alert('Xác nhận', 'Xoá phòng này?', [
      { text: 'Huỷ' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: async () => {
          try {
            // await deleteRoom(id);
            setRooms(prev => prev.filter(r => r.id !== id));
          } catch {
            Alert.alert('Lỗi', 'Không xoá được phòng');
          }
        },
      },
    ]);
  };

  const renderCard = ({ item }) => {
    const st = statusStyle(item.status);
    return (
      <View style={styles.card}>
        <View style={styles.leftCol}>
          {item.images?.length ? (
            <Image source={{ uri: item.images[0] }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Feather name="home" size={22} color="#94A3B8" />
            </View>
          )}
          <View style={styles.badgesRow}>
            <View style={[styles.chip, { backgroundColor: st.bg }]}>
              <Text style={[styles.chipText, { color: st.fg }]}>{st.text}</Text>
            </View>
            {!item.isVisible && (
              <View style={[styles.chip, { backgroundColor: '#F1F5F9' }]}>
                <Text style={[styles.chipText, { color: '#0F172A' }]}>Đang ẩn</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.rightCol}>
          <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.price}>{item.price?.toLocaleString('vi-VN')}đ/tháng</Text>

          <View style={styles.actionsRow}>
            <View style={styles.leftActions}>
              <TouchableOpacity style={styles.pillBtn} onPress={() => onView(item.id)}>
                <Text style={styles.pillBtnText}>Xem</Text>
                <Feather name="chevron-right" size={16} color="#0F172A" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.ghostBtn} onPress={() => onEdit(item.id)}>
                <Feather name="edit-3" size={16} color="#0F172A" />
                <Text style={styles.ghostBtnText}>Sửa</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.rightActions}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => onToggleVisible(item.id, !item.isVisible)}>
                <Feather name={item.isVisible ? 'eye' : 'eye-off'} size={18} color="#0F172A" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconBtn, styles.iconBtnDanger]} onPress={() => onDelete(item.id)}>
                <Feather name="trash-2" size={18} color="#DC2626" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const FILTERS = ['ALL', 'VACANT', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'];

  return (
    <View style={{ flex: 1 }}>
      {/* Lọc theo trạng thái */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}>
        {FILTERS.map(f => {
          const active = f === filter;
          return (
            <TouchableOpacity key={f} style={[styles.fchip, active && styles.fchipActive]} onPress={() => setFilter(f)}>
              <Text style={[styles.fchipText, active && styles.fchipTextActive]}>
                {{
                  ALL: 'Tất cả', VACANT: 'Trống', OCCUPIED: 'Đang ở', RESERVED: 'Giữ chỗ', MAINTENANCE: 'Bảo trì'
                }[f]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={rooms}
        keyExtractor={(it) => String(it.id)}
        renderItem={renderCard}
        onEndReached={() => { if (!loading && hasMore) fetchRooms(); }}
        onEndReachedThreshold={0.3}
        contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
        ListEmptyComponent={
          !loading && !refreshing ? (
            <View style={{ alignItems: 'center', padding: 24 }}>
              <Feather name="home" size={40} color={PRIMARY} />
              <Text style={{ marginTop: 8, fontWeight: '700', color: TEXT }}>Chưa có phòng nào</Text>
              <Text style={{ color: MUTED, marginTop: 4 }}>Nhấn nút + để thêm phòng trọ đầu tiên</Text>
            </View>
          ) : null
        }
        refreshing={refreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          loading && hasMore ? (
            <View style={{ paddingVertical: 14, alignItems: 'center' }}>
              <LottieView source={require('../../assets/animations/loading.json')} autoPlay loop style={{ width: 56, height: 56 }} />
              <Text style={{ color: MUTED, marginTop: 6 }}>Đang tải thêm...</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

/* ========== PLACEHOLDER PANEL (tenants/contracts/bills/comments) ========== */
function PlaceholderPanel({ icon, title, desc, primaryText, onPrimary }) {
  return (
    <View style={{ flex: 1, padding: 16, alignItems: 'center', justifyContent: 'center' }}>
      <View style={styles.emptyIcon}>
        <Feather name={icon} size={42} color={PRIMARY} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {!!desc && <Text style={styles.emptyDesc}>{desc}</Text>}
      {!!primaryText && (
        <TouchableOpacity style={styles.primaryBtn} onPress={onPrimary}>
          <Feather name="plus" size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>{primaryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/* ========== STYLES ========== */
const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: TEXT },
  headerSub:   { marginTop: 4, color: MUTED, fontSize: 12 },
  headerAction: {
    width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: BORDER,
    alignItems: 'center', justifyContent: 'center', marginLeft: 10, backgroundColor: '#fff'
  },

  menuWrap: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  menuItem: {
    paddingHorizontal: 12, height: 36, borderRadius: 999, borderWidth: 1, borderColor: BORDER,
    backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', marginRight: 8
  },
  menuItemActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  menuText: { color: TEXT, fontWeight: '700' },
  menuTextActive: { color: '#fff' },

  /* Room card */
  card: {
    flexDirection: 'row', padding: 12, marginTop: 12,
    borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: BORDER,
    shadowColor: '#0F172A', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  leftCol: { width: 96, marginRight: 12, position: 'relative' },
  image: { width: '100%', aspectRatio: 1, borderRadius: 12, backgroundColor: '#EDF2F7' },
  imagePlaceholder: { width: '100%', aspectRatio: 1, borderRadius: 12, backgroundColor: '#EDF2F7', alignItems: 'center', justifyContent: 'center' },
  badgesRow: { position: 'absolute', top: 6, left: 6, flexDirection: 'row', flexWrap: 'wrap' },
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, marginRight: 4, marginBottom: 4 },
  chipText: { fontSize: 10, fontWeight: '700' },

  rightCol: { flex: 1, justifyContent: 'space-between' },
  title: { fontSize: 15, fontWeight: '700', color: TEXT },
  price: { marginTop: 4, color: PRIMARY, fontWeight: '700', fontSize: 14 },

  actionsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  leftActions: { flexDirection: 'row', alignItems: 'center' },
  pillBtn: {
    height: 32, paddingHorizontal: 10, borderRadius: 8,
    backgroundColor: '#F1F5F9', flexDirection: 'row', alignItems: 'center', marginRight: 8
  },
  pillBtnText: { color: TEXT, fontWeight: '600', marginRight: 4, fontSize: 13 },
  ghostBtn: { height: 32, paddingHorizontal: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center' },
  ghostBtnText: { color: TEXT, fontWeight: '600', marginLeft: 4 },

  rightActions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#EFF2F6', alignItems: 'center', justifyContent: 'center', marginLeft: 6
  },
  iconBtnDanger: { backgroundColor: '#FFE4E6' },

  /* Filter chips */
  fchip: {
    paddingHorizontal: 12, height: 30, borderRadius: 999,
    borderWidth: 1, borderColor: BORDER, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 8
  },
  fchipActive: { backgroundColor: '#EEF2FF', borderColor: PRIMARY },
  fchipText: { color: TEXT, fontSize: 12, fontWeight: '600' },
  fchipTextActive: { color: PRIMARY },

  /* Empty */
  emptyIcon: { width: 90, height: 90, borderRadius: 999, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: TEXT, marginBottom: 6, textAlign: 'center' },
  emptyDesc: { color: MUTED, textAlign: 'center', marginBottom: 12 },

  primaryBtn: {
    height: 42, paddingHorizontal: 16, borderRadius: 12,
    backgroundColor: PRIMARY, flexDirection: 'row', alignItems: 'center'
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', marginLeft: 8 },

  /* FAB */
  fab: {
    position: 'absolute', right: 16, bottom: 24,
    width: 56, height: 56, borderRadius: 28, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6
  },
});

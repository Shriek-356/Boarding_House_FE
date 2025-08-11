// ZoneManagementScreen.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {View, Text, StyleSheet, TouchableOpacity,
  FlatList, Image, Alert, ScrollView,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation, useRoute } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { getRoomsOfBoardingZone } from '../api/roomApi';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY = '#2563EB';
const BORDER  = '#E2E8F0';
const BG      = '#F8FAFC';
const TEXT    = '#0F172A';
const MUTED   = '#64748B';

const MENU = [
  { key: 'rooms',   label: 'Phòng',      icon: 'home'  },
  { key: 'tenants', label: 'Khách thuê', icon: 'users' },
];

export default function ZoneManagementScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const zone     = route.params?.item;
  const zoneId   = zone?.id;
  const zoneName = route.params?.name || 'Dãy trọ';

  const [active, setActive] = useState('rooms');
  const [stats, setStats]   = useState({ totalRooms: 0 });

  const Panel = useMemo(() => {
    if (active === 'rooms') {
      return <RoomsPanel zoneId={zoneId} onStats={setStats} onSwitchTab={setActive} />;
    }
    return <TenantsPanel onSwitchTab={setActive} />;
  }, [active, zoneId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{zoneName}</Text>
          <Text style={styles.headerSub}>Tổng phòng: {stats.totalRooms}</Text>
        </View>
        <TouchableOpacity style={styles.headerAction} onPress={() => navigation.goBack()}>
          <Feather name="x" size={18} color={TEXT} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }} collapsable={false}>{Panel}</View>

      {/* FAB */}
      {active === 'rooms' ? (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateRoom', { zoneId })}>
          <Feather name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateTenant', { zoneId })}>
          <Feather name="user-plus" size={22} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

/* ---------------- Tabs header ---------------- */
function TabsHeader({ activeKey, onSwitchTab }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.menuWrap}>
      {MENU.map((it) => {
        const isActive = activeKey === it.key;
        return (
          <TouchableOpacity
            key={it.key}
            style={[styles.menuItem, isActive && styles.menuItemActive]}
            onPress={() => onSwitchTab(it.key)}
          >
            <Feather name={it.icon} size={16} color={isActive ? '#fff' : TEXT} style={{ marginRight: 6 }} />
            <Text style={[styles.menuText, isActive && styles.menuTextActive]}>{it.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

/* ---------------- Rooms (pagination) ---------------- */
function RoomsPanel({ zoneId, onStats, onSwitchTab }) {
  const [rooms, setRooms]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore]   = useState(true);
  const [error, setError]       = useState('');
  const [didLoad, setDidLoad]   = useState(false);
  const navigation = useNavigation();

  // Refs chống trùng lặp
  const pageRef = useRef(0);
  const fetchingRef = useRef(false);           // guard tức thì (không phụ thuộc state)
  const afterFirstLoadRef = useRef(false);     // bỏ qua onEndReached đến khi fetch đầu xong

  const appendPage = useCallback(async () => {
    if (fetchingRef.current || !hasMore || !zoneId) return;
    fetchingRef.current = true;
    setLoading(true);
    try {
      const currentPage = pageRef.current;
      const data = await getRoomsOfBoardingZone(zoneId, currentPage);
      const content = Array.isArray(data?.content) ? data.content : [];
      // Nếu không có gì mới thì thôi
      if (content.length === 0 && currentPage !== 0) {
        setHasMore(false);
      } else {
        setRooms((prev) => (currentPage === 0 ? content : [...prev, ...content]));
        pageRef.current = currentPage + 1;
        setHasMore(!data?.last);
        onStats?.({ totalRooms: data?.totalElements ?? (currentPage === 0 ? content.length : rooms.length + content.length) });
      }
      setError('');
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Có lỗi xảy ra.';
      setError(msg);
      if (pageRef.current === 0) {
        setRooms([]);
        onStats?.({ totalRooms: 0 });
      }
      setHasMore(false);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
      afterFirstLoadRef.current = true; // đã xong lượt đầu
      setDidLoad(true);
    }
  }, [hasMore, zoneId, onStats, rooms.length]);

  const onRefresh = useCallback(async () => {
    if (fetchingRef.current || !zoneId) return;
    setRefreshing(true);
    try {
      // reset về page 0
      pageRef.current = 0;
      afterFirstLoadRef.current = false;
      setHasMore(true);
      await appendPage();
    } finally {
      setRefreshing(false);
    }
  }, [zoneId, appendPage]);

  useEffect(() => {
    if (!zoneId) return;
    // reset khi đổi zone
    setRooms([]);
    setError('');
    setHasMore(true);
    setDidLoad(false);
    pageRef.current = 0;
    afterFirstLoadRef.current = false;
    appendPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoneId]);

  const onEndReached = useCallback(() => {
    // BỎ QUA lần đầu để tránh đụng useEffect
    if (!afterFirstLoadRef.current) return;
    if (!loading && hasMore) appendPage();
  }, [loading, hasMore, appendPage]);

  const onView = (id) => {};
  const onEdit = (item) => {navigation.navigate('EditRoom', { item });};
  const onDelete = (id) => {
    Alert.alert('Xác nhận', 'Xoá phòng này?', [
      { text: 'Huỷ' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: () => {
          setRooms((prev) => prev.filter((r) => r.id !== id));
          onStats?.({ totalRooms: Math.max(0, rooms.length - 1) });
        },
      },
    ]);
  };

  const renderRoom = ({ item }) => {
    const img = item.images?.[0];
    const tags = (item.roomAmenities || []).slice(0, 3).map((a) => a.amenityName);
    return (
      <View style={styles.card}>
        <View style={styles.leftCol}>
          {img ? (
            <Image source={{ uri: img }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Feather name="image" size={20} color="#94A3B8" />
            </View>
          )}
        </View>

        <View style={styles.rightCol}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.subText}>
            {item.area ? `${item.area} m² · ` : ''}
            {item.maxPeople ? `${item.maxPeople} người · ` : ''}
            {item.available ? 'Có thể thuê' : 'Tạm hết'}
          </Text>
          <Text style={styles.price}>{item.price?.toLocaleString('vi-VN')}đ/tháng</Text>

          {tags.length > 0 && (
            <View style={styles.tagRow}>
              {tags.map((t) => (
                <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>
              ))}
            </View>
          )}

          <View style={styles.actionsRow}>
            <View style={styles.leftActions}>
              <TouchableOpacity style={styles.pillBtn} onPress={() => onView(item)}>
                <Text style={styles.pillBtnText}>Xem</Text>
                <Feather name="chevron-right" size={16} color="#0F172A" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.ghostBtn} onPress={() => onEdit(item)}>
                <Feather name="edit-3" size={16} color="#0F172A" />
                <Text style={styles.ghostBtnText}>Sửa</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.rightActions}>
              <TouchableOpacity style={[styles.iconBtn, styles.iconBtnDanger]} onPress={() => onDelete(item.id)}>
                <Feather name="trash-2" size={18} color="#DC2626" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      style={{ flex: 1 }}
      data={rooms}
      keyExtractor={(it, idx) => String(it?.id ?? idx)}
      renderItem={renderRoom}
      ListHeaderComponent={<TabsHeader activeKey="rooms" onSwitchTab={onSwitchTab} />}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.35}
      refreshing={refreshing}
      onRefresh={onRefresh}
      removeClippedSubviews={false}
      initialNumToRender={6}
      windowSize={7}
      maxToRenderPerBatch={6}
      updateCellsBatchingPeriod={50}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
      ListEmptyComponent={
        didLoad && !loading ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <View style={styles.emptyIcon}>
              <Feather name="home" size={42} color={PRIMARY} />
            </View>
            <Text style={styles.emptyTitle}>Chưa có phòng nào</Text>
            <Text style={styles.emptyDesc}>Nhấn nút + để thêm phòng trọ đầu tiên</Text>
          </View>
        ) : null
      }
      ListFooterComponent={
        loading && hasMore && rooms.length > 0 ? (
          <View style={{ paddingVertical: 14, alignItems: 'center' }}>
            <LottieView
              source={require('../../assets/animations/loading.json')}
              autoPlay
              loop
              style={{ width: 56, height: 56 }}
            />
            <Text style={{ color: MUTED, marginTop: 6 }}>Đang tải thêm...</Text>
          </View>
        ) : null
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

/* ---------------- Tenants placeholder ---------------- */
function TenantsPanel({ onSwitchTab }) {
  return (
    <FlatList
      style={{ flex: 1 }}
      data={[]}
      keyExtractor={(_, i) => String(i)}
      renderItem={null}
      ListHeaderComponent={<TabsHeader activeKey="tenants" onSwitchTab={onSwitchTab} />}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
      ListEmptyComponent={
        <View style={{ alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <View style={styles.emptyIcon}>
            <Feather name="users" size={42} color={PRIMARY} />
          </View>
          <Text style={styles.emptyTitle}>Chưa có khách thuê</Text>
          <Text style={styles.emptyDesc}>Thêm khách thuê để bắt đầu quản lý hợp đồng và hoá đơn.</Text>
        </View>
      }
    />
  );
}

/* ---------------- styles ---------------- */
const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
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

  card: {
    flexDirection:'row', padding:12, marginBottom:12,
    borderRadius:16, backgroundColor:'#fff',
    borderWidth:1, borderColor:BORDER,
    shadowColor:'#0F172A', shadowOpacity:0.06, shadowRadius:10, shadowOffset:{width:0, height:4}, elevation:2,
  },
  leftCol: { width:96, marginRight:12 },
  image: { width:'100%', aspectRatio:1, borderRadius:12, backgroundColor:'#EDF2F7' },
  imagePlaceholder: { width:'100%', aspectRatio:1, borderRadius:12, backgroundColor:'#EDF2F7', alignItems:'center', justifyContent:'center' },

  rightCol: { flex:1 },
  title: { fontSize:15, fontWeight:'700', color:TEXT },
  subText: { marginTop:2, color:MUTED, fontSize:12 },
  price: { marginTop:6, color:PRIMARY, fontWeight:'700', fontSize:14 },

  tagRow: { flexDirection:'row', flexWrap:'wrap', gap:6, marginTop:6 },
  tag: { paddingHorizontal:8, paddingVertical:3, backgroundColor:'#F1F5F9', borderRadius:999 },
  tagText: { fontSize:11, color:'#0F172A', fontWeight:'600' },

  actionsRow: { marginTop:10, flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  leftActions: { flexDirection:'row', alignItems:'center' },
  pillBtn: { height:32, paddingHorizontal:10, borderRadius:8, backgroundColor:'#F1F5F9', flexDirection:'row', alignItems:'center', marginRight:8 },
  pillBtnText: { color:TEXT, fontWeight:'600', marginRight:4, fontSize:13 },
  ghostBtn: { height:32, paddingHorizontal:10, borderRadius:8, flexDirection:'row', alignItems:'center' },
  ghostBtnText: { color:TEXT, fontWeight:'600', marginLeft:4 },

  rightActions: { flexDirection:'row', alignItems:'center' },
  iconBtn: { width:32, height:32, borderRadius:8, backgroundColor:'#EFF2F6', alignItems:'center', justifyContent:'center', marginLeft:6 },
  iconBtnDanger: { backgroundColor:'#FFE4E6' },

  emptyIcon: { width:90, height:90, borderRadius:999, backgroundColor:'#DBEAFE', alignItems:'center', justifyContent:'center', marginBottom:12 },
  emptyTitle: { fontSize:16, fontWeight:'700', color:TEXT, marginBottom:6, textAlign:'center' },
  emptyDesc: { color:MUTED, textAlign:'center', marginBottom:12 },

  fab: {
    position:'absolute', right:16, bottom:24, width:56, height:56, borderRadius:28,
    backgroundColor:PRIMARY, alignItems:'center', justifyContent:'center',
    shadowColor:'#000', shadowOpacity:0.2, shadowRadius:12, shadowOffset:{width:0, height:6}, elevation:6
  },
});

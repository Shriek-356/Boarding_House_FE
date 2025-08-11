import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, TouchableOpacity,
  FlatList, Image, Alert, ScrollView
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation, useRoute} from '@react-navigation/native';
import LottieView from 'lottie-react-native';

import { getRoomsByZonePaged, /*, deleteRoom, updateRoomVisibility */ 
getRoomsOfBoardingZone} from '../api/roomApi';

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
  const zoneId   = route.params?.id;
  const zoneName = route.params?.name || 'Dãy trọ';

  const [active, setActive] = useState('rooms');
  const [stats, setStats]   = useState({ totalRooms: 0 });

  const Panel = useMemo(() => {
    if (active === 'rooms') return <RoomsPanel zoneId={zoneId} onStats={setStats} />;
    return (
      <Placeholder
        icon="users"
        title="Chưa có khách thuê"
        desc="Thêm khách thuê để bắt đầu quản lý hợp đồng và hoá đơn."
        primaryText="Thêm khách thuê"
        onPrimary={() => navigation.navigate('CreateTenant', { zoneId })}
      />
    );
  }, [active, zoneId, navigation]);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: BG}}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{flex: 1}}>
          <Text style={styles.headerTitle} numberOfLines={1}>{zoneName}</Text>
          <Text style={styles.headerSub}>Tổng phòng: {stats.totalRooms}</Text>
        </View>
        <TouchableOpacity style={styles.headerAction} onPress={() => navigation.goBack()}>
          <Feather name="x" size={18} color={TEXT} />
        </TouchableOpacity>
      </View>

      {/* Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.menuWrap}>
        {MENU.map(it => {
          const isActive = active === it.key;
          return (
            <TouchableOpacity
              key={it.key}
              style={[styles.menuItem, isActive && styles.menuItemActive]}
              onPress={() => setActive(it.key)}
            >
              <Feather name={it.icon} size={16} color={isActive ? '#fff' : TEXT} style={{marginRight: 6}} />
              <Text style={[styles.menuText, isActive && styles.menuTextActive]}>{it.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Content */}
      <View style={{flex: 1}}>{Panel}</View>

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

/* ---------------- Rooms (with pagination) ---------------- */
function RoomsPanel({ zoneId, onStats }) {
  const [rooms, setRooms]   = useState([]);
  const [page, setPage]     = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchRooms = useCallback(async () => {
    if (loading || !hasMore || !zoneId) return;
    setLoading(true);
    try {
      // API trả { content, last, totalElements, ... }
      const data = await getRoomsOfBoardingZone(zoneId);
      const content = Array.isArray(data?.content) ? data.content : [];
      setRooms(prev => [...prev, ...content]);
      setPage(prev => prev + 1);
      setHasMore(!data?.last);
      onStats?.({ totalRooms: data?.totalElements ?? (rooms.length + content.length) });
      setError('');
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Có lỗi xảy ra.';
      setError(msg);
      if (page === 0) {
        setRooms([]);
        onStats?.({ totalRooms: 0 });
      }
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, zoneId, page, rooms.length, onStats]);

  const onRefresh = useCallback(async () => {
    if (loading || !zoneId) return;
    setRefreshing(true);
    try {
      const data = await getRoomsByZonePaged(zoneId, 0);
      const content = Array.isArray(data?.content) ? data.content : [];
      setRooms(content);
      setPage(1);
      setHasMore(!data?.last);
      onStats?.({ totalRooms: data?.totalElements ?? content.length });
      setError('');
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Có lỗi xảy ra.';
      setError(msg);
      setRooms([]);
      setHasMore(false);
      onStats?.({ totalRooms: 0 });
    } finally {
      setRefreshing(false);
    }
  }, [loading, zoneId, onStats]);

  useEffect(() => {
    if (!zoneId) return;
    // reset khi đổi zone
    setRooms([]); setPage(0); setHasMore(true); setError('');
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoneId]);

  const onView = (id) => {}; // navigation.navigate('RoomDetail', { id })
  const onEdit = (id) => {}; // navigation.navigate('EditRoom', { id })
  const onDelete = (id) => {
    Alert.alert('Xác nhận', 'Xoá phòng này?', [
      { text: 'Huỷ' },
      { text: 'Xoá', style: 'destructive', onPress: () => {
        // await deleteRoom(id)
        setRooms(prev => prev.filter(r => r.id !== id));
        onStats?.({ totalRooms: Math.max(0, rooms.length - 1) });
      }}
    ]);
  };

  const renderRoom = ({ item }) => {
    const img = item.images?.[0];
    const tags = (item.roomAmenities || []).slice(0, 3).map(a => a.amenityName);
    return (
      <View style={styles.card}>
        <View style={styles.leftCol}>
          {img ? <Image source={{ uri: img }} style={styles.image} /> :
            <View style={styles.imagePlaceholder}><Feather name="image" size={20} color="#94A3B8" /></View>}
        </View>

        <View style={styles.rightCol}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.subText}>
            {item.area ? `${item.area} m² · ` : ''}{item.maxPeople ? `${item.maxPeople} người · ` : ''}{item.available ? 'Có thể thuê' : 'Tạm hết'}
          </Text>
          <Text style={styles.price}>{item.price?.toLocaleString('vi-VN')}đ/tháng</Text>

          {tags.length > 0 && (
            <View style={styles.tagRow}>
              {tags.map(t => <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>)}
            </View>
          )}

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
      data={rooms}
      keyExtractor={(it, idx) => String(it.id ?? idx)}
      renderItem={renderRoom}
      onEndReached={() => { if (!loading && hasMore) fetchRooms(); }}
      onEndReachedThreshold={0.3}
      refreshing={refreshing}
      onRefresh={onRefresh}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 36, flexGrow: 1 }}
      ListEmptyComponent={
        !loading && !refreshing ? (
          <View style={{ alignItems:'center', justifyContent:'center', flex:1 }}>
            <Feather name="home" size={40} color={PRIMARY} />
            <Text style={{ marginTop:8, fontWeight:'700', color:TEXT }}>Chưa có phòng nào</Text>
            <Text style={{ color:MUTED, marginTop:4 }}>Nhấn nút + để thêm phòng trọ đầu tiên</Text>
          </View>
        ) : null
      }
      ListFooterComponent={
        loading && hasMore && rooms.length > 0 ? (
          <View style={{ paddingVertical: 14, alignItems:'center' }}>
            <LottieView source={require('../../assets/animations/loading.json')} autoPlay loop style={{ width:56, height:56 }} />
            <Text style={{ color:MUTED, marginTop:6 }}>Đang tải thêm...</Text>
          </View>
        ) : null
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

/* ---------------- Placeholder (Tenants) ---------------- */
function Placeholder({ icon, title, desc, primaryText, onPrimary }) {
  return (
    <View style={{ flex:1, alignItems:'center', justifyContent:'center', padding:16 }}>
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

/* ---------------- styles ---------------- */
const styles = StyleSheet.create({
  header: {
    paddingHorizontal:16, paddingTop:8, paddingBottom:12,
    flexDirection:'row', alignItems:'center',
    backgroundColor:'#fff', borderBottomWidth:1, borderBottomColor:BORDER,
  },
  headerTitle: { fontSize:18, fontWeight:'800', color:TEXT },
  headerSub:   { marginTop:4, color:MUTED, fontSize:12 },
  headerAction: {
    width:36, height:36, borderRadius:10, borderWidth:1, borderColor:BORDER,
    alignItems:'center', justifyContent:'center', marginLeft:10, backgroundColor:'#fff'
  },

  menuWrap: { paddingHorizontal:12, paddingVertical:8, gap:8 },
  menuItem: {
    paddingHorizontal:12, height:36, borderRadius:999, borderWidth:1, borderColor:BORDER,
    backgroundColor:'#fff', flexDirection:'row', alignItems:'center', marginRight:8
  },
  menuItemActive: { backgroundColor:PRIMARY, borderColor:PRIMARY },
  menuText: { color:TEXT, fontWeight:'700' },
  menuTextActive: { color:'#fff' },

  card: {
    flexDirection:'row', padding:12, marginTop:12,
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

  primaryBtn: { height:42, paddingHorizontal:16, borderRadius:12, backgroundColor:PRIMARY, flexDirection:'row', alignItems:'center' },
  primaryBtnText: { color:'#fff', fontWeight:'700', marginLeft:8 },

  fab: {
    position:'absolute', right:16, bottom:24, width:56, height:56, borderRadius:28,
    backgroundColor:PRIMARY, alignItems:'center', justifyContent:'center',
    shadowColor:'#000', shadowOpacity:0.2, shadowRadius:12, shadowOffset:{width:0, height:6}, elevation:6
  },
});

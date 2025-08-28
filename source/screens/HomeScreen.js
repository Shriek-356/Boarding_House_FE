import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ImageBackground,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SearchFilterBarComponent from '../components/SearchFilterBarComponent';
import { useNearYouRecommendations } from '../hooks/useNearYouRecommendations';
import { formatAreaLabel } from '../utils/formatAreaLabel';
import { getAllBoardingZones } from '../api/boardingZoneApi';
import { useNavigation } from '@react-navigation/native';

const COLORS = {
  bg: '#F6F7FB',
  card: '#FFFFFF',
  text: '#0F172A',
  sub: '#6B7280',
  primary: '#1E88E5',
  accent: '#FF6A3D',
  price: '#EF4444',
  stroke: '#E5E7EB',
};
const RADIUS = 14;
const { width: W } = Dimensions.get('window');
const COMPACT_W = 220;
const GAP = 12;

function buildAddress(it) {
  return (
    it?.address ||
    [it?.street, it?.ward, it?.district, it?.province].filter(Boolean).join(', ')
  );
}

export default function HomeScreen() {
  const [searchText, setSearchText] = useState('');

  const { data: nearYou, loading: loadingNear, area } = useNearYouRecommendations(8);

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation();

  const fetchPage = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await getAllBoardingZones(page);
      const content = Array.isArray(res?.content) ? res.content : [];
      setPosts(prev => [...prev, ...content]);
      setPage(prev => prev + 1);
      setHasMore(!res?.last);
      setError('');
    } catch (e) {
      setError(e?.message || 'Có lỗi xảy ra khi tải danh sách.');
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page]);

  const onRefresh = useCallback(async () => {
    if (loading) return;
    setRefreshing(true);
    try {
      const res = await getAllBoardingZones(0);
      const content = Array.isArray(res?.content) ? res.content : [];
      setPosts(content);
      setPage(1);
      setHasMore(!res?.last);
      setError('');
    } catch (e) {
      setError(e?.message || 'Có lỗi xảy ra khi làm mới.');
      setPosts([]);
      setPage(0);
      setHasMore(false);
    } finally {
      setRefreshing(false);
    }
  }, [loading]);

  useEffect(() => {
    setPosts([]); setPage(0); setHasMore(true); setError('');
    fetchPage();
  }, []);

  const renderItem = ({ item }) => {
    const img = item?.images?.[0]
      ? { uri: item.images[0] }
      : require('../../assets/images/logo.avif');

    return (
      <TouchableOpacity activeOpacity={0.85} style={styles.card}>
        <View style={styles.thumbWrap}>
          <Image source={img} style={styles.cardImage} />
          <TouchableOpacity style={styles.bookmarkBtn}>
            <Icon name="heart-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text numberOfLines={2} style={styles.cardTitle}>{item?.name || '—'}</Text>
        <Text style={styles.cardPrice}>
          {item?.expectedPrice != null ? `${item.expectedPrice} đ/tháng` : ''}
        </Text>

        <View style={styles.rowCenter}>
          <Icon name="map-marker" size={16} color={COLORS.sub} />
          <Text numberOfLines={1} style={styles.cardLocation}>
            {buildAddress(item) || '—'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderNearCard = ({ item }) => {
    const src = item?.images?.[0]
      ? { uri: item.images[0] }
      : require('../../assets/images/logo.avif');

    return (
      <TouchableOpacity style={styles.nearCard} activeOpacity={0.92}>
        <View style={styles.nearThumbWrap}>
          <Image source={src} style={styles.nearThumb} resizeMode="cover" />
          <View style={styles.badgePrice}>
            <Text style={styles.badgePriceText}>
              {item?.expectedPrice != null ? `${item.expectedPrice} đ/tháng` : ''}
            </Text>
          </View>
          <TouchableOpacity style={styles.heartBtnNear}>
            <Icon name="heart-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text numberOfLines={2} style={styles.nearName}>{item?.name}</Text>
        <Text numberOfLines={1} style={styles.nearBrief}>
          {item?.area ? `${item.area} m²` : null}
          {item?.roomCount ? ` • ${item.roomCount} phòng` : ''}
          {item?.street ? ` • ${item.street}` : item?.ward ? ` • ${item.ward}` : ''}
        </Text>

        <View style={styles.nearMeta}>
          <Icon name="map-marker" size={16} color={COLORS.sub} />
          <Text numberOfLines={1} style={styles.nearLoc}>
            {item?.district ? `${item.district}, ` : ''}{item?.province || ''}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.bannerWrap}>
        <ImageBackground
          source={require('../../assets/images/logo.avif')}
          style={styles.banner}
          imageStyle={styles.bannerImage}
        >
          <View style={styles.overlay} pointerEvents="none" />
          <Text style={styles.headline}>Tìm trọ dễ • nhanh • chuẩn</Text>

          <View style={styles.searchBox}>
            <Icon name="magnify" size={20} color={COLORS.sub} />
            <TextInput
              placeholder="Tìm kiếm người dùng"
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
            />
            <TouchableOpacity
              style={styles.searchBtn}
              onPress={() => navigation.navigate('UserSearch')}
            >
              <Text style={styles.searchBtnText}>Tìm kiếm</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>

      <SearchFilterBarComponent />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Gần bạn{area ? ` • ${formatAreaLabel(area)}` : ''}
        </Text>
        {!!area?.isFallback && <Text style={styles.note}>Đang dùng khu vực mặc định</Text>}
      </View>

      {loadingNear ? (
        <Text style={styles.loadingText}>Đang lấy vị trí & gợi ý…</Text>
      ) : (
        <FlatList
          data={nearYou}
          keyExtractor={x => String(x.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderNearCard}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 6 }}
          snapToInterval={COMPACT_W + GAP}
          decelerationRate={Platform.OS === 'ios' ? 0 : 'fast'}
          snapToAlignment="start"
          disableIntervalMomentum
        />
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Danh sách phòng trọ</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Text style={styles.link}>Làm mới</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={{ gap: 12 }}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={() => { if (!loading && hasMore) fetchPage(); }}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loading ? <Text style={[styles.loadingText, { textAlign: 'center', marginTop: 6 }]}>Đang tải thêm…</Text> : null
        }
        ListEmptyComponent={
          !loading ? <Text style={[styles.loadingText, { textAlign: 'center' }]}>{error || 'Không có dữ liệu'}</Text> : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  bannerWrap: { backgroundColor: COLORS.primary },
  banner: {
    height: 220,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  bannerImage: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    opacity: 0.9,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headline: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 10 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: RADIUS,
    paddingHorizontal: 12,
    paddingVertical: 10,
    elevation: 6,
  },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 0, color: COLORS.text },
  searchBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  searchBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  sectionHeader: {
    marginTop: 18,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  link: { color: COLORS.primary, fontWeight: '600' },
  note: { color: COLORS.sub, fontSize: 12 },
  loadingText: { paddingHorizontal: 16, color: COLORS.sub, marginTop: 8 },
  nearCard: {
    width: COMPACT_W,
    marginRight: GAP,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  nearThumbWrap: { borderRadius: 12, overflow: 'hidden', position: 'relative', aspectRatio: 16 / 9, marginBottom: 8 },
  nearThumb: { width: '100%', height: '100%' },
  badgePrice: { position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgePriceText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  heartBtnNear: { position: 'absolute', right: 8, top: 8, backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 999, padding: 6 },
  nearName: { fontSize: 15, fontWeight: '700', color: COLORS.text, lineHeight: 20 },
  nearBrief: { marginTop: 4, color: COLORS.sub, fontSize: 12 },
  nearMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  nearLoc: { color: COLORS.sub, fontSize: 12, flex: 1 },
  listContent: { padding: 16, paddingTop: 12, gap: 12, paddingBottom: 24 },
  card: { backgroundColor: COLORS.card, borderRadius: RADIUS, padding: 10, flex: 1, elevation: 3 },
  thumbWrap: { borderRadius: 10, overflow: 'hidden', position: 'relative', marginBottom: 8, aspectRatio: 16 / 9 },
  cardImage: { width: '100%', height: '100%' },
  bookmarkBtn: { position: 'absolute', right: 8, top: 8, backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 999, padding: 6 },
  cardTitle: { fontSize: 14.5, fontWeight: '600', color: COLORS.text },
  cardPrice: { fontSize: 14, color: COLORS.price, marginTop: 4, fontWeight: '700' },
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  cardLocation: { color: COLORS.sub, fontSize: 12, flex: 1 },
});

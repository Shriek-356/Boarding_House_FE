import React, { useState } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SearchFilterBarComponent from '../components/SearchFilterBarComponent';
import { useNearYouRecommendations } from '../hooks/useNearYouRecommendations';
import { formatAreaLabel } from '../utils/formatAreaLabel';
import { getAllBoardingZones } from '../api/boardingZoneApi';

// --- Demo list cũ (giữ nguyên logic của bạn) ---
const mockPosts = [
  { id: '1', title: 'Phòng trọ 25m2 có gác lửng', price: '2.5 triệu/tháng', location: 'Q.10, TP.HCM', image: require('../../assets/images/logo.avif') },
  { id: '2', title: 'Nhà nguyên căn 3 tầng', price: '7 triệu/tháng', location: 'Q.12, TP.HCM', image: require('../../assets/images/logo.avif') },
  { id: '3', title: 'Phòng mới tinh, full nội thất', price: '3.8 triệu/tháng', location: 'Q.7, TP.HCM', image: require('../../assets/images/logo.avif') },
  { id: '4', title: 'Căn hộ mini ban công rộng', price: '5.2 triệu/tháng', location: 'Bình Thạnh, TP.HCM', image: require('../../assets/images/logo.avif') },
  { id: '5', title: 'Căn hộ mini ban công rộng', price: '5.2 triệu/tháng', location: 'Bình Thạnh, TP.HCM', image: require('../../assets/images/logo.avif') },
  { id: '6', title: 'Căn hộ mini ban công rộng', price: '5.2 triệu/tháng', location: 'Bình Thạnh, TP.HCM', image: require('../../assets/images/logo.avif') },
  { id: '7', title: 'Căn hộ mini ban công rộng', price: '5.2 triệu/tháng', location: 'Bình Thạnh, TP.HCM', image: require('../../assets/images/logo.avif') },
  { id: '8', title: 'Căn hộ mini ban công rộng', price: '5.2 triệu/tháng', location: 'Bình Thạnh, TP.HCM', image: require('../../assets/images/logo.avif') },
  { id: '9', title: 'Căn hộ mini ban công rộng', price: '5.2 triệu/tháng', location: 'Bình Thạnh, TP.HCM', image: require('../../assets/images/logo.avif') },
];

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

// --- Kích thước item “Gần bạn” (to, tỉ lệ theo màn hình) ---
const { width: W } = Dimensions.get('window');
const COMPACT_W = 220;       // chiều rộng thẻ nhỏ giống ảnh
const GAP = 12;

export default function HomeScreen() {
  const [searchText, setSearchText] = useState('');

  // --- ĐỀ XUẤT GẦN BẠN ---
  const {
    data: nearYou,
    loading: loadingNear,
    error: errorNear,
    area,
  } = useNearYouRecommendations(8);

  // Item card ở grid 2 cột (giữ nguyên)
  const renderItem = ({ item }) => (
    <TouchableOpacity activeOpacity={0.85} style={styles.card}>
      <View style={styles.thumbWrap}>
        <Image source={item.image} style={styles.cardImage} />
        <TouchableOpacity style={styles.bookmarkBtn}>
          <Icon name="heart-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text numberOfLines={2} style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardPrice}>{item.price}</Text>

      <View style={styles.rowCenter}>
        <Icon name="map-marker" size={16} color={COLORS.sub} />
        <Text numberOfLines={1} style={styles.cardLocation}>{item.location}</Text>
      </View>
    </TouchableOpacity>
  );

  // Item đẹp cho “Gần bạn” (UI-only)
  const renderNearCard = ({ item }) => {
    const src = item?.images?.[0]
      ? { uri: item.images[0] }
      : require('../../assets/images/logo.avif');

    return (
      <TouchableOpacity style={styles.nearCard} activeOpacity={0.92}>
        {/* Ảnh lớn 16:9 */}
        <View style={styles.nearThumbWrap}>
          <Image source={src} style={styles.nearThumb} resizeMode="cover" />

          {/* Giá nổi */}
          <View style={styles.badgePrice}>
            <Text style={styles.badgePriceText}>
              {Intl.NumberFormat('vi-VN').format(item.expectedPrice)} đ/tháng
            </Text>
          </View>

          {/* Nút tim */}
          <TouchableOpacity style={styles.heartBtnNear}>
            <Icon name="heart-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Tên & mô tả ngắn */}
        <Text numberOfLines={2} style={styles.nearName}>{item.name}</Text>
        <Text numberOfLines={1} style={styles.nearBrief}>
          {item.area ? `${item.area} m²` : null}
          {item.roomCount ? ` • ${item.roomCount} phòng` : ''}
          {item.street ? ` • ${item.street}` : item.ward ? ` • ${item.ward}` : ''}
        </Text>

        {/* Địa điểm */}
        <View style={styles.nearMeta}>
          <Icon name="map-marker" size={16} color={COLORS.sub} />
          <Text numberOfLines={1} style={styles.nearLoc}>
            {item.district}, {item.province}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Banner */}
      <View style={styles.bannerWrap}>
        <ImageBackground
          source={require('../../assets/images/logo.avif')}
          style={styles.banner}
          imageStyle={styles.bannerImage}
        >
          {/* overlay KHÔNG chặn touch */}
          <View style={styles.overlay} pointerEvents="none" />
          <Text style={styles.headline}>Tìm trọ dễ • nhanh • chuẩn</Text>

          {/* Floating Search */}
          <View style={styles.searchBox}>
            <Icon name="magnify" size={20} color={COLORS.sub} />
            <TextInput
              placeholder="Bạn muốn tìm trọ ở đâu?"
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
            />
            <TouchableOpacity style={styles.searchBtn}>
              <Text style={styles.searchBtnText}>Tìm kiếm</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>

      {/* Filter bar (giữ nguyên để modal hoạt động như cũ) */}
      <SearchFilterBarComponent />

      {/* --- Section: GẦN BẠN --- */}
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
          keyExtractor={(x) => x.id}
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

      {/* --- Section: Danh sách phòng trọ (giữ như cũ) --- */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Danh sách phòng trọ</Text>
        <TouchableOpacity>
          <Text style={styles.link}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      {/* Grid 2 cột */}
      <FlatList
        data={mockPosts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={{ gap: 12 }}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  // Banner
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
  headline: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
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

  // Section header
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

  // --- Near you (new UI) ---
  nearCompact: {
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
  nearCompactHeader: {
    marginBottom: 8,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  nearCompactThumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#EEF2F7',
  },
  nearHeart: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#EFF1F5',
    borderRadius: 16,
    padding: 6,
  },
  nearCompactTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 20,
  },
  nearCompactPrice: {
    marginTop: 6,
    color: COLORS.price,
    fontWeight: '700',
    fontSize: 14,
  },
  nearCompactLoc: {
    color: COLORS.sub,
    fontSize: 12,
    flex: 1,
    marginLeft: 2,
  },

  // --- Grid list cũ ---
  listContent: { padding: 16, paddingTop: 12, gap: 12, paddingBottom: 24 },
  card: { backgroundColor: COLORS.card, borderRadius: RADIUS, padding: 10, flex: 1, elevation: 3 },
  thumbWrap: {
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 8,
    aspectRatio: 16 / 9,
  },
  cardImage: { width: '100%', height: '100%' },
  bookmarkBtn: {
    position: 'absolute',
    right: 8,
    top: 8,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 999,
    padding: 6,
  },
  cardTitle: { fontSize: 14.5, fontWeight: '600', color: COLORS.text },
  cardPrice: { fontSize: 14, color: COLORS.price, marginTop: 4, fontWeight: '700' },
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  cardLocation: { color: COLORS.sub, fontSize: 12, flex: 1 },
});
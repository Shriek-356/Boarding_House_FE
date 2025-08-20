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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SearchFilterBarComponent from '../components/SearchFilterBarComponent';
import { useNearYouRecommendations } from '../hooks/useNearYouRecommendations';

const mockPosts = [
  { id: '1', title: 'Phòng trọ 25m2 có gác lửng', price: '2.5 triệu/tháng', location: 'Q.10, TP.HCM', image: require('../../assets/images/logo.avif') },
  { id: '2', title: 'Nhà nguyên căn 3 tầng',     price: '7 triệu/tháng',   location: 'Q.12, TP.HCM', image: require('../../assets/images/logo.avif') },
  { id: '3', title: 'Phòng mới tinh, full nội thất', price: '3.8 triệu/tháng', location: 'Q.7, TP.HCM', image: require('../../assets/images/logo.avif') },
  { id: '4', title: 'Căn hộ mini ban công rộng',     price: '5.2 triệu/tháng', location: 'Bình Thạnh, TP.HCM', image: require('../../assets/images/logo.avif') },
  { id: '5', title: 'Căn hộ mini ban công rộng',     price: '5.2 triệu/tháng', location: 'Bình Thạnh, TP.HCM', image: require('../../assets/images/logo.avif') },
  { id: '6', title: 'Căn hộ mini ban công rộng',     price: '5.2 triệu/tháng', location: 'Bình Thạnh, TP.HCM', image: require('../../assets/images/logo.avif') },
  { id: '7', title: 'Căn hộ mini ban công rộng',     price: '5.2 triệu/tháng', location: 'Bình Thạnh, TP.HCM', image: require('../../assets/images/logo.avif') },
  { id: '8', title: 'Căn hộ mini ban công rộng',     price: '5.2 triệu/tháng', location: 'Bình Thạnh, TP.HCM', image: require('../../assets/images/logo.avif') },
  { id: '9', title: 'Căn hộ mini ban công rộng',     price: '5.2 triệu/tháng', location: 'Bình Thạnh, TP.HCM', image: require('../../assets/images/logo.avif') },
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

export default function HomeScreen() {
  const [searchText, setSearchText] = useState('');

  // --- ĐỀ XUẤT GẦN BẠN (không ảnh hưởng logic filter cũ) ---
  const {
    data: nearYou,
    loading: loadingNear,
    error: errorNear,
    area,
  } = useNearYouRecommendations(
    8,
    { district: 'Quận 1', province: 'TP. Hồ Chí Minh' } // fallback khi user từ chối quyền
  );

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

  const renderNearCard = ({ item }) => (
    <TouchableOpacity style={styles.nearCard} activeOpacity={0.85}>
      <Image
        source={ item?.images?.[0] ? { uri: item.images[0] } : require('../../assets/images/logo.avif') }
        style={styles.nearThumb}
      />
      <Text numberOfLines={2} style={styles.nearTitle}>{item.name}</Text>
      <Text style={styles.nearPrice}>
        {Intl.NumberFormat('vi-VN').format(item.expectedPrice)} đ/tháng
      </Text>
      <View style={styles.rowCenter}>
        <Icon name="map-marker" size={16} color={COLORS.sub} />
        <Text numberOfLines={1} style={styles.nearLoc}>
          {item.district}, {item.province}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
          Gần bạn{area ? ` • ${area.district}, ${area.province}` : ''}
        </Text>
        {!!errorNear && <Text style={styles.note}>Đang dùng khu vực mặc định</Text>}
      </View>

      {loadingNear ? (
        <Text style={styles.loadingText}>Đang lấy vị trí & gợi ý…</Text>
      ) : (
        <FlatList
          data={nearYou}
          keyExtractor={(x) => x.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
          renderItem={renderNearCard}
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

  // Near-you
  loadingText: { paddingHorizontal: 16, color: COLORS.sub, marginTop: 8 },
  nearCard: {
    width: 220,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 10,
    marginRight: 12,
    elevation: 3,
  },
  nearThumb: { width: '100%', aspectRatio: 16 / 9, borderRadius: 8, marginBottom: 8 },
  nearTitle: { fontSize: 14.5, fontWeight: '600', color: COLORS.text },
  nearPrice: { fontSize: 14, fontWeight: '700', color: COLORS.price, marginTop: 4 },
  nearLoc: { color: COLORS.sub, fontSize: 12, flex: 1 },

  // Grid
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
  bookmarkBtn: { position: 'absolute', right: 8, top: 8, backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 999, padding: 6 },
  cardTitle: { fontSize: 14.5, fontWeight: '600', color: COLORS.text },
  cardPrice: { fontSize: 14, color: COLORS.price, marginTop: 4, fontWeight: '700' },
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  cardLocation: { color: COLORS.sub, fontSize: 12, flex: 1 },
});

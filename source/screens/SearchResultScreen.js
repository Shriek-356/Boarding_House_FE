import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Dimensions,
  ScrollView,
  Animated
} from 'react-native';
import { searchBoardingZones } from '../api/boardingZoneApi';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Carousel from 'react-native-snap-carousel';
import MapView, { Marker } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

const SearchResultScreen = ({ route }) => {
  const { location, price, area } = route.params;
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [featuredItems, setFeaturedItems] = useState([]);
  const scrollY = new Animated.Value(0);
  const navigation = useNavigation();

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const filters = {
        province: location?.province?.name,
        district: location?.district?.name,
        ward: location?.ward?.name,
        minPrice: price?.min,
        maxPrice: price?.max,
        minArea: area?.min,
        maxArea: area?.max,
        page: 0,
      };
      
      const data = await searchBoardingZones(filters);
      setResults(data.content || []);
      setFeaturedItems(data.content.slice(0, 3) || []); // Lấy 3 item đầu làm nổi bật
    } catch (error) {
      console.error('Lỗi khi tìm kiếm:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderFeaturedItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.featuredCard}
      onPress={() => navigation.navigate('BoardingZoneDetail', { id: item.id })}
    >
      <Image
        source={{ uri: item.images?.[0] || 'https://i.imgur.com/0b2Y7xK.jpg' }}
        style={styles.featuredImage}
      />
      <View style={styles.featuredBadge}>
        <Icon name="crown" size={16} color="#FFD700" />
        <Text style={styles.featuredBadgeText}>Nổi bật</Text>
      </View>
      <View style={styles.featuredContent}>
        <Text style={styles.featuredTitle} numberOfLines={1}>{item.name}</Text>
        <View style={styles.featuredInfo}>
          <Icon name="map-marker" size={14} color="#FFF" />
          <Text style={styles.featuredAddress} numberOfLines={1}>
            {[item.district, item.province].filter(Boolean).join(', ')}
          </Text>
        </View>
        <Text style={styles.featuredPrice}>
          {item.expectedPrice?.toLocaleString('vi-VN')}đ/tháng
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderGridItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.gridCard}
      onPress={() => navigation.navigate('BoardingZoneDetail', { id: item.id })}
    >
      <Image
        source={{ uri: item.images?.[0] || 'https://i.imgur.com/0b2Y7xK.jpg' }}
        style={styles.gridImage}
      />
      <View style={styles.gridContent}>
        <Text style={styles.gridTitle} numberOfLines={1}>{item.name}</Text>
        <View style={styles.gridInfo}>
          <Icon name="map-marker-radius" size={12} color="#6C5CE7" />
          <Text style={styles.gridAddress} numberOfLines={1}>
            {item.district}
          </Text>
        </View>
        <View style={styles.gridFooter}>
          <Text style={styles.gridPrice}>
            {item.expectedPrice?.toLocaleString('vi-VN')}đ
          </Text>
          <View style={styles.ratingBadge}>
            <Icon name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>4.8</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderMapItem = () => (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 10.8231,
          longitude: 106.6297,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {results.map((item, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: item.latitude || 10.8231 + (index * 0.001),
              longitude: item.longitude || 106.6297 + (index * 0.001)
            }}
            title={item.name}
            description={`${item.expectedPrice?.toLocaleString('vi-VN')}đ`}
          >
            <View style={styles.mapMarker}>
              <Text style={styles.mapMarkerText}>
                {item.expectedPrice?.toLocaleString('vi-VN').replace(/\D/g,'').slice(0,3)}k
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C5CE7" />
        <Text style={styles.loadingText}>Đang tải kết quả...</Text>
      </View>
    );
  }

  if (results.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Image 
          source={{ uri: 'https://i.imgur.com/Vpw3R3Q.png' }} 
          style={styles.emptyImage}
        />
        <Text style={styles.emptyTitle}>Không tìm thấy kết quả</Text>
        <Text style={styles.emptySubtitle}>Hãy thử điều chỉnh bộ lọc hoặc mở rộng phạm vi tìm kiếm</Text>
        <TouchableOpacity style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [300, 100],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <Carousel
          data={featuredItems}
          renderItem={renderFeaturedItem}
          sliderWidth={width}
          itemWidth={width - 80}
          layout={'default'}
          loop
          autoplay
        />
      </Animated.View>

      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.toggleButton, viewMode === 'grid' && styles.activeToggle]}
          onPress={() => setViewMode('grid')}
        >
          <Icon name="view-grid" size={20} color={viewMode === 'grid' ? '#FFF' : '#6C5CE7'} />
          <Text style={[styles.toggleText, viewMode === 'grid' && styles.activeToggleText]}>Lưới</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleButton, viewMode === 'map' && styles.activeToggle]}
          onPress={() => setViewMode('map')}
        >
          <Icon name="map" size={20} color={viewMode === 'map' ? '#FFF' : '#6C5CE7'} />
          <Text style={[styles.toggleText, viewMode === 'map' && styles.activeToggleText]}>Bản đồ</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <View style={styles.content}>
          {viewMode === 'grid' ? (
            <FlatList
              data={results}
              renderItem={renderGridItem}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              columnWrapperStyle={styles.gridRow}
              scrollEnabled={false}
            />
          ) : (
            renderMapItem()
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#6C5CE7',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#636E72',
    textAlign: 'center',
    marginBottom: 25,
    paddingHorizontal: 40,
  },
  retryButton: {
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  header: {
    backgroundColor: '#6C5CE7',
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  featuredCard: {
    width: width - 80,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 10,
    elevation: 5,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  featuredBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  featuredBadgeText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 15,
  },
  featuredTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  featuredInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  featuredAddress: {
    color: '#FFF',
    fontSize: 12,
    marginLeft: 5,
    opacity: 0.9,
  },
  featuredPrice: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: -15,
    marginBottom: 15,
    zIndex: 10,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginHorizontal: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activeToggle: {
    backgroundColor: '#6C5CE7',
  },
  toggleText: {
    marginLeft: 5,
    color: '#6C5CE7',
    fontWeight: '600',
  },
  activeToggleText: {
    color: '#FFF',
  },
  content: {
    padding: 15,
    paddingBottom: 30,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  gridCard: {
    width: (width - 45) / 2,
    backgroundColor: '#FFF',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gridImage: {
    width: '100%',
    height: 120,
  },
  gridContent: {
    padding: 12,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 5,
  },
  gridInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridAddress: {
    fontSize: 11,
    color: '#636E72',
    marginLeft: 5,
  },
  gridFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6C5CE7',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 11,
    color: '#6C5CE7',
    marginLeft: 2,
    fontWeight: 'bold',
  },
  mapContainer: {
    height: height - 300,
    borderRadius: 15,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapMarker: {
    backgroundColor: '#6C5CE7',
    padding: 5,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  mapMarkerText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default SearchResultScreen;
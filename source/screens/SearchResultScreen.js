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
  StatusBar,
  SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { searchBoardingZones } from '../api/boardingZoneApi'; // Assuming you have this API function
const { width } = Dimensions.get('window');

const SearchResultScreen = ({ route }) => {
  const { location, price, area } = route.params;
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
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
    } catch (error) {
      console.error('Lỗi khi tìm kiếm:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('BoardingZoneDetail', { id: item.id })}
    >
      <Image
        source={{ uri: item.images?.[0] || 'https://i.imgur.com/JZw1g0a.jpg' }}
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.price}>
          {item.expectedPrice?.toLocaleString('vi-VN')}đ/tháng
        </Text>
        <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
        <View style={styles.locationContainer}>
          <Icon name="location-outline" size={14} color="#888" />
          <Text style={styles.address} numberOfLines={1}>
            {[item.address, item.ward, item.district].filter(Boolean).join(', ')}
          </Text>
        </View>
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Icon name="square-outline" size={14} color="#6C5CE7" />
            <Text style={styles.detailText}>{item.area}m²</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#0066FF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Danh sách phòng phù hợp</Text>
          <View style={styles.emptyRight} />
        </View>
        <View style={styles.emptyContainer}>
          <Icon name="search-off" size={60} color="#0066FF" />
          <Text style={styles.emptyText}>Không tìm thấy kết quả phù hợp</Text>
          <Text style={styles.emptySubText}>Hãy thử điều chỉnh tiêu chí tìm kiếm</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#0066FF" barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Danh sách phòng phù hợp</Text>
        <View style={styles.emptyRight} />
      </View>
      
      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.resultCount}>{results.length} kết quả tìm kiếm</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    backgroundColor: '#0066FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1,
    textAlign: 'center',
  },
  emptyRight: {
    width: 34,
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
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubText: {
    fontSize: 14,
    color: '#636E72',
    textAlign: 'center',
  },
  listContainer: {
    padding: 15,
    paddingBottom: 20,
  },
  resultCount: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: 15,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6C5CE7',
    marginBottom: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  address: {
    fontSize: 13,
    color: '#636E72',
    marginLeft: 5,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 13,
    color: '#636E72',
    marginLeft: 5,
  },
});

export default SearchResultScreen;
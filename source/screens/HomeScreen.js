import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ImageBackground,
  FlatList,
  ScrollView,
  Image,
} from 'react-native';
import { Button } from 'react-native-paper';
import SearchFilterBarComponent from '../components/SearchFilterBarComponent';
import { searchBoardingZones } from '../api/boardingZoneApi';
import { endpoints } from '../api/boardingZoneApi';
import { axiosInstance } from '../api/axiosClient';
import qs from 'qs';
const mockPosts = [
  {
    id: '1',
    title: 'Phòng trọ 25m2 có gác lửng',
    price: '2.5 triệu/tháng',
    location: 'Q.10, TP.HCM',
    image: require('../../assets/images/logo.avif'),
  },
  {
    id: '2',
    title: 'Nhà nguyên căn 3 tầng',
    price: '7 triệu/tháng',
    location: 'Q.12, TP.HCM',
    image: require('../../assets/images/logo.avif'),
  },
];

const HomeScreen = () => {
  const [searchText, setSearchText] = useState('');

  const onSearch = async ({ location, price, area }) => {
    const filters = {};

    if (location?.province?.name) filters.province = location.province.name;
    if (location?.district?.name) filters.district = location.district.name;
    if (location?.ward?.name) filters.ward = location.ward.name;

    if (price?.min) filters.minPrice = price.min;
    if (price?.max) filters.maxPrice = price.max;

    if (area?.value?.min) filters.minArea = area.value.min;
    if (area?.value?.max) filters.maxArea = area.value.max;
    filters.page = 0; // page mặc định
    try {

      const response = await axiosInstance.get(endpoints.searchBoardingZones, {
        params: filters,
      });
      console.log('Kết quả tìm kiếm:', response.data);
      // setState(data.content) nếu bạn muốn hiển thị danh sách
    } catch (error) {
      console.error('Lỗi tìm kiếm:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Ảnh nền phía trên */}
      <ImageBackground
        source={require('../../assets/images/logo.avif')}
        style={styles.banner}
        imageStyle={{ borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
      >
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Bạn muốn tìm trọ ở đâu?"
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
          />
          <Button mode="contained" style={styles.searchButton}>
            Tìm kiếm
          </Button>
        </View>
      </ImageBackground>

      {/* Thanh lọc trọ */}
      <SearchFilterBarComponent onSearch={onSearch} />

      {/* Danh sách trọ */}
      <Text style={styles.sectionTitle}>Danh sách phòng trọ</Text>
      <FlatList
        data={mockPosts}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={item.image} style={styles.cardImage} />
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardPrice}>{item.price}</Text>
            <Text style={styles.cardLocation}>{item.location}</Text>
          </View>
        )}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  banner: {
    height: 240,
    justifyContent: 'flex-end',
    padding: 16,
  },
  searchContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    fontSize: 16,
  },
  searchButton: {
    borderRadius: 8,
    backgroundColor: '#007BFF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 16,
    marginLeft: 16,
  },
  card: {
    backgroundColor: '#fff',
    marginRight: 16,
    borderRadius: 12,
    padding: 12,
    width: 220,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardPrice: {
    fontSize: 14,
    color: '#EF4444',
    marginVertical: 4,
  },
  cardLocation: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default HomeScreen;

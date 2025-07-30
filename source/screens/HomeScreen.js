// screens/HomeScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ImageBackground,
  FlatList,
  ScrollView,
  Image
} from 'react-native';
import { Button } from 'react-native-paper';
import SearchFilterBar from '../components/SearchFilterBarComponent';

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

  const handleFilterSearch = (filters) => {
    console.log('Tìm kiếm với bộ lọc:', filters);
    // Gọi API ở đây nếu cần
  };

  return (
    <ScrollView style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/logo.avif')}
        style={styles.banner}
        imageStyle={{ borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
      >
        <View style={styles.overlay}>
          <Text style={styles.bannerText}>Tìm chỗ ở phù hợp</Text>
        </View>
      </ImageBackground>

      {/* Thanh lọc */}
      <SearchFilterBar onSearch={handleFilterSearch} />

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
    height: 180,
    justifyContent: 'flex-end',
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    padding: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  bannerText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
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

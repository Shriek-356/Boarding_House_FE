import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import AreaFilterModal from '../modals/AreaFilterModal';
import PriceFilterModal from '../modals/PriceFilterModal';
import LocationFilterModal from '../modals/LocationFilterModal';

const SearchFilterBarComponent = () => {
  const [locationVisible, setLocationVisible] = useState(false);
  const [priceVisible, setPriceVisible] = useState(false);
  const [areaVisible, setAreaVisible] = useState(false);
  // Thêm state để lưu trữ địa điểm đã chọn
  const [selectedLocationDisplay, setSelectedLocationDisplay] = useState('Địa điểm');

  const handleLocationSelect = (province, district) => {
    let display = 'Địa điểm';
    if (district) {
      display = `${district}, ${province}`;
    } else if (province) {
      display = province;
    }
    setSelectedLocationDisplay(display);
    setLocationVisible(false); // Đóng modal sau khi chọn
  };

  return (
    <View style={styles.searchBarContainer}>
      <View style={styles.filterItemsWrapper}>
        {/* Nút Địa điểm - Hiển thị giá trị đã chọn */}
        <TouchableOpacity style={[styles.filterItem, styles.filterItemLeft]} onPress={() => setLocationVisible(true)}>
          <Icon name="map-marker-outline" size={20} color="#007AFF" />
          <View style={styles.filterTextContainer}>
            <Text style={styles.filterLabel}>{selectedLocationDisplay}</Text>
            <Icon name="chevron-down" size={20} color="#666" />
          </View>
        </TouchableOpacity>

        {/* Nút Mức giá */}
        <TouchableOpacity style={styles.filterItem} onPress={() => setPriceVisible(true)}>
          <Icon name="currency-usd" size={20} color="#007AFF" />
          <View style={styles.filterTextContainer}>
            <Text style={styles.filterLabel}>Mức giá</Text>
            <Icon name="chevron-down" size={20} color="#666" />
          </View>
        </TouchableOpacity>

        {/* Nút Diện tích */}
        <TouchableOpacity style={[styles.filterItem, styles.filterItemRight]} onPress={() => setAreaVisible(true)}>
          <Icon name="ruler-square" size={20} color="#007AFF" />
          <View style={styles.filterTextContainer}>
            <Text style={styles.filterLabel}>Diện tích</Text>
            <Icon name="chevron-down" size={20} color="#666" />
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.searchButton}>
        <Icon name="magnify" size={24} color="#fff" />
        <Text style={styles.searchButtonText}>Tìm kiếm</Text>
      </TouchableOpacity>

      {/* Truyền hàm callback xuống LocationFilterModal */}
      <LocationFilterModal
        visible={locationVisible}
        onClose={() => setLocationVisible(false)}
        onSelectLocation={handleLocationSelect} // Truyền hàm này
      />
      <PriceFilterModal visible={priceVisible} onClose={() => setPriceVisible(false)} />
      <AreaFilterModal visible={areaVisible} onClose={() => setAreaVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  searchBarContainer: {
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 12,
    marginHorizontal: 15,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  filterItemsWrapper: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterItemLeft: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  filterItemRight: {
    borderRightWidth: 0,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  filterTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 8,
  },
  filterLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  searchButton: {
    backgroundColor: '#FF5722',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 8,
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
  },
});

export default SearchFilterBarComponent;
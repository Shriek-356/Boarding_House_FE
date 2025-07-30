import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import LocationFilterModal from './LocationFilterModal';
import PriceFilterModal from './PriceFilterModal';
import AreaFilterModal from './AreaFilterModal';

const SearchFilterBarComponent = () => {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);

  return (
    <View style={styles.container}>
      {/* Địa điểm */}
      <TouchableOpacity style={styles.filterItem} onPress={() => setShowLocationModal(true)}>
        <Icon name="map-marker" size={20} color="#00BFFF" />
        <Text style={styles.filterText}>Địa điểm</Text>
        <Icon name="chevron-down" size={16} />
      </TouchableOpacity>

      {/* Mức giá */}
      <TouchableOpacity style={styles.filterItem} onPress={() => setShowPriceModal(true)}>
        <Icon name="currency-usd" size={20} color="#00BFFF" />
        <Text style={styles.filterText}>Mức giá</Text>
        <Icon name="chevron-down" size={16} />
      </TouchableOpacity>

      {/* Diện tích */}
      <TouchableOpacity style={styles.filterItem} onPress={() => setShowAreaModal(true)}>
        <Text style={[styles.filterText, { color: '#00BFFF' }]}>m² Diện tích</Text>
        <Icon name="chevron-down" size={16} />
      </TouchableOpacity>

      {/* Nút tìm kiếm */}
      <TouchableOpacity style={styles.searchButton}>
        <Icon name="magnify" size={18} color="#fff" />
        <Text style={styles.searchText}>Tìm kiếm</Text>
      </TouchableOpacity>

      {/* Các modal */}
      <LocationFilterModal visible={showLocationModal} onClose={() => setShowLocationModal(false)} />
      <PriceFilterModal visible={showPriceModal} onClose={() => setShowPriceModal(false)} />
      <AreaFilterModal visible={showAreaModal} onClose={() => setShowAreaModal(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#004AAD',
    padding: 8,
    borderRadius: 8,
    margin: 12,
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 6,
  },
  filterText: {
    marginLeft: 4,
    marginRight: 4,
    fontSize: 14,
    color: '#555',
  },
  searchButton: {
    flexDirection: 'row',
    backgroundColor: '#FF6600',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default SearchFilterBarComponent;

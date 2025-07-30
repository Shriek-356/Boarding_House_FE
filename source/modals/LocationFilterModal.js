import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const provinces = ['TP.HCM', 'Hà Nội', 'Đà Nẵng'];
const districts = {
  'TP.HCM': ['Quận 1', 'Quận 10', 'Gò Vấp'],
  'Hà Nội': ['Cầu Giấy', 'Ba Đình', 'Thanh Xuân'],
  'Đà Nẵng': ['Hải Châu', 'Sơn Trà', 'Thanh Khê'],
};

// Thêm onSelectLocation vào props
const LocationFilterModal = ({ visible, onClose, onSelectLocation }) => {
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const handleProvinceSelect = (province) => {
    setSelectedProvince(province);
    setSelectedDistrict(null);
    // Gọi onSelectLocation ngay cả khi chỉ chọn tỉnh/thành phố
    if (onSelectLocation) {
      onSelectLocation(province, null);
    }
  };

  const handleDistrictSelect = (district) => {
    setSelectedDistrict(district);
    if (onSelectLocation) {
      onSelectLocation(selectedProvince, district); // Truyền cả tỉnh và huyện
    }
    onClose(); // đóng modal sau khi chọn
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Chọn địa điểm</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Tỉnh / Thành phố</Text>
          <FlatList
            horizontal
            data={provinces}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.option,
                  selectedProvince === item && styles.selectedOption,
                ]}
                onPress={() => handleProvinceSelect(item)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedProvince === item && styles.selectedText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />

          {selectedProvince && (
            <>
              <Text style={styles.label}>Quận / Huyện</Text>
              <FlatList
                data={districts[selectedProvince]}
                keyExtractor={(item) => item}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.option,
                      selectedDistrict === item && styles.selectedOption,
                    ]}
                    onPress={() => handleDistrictSelect(item)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedDistrict === item && styles.selectedText,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 10,
    color: '#374151',
  },
  listContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: '#3B82F6',
  },
  optionText: {
    color: '#374151',
    fontSize: 14,
  },
  selectedText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default LocationFilterModal;
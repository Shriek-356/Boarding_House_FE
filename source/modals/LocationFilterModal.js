import React, { useState, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const provinces = ['TP.HCM', 'Hà Nội', 'Đà Nẵng'];
const districts = {
  'TP.HCM': ['Quận 1', 'Quận 10', 'Gò Vấp'],
  'Hà Nội': ['Cầu Giấy', 'Ba Đình', 'Thanh Xuân'],
  'Đà Nẵng': ['Hải Châu', 'Sơn Trà', 'Thanh Khê'],
};

const LocationFilterModal = ({ visible, onClose, onSelectLocation }) => {
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const scrollViewRef = useRef(null);
  const districtListRef = useRef(null);

  const handleProvinceSelect = (province) => {
    // Logic: Nếu tỉnh này đang được chọn -> hủy chọn. Ngược lại -> chọn tỉnh mới.
    if (selectedProvince === province) {
      // Hủy chọn tỉnh hiện tại
      setSelectedProvince(null);
      setSelectedDistrict(null); // Đảm bảo hủy cả huyện
      if (onSelectLocation) {
        onSelectLocation(null, null); // Gửi null cho cả tỉnh và huyện
      }
    } else {
      // Chọn tỉnh mới
      setSelectedProvince(province);
      setSelectedDistrict(null); // Reset huyện khi chọn tỉnh mới
      if (onSelectLocation) {
        onSelectLocation(province, null); // Gửi tỉnh đã chọn, huyện là null
      }
      // Khi chọn tỉnh, cuộn xuống phần quận/huyện nếu nó đã render
      setTimeout(() => {
        if (districtListRef.current && scrollViewRef.current) {
          districtListRef.current.measureLayout(
            scrollViewRef.current,
            (x, y, width, height) => {
              scrollViewRef.current.scrollTo({ y: y, animated: true });
            },
            () => {}
          );
        }
      }, 100);
    }
    // LOẠI BỎ onCLOSE() ở đây. Modal sẽ không tự đóng khi chỉ chọn tỉnh/thành phố.
    // onClose(); // <-- BỎ DÒNG NÀY
  };

  const handleDistrictSelect = (district) => {
    // Logic: Nếu huyện này đang được chọn -> hủy chọn. Ngược lại -> chọn huyện mới và đóng modal.
    if (selectedDistrict === district) {
      // Hủy chọn huyện hiện tại
      setSelectedDistrict(null);
      if (onSelectLocation) {
        onSelectLocation(selectedProvince, null); // Giữ tỉnh, gửi null cho huyện
      }
    } else {
      // Chọn huyện mới
      setSelectedDistrict(district);
      if (onSelectLocation) {
        onSelectLocation(selectedProvince, district); // Gửi cả tỉnh và huyện đã chọn
      }
      onClose(); // Giữ nguyên onClose() ở đây, vì chọn huyện là hành động cuối cùng
    }
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

          <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Tỉnh / Thành phố</Text>
            <FlatList
              horizontal
              data={provinces}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.listContainer}
              showsHorizontalScrollIndicator={false}
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
              <View ref={districtListRef}>
                <Text style={styles.label}>Quận / Huyện</Text>
                <FlatList
                  key={selectedProvince}
                  horizontal
                  data={districts[selectedProvince] || []}
                  keyExtractor={(item) => item}
                  contentContainerStyle={styles.listContainer}
                  showsHorizontalScrollIndicator={false}
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
              </View>
            )}
          </ScrollView>
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
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10,
    color: '#374151',
  },
  listContainer: {
    paddingBottom: 5,
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#E5E7EB',
    borderRadius: 25,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedOption: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  optionText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '500',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default LocationFilterModal;
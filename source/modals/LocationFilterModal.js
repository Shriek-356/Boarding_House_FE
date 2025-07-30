import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const provinces = ['TP.HCM', 'Hà Nội', 'Đà Nẵng'];
const districts = {
  'TP.HCM': ['Quận 1', 'Quận 10', 'Gò Vấp'],
  'Hà Nội': ['Cầu Giấy', 'Ba Đình', 'Thanh Xuân'],
  'Đà Nẵng': ['Hải Châu', 'Sơn Trà', 'Thanh Khê'],
};

const LocationModal = ({ visible, onClose, onSelect }) => {
  const [selectedProvince, setProvince] = useState(null);
  const [selectedDistrict, setDistrict] = useState(null);

  const reset = () => {
    setProvince(null);
    setDistrict(null);
  };

  const handleConfirm = () => {
    if (selectedProvince && selectedDistrict) {
      onSelect(selectedProvince, selectedDistrict);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Chọn địa điểm</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} />
            </TouchableOpacity>
          </View>

          {/* Province Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Tỉnh/Thành phố</Text>
            <View style={styles.options}>
              {provinces.map(province => (
                <TouchableOpacity
                  key={province}
                  style={[
                    styles.option,
                    selectedProvince === province && styles.selected
                  ]}
                  onPress={() => {
                    setProvince(province);
                    setDistrict(null);
                  }}
                >
                  <Text style={selectedProvince === province && styles.selectedText}>
                    {province}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* District Selection */}
          {selectedProvince && (
            <View style={styles.section}>
              <Text style={styles.label}>Quận/Huyện</Text>
              <View style={styles.options}>
                {districts[selectedProvince].map(district => (
                  <TouchableOpacity
                    key={district}
                    style={[
                      styles.option,
                      selectedDistrict === district && styles.selected
                    ]}
                    onPress={() => setDistrict(district)}
                  >
                    <Text style={selectedDistrict === district && styles.selectedText}>
                      {district}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Actions */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.reset} onPress={reset}>
              <Text>Đặt lại</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.confirm, !selectedDistrict && styles.disabled]}
              onPress={handleConfirm}
              disabled={!selectedDistrict}
            >
              <Text style={styles.confirmText}>Xác nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modal: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  section: {
    marginBottom: 15
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '600'
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  option: {
    padding: 10,
    margin: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5
  },
  selected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  },
  reset: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center'
  },
  confirm: {
    padding: 10,
    backgroundColor: '#2196F3',
    borderRadius: 5,
    flex: 1,
    alignItems: 'center'
  },
  disabled: {
    backgroundColor: '#cccccc'
  },
  confirmText: {
    color: 'white',
    fontWeight: 'bold'
  }
});

export default LocationModal;
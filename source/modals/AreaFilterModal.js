import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const areaRanges = [
  { label: 'Dưới 10m²', value: { min: 0, max: 10 } },
  { label: '10 - 20m²', value: { min: 10, max: 20 } },
  { label: '20 - 30m²', value: { min: 20, max: 30 } },
  { label: '30 - 50m²', value: { min: 30, max: 50 } },
  { label: 'Trên 50m²', value: { min: 50, max: Infinity } },
];

const AreaFilterModal = ({ visible, onClose, onSelect }) => {
  const [selectedArea, setSelectedArea] = useState(null);

  const handleSelect = (range) => {
    setSelectedArea(range);
    onSelect(range); // Gửi về parent
    onClose();        // Đóng modal
  };

  const handleReset = () => {
    setSelectedArea(null);
    onSelect(null); // Gửi null để xóa lựa chọn
    onClose();      // Đóng modal
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Chọn diện tích</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={areaRanges}
            keyExtractor={(item) => item.label}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.option,
                  selectedArea?.label === item.label && styles.selectedOption,
                ]}
                onPress={() => handleSelect(item)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedArea?.label === item.label && styles.selectedText,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContainer}
          />

          {/* Nút Đặt lại */}
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetText}>Đặt lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', // ✅ từ 'flex-end' → 'center'
    alignItems: 'center',     // ✅ căn giữa ngang
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    width: '90%',             // ✅ giới hạn chiều ngang
    maxHeight: '80%',         // ✅ tránh tràn màn
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  listContainer: {
    paddingBottom: 16,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: '#10B981',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  resetText: {
    color: '#374151',
    fontWeight: 'bold',
  },
});

export default AreaFilterModal;

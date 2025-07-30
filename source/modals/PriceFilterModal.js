import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const priceRanges = [
  { label: 'Dưới 1 triệu', value: { min: 0, max: 1000000 } },
  { label: '1 - 2 triệu', value: { min: 1000000, max: 2000000 } },
  { label: '2 - 3 triệu', value: { min: 2000000, max: 3000000 } },
  { label: '3 - 5 triệu', value: { min: 3000000, max: 5000000 } },
  { label: 'Trên 5 triệu', value: { min: 5000000, max: Infinity } },
];

const PriceFilterModal = ({ visible, onClose }) => {
  const [selectedRange, setSelectedRange] = useState(null);

  const handleSelect = (range) => {
    setSelectedRange(range);
    onClose(); // đóng modal sau khi chọn
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Chọn mức giá</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={priceRanges}
            keyExtractor={(item) => item.label}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.option,
                  selectedRange?.label === item.label && styles.selectedOption,
                ]}
                onPress={() => handleSelect(item)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedRange?.label === item.label && styles.selectedText,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContainer}
          />
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
    maxHeight: '60%',
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
    backgroundColor: '#3B82F6',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default PriceFilterModal;

import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PriceFilterModal = ({ visible, onClose, onSelect }) => {
  const [inputMin, setInputMin] = useState('');
  const [inputMax, setInputMax] = useState('');

  const minInputRef = useRef();
  const maxInputRef = useRef();

  const handleManualApply = () => {
    const min = parseFloat(inputMin) || 0;
    const max = parseFloat(inputMax) || 0;
    onSelect(
      min * 1_000_000,
      max * 1_000_000,
      `${inputMin} - ${inputMax} triệu`
    );
    onClose();
  };

  const handleReset = () => {
    setInputMin('');
    setInputMax('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Chọn mức giá</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* Input Từ - Đến */}
            <View style={styles.priceInputContainer}>
              <View style={styles.priceInputWrapper}>
                <Text style={styles.priceLabel}>Từ</Text>
                <TextInput
                  ref={minInputRef}
                  value={inputMin}
                  onChangeText={setInputMin}
                  keyboardType="numeric"
                  style={styles.priceInput}
                  placeholder="0"
                />
                <Text style={styles.priceUnit}>triệu</Text>
              </View>

              <View style={styles.priceInputWrapper}>
                <Text style={styles.priceLabel}>Đến</Text>
                <TextInput
                  ref={maxInputRef}
                  value={inputMax}
                  onChangeText={setInputMax}
                  keyboardType="numeric"
                  style={styles.priceInput}
                  placeholder="50"
                />
                <Text style={styles.priceUnit}>triệu</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.manualApply} onPress={handleManualApply}>
              <Text style={styles.manualApplyText}>Áp dụng</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetText}>Đặt lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
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
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  priceInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 10,
    flex: 0.48,
  },
  priceLabel: {
    color: '#666',
    marginRight: 6,
  },
  priceInput: {
    flex: 1,
    textAlign: 'right',
    fontSize: 16,
    padding: 8,
  },
  priceUnit: {
    color: '#666',
    marginLeft: 4,
  },
  manualApply: {
    marginTop: 16,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  manualApplyText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  resetButton: {
    marginTop: 10,
    backgroundColor: '#E5E7EB',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetText: {
    color: '#374151',
    fontWeight: 'bold',
  },
});

export default PriceFilterModal;

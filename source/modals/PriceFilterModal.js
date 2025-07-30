import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PriceFilterModal = ({ visible, onClose, onApply }) => {
  const MIN_PRICE = 0;
  const MAX_PRICE = 200;
  const STEP = 1;

  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(50);
  const [inputMin, setInputMin] = useState('0');
  const [inputMax, setInputMax] = useState('50');
  const [selectedPreset, setSelectedPreset] = useState(null);

  const minInputRef = useRef();
  const maxInputRef = useRef();

  const pricePresets = [
    { id: 'all', label: 'Tất cả mức giá' },
    { id: 'under1', label: 'Dưới 1 triệu', min: 0, max: 1 },
    { id: '1to10', label: '1 - 10 triệu', min: 1, max: 10 },
    { id: '10to30', label: '10 - 30 triệu', min: 10, max: 30 },
    { id: '30to50', label: '30 - 50 triệu', min: 30, max: 50 },
    { id: 'over50', label: 'Trên 50 triệu', min: 50, max: MAX_PRICE },
    { id: 'over100', label: 'Trên 100 triệu', min: 100, max: MAX_PRICE },
  ];

  const handleInputChange = (type, value) => {
    const numValue = parseFloat(value) || 0;
    if (type === 'min') {
      const newMin = Math.min(numValue, maxValue);
      setInputMin(value);
      setMinValue(newMin);
    } else {
      const newMax = Math.max(numValue, minValue);
      setInputMax(value);
      setMaxValue(newMax);
    }
    setSelectedPreset(null);
  };

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset.id);
    setMinValue(preset.min);
    setMaxValue(preset.max);
    setInputMin(preset.min.toString());
    setInputMax(preset.max.toString());
  };

  const handleReset = () => {
    setMinValue(MIN_PRICE);
    setMaxValue(MAX_PRICE);
    setInputMin(MIN_PRICE.toString());
    setInputMax(MAX_PRICE.toString());
    setSelectedPreset(null);
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

            <View style={styles.priceInputContainer}>
              <View style={styles.priceInputWrapper}>
                <Text style={styles.priceLabel}>Từ</Text>
                <TextInput
                  ref={minInputRef}
                  style={styles.priceInput}
                  value={inputMin}
                  onChangeText={(text) => handleInputChange('min', text)}
                  keyboardType="numeric"
                />
                <Text style={styles.priceUnit}>triệu</Text>
              </View>

              <View style={styles.priceInputWrapper}>
                <Text style={styles.priceLabel}>Đến</Text>
                <TextInput
                  ref={maxInputRef}
                  style={styles.priceInput}
                  value={inputMax}
                  onChangeText={(text) => handleInputChange('max', text)}
                  keyboardType="numeric"
                />
                <Text style={styles.priceUnit}>triệu</Text>
              </View>
            </View>

            <View style={styles.presetsContainer}>
              {pricePresets.map((preset) => (
                <TouchableOpacity
                  key={preset.id}
                  style={[
                    styles.presetButton,
                    selectedPreset === preset.id && styles.selectedPreset
                  ]}
                  onPress={() => handlePresetSelect(preset)}
                >
                  <Text
                    style={[
                      styles.presetText,
                      selectedPreset === preset.id && styles.selectedPresetText
                    ]}
                  >
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  priceInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flex: 0.48,
  },
  priceLabel: {
    marginRight: 5,
    color: '#666',
  },
  priceInput: {
    flex: 1,
    padding: 0,
    textAlign: 'right',
  },
  priceUnit: {
    marginLeft: 5,
    color: '#666',
  },
  presetsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  presetButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  selectedPreset: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  presetText: {
    color: '#374151',
  },
  selectedPresetText: {
    color: '#fff',
  },
  resetButton: {
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    alignItems: 'center',
  },
  resetText: {
    color: '#374151',
    fontWeight: 'bold',
  },
});

export default PriceFilterModal;

import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LocationFilterModal = ({ visible, onClose, onSelect, defaultValue }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);

  const [activeLevel, setActiveLevel] = useState(null);
  const [loading, setLoading] = useState(false);

  // === Load provinces và gán lại default value nếu có ===
  useEffect(() => {
    if (visible) {
      reset();
      fetchProvinces().then(() => {
        if (defaultValue?.province) {
          setSelectedProvince(defaultValue.province);
          fetchDistricts(defaultValue.province.code).then(() => {
            if (defaultValue?.district) {
              setSelectedDistrict(defaultValue.district);
              fetchWards(defaultValue.district.code).then(() => {
                if (defaultValue?.ward) {
                  setSelectedWard(defaultValue.ward);
                }
              });
            }
          });
        }
      });
    }
  }, [visible]);

  const fetchProvinces = async () => {
    setLoading(true);
    const r = await fetch('https://provinces.open-api.vn/api/?depth=1');
    const data = await r.json();
    setProvinces(data);
    setLoading(false);
  };

  const fetchDistricts = async (provinceCode) => {
    setLoading(true);
    const r = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
    const data = await r.json();
    setDistricts(data.districts || []);
    setLoading(false);
  };

  const fetchWards = async (districtCode) => {
    setLoading(true);
    const r = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
    const data = await r.json();
    setWards(data.wards || []);
    setLoading(false);
  };

  const onSelectProvince = async (p) => {
    setSelectedProvince(p);
    setSelectedDistrict(null);
    setSelectedWard(null);
    await fetchDistricts(p.code);
    setActiveLevel(null);
  };

  const onSelectDistrict = async (d) => {
    setSelectedDistrict(d);
    setSelectedWard(null);
    await fetchWards(d.code);
    setActiveLevel(null);
  };

  const onSelectWard = (w) => {
    setSelectedWard(w);
    setActiveLevel(null);
  };

  const reset = () => {
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setDistricts([]);
    setWards([]);
    setActiveLevel(null);
  };

  const confirm = () => {
    // Nếu không chọn gì, vẫn gửi object rỗng
    if (!selectedProvince && !selectedDistrict && !selectedWard) {
      onSelect(null);  // hoặc gửi {} nếu bạn thích
      onClose();
      return;
    }

    onSelect({
      province: selectedProvince,
      district: selectedDistrict,
      ward: selectedWard,
    });
    onClose();
  };

  const renderList = () => {
    const list = activeLevel === 'province' ? provinces
      : activeLevel === 'district' ? districts
        : wards;
    return (
      <ScrollView style={{ maxHeight: 200 }}>
        {list.map((item) => (
          <TouchableOpacity
            key={item.code}
            style={styles.listItem}
            onPress={() =>
              activeLevel === 'province'
                ? onSelectProvince(item)
                : activeLevel === 'district'
                  ? onSelectDistrict(item)
                  : onSelectWard(item)
            }
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Chọn địa điểm</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.box} onPress={() => setActiveLevel('province')}>
            <Text style={styles.boxText}>
              {selectedProvince ? selectedProvince.name : 'Tỉnh / Thành phố'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.box}
            onPress={() => selectedProvince && setActiveLevel('district')}
            disabled={!selectedProvince}
          >
            <Text style={[styles.boxText, !selectedProvince && styles.disabled]}>
              {selectedDistrict ? selectedDistrict.name : 'Quận / Huyện'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.box}
            onPress={() => selectedDistrict && setActiveLevel('ward')}
            disabled={!selectedDistrict}
          >
            <Text style={[styles.boxText, !selectedDistrict && styles.disabled]}>
              {selectedWard ? selectedWard.name : 'Phường / Xã'}
            </Text>
          </TouchableOpacity>

          {activeLevel && (
            <View style={styles.listContainer}>
              {loading ? <ActivityIndicator /> : renderList()}
            </View>
          )}

          <View style={styles.footer}>
            <TouchableOpacity style={styles.btnReset} onPress={reset}>
              <Text style={{ fontWeight: '600' }}>Đặt lại</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnConfirm}
              onPress={confirm}
            >
              <Text style={styles.textConfirm}>Xác nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  container: { width: '90%', backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827' },
  box: { borderWidth: 1, borderColor: '#d1d5db', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 10, marginBottom: 12 },
  boxText: { fontSize: 16, color: '#111827' },
  disabled: { color: '#9CA3AF' },
  listContainer: { backgroundColor: '#f9fafb', padding: 10, borderRadius: 10, marginTop: 10 },
  listItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  btnReset: { flex: 1, backgroundColor: '#E5E7EB', padding: 12, borderRadius: 8, marginRight: 10, alignItems: 'center' },
  btnConfirm: { flex: 1, backgroundColor: '#3B82F6', padding: 12, borderRadius: 8, alignItems: 'center' },
  disabledBtn: { backgroundColor: '#A5B4FC' },
  textConfirm: { color: '#fff', fontWeight: 'bold' },
});

export default LocationFilterModal;

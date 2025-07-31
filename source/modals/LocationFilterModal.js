import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

const LocationFilterModal = ({ visible, onClose, onSelect }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);

  const [activeLevel, setActiveLevel] = useState(null); // 'province','district','ward'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      reset();
      fetchProvinces();
    }
  }, [visible]);

  const fetchProvinces = async () => {
    setLoading(true);
    const r = await fetch('https://provinces.open-api.vn/api/?depth=1');
    const data = await r.json();
    setProvinces(data);
    setLoading(false);
  };

  const onSelectProvince = async (p) => {
    setSelectedProvince(p);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setLoading(true);
    const r = await fetch(`https://provinces.open-api.vn/api/p/${p.code}?depth=2`);
    const data = await r.json();
    setDistricts(data.districts);
    setLoading(false);
    setActiveLevel(null);
  };

  const onSelectDistrict = async (d) => {
    setSelectedDistrict(d);
    setSelectedWard(null);
    setLoading(true);
    const r = await fetch(`https://provinces.open-api.vn/api/d/${d.code}?depth=2`);
    const data = await r.json();
    setWards(data.wards);
    setLoading(false);
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
    if (selectedProvince && selectedDistrict && selectedWard) {
      onSelect({ province: selectedProvince, district: selectedDistrict, ward: selectedWard });
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Chọn địa điểm</Text>

          <TouchableOpacity style={styles.box} onPress={() => setActiveLevel('province')}>
            <Text style={styles.boxText}>
              {selectedProvince ? selectedProvince.name : 'Chọn Tỉnh/Thành phố'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.box}
            onPress={() => selectedProvince && setActiveLevel('district')}
            disabled={!selectedProvince}
          >
            <Text style={[styles.boxText, !selectedProvince && styles.disabled]}>
              {selectedDistrict ? selectedDistrict.name : 'Chọn Quận/Huyện'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.box}
            onPress={() => selectedDistrict && setActiveLevel('ward')}
            disabled={!selectedDistrict}
          >
            <Text style={[styles.boxText, !selectedDistrict && styles.disabled]}>
              {selectedWard ? selectedWard.name : 'Chọn Phường/Xã'}
            </Text>
          </TouchableOpacity>

          {activeLevel && (
            <View style={styles.listContainer}>
              {loading ? (
                <ActivityIndicator />
              ) : (
                <ScrollView style={{ maxHeight: 200 }}>
                  {(activeLevel === 'province'
                    ? provinces
                    : activeLevel === 'district'
                    ? districts
                    : wards
                  ).map((item) => (
                    <TouchableOpacity
                      key={item.code}
                      style={styles.item}
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
              )}
            </View>
          )}

          <View style={styles.footer}>
            <TouchableOpacity style={styles.btnReset} onPress={reset}>
              <Text>Đặt lại</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnConfirm, !(selectedWard) && styles.disabledBtn]}
              onPress={confirm}
              disabled={!selectedWard}
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  box: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  boxText: {
    fontSize: 15,
    color: '#333',
  },
  disabled: {
    color: '#aaa',
  },
  listContainer: {
    borderTopWidth: 1,
    borderColor: '#eee',
    marginTop: 8,
    paddingTop: 8,
  },
  item: {
    paddingVertical: 10,
  },
  footer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  btnReset: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#eee',
    marginRight: 8,
    alignItems: 'center',
  },
  btnConfirm: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: '#ccc',
  },
  textConfirm: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default LocationFilterModal;

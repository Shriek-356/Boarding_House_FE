import React, { useEffect, useState } from 'react';
import {
  SafeAreaView, View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, Image, Alert, Switch, KeyboardAvoidingView,
  Platform, ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation, useRoute } from '@react-navigation/native';

import { updateRoomFormData, createRoomAmenity, deleteRoomAmenity } from '../api/roomApi';
import { getToken } from '../api/axiosClient';
import { MAX_IMAGES, buildRoomUpdateForm } from '../utils/imagesForm';
import { diffAmenities } from '../utils/amenities';
import { compressMany } from '../utils/imagesCompress';

const PRIMARY = '#2563EB';
const BORDER = '#E5E7EB';
const BG = '#F8FAFC';
const TEXT = '#0F172A';
const MUTED = '#64748B';

// Label phải khớp với BE
const ROOM_AMENITIES = [
  'Gác Lửng', 'Máy giặt riêng', 'Tủ lạnh', 'Điều hoà', 'Vệ sinh khép kín',
  'Giường nệm', 'Ban công', 'Kệ bếp', 'Nước nóng lạnh', 'Wifi',
];

export default function EditRoomScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const room = route.params?.item;
  const roomId = room?.id;

  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [area, setArea] = useState('');
  const [price, setPrice] = useState('');
  const [maxPeople, setMaxPeople] = useState('');
  const [available, setAvailable] = useState(true);
  const [description, setDescription] = useState('');

  // Ảnh
  const [oldUrls, setOldUrls] = useState([]); // URL đang giữ
  const [newAssets, setNewAssets] = useState([]); // ảnh mới chọn

  // Tiện nghi
  const [originalRoomAmenities, setOriginalRoomAmenities] = useState([]); // [{id, amenityName}]
  const [selectedAmenityNames, setSelectedAmenityNames] = useState([]); // ['Gác Lửng', ...]

  /* -------- init từ route -------- */
  useEffect(() => {
    (async () => {
      try {
        const t = await getToken();
        setToken(t);

        if (!roomId) {
          Alert.alert('Lỗi', 'Thiếu roomId'); navigation.goBack(); return;
        }

        setTitle(room?.title ?? '');
        setArea(room?.area ? String(room.area) : '');
        setPrice(room?.price ? String(room.price) : '');
        setMaxPeople(room?.maxPeople ? String(room.maxPeople) : '');
        setAvailable(!!room?.available);
        setDescription(room?.description ?? '');

        setOldUrls(Array.isArray(room?.images) ? room.images : []);
        setNewAssets([]);

        const orig = Array.isArray(room?.roomAmenities) ? room.roomAmenities : [];
        setOriginalRoomAmenities(orig);
        setSelectedAmenityNames(orig.map(a => a.amenityName));
      } catch (e) {
        console.log('init error', e?.response?.data || e);
        Alert.alert('Lỗi', 'Không tải được dữ liệu phòng.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    })();
  }, [roomId, navigation]);

  /* -------- ảnh -------- */
  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền', 'Vui lòng cấp quyền truy cập thư viện ảnh.');
      return;
    }

    const totalNow = oldUrls.length + newAssets.length;
    const remain = MAX_IMAGES - totalNow;
    if (remain <= 0) {
      Alert.alert('Đã đủ ảnh', `Tối đa ${MAX_IMAGES} ảnh.`);
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: remain,
    });
    if (res.canceled) return;

    const picked = (res.assets ?? []).slice(0, remain);
    setNewAssets(prev => [...prev, ...picked]);
  };

  const removeOldUrl = (url) => setOldUrls(prev => prev.filter(u => u !== url));
  const removeNewAsset = (uri) => setNewAssets(prev => prev.filter(a => a.uri !== uri));

  /* -------- tiện nghi -------- */
  const toggleAmenity = (name) => {
    setSelectedAmenityNames(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  /* -------- validate -------- */
  const totalImages = oldUrls.length + newAssets.length;
  const validate = () => {
    if (!title.trim()) return 'Vui lòng nhập tiêu đề phòng';
    if (!price) return 'Vui lòng nhập giá thuê';
    if (totalImages < 1) return 'Vui lòng giữ ít nhất 1 ảnh';
    if (totalImages > MAX_IMAGES) return `Tối đa ${MAX_IMAGES} ảnh`;
    return '';
  };

  /* -------- save -------- */
  const onSave = async () => {
    const err = validate();
    if (err) { Alert.alert('Thiếu thông tin', err); return; }
    if (!roomId) { Alert.alert('Lỗi', 'Thiếu roomId'); return; }

    try {
      setSaving(true);

      //Nén ảnh mới, ảnh cũ không cần nén vì đã có trên cloud
      const compressedNewAssets = await compressMany(newAssets, {
        maxWidth: 1280,
        maxHeight: 1280,
        quality: 0.6,
      });
      // 1) Build FormData từ ảnh đang hiển thị + ảnh mới
      const form = await buildRoomUpdateForm({
        roomId,
        title: title.trim(),
        area: Number(area || 0),
        price: Number(price || 0),
        maxPeople: Number(maxPeople || 0),
        available: !!available,
        description: description || '',
      }, oldUrls, compressedNewAssets);

      // 2) Update core + images (BE replace toàn bộ)
      await updateRoomFormData(form, token);

      // 3) Đồng bộ tiện nghi (thêm theo name, xoá theo id)
      const { toAddNames, toRemoveIds } =
        diffAmenities(originalRoomAmenities, selectedAmenityNames);

      for (const name of toAddNames) {
        try { await createRoomAmenity(roomId, name, token); }
        catch (e) { console.log('createRoomAmenity error', name, e?.response?.data || e); }
      }
      for (const id of toRemoveIds) {
        try { await deleteRoomAmenity(id, token); }
        catch (e) { console.log('deleteRoomAmenity error', id, e?.response?.data || e); }
      }

      Alert.alert('Thành công', 'Đã cập nhật phòng.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      console.log('updateRoom error', e?.response?.data || e);
      Alert.alert('Lỗi', 'Không cập nhật được phòng. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  /* -------- UI -------- */
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={{ marginTop: 6, color: MUTED }}>Đang tải phòng...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {/* Header mini */}
          <View style={styles.headerRow}>
            <Text style={styles.title}>Sửa phòng</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
              <Feather name="x" size={18} color={TEXT} />
            </TouchableOpacity>
          </View>

          {/* Thông tin cơ bản */}
          <Section title="Thông tin cơ bản">
            <LabeledInput label="Tiêu đề" value={title} onChangeText={setTitle} placeholder="VD: Phòng gác lửng, full nội thất" />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <LabeledInput style={{ flex: 1 }} label="Diện tích (m²)" value={area} onChangeText={setArea} keyboardType="numeric" placeholder="VD: 25" />
              <LabeledInput style={{ flex: 1 }} label="Số người tối đa" value={maxPeople} onChangeText={setMaxPeople} keyboardType="numeric" placeholder="VD: 3" />
            </View>
            <LabeledInput label="Giá (VND/tháng)" value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="VD: 4500000" />

            <View style={styles.rowBetween}>
              <Text style={styles.label}>Trạng thái cho thuê</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ color: MUTED }}>{available ? 'Có thể thuê' : 'Tạm hết'}</Text>
                <Switch value={available} onValueChange={setAvailable} />
              </View>
            </View>
          </Section>

          {/* Mô tả */}
          <Section title="Mô tả">
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Mô tả chi tiết phòng..."
              placeholderTextColor="#94A3B8"
              style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
              multiline
            />
          </Section>

          {/* Ảnh */}
          <Section title={`Hình ảnh (${totalImages}/${MAX_IMAGES})`}>
            <TouchableOpacity
              style={[styles.drop, totalImages >= MAX_IMAGES && { opacity: 0.5 }]}
              onPress={totalImages >= MAX_IMAGES ? undefined : pickImages}
            >
              <Feather name="image" size={20} color={PRIMARY} />
              <Text style={{ color: PRIMARY, fontWeight: '600', marginTop: 6 }}>
                {totalImages >= MAX_IMAGES ? 'Đã đủ ảnh' : 'Chọn thêm ảnh'}
              </Text>
            </TouchableOpacity>

            <View style={styles.grid}>
              {/* Ảnh cũ */}
              {oldUrls.map(url => (
                <View key={url} style={styles.thumbWrap}>
                  <Image source={{ uri: url }} style={styles.thumb} />
                  <TouchableOpacity style={styles.remove} onPress={() => removeOldUrl(url)}>
                    <Feather name="x" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              {/* Ảnh mới */}
              {newAssets.map(a => (
                <View key={a.uri} style={styles.thumbWrap}>
                  <Image source={{ uri: a.uri }} style={styles.thumb} />
                  <TouchableOpacity style={styles.remove} onPress={() => removeNewAsset(a.uri)}>
                    <Feather name="x" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </Section>

          {/* Tiện nghi */}
          <Section title="Tiện nghi">
            <View style={styles.chipsWrap}>
              {ROOM_AMENITIES.map(name => {
                const on = selectedAmenityNames.includes(name);
                return (
                  <TouchableOpacity
                    key={name}
                    onPress={() => toggleAmenity(name)}
                    style={[styles.chip, on ? styles.chipOn : styles.chipOff]}
                  >
                    <Text style={[styles.chipText, on ? { color: '#fff' } : { color: TEXT }]}>{name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Section>

          {/* Actions */}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#E5E7EB' }]} onPress={() => navigation.goBack()}>
              <Text style={[styles.btnText, { color: TEXT }]}>Hủy</Text>
            </TouchableOpacity>
            {saving ? (
              <View style={styles.savingBox}>
                <ActivityIndicator color={PRIMARY} />
                <Text style={{ marginLeft: 8, color: MUTED }}>Đang lưu...</Text>
              </View>
            ) : (
              <TouchableOpacity style={[styles.btn, { backgroundColor: PRIMARY }]} onPress={onSave}>
                <Text style={[styles.btnText, { color: '#fff' }]}>Lưu</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---- small components ---- */
function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}
function LabeledInput({ label, style, ...props }) {
  return (
    <View style={[{ marginBottom: 12 }, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput {...props} style={styles.input} placeholderTextColor="#94A3B8" />
    </View>
  );
}

/* ---- styles ---- */
const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 18, fontWeight: '800', color: TEXT, flex: 1 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: BORDER,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff'
  },

  section: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 12, marginBottom: 14 },
  sectionTitle: { fontWeight: '700', marginBottom: 8, color: TEXT },
  label: { color: TEXT, fontWeight: '600', marginBottom: 6, fontSize: 13 },
  input: { borderWidth: 1, borderColor: BORDER, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff', color: TEXT },

  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  drop: {
    borderWidth: 1, borderColor: '#BFDBFE', backgroundColor: '#EFF6FF',
    paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  thumbWrap: { width: 90, height: 90, borderRadius: 10, overflow: 'hidden', position: 'relative' },
  thumb: { width: '100%', height: '100%' },
  remove: { position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11, backgroundColor: '#0008', alignItems: 'center', justifyContent: 'center' },

  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  chipOff: { backgroundColor: '#fff', borderColor: BORDER },
  chipOn: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  chipText: { fontWeight: '700' },

  btn: { minWidth: 92, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontWeight: '700' },
  savingBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
});

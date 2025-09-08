// =============================================
// File: screens/EditBoardingZoneScreen.js
// =============================================
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView, View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, Image, Alert, Switch, KeyboardAvoidingView,
  Platform, ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getToken } from '../api/axiosClient';
import { MAX_IMAGES, buildRoomUpdateForm } from '../utils/imagesForm';
import { compressMany } from '../utils/imagesCompress';
import { updateBoardingZone, deleteBoardingZoneAmenity, addBoardingZoneAmenity, deleteBoardingZoneEnvironment, addBoardingZoneEnvironment, deleteBoardingZoneTarget, addBoardingZoneTarget } from '../api/boardingZoneApi';
import { diffEnvironments } from '../utils/environments';
import { diffAmenities } from '../utils/amenities';
import { diffTargets } from '../utils/targets';

const PRIMARY = '#2563EB';
const BORDER = '#E5E7EB';
const BG = '#F8FAFC';
const TEXT = '#0F172A';
const MUTED = '#64748B';


const ZONE_AMENITIES = ['Wifi', 'Điều hoà', 'Giữ xe', 'Thang máy', 'Camera', 'Máy giặt chung', 'Sân phơi', 'Khu bếp chung', 'Ban công'];
const ZONE_TARGETS = ['Đi học', 'Đi làm', 'Gia đình', 'Nữ', 'Nam', 'Nhân viên văn phòng'];
const ZONE_ENVIRONMENTS = ['Chợ', 'Siêu thị', 'Bến xe', 'Gần trường học', 'Khu văn phòng', 'Khu dân cư yên tĩnh'];

export default function EditBoardingZoneScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const zone = route.params?.item;
  const zoneId = zone?.id;

  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Core fields
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [roomCount, setRoomCount] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [street, setStreet] = useState('');
  const [address, setAddress] = useState('');
  const [expectedPrice, setExpectedPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  // Contact
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactZalo, setContactZalo] = useState('');

  // Images
  const [oldUrls, setOldUrls] = useState([]);
  const [newAssets, setNewAssets] = useState([]);

  // Multi-select groups
  const [originalAmenities, setOriginalAmenities] = useState([]); // [{id, amenityName}]
  const [originalTargets, setOriginalTargets] = useState([]);     // [{id, targetGroup}]
  const [originalEnvironments, setOriginalEnvironments] = useState([]); // [{id, environmentType}]

  const [selectedAmenityNames, setSelectedAmenityNames] = useState([]);
  const [selectedTargetGroups, setSelectedTargetGroups] = useState([]);
  const [selectedEnvironmentTypes, setSelectedEnvironmentTypes] = useState([]);

  // Init
  useEffect(() => {
    (async () => {
      try {
        const t = await getToken();
        setToken(t);
        if (!zoneId) { Alert.alert('Lỗi', 'Thiếu zoneId'); navigation.goBack(); return; }

        setName(zone?.name ?? '');
        setArea(zone?.area ? String(zone.area) : '');
        setRoomCount(zone?.roomCount ? String(zone.roomCount) : '');
        setProvince(zone?.province ?? '');
        setDistrict(zone?.district ?? '');
        setWard(zone?.ward ?? '');
        setStreet(zone?.street ?? '');
        setAddress(zone?.address ?? '');
        setExpectedPrice(zone?.expectedPrice ? String(zone.expectedPrice) : '');
        setDescription(zone?.description ?? '');
        setIsVisible(zone?.isVisible ?? true);

        setContactName(zone?.contactName ?? '');
        setContactPhone(zone?.contactPhone ?? '');
        setContactZalo(zone?.contactZalo ?? '');

        setOldUrls(Array.isArray(zone?.images) ? zone.images : []);
        setNewAssets([]);

        const a = Array.isArray(zone?.amenities) ? zone.amenities : [];
        const tgs = Array.isArray(zone?.targets) ? zone.targets : [];
        const envs = Array.isArray(zone?.environments) ? zone.environments : [];
        setOriginalAmenities(a);
        setOriginalTargets(tgs);
        setOriginalEnvironments(envs);
        setSelectedAmenityNames(a.map(x => x.amenityName));
        setSelectedTargetGroups(tgs.map(x => x.targetGroup));
        setSelectedEnvironmentTypes(envs.map(x => x.environmentType));
      } catch (e) {
        console.log('init zone error', e?.response?.data || e);
        Alert.alert('Lỗi', 'Không tải được dữ liệu khu trọ.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    })();
  }, [zoneId, navigation]);

  // Images pick/remove
  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Cần quyền', 'Vui lòng cấp quyền truy cập thư viện ảnh.'); return; }

    const totalNow = oldUrls.length + newAssets.length;
    const remain = MAX_IMAGES - totalNow;
    if (remain <= 0) { Alert.alert('Đã đủ ảnh', `Tối đa ${MAX_IMAGES} ảnh.`); return; }

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

  // Toggle chips
  const toggleAmenity = (name) => setSelectedAmenityNames(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  const toggleTarget = (name) => setSelectedTargetGroups(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  const toggleEnvironment = (name) => setSelectedEnvironmentTypes(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);

  // Validate
  const totalImages = oldUrls.length + newAssets.length;
  const validate = () => {
    if (!name.trim()) return 'Vui lòng nhập tên khu trọ';
    if (!expectedPrice) return 'Vui lòng nhập giá dự kiến';
    if (totalImages < 1) return 'Cần ít nhất 1 ảnh';
    if (totalImages > MAX_IMAGES) return `Tối đa ${MAX_IMAGES} ảnh`;
    return '';
  };

  // Save
  const onSave = async () => {
    const err = validate();
    if (err) { Alert.alert('Thiếu thông tin', err); return; }
    if (!zoneId) { Alert.alert('Lỗi', 'Thiếu zoneId'); return; }

    try {
      setSaving(true);

      // Nén ảnh mới
      const compressedNewAssets = await compressMany(newAssets, { maxWidth: 1280, maxHeight: 1280, quality: 0.6 });

      // Build multipart form dùng lại buildRoomUpdateForm
      const form = await buildRoomUpdateForm({
        id: zoneId,
        name: name.trim(),
        area: Number(area || 0),
        roomCount: Number(roomCount || 0),
        province: province?.trim() || '',
        district: district?.trim() || '',
        ward: ward?.trim() || '',
        street: street?.trim() || '',
        address: address?.trim() || '',
        expectedPrice: Number(expectedPrice || 0),
        description: description || '',
        isVisible: !!isVisible,
        contactName: contactName?.trim() || '',
        contactPhone: contactPhone?.trim() || '',
        contactZalo: contactZalo?.trim() || '',
      }, oldUrls, compressedNewAssets);

      await updateBoardingZone(form, token)

      // Đồng bộ 3 nhóm danh mục
      const { toAddNames: amenAdd, toRemoveIds: amenDel } =
        diffAmenities(originalAmenities, selectedAmenityNames);
      const { toAddNames: tgtAdd, toRemoveIds: tgtDel } =
        diffTargets(originalTargets, selectedTargetGroups);
      const { toAddNames: envAdd, toRemoveIds: envDel } =
        diffEnvironments(originalEnvironments, selectedEnvironmentTypes);

      // (tuỳ BE yêu cầu, bạn đang truyền body có boardingZoneId)
      for (const name of amenAdd) { try { await addBoardingZoneAmenity({ boardingZoneId: zoneId, amenityName: name }, token); } catch (e) { console.log('create amenity', name, e?.response?.data || e); } }
      for (const id of amenDel) { try { await deleteBoardingZoneAmenity(id, token); } catch (e) { console.log('delete amenity', id, e?.response?.data || e); } }

      for (const name of tgtAdd) { try { await addBoardingZoneTarget({ boardingZoneId: zoneId, targetGroup: name }, token); } catch (e) { console.log('create target', name, e?.response?.data || e); } }
      for (const id of tgtDel) { try { await deleteBoardingZoneTarget(id, token); } catch (e) { console.log('delete target', id, e?.response?.data || e); } }

      for (const name of envAdd) { try { await addBoardingZoneEnvironment({ boardingZoneId: zoneId, environmentType: name }, token); } catch (e) { console.log('create env', name, e?.response?.data || e); } }
      for (const id of envDel) { try { await deleteBoardingZoneEnvironment(id, token); } catch (e) { console.log('delete env', id, e?.response?.data || e); } }

      Alert.alert('Thành công', 'Đã cập nhật khu trọ.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      console.log('updateZone error', e?.response?.data || e);
      Alert.alert('Lỗi', 'Không cập nhật được khu trọ. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={{ marginTop: 6, color: MUTED }}>Đang tải khu trọ...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Sửa khu trọ</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
              <Feather name="x" size={18} color={TEXT} />
            </TouchableOpacity>
          </View>

          <Section title="Thông tin cơ bản">
            <LabeledInput label="Tên khu trọ" value={name} onChangeText={setName} placeholder="VD: Khu trọ Phú Nhuận A" />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <LabeledInput style={{ flex: 1 }} label="Diện tích (m²)" value={area} onChangeText={setArea} keyboardType="numeric" placeholder="VD: 120" />
              <LabeledInput style={{ flex: 1 }} label="Số phòng" value={roomCount} onChangeText={setRoomCount} keyboardType="numeric" placeholder="VD: 10" />
            </View>
            <LabeledInput label="Giá dự kiến (VND/tháng)" value={expectedPrice} onChangeText={setExpectedPrice} keyboardType="numeric" placeholder="VD: 4500000" />
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Hiển thị công khai</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ color: MUTED }}>{isVisible ? 'Đang hiển thị' : 'Đang ẩn'}</Text>
                <Switch value={isVisible} onValueChange={setIsVisible} />
              </View>
            </View>
          </Section>

          <Section title="Địa chỉ">
            <LabeledInput label="Tỉnh/Thành" value={province} onChangeText={setProvince} placeholder="TP. Hồ Chí Minh" />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <LabeledInput style={{ flex: 1 }} label="Quận/Huyện" value={district} onChangeText={setDistrict} placeholder="Quận Phú Nhuận" />
              <LabeledInput style={{ flex: 1 }} label="Phường/Xã" value={ward} onChangeText={setWard} placeholder="Phường 15" />
            </View>
            <LabeledInput label="Đường" value={street} onChangeText={setStreet} placeholder="Đường Trần Huy Liệu" />
            <LabeledInput label="Số nhà/Ngõ" value={address} onChangeText={setAddress} placeholder="158/38" />
          </Section>

          <Section title="Mô tả">
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Mô tả chi tiết khu trọ..."
              placeholderTextColor="#94A3B8"
              style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
              multiline
            />
          </Section>

          <Section title="Thông tin liên hệ">
            <LabeledInput label="Tên liên hệ" value={contactName} onChangeText={setContactName} placeholder="VD: Khang Landlord" />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <LabeledInput style={{ flex: 1 }} label="SĐT" value={contactPhone} onChangeText={setContactPhone} keyboardType="phone-pad" placeholder="VD: 0909xxxxxx" />
              <LabeledInput style={{ flex: 1 }} label="Zalo" value={contactZalo} onChangeText={setContactZalo} placeholder="VD: 0909xxxxxx" />
            </View>
          </Section>

          <Section title={`Hình ảnh (${totalImages}/${MAX_IMAGES})`}>
            <TouchableOpacity style={[styles.drop, totalImages >= MAX_IMAGES && { opacity: 0.5 }]} onPress={totalImages >= MAX_IMAGES ? undefined : pickImages}>
              <Feather name="image" size={20} color={PRIMARY} />
              <Text style={{ color: PRIMARY, fontWeight: '600', marginTop: 6 }}>
                {totalImages >= MAX_IMAGES ? 'Đã đủ ảnh' : 'Chọn thêm ảnh'}
              </Text>
            </TouchableOpacity>

            <View style={styles.grid}>
              {oldUrls.map(url => (
                <View key={url} style={styles.thumbWrap}>
                  <Image source={{ uri: url }} style={styles.thumb} />
                  <TouchableOpacity style={styles.remove} onPress={() => removeOldUrl(url)}>
                    <Feather name="x" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
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

          <Section title="Tiện nghi">
            <Chips data={ZONE_AMENITIES} selected={selectedAmenityNames} onToggle={toggleAmenity} />
          </Section>
          <Section title="Đối tượng phù hợp">
            <Chips data={ZONE_TARGETS} selected={selectedTargetGroups} onToggle={toggleTarget} />
          </Section>
          <Section title="Môi trường xung quanh">
            <Chips data={ZONE_ENVIRONMENTS} selected={selectedEnvironmentTypes} onToggle={toggleEnvironment} />
          </Section>

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

function Section({ title, children }) { return (<View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>); }
function LabeledInput({ label, style, ...props }) { return (<View style={[{ marginBottom: 12 }, style]}><Text style={styles.label}>{label}</Text><TextInput {...props} style={styles.input} placeholderTextColor="#94A3B8" /></View>); }
function Chips({ data, selected, onToggle }) {
  return (
    <View style={styles.chipsWrap}>
      {data.map(name => {
        const on = selected.includes(name);
        return (
          <TouchableOpacity key={name} onPress={() => onToggle(name)} style={[styles.chip, on ? styles.chipOn : styles.chipOff]}>
            <Text style={[styles.chipText, on ? { color: '#fff' } : { color: TEXT }]}>{name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 18, fontWeight: '800', color: TEXT, flex: 1 },
  iconBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: BORDER, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },

  section: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 12, marginBottom: 14 },
  sectionTitle: { fontWeight: '700', marginBottom: 8, color: TEXT },
  label: { color: TEXT, fontWeight: '600', marginBottom: 6, fontSize: 13 },
  input: { borderWidth: 1, borderColor: BORDER, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff', color: TEXT },

  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  drop: { borderWidth: 1, borderColor: '#BFDBFE', backgroundColor: '#EFF6FF', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
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


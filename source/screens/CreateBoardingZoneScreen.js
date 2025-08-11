// CreateBoardingZoneScreen.js
import React, { useContext, useState } from 'react';
import {
    View, Text, TextInput, ScrollView, TouchableOpacity,
    StyleSheet, KeyboardAvoidingView, Platform, Image, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../contexts/AuthContext';
import { addBoardingZoneFormData } from '../api/boardingZoneApi';
import LocationFilterModal from '../modals/LocationFilterModal'; // <-- dùng modal bạn đã viết
import { useEffect } from 'react';
import { getToken } from '../api/axiosClient';
import { ActivityIndicator } from 'react-native-paper';
import LottieView from 'lottie-react-native';

const PRIMARY = '#2563EB';
const BORDER = '#E5E7EB';
const BG = '#F8FAFC';
const TEXT = '#0F172A';
const MUTED = '#64748B';
const MAX_IMAGES = 10;

export default function CreateBoardingZoneScreen({ navigation }) {
    const { user } = useContext(AuthContext);
    const [token, setToken] = useState(user?.token || '');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchToken = async () => {
            const token = await getToken();
            setToken(token);
        };
        fetchToken();
    }, []);

    // -------- form
    const [name, setName] = useState('');
    const [roomCount, setRoomCount] = useState('');
    const [area, setArea] = useState('');
    const [street, setStreet] = useState('');
    const [address, setAddress] = useState('');
    const [expectedPrice, setExpectedPrice] = useState('');
    const [description, setDescription] = useState('');
    const [contactName, setContactName] = useState(user ? `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim() : '');
    const [contactPhone, setContactPhone] = useState('');
    const [contactZalo, setContactZalo] = useState('');

    // -------- location via modal
    const [loc, setLoc] = useState({ province: null, district: null, ward: null });
    const [locVisible, setLocVisible] = useState(false);

    // -------- images
    const [images, setImages] = useState([]);

    const pickImages = async () => {
        // xin quyền
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Cần quyền', 'Vui lòng cấp quyền truy cập thư viện ảnh.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsMultipleSelection: true, // iOS 14+/Web hỗ trợ
            selectionLimit: MAX_IMAGES,   //Giới hạn ảnh được phép chọn   // Android mới hỗ trợ, nếu không thì chọn 1
        });

        if (result.canceled) return;

        setImages(prev => {
            const remain = MAX_IMAGES - prev.length;
            const picked = (result.assets ?? []).slice(0, Math.max(0, remain));
            if (picked.length < (result.assets ?? []).length) {
                Alert.alert('Giới hạn ảnh', `Bạn chỉ có thể gửi tối đa ${MAX_IMAGES} ảnh.`);
            }
            return [...prev, ...picked];
        });
    };
    const removeImage = (uri) => setImages(prev => prev.filter(a => a.uri !== uri));

    const validate = () => {
        if (!name.trim()) return 'Vui lòng nhập tên trọ';
        if (!expectedPrice) return 'Vui lòng nhập giá thuê';
        if (!(loc.province && loc.district && loc.ward)) return 'Vui lòng chọn Tỉnh/Quận/Phường';
        if (images.length < 1) return 'Vui lòng chọn ít nhất 1 ảnh';
        if (images.length > MAX_IMAGES) return `Chỉ được gửi tối đa ${MAX_IMAGES} ảnh`;
        return '';
    };

    const toFormFile = (asset, i) => ({
        uri: asset.uri,
        type: asset.mimeType || 'image/jpeg',
        name: asset.fileName || `photo_${i}.jpg`,
    });

    const onSave = async () => {
        const err = validate();
        if (err) { Alert.alert('Thiếu thông tin', err); return; }
        setLoading(true);
        try {
            const form = new FormData();
            images.forEach((a, i) => form.append('images', toFormFile(a, i)));

            form.append('landLordId', user?.id || '');
            form.append('name', name.trim());
            if (area) form.append('area', String(Number(area)));
            if (roomCount) form.append('roomCount', String(Number(roomCount)));
            form.append('province', loc.province?.name || '');
            form.append('district', loc.district?.name || '');
            form.append('ward', loc.ward?.name || '');
            form.append('street', street);
            form.append('address', address);
            form.append('expectedPrice', String(Number(expectedPrice)));
            form.append('description', description);
            form.append('contactName', contactName);
            form.append('contactPhone', contactPhone);
            form.append('contactZalo', contactZalo);

            await addBoardingZoneFormData(form, token);
            Alert.alert('Thành công', 'Đã thêm dãy trọ vui lòng chờ quản trị viên duyệt!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
        } catch (e) {
            console.log(e?.response?.data || e);
            Alert.alert('Lỗi', 'Không lưu được, vui lòng thử lại.');
        }
        finally {
            setLoading(false);
        }
    };

    const formatLoc = () => {
        const p = loc.province?.name, d = loc.district?.name, w = loc.ward?.name;
        return [w, d, p].filter(Boolean).join(', ');
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
                    <Text style={styles.title}>Tạo trọ & Đăng quảng cáo</Text>

                    {/* Thông tin trọ */}
                    <Section title="Thông tin trọ">
                        <LabeledInput label="Tên trọ" value={name} onChangeText={setName} placeholder="Tên trọ" />
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <LabeledInput style={{ flex: 1 }} label="Số lượng phòng" value={roomCount} onChangeText={setRoomCount} placeholder="VD: 3" keyboardType="numeric" />
                            <LabeledInput style={{ flex: 1 }} label="Diện tích (m²)" value={area} onChangeText={setArea} placeholder="VD: 25" keyboardType="numeric" />
                        </View>

                        {/* Khu vực: mở modal của bạn */}
                        <View style={{ marginBottom: 12 }}>
                            <Text style={styles.label}>Khu vực</Text>
                            <TouchableOpacity style={styles.fakeInput} onPress={() => setLocVisible(true)}>
                                <Feather name="map-pin" size={16} color={loc.province ? TEXT : MUTED} />
                                <Text
                                    numberOfLines={1}
                                    style={[styles.fakeInputText, !loc.province && { color: '#94A3B8' }]}
                                >
                                    {loc.province ? formatLoc() : 'Chọn Tỉnh / Quận / Phường'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <LabeledInput label="Đường" value={street} onChangeText={setStreet} placeholder="VD: Trần Huy Liệu" />
                        <LabeledInput label="Địa chỉ" value={address} onChangeText={setAddress} placeholder="Số nhà/Ngõ..." />
                    </Section>

                    {/* Thông tin quảng cáo */}
                    <Section title="Thông tin quảng cáo">
                        <LabeledInput
                            label="Giá thuê (VND/tháng)"
                            value={expectedPrice}
                            onChangeText={setExpectedPrice}
                            placeholder="VD: 4500000"
                            keyboardType="numeric"
                        />
                    </Section>

                    {/* Mô tả */}
                    <Section title="Mô tả">
                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Mô tả về trọ..."
                            placeholderTextColor="#94A3B8"
                            style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
                            multiline
                        />
                    </Section>

                    {/* Ảnh */}
                    <Section title="Hình ảnh tổng quan">
                        <TouchableOpacity style={[styles.drop, images.length >= MAX_IMAGES && { opacity: 0.5 }]}
                            onPress={images.length >= MAX_IMAGES ? undefined : pickImages}>
                            <Feather name="cloud-upload" size={22} color={PRIMARY} />
                            <Text style={{ color: PRIMARY, fontWeight: '600', marginTop: 6 }}>
                                {images.length >= MAX_IMAGES ? 'Đã đủ ảnh' : 'Chọn hình ảnh'}
                            </Text>
                            <Text style={{ color: MUTED, fontSize: 12, marginTop: 2 }}>(Tối đa {MAX_IMAGES} ảnh)</Text>
                        </TouchableOpacity>

                        <View style={styles.grid}>
                            {images.map(a => (
                                <View key={a.uri} style={styles.thumbWrap}>
                                    <Image source={{ uri: a.uri }} style={styles.thumb} />
                                    <TouchableOpacity style={styles.remove} onPress={() => removeImage(a.uri)}>
                                        <Feather name="x" size={14} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </Section>

                    {/* Liên hệ */}
                    <Section title="Thông tin liên hệ">
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <LabeledInput style={{ flex: 1 }} label="Họ tên" value={contactName} onChangeText={setContactName} placeholder="Tên liên hệ" />
                            <LabeledInput style={{ flex: 1 }} label="Số điện thoại" value={contactPhone} onChangeText={setContactPhone} placeholder="SĐT" keyboardType="phone-pad" />
                        </View>
                        <LabeledInput label="Zalo" value={contactZalo} onChangeText={setContactZalo} placeholder="Zalo" keyboardType="phone-pad" />
                    </Section>

                    {/* Buttons */}
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
                        <TouchableOpacity style={[styles.btn, { backgroundColor: '#E5E7EB' }]} onPress={() => navigation.goBack()}>
                            <Text style={[styles.btnText, { color: TEXT }]}>Hủy</Text>
                        </TouchableOpacity>
                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <LottieView
                                    source={require('../../assets/animations/loading.json')}
                                    autoPlay loop style={{ width: 60, height: 60 }}
                                />
                                <Text style={styles.loadingText}>Đang xử lý..</Text>
                            </View>
                        ) : (
                            <TouchableOpacity style={[styles.btn, { backgroundColor: PRIMARY }]} onPress={onSave}>
                                <Text style={[styles.btnText, { color: '#fff' }]}>Lưu</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Modal chọn Tỉnh/Quận/Phường */}
            <LocationFilterModal
                visible={locVisible}
                onClose={() => setLocVisible(false)}
                defaultValue={loc}
                onSelect={(res) => setLoc(res || { province: null, district: null, ward: null })}
            />
        </SafeAreaView>
    );
}

/* ---- small components & styles ---- */
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

const styles = StyleSheet.create({
    title: { fontSize: 18, fontWeight: '700', color: TEXT, marginBottom: 12 },
    section: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 12, marginBottom: 14 },
    sectionTitle: { fontWeight: '700', marginBottom: 8, color: TEXT },
    label: { color: TEXT, fontWeight: '600', marginBottom: 6, fontSize: 13 },
    input: { borderWidth: 1, borderColor: BORDER, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff', color: TEXT },

    // “ô chọn khu vực” để mở modal
    fakeInput: {
        borderWidth: 1, borderColor: BORDER, borderRadius: 10,
        backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 11,
        flexDirection: 'row', alignItems: 'center', gap: 8
    },
    fakeInputText: { color: TEXT, flex: 1 },

    drop: {
        borderWidth: 1, borderColor: '#BFDBFE', backgroundColor: '#EFF6FF',
        paddingVertical: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10,
    },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    thumbWrap: { width: 90, height: 90, borderRadius: 10, overflow: 'hidden', position: 'relative' },
    thumb: { width: '100%', height: '100%' },
    remove: { position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11, backgroundColor: '#0008', alignItems: 'center', justifyContent: 'center' },

    btn: { minWidth: 92, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    btnText: { fontWeight: '700' },
    /* Loading */
    loadingContainer: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 20,
    },
    loadingText: { marginLeft: 10, fontSize: 14, color: '#6B7280' },
});

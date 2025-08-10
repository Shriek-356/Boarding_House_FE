import React, { useEffect, useState, useCallback } from "react";
import {
    View, Text, TextInput, TouchableOpacity, Image, Alert,
    StyleSheet, ScrollView
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { addLandlordRequest } from "../api/LandLordApi"; // nhận (formData, token)
import { getToken } from "../api/axiosClient";           // lấy token

// --- helper: nén 1 ảnh
const compressImage = async (uri) => {
    const out = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1280 } }], // max chiều rộng 1280, giữ tỉ lệ
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return out.uri;
};

// --- helper: mime theo đuôi
const mimeFromUri = (uri) => {
    const name = uri.split("/").pop() || "image.jpg";
    const ext = (name.split(".").pop() || "jpg").toLowerCase();
    if (ext === "png") return "image/png";
    if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
    return "application/octet-stream";
};

export default function LandlordRequestScreen() {
    const { params } = useRoute();
    const navigation = useNavigation();
    const userId = params?.userId;

    const [identityNumber, setIdentityNumber] = useState("");
    const [frontUri, setFrontUri] = useState(""); // CCCD mặt trước
    const [backUri, setBackUri] = useState(""); // CCCD mặt sau
    const [houseUris, setHouseUris] = useState([]); // ảnh dãy trọ (nhiều)
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState(null);

    useEffect(() => { (async () => setToken(await getToken()))(); }, []);

    // Quyền
    const ensureLibPerm = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Thiếu quyền", "Cần quyền truy cập ảnh.");
            return false;
        }
        return true;
    };
    const ensureCamPerm = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Thiếu quyền", "Cần quyền dùng camera.");
            return false;
        }
        return true;
    };

    // Chọn 1 ảnh (CCCD) từ thư viện/camera + nén
    const pickSingleFromLibrary = async () => {
        const ok = await ensureLibPerm();
        if (!ok) return null;
        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.9,
        });
        if (!res.canceled) {
            const u = res.assets?.[0]?.uri;
            if (u) return await compressImage(u);
        }
        return null;
    };
    const pickSingleFromCamera = async () => {
        const ok = await ensureCamPerm();
        if (!ok) return null;
        const res = await ImagePicker.launchCameraAsync({ quality: 1 });
        if (!res.canceled) {
            const u = res.assets?.[0]?.uri;
            if (u) return await compressImage(u);
        }
        return null;
    };

    // Popup chọn nguồn cho CCCD
    const chooseSingle = useCallback((setter) => {
        Alert.alert("Chọn ảnh", "", [
            {
                text: "Thư viện", onPress: async () => {
                    const uri = await pickSingleFromLibrary(); if (uri) setter(uri);
                }
            },
            {
                text: "Chụp ảnh", onPress: async () => {
                    const uri = await pickSingleFromCamera(); if (uri) setter(uri);
                }
            },
            { text: "Hủy", style: "cancel" },
        ]);
    }, []);

    // Thêm nhiều ảnh dãy trọ (chỉ từ thư viện) + nén từng ảnh
    const addHouseImages = useCallback(async () => {
        const ok = await ensureLibPerm();
        if (!ok) return;
        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.9,
        });
        if (res.canceled) return;
        const picked = (res.assets || []).map(a => a.uri).filter(Boolean);
        if (picked.length) {
            // nén lần lượt để tránh đỉnh RAM
            const compressed = [];
            for (const u of picked) {
                const cu = await compressImage(u);
                compressed.push(cu);
            }
            setHouseUris(prev => [...prev, ...compressed]);
        }
    }, []);

    const removeHouseImage = (idx) =>
        setHouseUris(prev => prev.filter((_, i) => i !== idx));

    const validate = () => {
        if (!identityNumber.trim()) return "Vui lòng nhập số CMND/CCCD.";
        if (!frontUri) return "Vui lòng chọn ảnh CCCD mặt trước.";
        if (!backUri) return "Vui lòng chọn ảnh CCCD mặt sau.";
        if (houseUris.length === 0) return "Vui lòng thêm ít nhất 1 ảnh dãy trọ.";
        return "";
    };

    const submit = async () => {
        const msg = validate();
        if (msg) return Alert.alert("Thiếu thông tin", msg);

        try {
            setLoading(true);
            // Build FormData từ các ảnh **đã nén**
            const form = new FormData();
            form.append("userId", String(userId));
            form.append("identityNumber", String(identityNumber.trim()));

            // append tất cả ảnh vào key 'file' như backend yêu cầu
            const allUris = [frontUri, backUri, ...houseUris];
            allUris.forEach((uri, i) => {
                form.append("file", {
                    uri,
                    name: `img_${i + 1}.jpg`,
                    type: mimeFromUri(uri),
                });
            });

            await addLandlordRequest(form, token); // API chỉ gửi form + token
            Alert.alert("Thành công", "Yêu cầu đã được gửi. Vui lòng chờ duyệt.", [
                { text: "OK", onPress: () => navigation.goBack() },
            ]);
        } catch (e) {
            const err = e?.response?.data?.message || e?.response?.data || e?.message || "Gửi yêu cầu thất bại.";
            Alert.alert("Lỗi", err);
        } finally {
            setLoading(false);
        }
    };

    const UploadBox = ({ label, uri, onPick, onClear }) => (
        <View style={{ marginBottom: 14 }}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity style={styles.uploadBox} onPress={onPick} activeOpacity={0.9}>
                {uri ? (
                    <>
                        <Image source={{ uri }} style={styles.preview} />
                        <TouchableOpacity style={styles.clearBtn} onPress={onClear}>
                            <Ionicons name="close" size={18} color="#fff" />
                        </TouchableOpacity>
                    </>
                ) : (
                    <View style={{ alignItems: "center" }}>
                        <Ionicons name="image-outline" size={28} color="#6b7280" />
                        <Text style={{ color: "#6b7280", marginTop: 6 }}>Chọn ảnh</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Gửi yêu cầu làm chủ trọ</Text>

            <Text style={styles.label}>Số CMND/CCCD</Text>
            <TextInput
                style={styles.input}
                keyboardType="number-pad"
                maxLength={12}
                value={identityNumber}
                onChangeText={setIdentityNumber}
                placeholder="VD: 052204030123"
            />

            {/* 2 ô CCCD */}
            <UploadBox
                label="CCCD mặt trước"
                uri={frontUri}
                onPick={() => chooseSingle(setFrontUri)}
                onClear={() => setFrontUri("")}
            />
            <UploadBox
                label="CCCD mặt sau"
                uri={backUri}
                onPick={() => chooseSingle(setBackUri)}
                onClear={() => setBackUri("")}
            />

            {/* Dãy trọ (nhiều ảnh) */}
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10, marginBottom: 6 }}>
                <Text style={[styles.label, { marginTop: 0, marginBottom: 0 }]}>Ảnh dãy trọ (nhiều ảnh)</Text>
                <View style={styles.counter}><Text style={styles.counterText}>{houseUris.length}</Text></View>
            </View>

            <View style={styles.grid}>
                {houseUris.map((u, idx) => (
                    <View key={idx} style={styles.gridItem}>
                        <Image source={{ uri: u }} style={styles.gridImg} />
                        <TouchableOpacity style={styles.removeThumb} onPress={() => removeHouseImage(idx)}>
                            <Ionicons name="close" size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>
                ))}
                <TouchableOpacity style={[styles.gridItem, styles.addTile]} onPress={addHouseImages}>
                    <Ionicons name="add" size={28} />
                    <Text style={{ marginTop: 4, fontSize: 12 }}>Thêm ảnh</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[styles.submitBtn, (loading || !token) && { opacity: 0.7 }]}
                onPress={submit}
                disabled={loading || !token}
            >
                <Text style={styles.submitText}>{loading ? "Đang gửi..." : "Gửi yêu cầu"}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16, paddingBottom: 32, backgroundColor: "#fff" },
    title: { fontSize: 20, fontWeight: "700", marginBottom: 16, color: "#111827" },
    label: { fontSize: 14, color: "#374151", marginTop: 10, marginBottom: 6 },
    input: {
        borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10,
        paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#fff",
    },
    uploadBox: {
        height: 180, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12,
        alignItems: "center", justifyContent: "center", backgroundColor: "#F9FAFB", overflow: "hidden",
    },
    preview: { width: "100%", height: "100%", resizeMode: "cover" },
    clearBtn: {
        position: "absolute", top: 8, right: 8, backgroundColor: "rgba(0,0,0,0.5)",
        width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center",
    },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
    gridItem: {
        width: "31%", aspectRatio: 1, borderRadius: 10, overflow: "hidden",
        backgroundColor: "#F3F4F6", position: "relative", alignItems: "center", justifyContent: "center",
    },
    gridImg: { width: "100%", height: "100%", resizeMode: "cover" },
    addTile: { borderWidth: 1, borderColor: "#E5E7EB" },
    removeThumb: {
        position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: 11,
        backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center",
    },
    submitBtn: {
        marginTop: 18, backgroundColor: "#2563EB", paddingVertical: 12, borderRadius: 12, alignItems: "center",
    },
    submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    counter: {
        marginLeft: 8, backgroundColor: "#EEF2FF", borderRadius: 10,
        paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: "#E0E7FF",
    },
    counterText: { color: "#3730A3", fontWeight: "700", fontSize: 12 },
});

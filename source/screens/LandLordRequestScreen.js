import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { addLandlordRequest } from "../api/LandLordApi";
import { getToken } from "../api/axiosClient";
import { useEffect } from "react";

export default function LandlordRequestScreen() {
  const { params } = useRoute();
  const navigation = useNavigation();
  const userId = params?.userId;

  const [identityNumber, setIdentityNumber] = useState("");
  const [frontUri, setFrontUri] = useState("");
  const [backUri, setBackUri] = useState("");
  const [docUri, setDocUri] = useState("");
  const [houseUris, setHouseUris] = useState([]); // nhiều ảnh
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      const token = await getToken();
      setToken(token);
    };
    fetchToken();
  }, []);

  const askLibPerm = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Thiếu quyền", "Cần quyền truy cập thư viện ảnh.");
      return false;
    }
    return true;
  };
  const askCamPerm = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Thiếu quyền", "Cần quyền dùng camera.");
      return false;
    }
    return true;
  };

  const pickFromLibrary = async () => {
    const ok = await askLibPerm();
    if (!ok) return null;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!res.canceled) return res.assets[0].uri;
    return null;
  };

  const pickFromCamera = async () => {
    const ok = await askCamPerm();
    if (!ok) return null;
    const res = await ImagePicker.launchCameraAsync({ quality: 0.9 });
    if (!res.canceled) return res.assets[0].uri;
    return null;
  };

  const chooseImage = useCallback(async (setter) => {
    Alert.alert("Chọn ảnh", "", [
      {
        text: "Thư viện",
        onPress: async () => {
          const uri = await pickFromLibrary();
          if (uri) setter(uri);
        },
      },
      {
        text: "Chụp ảnh",
        onPress: async () => {
          const uri = await pickFromCamera();
          if (uri) setter(uri);
        },
      },
      { text: "Hủy", style: "cancel" },
    ]);
  }, []);

  const addHouseImage = useCallback(async () => {
    const uri = await pickFromLibrary();
    if (uri) setHouseUris((prev) => [...prev, uri]);
  }, []);
  const removeHouseImage = (idx) =>
    setHouseUris((prev) => prev.filter((_, i) => i !== idx));

  const validate = () => {
    if (!identityNumber.trim()) return "Vui lòng nhập số CMND/CCCD.";
    if (!frontUri) return "Vui lòng chọn ảnh CCCD/CMND mặt trước.";
    if (!backUri) return "Vui lòng chọn ảnh CCCD/CMND mặt sau.";
    if (!docUri) return "Vui lòng tải ảnh giấy tờ trọ.";
    if (houseUris.length === 0)
      return "Vui lòng thêm ít nhất 1 hình trọ liên quan.";
    return "";
  };

  const submit = async () => {
    const msg = validate();
    if (msg) return Alert.alert("Thiếu thông tin", msg);

    try {
      setLoading(true);
      const images = [frontUri, backUri, docUri, ...houseUris].filter(Boolean);
      console.log('token', token);
      await addLandlordRequest({
        userId,
        identityNumber: identityNumber.trim(),
        images, //  tất cả ảnh chung field "images"
      }, token);
      Alert.alert("Thành công", "Yêu cầu đã được gửi. Vui lòng chờ duyệt.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      const err =
        e?.response?.data?.message ||
        e?.response?.data ||
        e?.message ||
        "Gửi yêu cầu thất bại.";
      Alert.alert("Lỗi", err);
    } finally {
      setLoading(false);
    }
  };

  const UploadBox = ({ label, uri, onPick, onClear }) => (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.uploadBox}
        onPress={onPick}
        activeOpacity={0.9}
      >
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
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
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

        <UploadBox
          label="CCCD/CMND mặt trước"
          uri={frontUri}
          onPick={() => chooseImage(setFrontUri)}
          onClear={() => setFrontUri("")}
        />
        <UploadBox
          label="CCCD/CMND mặt sau"
          uri={backUri}
          onPick={() => chooseImage(setBackUri)}
          onClear={() => setBackUri("")}
        />
        <UploadBox
          label="Giấy tờ trọ (hợp đồng/biên nhận...)"
          uri={docUri}
          onPick={() => chooseImage(setDocUri)}
          onClear={() => setDocUri("")}
        />

        <Text style={[styles.label, { marginBottom: 8 }]}>
          Hình ảnh trọ liên quan
        </Text>
        <View style={styles.grid}>
          {houseUris.map((u, idx) => (
            <View key={idx} style={styles.gridItem}>
              <Image source={{ uri: u }} style={styles.gridImg} />
              <TouchableOpacity
                style={styles.removeThumb}
                onPress={() => removeHouseImage(idx)}
              >
                <Ionicons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={[styles.gridItem, styles.addTile]}
            onPress={addHouseImage}
          >
            <Ionicons name="add" size={28} />
            <Text style={{ marginTop: 4, fontSize: 12 }}>Thêm ảnh</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.7 }]}
          onPress={submit}
          disabled={loading}
        >
          <Text style={styles.submitText}>
            {loading ? "Đang gửi..." : "Gửi yêu cầu"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 16, color: "#111827" },
  label: { fontSize: 14, color: "#374151", marginTop: 10, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  uploadBox: {
    height: 180,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    overflow: "hidden",
  },
  preview: { width: "100%", height: "100%", resizeMode: "cover" },
  clearBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  gridItem: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  gridImg: { width: "100%", height: "100%", resizeMode: "cover" },
  addTile: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  removeThumb: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtn: {
    marginTop: 18,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

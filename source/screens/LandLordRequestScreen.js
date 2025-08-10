import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, Alert, StyleSheet, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRoute, useNavigation } from "@react-navigation/native";
import { addLandlordRequest } from "../api/LandLordApi";
import { getToken } from "../api/axiosClient";

export default function LandlordRequestScreen() {
  const { params } = useRoute();
  const navigation = useNavigation();
  const userId = params?.userId;

  const [identityNumber, setIdentityNumber] = useState("");
  const [images, setImages] = useState([]); // giữ ảnh dạng mảng uri (giống CreatePost)
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => { (async () => setToken(await getToken()))(); }, []);

  const pickImage = async () => {
    // Y HỆT CreatePost
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access gallery is required!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaType: ImagePicker.MediaTypeOptions.Images, // giữ nguyên như bạn dùng
      allowsEditing: true,
      quality: 1,
      selectionLimit: 0, // bạn từng để như này
    });
    if (!result.canceled) {
      setImages(prev => [...prev, result.assets[0].uri]); // thêm 1 ảnh/1 lần chọn (giống code bạn)
    }
  };

  const submit = async () => {
    if (!identityNumber.trim()) return Alert.alert("Thiếu thông tin", "Vui lòng nhập số CMND/CCCD.");
    if (images.length === 0)     return Alert.alert("Thiếu thông tin", "Vui lòng chọn ít nhất 1 ảnh.");

    // Build FormData NGAY Ở SCREEN (giống CreatePost)
    const formData = new FormData();
    formData.append("userId", String(userId));
    formData.append("identityNumber", String(identityNumber.trim()));
    images.forEach((uri) => {
      const filename = uri.split("/").pop() || "image.jpg";
      const ext = (filename.split(".").pop() || "jpg").toLowerCase();
      const type = ext === "png" ? "image/png" : (ext === "jpg" || ext === "jpeg") ? "image/jpeg" : "application/octet-stream";
      formData.append("file", { uri, name: filename, type }); // BE nhận key 'file'
    });

    try {
      setLoading(true);
      await addLandlordRequest(formData, token); // API chỉ nhận data + token
      Alert.alert("Thành công", "Yêu cầu đã được gửi. Vui lòng chờ duyệt.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data || e?.message || "Gửi yêu cầu thất bại.";
      Alert.alert("Lỗi", msg);
    } finally {
      setLoading(false);
    }
  };

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

      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Chọn ảnh giấy tờ</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 10 }}>
        {images.map((u, i) => (
          <Image key={i} source={{ uri: u }} style={{ width: 100, height: 100, margin: 5, borderRadius: 8 }} />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, { marginTop: 20 }, (loading || !token) && { opacity: 0.7 }]}
        onPress={submit}
        disabled={loading || !token}
      >
        <Text style={styles.buttonText}>{loading ? "Đang gửi..." : "Gửi yêu cầu"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 16, color: "#111827" },
  label: { fontSize: 14, color: "#374151", marginTop: 10, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 10, marginBottom: 10,
  },
  button: {
    backgroundColor: "#007bff", padding: 15, borderRadius: 5, alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});

// components/CreatePostSheet.js
import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';

const CreatePostSheet = forwardRef(({ onSubmit }, ref) => {
  const titleRef = useRef(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const snapPoints = useMemo(() => ['35%', '70%'], []);

  const canPost = title.trim().length >= 5 && desc.trim().length >= 10 && !loading;

  const handlePost = async () => {
    if (!canPost) return;
    try {
      setLoading(true);
      await onSubmit({ title: title.trim(), description: desc.trim() });
      setTitle('');
      setDesc('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet ref={ref} index={-1} snapPoints={snapPoints} enablePanDownToClose>
      <View style={styles.container}>
        <Text style={styles.title}>Tạo bài thảo luận</Text>

        <TextInput
          ref={titleRef}
          style={styles.input}
          placeholder="Tiêu đề (≥ 5 ký tự)"
          value={title}
          onChangeText={setTitle}
          returnKeyType="next"
        />
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Nội dung (≥ 10 ký tự)"
          value={desc}
          onChangeText={setDesc}
          multiline
        />

        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => ref.current?.close()} disabled={loading}>
            <Text style={[styles.btnText, { color: '#0066FF' }]}>Đóng</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, canPost ? styles.btnPrimary : styles.btnDisabled]}
            onPress={handlePost}
            disabled={!canPost}
            activeOpacity={0.9}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Đăng</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  container: { padding: 16, gap: 10 },
  title: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#FFF', color: '#111827'
  },
  textarea: { height: 120, textAlignVertical: 'top' },
  row: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 4 },
  btn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  btnGhost: { backgroundColor: '#EEF4FF' },
  btnPrimary: { backgroundColor: '#0066FF' },
  btnDisabled: { backgroundColor: '#9CA3AF' },
  btnText: { color: '#fff', fontWeight: '700' },
});

export default CreatePostSheet;

import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native';
import LoadingComponent from '../components/LoadingComponent';

export default function CreatePostModal({ visible, onClose, onSubmit }) {
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [loading, setLoading] = useState(false);


    //Dung useEffect de kiem tra xem co du ki tu hay khong
    useEffect(() => {
        setIsValid(title.trim().length >= 5 && desc.trim().length >= 10);
    }, [title, desc]);

    const handlePost = async () => {
        if (!isValid) return;
        setLoading(true);
        try {
            await onSubmit({ title: title.trim(), description: desc.trim() }); // chờ API xong
            setTitle('');
            setDesc('');
            onClose();
        } catch (error) {
            console.error('Lỗi tạo bài viết:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            transparent
            animationType="fade"
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Tạo bài thảo luận</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Tiêu đề (≥ 5 ký tự)"
                        value={title}
                        onChangeText={setTitle}
                    />
                    <TextInput
                        style={[styles.input, styles.textarea]}
                        placeholder="Nội dung (≥ 10 ký tự)"
                        value={desc}
                        onChangeText={setDesc}
                        multiline
                    />

                    <View style={styles.row}>
                        <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={onClose}>
                            <Text style={[styles.btnText, { color: '#0066FF' }]}>Đóng</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.btn,
                                styles.btnPrimary,
                                (!isValid || loading) && { backgroundColor: '#A5C9FF' }
                            ]}
                            onPress={handlePost}
                            disabled={!isValid || loading}
                        >
                            {loading
                                ? <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <ActivityIndicator size="small" color="#FFF" />
                                    <Text style={[styles.btnText, { marginLeft: 8 }]}>Đang đăng...</Text>
                                </View>
                                : <Text style={styles.btnText}>Đăng</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20
    },
    modalContent: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        elevation: 5
    },
    title: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 10
    },
    textarea: {
        height: 100,
        textAlignVertical: 'top'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10
    },
    btn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8
    },
    btnGhost: { backgroundColor: '#EEF4FF' },
    btnPrimary: { backgroundColor: '#0066FF' },
    btnText: { color: '#fff', fontWeight: '700' }
});

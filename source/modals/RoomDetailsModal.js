import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, Pressable, Image, ScrollView, Linking, Animated, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather'; // Sử dụng thư viện icon Feather

// Ánh xạ tên tiện nghi với tên icon từ thư viện 'react-native-vector-icons'
// Bạn có thể cần điều chỉnh tên icon tùy theo bộ icon bạn chọn
const amenityIconMap = {
    "Gác Lửng": "home",
    "Tủ lạnh": "aperture",
    "Máy giặt riêng": "moon",
    "Wifi": "wifi",
    "Vệ sinh trong phòng": "check-square",
    "Bình nóng lạnh": "shield",
    "Kệ bếp": "cloud",
    "Giường": "maximize",
    "Tủ quần áo": "box",
    "Điều hoà": "sun",
    "Nóng lạnh": "shield",
};

// Hàm helper để trích xuất các chi tiết từ chuỗi mô tả
const extractDetails = (description) => {
    if (!description) return [];
    return description.split('\n').filter(line => line.trim() !== '').map(line => line.replace(/^- /, '').trim());
};

const RoomDetailModal = ({ visible, room, onClose }) => {
    // Nếu không có dữ liệu phòng, không hiển thị modal
    if (!room) {
        return null;
    }

    const [mainImage, setMainImage] = useState(room.images[0]);
    const details = extractDetails(room.description);

    // Sử dụng giá trị Animated cho modal
    const animatedOpacity = useRef(new Animated.Value(0)).current;
    const animatedScale = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        if (visible) {
            // Hiệu ứng hiện lên
            Animated.parallel([
                Animated.timing(animatedOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(animatedScale, {
                    toValue: 1,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // Hiệu ứng ẩn đi
            Animated.parallel([
                Animated.timing(animatedOpacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedScale, {
                    toValue: 0.9,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    return (
        <Modal
            animationType="none" // Tắt animation mặc định của Modal
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Animated.View style={[styles.container, { transform: [{ scale: animatedScale }] }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>{room.title}</Text>
                        <Pressable onPress={onClose} style={styles.closeButton}>
                            <Icon name="x" size={24} color="#6B7280" />
                        </Pressable>
                    </View>

                    {/* Main Content */}
                    <ScrollView style={styles.content} bounces={false}>
                        {/* Image Gallery */}
                        <View style={styles.imageGallery}>
                            <Image source={{ uri: mainImage }} style={styles.mainImage} />
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailContainer}>
                                {room.images.map((image, index) => (
                                    <Pressable key={index} onPress={() => setMainImage(image)}>
                                        <Image source={{ uri: image }} style={[styles.thumbnail, mainImage === image && styles.activeThumbnail]} />
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Details Section */}
                        <View style={styles.detailsSection}>
                            <View style={styles.card}>
                                {/* Thông tin cơ bản */}
                                <View style={styles.infoSection}>
                                    <Text style={styles.infoTitle}>Thông tin loại phòng</Text>
                                    <View style={styles.infoRow}>
                                        <Icon name="home" size={18} color="#4F46E5" />
                                        <Text style={styles.infoText}>{room.available ? "Còn phòng" : "Hết phòng"}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Icon name="crop" size={18} color="#4F46E5" />
                                        <Text style={styles.infoText}>Diện tích: {room.area}m²</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Icon name="users" size={18} color="#4F46E5" />
                                        <Text style={styles.infoText}>Tối đa: {room.maxPeople} người</Text>
                                    </View>
                                </View>

                                {/* Giới thiệu */}
                                <View style={styles.infoSection}>
                                    <Text style={styles.infoTitle}>Giới thiệu</Text>
                                    {details.map((detail, index) => (
                                        <Text key={index} style={styles.infoText}>{detail}</Text>
                                    ))}
                                </View>

                                {/* Tiện nghi */}
                                {room.roomAmenities && room.roomAmenities.length > 0 && (
                                    <View style={styles.infoSection}>
                                        <Text style={styles.infoTitle}>Tiện nghi</Text>
                                        <View style={styles.amenitiesGrid}>
                                            {room.roomAmenities.map((amenity, index) => (
                                                <View key={index} style={styles.amenityItem}>
                                                    <Icon name={amenityIconMap[amenity.amenityName] || "check"} size={20} color="#4F46E5" />
                                                    <Text style={styles.amenityText}>{amenity.amenityName}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                )}
                            </View>
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <View>
                            <Text style={styles.priceLabel}>Giá chỉ từ</Text>
                            <Text style={styles.priceText}>{room.price.toLocaleString('vi-VN')}đ/tháng</Text>
                        </View>
                        <Pressable style={styles.contactButton} onPress={() => Linking.openURL(`tel:0901234567`)}>
                            <Icon name="phone-call" size={18} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.contactButtonText}>Liên hệ ngay</Text>
                        </Pressable>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

// StyleSheet cho React Native
const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        backgroundColor: 'white',
        borderRadius: 12,
        width: '95%',
        maxWidth: 500,
        maxHeight: '90%',
        overflow: 'hidden',
        // Thêm flex: 1 để container chiếm không gian còn lại
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    closeButton: {
        padding: 8,
    },
    content: {
        flex: 1, // Thêm flex: 1 để ScrollView chiếm hết không gian
        padding: 16,
    },
    imageGallery: {
        marginBottom: 16,
    },
    mainImage: {
        width: '100%',
        height: 250,
        borderRadius: 8,
        marginBottom: 8,
        resizeMode: 'cover',
    },
    thumbnailContainer: {
        flexDirection: 'row',
    },
    thumbnail: {
        width: 72,
        height: 48,
        borderRadius: 6,
        marginRight: 8,
        borderColor: 'transparent',
        borderWidth: 2,
    },
    activeThumbnail: {
        borderColor: '#4F46E5',
    },
    detailsSection: {
        flex: 1,
    },
    card: {
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        padding: 16,
    },
    infoSection: {
        marginBottom: 24,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4F46E5',
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    infoText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#4B5563',
    },
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    amenityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '50%',
        marginBottom: 8,
    },
    amenityText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#4B5563',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
    },
    priceLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    priceText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#EF4444',
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EF4444',
        borderRadius: 20,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    contactButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
});

export default RoomDetailModal;

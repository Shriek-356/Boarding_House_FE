import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const RoomDetailModal = ({ visible, room, onClose }) => {
    if (!room) return null;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{room.title}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Icon name="close" size={24} color="#6C5CE7" />
                        </TouchableOpacity>
                    </View>

                    {/* Thông tin cơ bản */}
                    <View style={styles.infoSection}>
                        <Text style={styles.sectionTitle}>Thông tin loại phòng</Text>
                        <View style={styles.infoRow}>
                            <Icon name="home" size={18} color="#6C5CE7" />
                            <Text>Còn {room.available}/{room.total} phòng</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Icon name="square-outline" size={18} color="#6C5CE7" />
                            <Text>Diện tích: {room.area}m²</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Icon name="account" size={18} color="#6C5CE7" />
                            <Text>Tối đa: {room.maxPeople} người</Text>
                        </View>
                    </View>

                    {/* Giới thiệu */}
                    <View style={styles.infoSection}>
                        <Text style={styles.sectionTitle}>Giới thiệu</Text>
                        <Text style={styles.description}>{room.description}</Text>
                    </View>

                    {/* Tiện nghi */}
                    <View style={styles.infoSection}>
                        <Text style={styles.sectionTitle}>Tiện nghi</Text>
                        <View style={styles.amenitiesContainer}>
                            {room.amenities.map((amenity, index) => (
                                <View key={index} style={styles.amenityItem}>
                                    <Icon
                                        name={amenity.available ? "check" : "close"}
                                        size={18}
                                        color={amenity.available ? "#6C5CE7" : "#FF7675"}
                                    />
                                    <Text>{amenity.name}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Giá và nút liên hệ */}
                    <View style={styles.priceSection}>
                        <Text style={styles.priceText}>Giá từ {room.price.toLocaleString('vi-VN')}đ/tháng</Text>
                        <TouchableOpacity style={styles.contactButton} onPress={() => handleCallOwner(room.ownerPhone)}>
                            <Text style={styles.contactButtonText}>Liên hệ ngay</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2D3436',
    },
    infoSection: {
        marginBottom: 20,
    },
    amenitiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    amenityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '50%',
        marginBottom: 10,
    },
    priceSection: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        paddingTop: 15,
        alignItems: 'center',
    },
    priceText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#6C5CE7',
        marginBottom: 15,
    },
});

import React, { useEffect, useState, useContext } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ref, onValue } from 'firebase/database';
import { db } from '../configs/firebaseConfig';
import { AuthContext } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

const ChatRoomListScreen = () => {
    const { user } = useContext(AuthContext);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        if (!user?.id) return;

        const chatRoomsRef = ref(db, `chatRooms/${user.id}`);
        const unsubscribe = onValue(chatRoomsRef, (snapshot) => {
            const data = snapshot.val() || {};
            const roomList = Object.entries(data).map(([userId, room]) => ({
                userId, //Lay userId tu object cua chatRooms firebase vi hien tai chua biet receiver
                ...room,
            }));
            setRooms(roomList.reverse());
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.roomItem}
            onPress={() =>
                navigation.navigate('Chat', {
                    sender: user,
                    receiver: {
                        id: item.userId,
                        firstname: item.firstname,
                        lastname: item.lastname,
                        avatar: item.avatar,
                    },
                })
            }
        >
            <Image
                source={{ uri: item.avatar || 'https://placehold.co/100x100?text=U' }}
                style={styles.avatar}
            />
            <View style={styles.textContainer}>
                <View style={styles.topRow}>
                    <Text style={styles.name} numberOfLines={1}>
                        {item.firstname} {item.lastname}
                    </Text>
                    <Text style={styles.time}>
                        {item.timestamp &&
                            new Date(item.timestamp).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                    </Text>
                </View>
                <Text style={styles.lastMessage} numberOfLines={1}>
                    {item.lastMessage || 'Tin nhắn trống'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Tiêu đề */}
            <View style={styles.header}>
                <Ionicons name="chatbubbles-outline" size={20} color="#4B5563" style={styles.icon} />
                <Text style={styles.headerTitle}>Đoạn chat</Text>
            </View>

            {loading ? (
                <View style={styles.loadingMoreContainer}>
                    <LottieView
                        source={require('../../assets/animations/loading.json')}
                        autoPlay
                        loop
                        style={{ width: 60, height: 60 }}
                    />
                    <Text style={styles.loadingText}>Đang tải trò chuyện...</Text>
                </View>
            ) : rooms.length === 0 ? (
                <Text style={styles.emptyText}>Chưa có cuộc trò chuyện nào</Text>
            ) : (
                <FlatList
                    data={rooms}
                    renderItem={renderItem}
                    keyExtractor={(_, index) => index.toString()}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </View>
    );
};

export default ChatRoomListScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { height: 1 },
        shadowRadius: 2,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
    },
    icon: {
        marginRight: 8,
    },
    roomItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: '#fff',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        flexShrink: 1,
    },
    time: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    lastMessage: {
        fontSize: 14,
        color: '#6B7280',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
        color: '#9CA3AF',
    },
});

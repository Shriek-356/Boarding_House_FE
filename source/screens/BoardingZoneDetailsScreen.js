import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, Dimensions, TextInput, TouchableOpacity, Share, FlatList,Linking, Platform, StatusBar, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native-paper';
import { getBoardingZoneById, getBoardingZoneAmenities, getBoardingZoneTarget, getBoardingZoneEnvironment } from '../api/boardingZoneApi';
import { getRoomsOfBoardingZone } from '../api/roomApi';
import PropTypes from 'prop-types';
import axios from 'axios';
import RoomDetailsModal from '../modals/RoomDetailsModal';
import { addZoneComment, addZoneCommentResponse, getBoardingZoneComments } from '../api/boardingZoneComment';
import { getToken } from '../api/axiosClient';
import { AuthContext } from '../contexts/AuthContext';
import { useContext } from 'react';
import CommentItemComponent from '../components/CommentItemComponent';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const { width } = Dimensions.get('window');
import { Pressable, PixelRatio } from 'react-native';
const MAX_REQUESTS_PER_MINUTE = 50;

const BoardingDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { id } = route.params;//id cua boardingZone

    const [room, setRoom] = useState(null);
    const [boardingHouse, setBoardingHouse] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [requestCount, setRequestCount] = useState(0);
    const [error, setError] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const { user } = useContext(AuthContext);
    const [token, setToken] = useState(null);
    const [comments, setComments] = useState([]);
    const [newCommentText, setNewCommentText] = useState('');

    const insets = useSafeAreaInsets();
    const BOTTOM_BAR_HEIGHT = 64;

    // Memoized address for coordinates fetching
    const fullAddress = useMemo(() => {
        if (!room) return '';
        return [room.address, room.street, room.ward, room.district, room.province]
            .filter(Boolean)
            .join(', ');
    }, [room]);

    // Hàm mở modal
    const handleRoomPress = (room) => {
        setSelectedRoom(room);
        setModalVisible(true);
    };

    // Fetch all boarding zone data in parallel
    const fetchBoardingZoneData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [details, amenities, target, environment, rooms] = await Promise.all([
                getBoardingZoneById(id),
                getBoardingZoneAmenities(id),
                getBoardingZoneTarget(id),
                getBoardingZoneEnvironment(id),
                getRoomsOfBoardingZone(id, 0)
            ]);

            setRoom({
                ...details,
                amenities,
                target,
                environment
            });

            setBoardingHouse(rooms);
        } catch (err) {
            console.error('Error fetching boarding zone data:', err);
            setError('Không thể tải thông tin phòng trọ. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    // Get coordinates from address with rate limiting
    const getCoordinatesFromAddress = useCallback(async (address) => {
        if (!address || requestCount >= MAX_REQUESTS_PER_MINUTE) {
            console.warn("Đạt giới hạn request hoặc địa chỉ trống");
            return;
        }

        try {
            setRequestCount(prev => prev + 1);

            const response = await axios.get(
                `https://us1.locationiq.com/v1/search.php?key=pk.813257b3e503fd44f49d3c6b13648a38&q=${encodeURIComponent(address)}&format=json`
            );

            if (response.data?.length > 0) {
                const firstResult = response.data[0];
                setRoom(prev => ({
                    ...prev,
                    latitude: parseFloat(firstResult.lat),
                    longitude: parseFloat(firstResult.lon)
                }));
            }
        } catch (err) {
            console.log("LocationIQ Error:", err.response?.data || err.message);
        }
    }, [requestCount]);

    useEffect(() => {
        fetchBoardingZoneData();
    }, [fetchBoardingZoneData]);

    //Load token va comment
    useEffect(() => {
        const load = async () => {
            try {
                const t = await getToken();
                setToken(t);
            } catch { }
            try {
                console.log("id", id)
                const cmts = await getBoardingZoneComments(id);
                setComments(cmts || []);
            } catch (e) {
                console.log('Load BZ comments error:', e);
                setComments([]);
            }
        };
        load();
    }, [id]);

    //Xu ly comment
    const insertReplyToTree = (parentId, replyNode, nodes) =>
        nodes.map(n => {
            if (n.id === parentId) return { ...n, replies: [...(n.replies || []), replyNode] };
            if (n.replies?.length) return { ...n, replies: insertReplyToTree(parentId, replyNode, n.replies) };
            return n;
        });

    const handleReplySubmit = (parentId, replyNode) => {
        setComments(prev => insertReplyToTree(parentId, replyNode, prev));
    };

    const handleAddComment = async () => {
        const text = newCommentText.trim();
        if (!text) return;
        try {
            const res = await addZoneComment(token, { boardingZoneId: id, content: text });
            const newCmt = {
                id: res.id,
                content: res.content,
                createdAt: res.createdAt,
                user: { username: user?.username || 'Bạn', avatar: user?.avatar },
                replies: [],
            };
            setComments(prev => [newCmt, ...(prev || [])]);
            setNewCommentText('');
        } catch (e) {
            console.log('Add BZ comment error:', e);
        }
    };

    const onReplySubmit = async (parentId, replyText) => {
        const res = await addZoneCommentResponse(token,
            { boardingZoneId: id, content: replyText, parentId: parentId },
        );
        const reply = {
            id: res.id,
            content: res.content,
            createdAt: res.createdAt,
            user: { username: user?.username || 'Bạn', avatar: user?.avatar },
            replies: [],
        };
        handleReplySubmit(parentId, reply);
    };

    useEffect(() => {
        if (fullAddress) {
            getCoordinatesFromAddress(fullAddress);
        }
    }, [fullAddress, getCoordinatesFromAddress]);

    const handleCallOwner = useCallback(() => {
        const phone = room?.contactPhone || room?.landlord?.phone;
        if (phone) {
            Linking.openURL(`tel:${phone}`);
        }
    }, [room]);

    const handleShareRoom = useCallback(async () => {
        try {
            await Share.share({
                message: `Xem phòng trọ này: ${room?.name || 'Phòng trọ'} - Giá ${room?.expectedPrice?.toLocaleString('vi-VN') || '---'}đ/tháng`,
                url: 'https://yourwebsite.com/room/' + id,
                title: room?.name || 'Phòng trọ'
            });
        } catch (err) {
            console.error('Error sharing:', err);
        }
    }, [room, id]);

    const handleImageError = useCallback(({ nativeEvent: { error } }) => {
        console.log('Image load error:', error);
    }, []);

    const renderImageItem = useCallback(({ item, index }) => (
        <TouchableOpacity onPress={() => setActiveImageIndex(index)}>
            <Image
                source={{ uri: item }}
                style={[styles.thumbnail, index === activeImageIndex && styles.activeThumbnail]}
                onError={handleImageError}
            />
        </TouchableOpacity>
    ), [activeImageIndex, handleImageError]);

    const renderUtilityItem = useCallback(({ item }) => (
        <View style={styles.utilityItem}>
            <Icon name={item.icon} size={20} color="#6C5CE7" />
            <Text style={styles.utilityText}>{item.amenityName}</Text>
        </View>
    ), []);

    const renderRoomItem = useCallback(({ item }) => (
        <View style={styles.card}>
            <Image
                source={{ uri: item.images[0] || 'https://i.imgur.com/JZw1g0a.jpg' }}
                style={styles.image}
                onError={handleImageError}
            />
            <View style={styles.infoContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.info}>Diện tích: {item.area}m²</Text>
                <Text style={styles.info}>Tối đa: {item.maxPeople} người</Text>
                <Text style={styles.price}>{(item.price / 1000000).toFixed(1)} triệu/tháng</Text>
                <TouchableOpacity style={styles.button} onPress={() => handleRoomPress(item)}>
                    <Text style={styles.buttonText}>Chi tiết</Text>
                </TouchableOpacity>
            </View>
        </View>
    ), [handleImageError]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6C5CE7" />
                <Text style={styles.loadingText}>Đang tải thông tin phòng...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={48} color="#FF7675" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={fetchBoardingZoneData}
                >
                    <Text style={styles.retryButtonText}>Thử lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!room) {
        return null;
    }

    const LIQ_TOKEN = 'pk.813257b3e503fd44f49d3c6b13648a38'

    const images = room.images?.length > 0 ? room.images : ['https://i.imgur.com/JZw1g0a.jpg'];

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar backgroundColor="#6C5CE7" barStyle="light-content" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi tiết phòng trọ</Text>
                <TouchableOpacity style={styles.shareButton} onPress={handleShareRoom}>
                    <Icon name="share-variant" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.container}
                contentContainerStyle={{ paddingBottom: insets.bottom + BOTTOM_BAR_HEIGHT + 24 }}>
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: images[activeImageIndex] }}
                        style={styles.mainImage}
                        resizeMode="cover"
                        onError={handleImageError}
                    />
                    <View style={styles.imagePagination}>
                        {images.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.paginationDot,
                                    index === activeImageIndex && styles.activeDot
                                ]}
                            />
                        ))}
                    </View>
                </View>

                <FlatList
                    horizontal
                    data={images}
                    renderItem={renderImageItem}
                    keyExtractor={(_, index) => index.toString()}
                    contentContainerStyle={styles.thumbnailContainer}
                    showsHorizontalScrollIndicator={false}
                />

                <View style={styles.contentContainer}>
                    <Text style={styles.title}>{room.name || 'Phòng trọ không tên'}</Text>

                    <View style={styles.priceContainer}>
                        <Text style={styles.price}>
                            Từ {room.expectedPrice?.toLocaleString('vi-VN') || '---'}đ/tháng
                        </Text>
                        {room.deposit && (
                            <Text style={styles.deposit}>
                                Đặt cọc: {room.deposit.toLocaleString('vi-VN')}đ
                            </Text>
                        )}
                    </View>

                    <View style={styles.infoRow}>
                        <Icon name="map-marker" size={18} color="#6C5CE7" />
                        <Text style={styles.address}>{fullAddress || 'Địa chỉ không xác định'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Icon name="square-outline" size={18} color="#6C5CE7" />
                        <Text style={styles.area}>{room.area || '--'}m²</Text>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Mô tả chi tiết</Text>
                    <Text style={styles.description}>
                        {room.description || 'Không có mô tả chi tiết.'}
                    </Text>

                    <View style={styles.divider} />

                    {room.target?.length > 0 && (
                        <>
                            <Text style={styles.sectionTitle}>Đối tượng</Text>
                            <View style={styles.flexWrapRow}>
                                {room.target.map((target, index) => (
                                    <View key={index} style={styles.tagItem}>
                                        <Icon name="account" size={18} color="#6C5CE7" />
                                        <Text style={styles.tagText}>{target.targetGroup}</Text>
                                    </View>
                                ))}
                            </View>
                            <View style={styles.divider} />
                        </>
                    )}

                    {room.amenities?.length > 0 && (
                        <>
                            <Text style={styles.sectionTitle}>Tiện ích</Text>
                            <FlatList
                                data={room.amenities}
                                renderItem={renderUtilityItem}
                                keyExtractor={(item, index) => index.toString()}
                                numColumns={2}
                                columnWrapperStyle={styles.utilityColumnWrapper}
                                contentContainerStyle={styles.utilitiesContainer}
                                scrollEnabled={false}
                            />
                            <View style={styles.divider} />
                        </>
                    )}

                    {room.environment?.length > 0 && (
                        <>
                            <Text style={styles.sectionTitle}>Môi trường xung quanh</Text>
                            <View style={styles.flexWrapRow}>
                                {room.environment.map((env, index) => (
                                    <View key={index} style={styles.tagItem}>
                                        <Icon name="home-city" size={18} color="#6C5CE7" />
                                        <Text style={styles.tagText}>{env.environmentType}</Text>
                                    </View>
                                ))}
                            </View>
                            <View style={styles.divider} />
                        </>
                    )}

                    {boardingHouse.length > 0 && (
                        <>
                            <Text style={styles.sectionTitle}>Phòng trọ khác trong khu</Text>
                            <FlatList
                                data={boardingHouse}
                                renderItem={renderRoomItem}
                                keyExtractor={(item) => item.id.toString()}
                                scrollEnabled={false}
                            />
                            <View style={styles.divider} />
                        </>
                    )}

                    <Text style={styles.sectionTitle}>Thông tin chủ trọ</Text>
                    <View style={styles.ownerContainer}>
                        <TouchableOpacity onPress={() => navigation.navigate('Profile', { profileUser: room.landlord })}>
                            <Image
                                source={{ uri: room.landlord?.avatar || 'https://i.imgur.com/JZw1g0a.jpg' }}
                                style={styles.ownerAvatar}
                                onError={handleImageError}
                            />
                        </TouchableOpacity>
                        <View style={styles.ownerInfo}>
                            <Text style={styles.ownerName}>
                                {room.contactName ||
                                    `${room.landlord?.firstname || 'Chủ'} ${room.landlord?.lastname || ''}`}
                            </Text>
                            <Text style={styles.ownerPhone}>
                                {room.contactPhone || room.landlord?.phone || 'Không có số điện thoại'}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.callButton}
                            onPress={handleCallOwner}
                            disabled={!room.contactPhone && !room.landlord?.phone}
                        >
                            <Icon name="phone" size={20} color="#FFF" />
                            <Text style={styles.callButtonText}>Gọi ngay</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    {room.latitude && room.longitude && (
                        <>
                            <Text style={styles.sectionTitle}>Vị trí</Text>
                            <View style={styles.mapContainer}>
                                {(() => {
                                    const dpr = Math.min(PixelRatio.get(), 2);               // ảnh nét vừa đủ
                                    const targetH = 250;                                     // cùng chiều cao với style
                                    const targetW = Math.round(width - 30);                  // trừ padding 2 bên nếu có
                                    const w = Math.min(Math.round(targetW * dpr), 1024);     // tránh vượt limit
                                    const h = Math.min(Math.round(targetH * dpr), 1024);

                                    const lat = room.latitude;
                                    const lng = room.longitude;
                                    const url = `https://maps.locationiq.com/v3/staticmap` +
                                        `?key=${LIQ_TOKEN}` +
                                        `&center=${lat},${lng}` +
                                        `&zoom=15&size=${w}x${h}` +
                                        `&markers=icon:large-blue-cutout|${lat},${lng}`;

                                    // Bấm vào ảnh -> mở OSM ngoài app (không dùng Google)
                                    const openExternal = () =>
                                        Linking.openURL(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`);

                                    return (
                                        <Pressable onPress={openExternal} android_ripple={{ color: '#eee' }}>
                                            <Image
                                                source={{ uri: url }}
                                                style={{ width: '100%', height: targetH, borderRadius: 12, backgroundColor: '#eee' }}
                                                resizeMode="cover"
                                            />
                                        </Pressable>
                                    );
                                })()}
                            </View>
                        </>
                    )}
                </View>

                <View style={styles.divider} />
                <Text style={styles.sectionTitle}>Bình luận</Text>

                <FlatList
                    data={comments}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => (
                        <CommentItemComponent
                            comment={item}
                            onReplySubmit={onReplySubmit}
                            postId={id}
                        />
                    )}
                    ListFooterComponent={
                        <View style={styles.footerInput}>
                            <TextInput
                                value={newCommentText}
                                onChangeText={setNewCommentText}
                                placeholder="Nhập bình luận..."
                                placeholderTextColor="#9CA3AF"
                                style={styles.input}
                            />
                            <TouchableOpacity onPress={handleAddComment} style={styles.sendBtn} activeOpacity={0.9}>
                                <Text style={styles.sendText}>Gửi</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    scrollEnabled={false}
                />
            </ScrollView>



            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    style={styles.contactButton}
                    onPress={handleCallOwner}
                    disabled={!room.contactPhone && !room.landlord?.phone}
                >
                    <Icon name="phone" size={20} color="#FFF" />
                    <Text style={styles.contactButtonText}>Liên hệ chủ trọ</Text>
                </TouchableOpacity>
            </View>

            <RoomDetailsModal
                visible={modalVisible}
                room={selectedRoom}
                onClose={() => setModalVisible(false)}
                handleCallOwner={handleCallOwner}
            />
        </SafeAreaView>
    );
};

BoardingDetailScreen.propTypes = {
    route: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
        }).isRequired
    }).isRequired,
    navigation: PropTypes.object.isRequired
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFF',
    },
    errorText: {
        marginTop: 15,
        fontSize: 16,
        color: '#2D3436',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#6C5CE7',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    retryButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: '#6C5CE7',
        fontWeight: '500',
    },
    header: {
        backgroundColor: '#6C5CE7',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 15,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
        flex: 1,
        textAlign: 'center',
    },
    shareButton: {
        padding: 5,
    },
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    imageContainer: {
        height: 250,
        width: '100%',
        position: 'relative',
    },
    mainImage: {
        width: '100%',
        height: '100%',
    },
    imagePagination: {
        position: 'absolute',
        bottom: 15,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.5)',
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: '#6C5CE7',
        width: 20,
    },
    thumbnailContainer: {
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    activeThumbnail: {
        borderColor: '#6C5CE7',
        borderWidth: 2,
    },
    contentContainer: {
        padding: 15,
        paddingBottom: 80,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2D3436',
        marginBottom: 10,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    price: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#6C5CE7',
        marginRight: 15,
    },
    deposit: {
        fontSize: 14,
        color: '#636E72',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    address: {
        fontSize: 14,
        color: '#636E72',
        marginLeft: 8,
        flex: 1,
    },
    area: {
        fontSize: 14,
        color: '#636E72',
        marginLeft: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#EEE',
        marginVertical: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D3436',
        marginBottom: 15,
    },
    description: {
        fontSize: 14,
        color: '#636E72',
        lineHeight: 22,
    },
    utilitiesContainer: {
        paddingBottom: 10,
    },
    utilityColumnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    utilityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 12,
        width: '48%',
        marginBottom: 10,
    },
    utilityText: {
        fontSize: 13,
        color: '#2D3436',
        marginLeft: 5,
        flexShrink: 1,
    },
    ownerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    ownerAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    ownerInfo: {
        flex: 1,
    },
    ownerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2D3436',
    },
    ownerPhone: {
        fontSize: 14,
        color: '#636E72',
        marginTop: 3,
    },
    callButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#6C5CE7',
        borderRadius: 25,
        paddingVertical: 10,
        paddingHorizontal: 15,
        opacity: 1,
    },
    callButtonDisabled: {
        opacity: 0.5,
    },
    callButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    mapContainer: {
        height: 250,  // Tăng từ 200 lên 250 hoặc cao hơn nếu cần
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 10,
        marginBottom: 10,  // Thêm margin bottom để tránh bị che
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    marker: {
        backgroundColor: '#FFF',
        padding: 5,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#6C5CE7',
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 10,
    },
    contactButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#6C5CE7',
        borderRadius: 25,
        padding: 15,
        opacity: 1,
    },
    contactButtonDisabled: {
        opacity: 0.5,
    },
    contactButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    tagItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        marginRight: 10,
        marginBottom: 10,
        backgroundColor: '#f9f9f9',
    },
    tagText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#333',
    },
    flexWrapRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    card: {
        flexDirection: 'row',
        margin: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 2
    },
    image: {
        width: 120,
        height: 120
    },
    infoContainer: {
        flex: 1,
        padding: 10
    },
    info: {
        fontSize: 13,
        marginTop: 2
    },
    button: {
        marginTop: 10,
        backgroundColor: '#6C5CE7',
        padding: 8,
        borderRadius: 5
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center'
    },
    footerInput: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 18,
        paddingBottom: 40,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 22,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        color: '#111827',
    },
    sendBtn: {
        backgroundColor: '#6C5CE7',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 22,
        marginLeft: 8,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
    },
    sendText: { color: '#fff', fontWeight: '700' },

});

export default BoardingDetailScreen;
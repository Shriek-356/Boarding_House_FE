import React, { useState, useEffect, use } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Image,
    Dimensions,
    TouchableOpacity,
    Share,
    Linking,
    FlatList,
    Platform,
    StatusBar,
    SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { ActivityIndicator } from 'react-native-paper';
import { getBoardingZoneById, getBoardingZoneAmenities, getBoardingZoneTarget, getBoardingZoneEnvironment } from '../api/boardingZoneApi';
import axios from 'axios';

const { width } = Dimensions.get('window');

const BoardingDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { id } = route.params;
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    let requestCount = 0;
    const MAX_REQUESTS_PER_MINUTE = 50;
    //Ham lấy tọa độ từ địa chỉ, dung API cua LocationIQ
    const getCoordinatesFromAddress = async (address) => {
        if (!address) return;
        if (requestCount >= MAX_REQUESTS_PER_MINUTE) {
            console.warn("Đạt giới hạn request");
            return null;
        }
        requestCount++;
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
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
        } catch (error) {
            console.log("LocationIQ Error:", error.response?.data || error.message);
        }
    };



    useEffect(() => {
        const fetchBoardingZoneDetails = async () => {
            try {
                const response = await getBoardingZoneById(id);
                setRoom(response);
            } catch (error) {
                console.error('Error fetching room details:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchBoardingZoneAmenities = async () => {
            try {
                const amenities = await getBoardingZoneAmenities(id);
                setRoom(prev => ({
                    ...prev,
                    amenities
                }));
            } catch (error) {
                console.error('Error fetching room amenities:', error);
            }
        };

        const fetchBoardingZoneTarget = async () => {
            try {
                const target = await getBoardingZoneTarget(id);
                setRoom(prev => ({
                    ...prev,
                    target
                }));
            } catch (error) {
                console.error('Error fetching room target:', error);
            }
        };

        const fetchBoardingZoneEnvironment = async () => {
            try {
                const environment = await getBoardingZoneEnvironment(id);
                setRoom(prev => ({
                    ...prev,
                    environment
                }));
            } catch (error) {
                console.error('Error fetching room environment:', error);
            }
        };
        fetchBoardingZoneDetails();
        fetchBoardingZoneAmenities();
        fetchBoardingZoneTarget();
        fetchBoardingZoneEnvironment();
    }, [id]);

    useEffect(() => {
        getCoordinatesFromAddress([room?.address, room?.street, room?.ward, room?.district, room?.province].filter(Boolean).join(', ') || '')
        //console.log("Room details updated:", room);
    }, [room])

    const handleCallOwner = () => {
        const phone = room?.contactPhone || room?.landlord?.phone || '0000000000';
        Linking.openURL(`tel:${phone}`);
    };

    const handleShareRoom = async () => {
        try {
            await Share.share({
                message: `Xem phòng trọ này: ${room?.name || 'Phòng trọ'} - Giá ${room?.expectedPrice?.toLocaleString('vi-VN') || '---'}đ/tháng`,
                url: 'https://yourwebsite.com/room/' + id,
                title: room?.name || 'Phòng trọ'
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    if (loading || !room) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6C5CE7" />
                <Text style={styles.loadingText}>Đang tải thông tin phòng...</Text>
            </View>
        );
    }


    const images = room.images || ['https://i.imgur.com/JZw1g0a.jpg'];

    // Test ngay trong component


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

            <ScrollView style={styles.container}>
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: images[activeImageIndex] }}
                        style={styles.mainImage}
                        resizeMode="cover"
                    />
                    <View style={styles.imagePagination}>
                        {images.map((_, index) => (
                            <View
                                key={index}
                                style={[styles.paginationDot, index === activeImageIndex && styles.activeDot]}
                            />
                        ))}
                    </View>
                </View>

                <FlatList
                    horizontal
                    data={images}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity onPress={() => setActiveImageIndex(index)}>
                            <Image
                                source={{ uri: item }}
                                style={[styles.thumbnail, index === activeImageIndex && styles.activeThumbnail]}
                            />
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={styles.thumbnailContainer}
                    showsHorizontalScrollIndicator={false}
                />

                <View style={styles.contentContainer}>
                    <Text style={styles.title}>{room.name || 'Phòng trọ không tên'}</Text>

                    <View style={styles.priceContainer}>
                        <Text style={styles.price}>Từ {room.expectedPrice?.toLocaleString('vi-VN') || '---'}đ/tháng</Text>
                        {room.deposit && <Text style={styles.deposit}>Đặt cọc: {room.deposit.toLocaleString('vi-VN')}đ</Text>}
                    </View>

                    <View style={styles.infoRow}>
                        <Icon name="map-marker" size={18} color="#6C5CE7" />
                        <Text style={styles.address}>
                            {[room.address, room.street, room.ward, room.district, room.province].filter(Boolean).join(', ') || 'Địa chỉ không xác định'}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Icon name="square-outline" size={18} color="#6C5CE7" />
                        <Text style={styles.area}>{room.area || '--'}m²</Text>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Mô tả chi tiết</Text>
                    <Text style={styles.description}>{room.description || 'Không có mô tả chi tiết.'}</Text>

                    <View style={styles.divider} />

                    {/* ĐỐI TƯỢNG  */}

                    {room.target?.length > 0 && (
                        <View>
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
                        </View>
                    )}

                    {room.amenities?.length > 0 && (
                        <View>
                            <Text style={styles.sectionTitle}>Tiện ích</Text>
                            <View style={styles.utilitiesContainer}>
                                {room.amenities.map((amenities, index) => (
                                    <View key={index} style={styles.utilityItem}>
                                        <Icon name={amenities.icon} size={20} color="#6C5CE7" />
                                        <Text style={styles.utilityText}>{amenities.amenityName}</Text>
                                    </View>
                                ))}
                            </View>
                            <View style={styles.divider} />
                        </View>
                    )}

                    {room.environment?.length > 0 && (
                        <View>
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
                        </View>
                    )}

                    <Text style={styles.sectionTitle}>Thông tin chủ trọ</Text>
                    <View style={styles.ownerContainer}>
                        <Image
                            source={{ uri: room.landlord?.avatar || 'https://i.imgur.com/JZw1g0a.jpg' }}
                            style={styles.ownerAvatar}
                        />
                        <View style={styles.ownerInfo}>
                            <Text style={styles.ownerName}>{room.contactName || `${room.landlord?.firstname || 'Chủ'} ${room.landlord?.lastname || ''}`}</Text>
                            <Text style={styles.ownerPhone}>{room.contactPhone || room.landlord?.phone || 'Không có số điện thoại'}</Text>
                        </View>
                        <TouchableOpacity style={styles.callButton} onPress={handleCallOwner}>
                            <Icon name="phone" size={20} color="#FFF" />
                            <Text style={styles.callButtonText}>Gọi ngay</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    {room.latitude && room.longitude && (
                        <View>
                            <Text style={styles.sectionTitle}>Vị trí</Text>
                            <View style={styles.mapContainer}>
                                <MapView
                                    style={styles.map}
                                    initialRegion={{
                                        latitude: room.latitude,
                                        longitude: room.longitude,
                                        latitudeDelta: 0.005,
                                        longitudeDelta: 0.005,
                                    }}
                                    scrollEnabled={false}
                                >
                                    <Marker coordinate={{ latitude: room.latitude, longitude: room.longitude }}>
                                        <View style={styles.marker}>
                                            <Icon name="home" size={24} color="#6C5CE7" />
                                        </View>
                                    </Marker>
                                </MapView>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            <View style={styles.bottomContainer}>
                <TouchableOpacity style={styles.contactButton} onPress={handleCallOwner}>
                    <Icon name="phone" size={20} color="#FFF" />
                    <Text style={styles.contactButtonText}>Liên hệ chủ trọ</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
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
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    utilityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 10,
        marginBottom: 10,
    },
    utilityText: {
        fontSize: 13,
        color: '#2D3436',
        marginLeft: 5,
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
    },
    callButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    mapContainer: {
        height: 200,
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 10,
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
});

export default BoardingDetailScreen;
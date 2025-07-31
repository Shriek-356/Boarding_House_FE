import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LocationFilterModal from '../modals/LocationFilterModal'; // Assuming you have a modal for location selection
import PriceFilterModal from '../modals/PriceFilterModal'; // Assuming you have a modal for price selection
import AreaFilterModal from '../modals/AreaFilterModal'; // Assuming you have a modal
const SearchFilterBarComponent = ({ onSearch }) => {
    const [locationVisible, setLocationVisible] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [priceVisible, setPriceVisible] = useState(false);
    const [selectedPrice, setSelectedPrice] = useState(null);
    const [areaVisible, setAreaVisible] = useState(false);
    const [selectedArea, setSelectedArea] = useState(null);

    // Xử lý khi chọn địa điểm
    const handleLocationSelect = (province, district) => {
        setSelectedLocation({ province, district });
        setLocationVisible(false);
    };

    const handlePriceSelect = (minPrice, maxPrice,label) => {
        setSelectedPrice({ min: minPrice, max: maxPrice,label: label });
        setPriceVisible(false);
    };

    const handleAreaSelect = (area) => {
        setSelectedArea(area);
        setAreaVisible(false);
    };

    // Xử lý tìm kiếm
    const handleSearch = () => {
        if (onSearch) {
            onSearch({
                location: selectedLocation,
                price: selectedPrice,
                area: selectedArea,
                // Có thể thêm các tham số khác (giá, diện tích) ở đây
            });
        }
    };

    return (
        <View style={styles.searchBarContainer}>
            <View style={styles.filterItemsWrapper}>
                {/* Nút chọn địa điểm */}
                <TouchableOpacity
                    style={styles.filterItem}
                    onPress={() => setLocationVisible(true)}
                >
                    <Icon name="map-marker-outline" size={20} color="#007AFF" />
                    <View style={styles.filterTextContainer}>
                        <Text style={styles.filterLabel}>
                            {selectedLocation ?
                                `${selectedLocation.province}, ${selectedLocation.district}` :
                                'Địa điểm'}
                        </Text>
                        <Icon name="chevron-down" size={20} color="#666" />
                    </View>
                </TouchableOpacity>

                {/* Nút chọn mức giá */}
                <TouchableOpacity
                    style={styles.filterItem}
                    onPress={() => setPriceVisible(true)}
                >
                    <Icon name="currency-usd" size={20} color="#007AFF" />
                    <View style={styles.filterTextContainer}>
                        <Text style={styles.filterLabel}>
                            {selectedPrice ? selectedPrice.label : 'Mức giá'}
                        </Text>
                        <Icon name="chevron-down" size={20} color="#666" />
                    </View>
                </TouchableOpacity>

                {/* Nút chọn diện tích */}
                <TouchableOpacity
                    style={[styles.filterItem, styles.lastFilterItem]}
                    onPress={() => setAreaVisible(true)}
                >
                    <Icon name="ruler-square" size={20} color="#007AFF" />
                    <View style={styles.filterTextContainer}>
                        <Text style={styles.filterLabel}>
                            {selectedArea ? selectedArea.label : 'Diện tích'}
                        </Text>
                        <Icon name="chevron-down" size={20} color="#666" />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Nút tìm kiếm */}
            <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearch}
                disabled={!selectedLocation}
            >
                <Icon name="magnify" size={24} color="#fff" />
                <Text style={styles.searchButtonText}>Tìm kiếm</Text>
            </TouchableOpacity>

            {/* Modal chọn địa điểm */}
            <LocationFilterModal
                visible={locationVisible}
                onClose={() => setLocationVisible(false)}
                onSelect={handleLocationSelect}
            />
            {/* Modal chọn giá */}
            <PriceFilterModal
                visible={priceVisible}
                onClose={() => setPriceVisible(false)}
                onSelect={handlePriceSelect}
            />
            {/* Modal chọn diện tích */}
            <AreaFilterModal
                visible={areaVisible}
                onClose={() => setAreaVisible(false)}
                onSelect={handleAreaSelect}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    searchBarContainer: {
        backgroundColor: '#F8F8F8', // Lighter background for the entire bar area
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderRadius: 12, // Overall rounded corners for the search bar section
        marginHorizontal: 15, // Add horizontal margin to lift it off the edges
        marginTop: 20, // Space from top content
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 8, // For Android shadow
    },
    filterItemsWrapper: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 10, // Space between filter row and search button
        borderWidth: 1, // Subtle border for the entire filter row
        borderColor: '#E0E0E0',
    },
    filterItem: {
        flex: 1, // Distribute space equally
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14, // Increased vertical padding
        paddingHorizontal: 12, // Increased horizontal padding
        borderRightWidth: 1, // Separator line
        borderColor: '#E0E0E0',
    },
    // Remove border from the last filter item
    filterItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRightWidth: 1,
        borderColor: '#E0E0E0',
    },
    filterItem: {
        // ... (previous filterItem styles)
        // Add specific style for the last item to remove right border
        // This requires a bit more logic, or apply it conditionally if using FlatList.
        // For a fixed 3 items, you can define a specific style for the last one if needed.
        // filterItem: { ...baseFilterItemStyles, borderRightWidth: 0 } for the last one
    },
    filterItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRightWidth: 1,
        borderColor: '#E0E0E0',
    },
    // To specifically remove the border from the last item:
    // You would typically render this using .map() and apply a conditional style.
    // For example:
    // {['Địa điểm', 'Mức giá', 'Diện tích'].map((item, index, array) => (
    //   <TouchableOpacity
    //     key={item}
    //     style={[
    //       styles.filterItem,
    //       index === array.length - 1 && styles.noBorderRight // Apply noBorderRight to the last item
    //     ]}
    //     onPress={() => { /* handle modal open */ }}
    //   >
    //     <Icon name={/* icon name */} size={20} color="#007AFF" />
    //     <View style={styles.filterTextContainer}>
    //       <Text style={styles.filterLabel}>{item}</Text>
    //       <Icon name="chevron-down" size={20} color="#666" />
    //     </View>
    //   </TouchableOpacity>
    // ))}

    // Add this style if you use the conditional rendering above
    noBorderRight: {
        borderRightWidth: 0,
    },

    filterTextContainer: {
        flex: 1, // Allows text and arrow to justify content within this container
        flexDirection: 'row',
        justifyContent: 'space-between', // Pushes text to left, arrow to right
        alignItems: 'center',
        marginLeft: 8, // Space between icon and text container
    },
    filterLabel: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    searchButton: {
        backgroundColor: '#FF5722', // Vibrant orange
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15, // Good vertical padding for tap target
        borderRadius: 8, // Rounded corners for the button
        shadowColor: '#FF5722', // Subtle shadow matching button color
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    searchButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18, // Larger font for prominence
        marginLeft: 10,
    }, lastFilterItem: {
        borderRightWidth: 0,
    },
});

export default SearchFilterBarComponent;
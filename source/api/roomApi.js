import { axiosInstance } from "./axiosClient";
import { axiosDAuthApiInstance } from "./axiosClient";
const endpoints = {
    getRoomsOfBoardingZone: (id) => `/get-all-room-boarding/${id}`,
    updateRoom:'/update-room',
    deleteRoomAmenity: (id) => `/delete-room-amenity/${id}`,
    createRoomAmenity: '/create-room-amenity'
}

export const getRoomsOfBoardingZone = async (id, page) => {
    try {
        const response = await axiosInstance.get(endpoints.getRoomsOfBoardingZone(id), {
            params: { page }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching rooms of boarding zone:", error);
        throw error;
    }
};

export const updateRoomFormData = async (formData, token) => {
    try {
        console.log(formData)
        const response = await axiosDAuthApiInstance(token).patch(endpoints.updateRoom, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating room form data:", error);
        throw error;
    }
};

export const deleteRoomAmenity = async (roomAmenityId, token) => {
    try {
        const response = await axiosDAuthApiInstance(token).delete(endpoints.deleteRoomAmenity(roomAmenityId));
        return response.data;
    } catch (error) {
        console.error("Error deleting room amenity:", error);
        throw error;
    }
};

export const    createRoomAmenity = async (roomId, amenityName, token) => {
    try {
        const response = await axiosDAuthApiInstance(token).post(endpoints.createRoomAmenity, {
            roomId,
            amenityName
        });
        return response.data;
    } catch (error) {
        console.error("Error creating room amenity:", error);
        throw error;
    }
};

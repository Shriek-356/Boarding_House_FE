import { axiosInstance } from "./axiosClient";

const endpoints = {
    getRoomsOfBoardingZone: (id) => `/get-all-room-boarding/${id}`,
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

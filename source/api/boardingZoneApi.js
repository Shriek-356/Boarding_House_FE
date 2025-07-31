import { axiosInstance } from "./axiosClient";

export const endpoints = {
    searchBoardingZones: "/search-zones",
}

export const searchBoardingZones = async (filters) => {
    try {
        const response = await axiosInstance.get(endpoints.searchBoardingZones, { params: filters });
        return response.data;
    } catch (error) {
        console.error("Error searching boarding zones:", error);
        throw error;
    }
};
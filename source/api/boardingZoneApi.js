import { axiosInstance } from "./axiosClient";

export const endpoints = {
    searchBoardingZones: "/search-zones",
    getBoardingZoneById: (id) => `/get-boarding-zone/${id}`,
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

export const getBoardingZoneById = async (id) => {
    try {
        const response = await axiosInstance.get(endpoints.getBoardingZoneById(id));
        return response.data;
    } catch (error) {
        console.error("Error fetching boarding zone by ID:", error);
        throw error;
    }
}
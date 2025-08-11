import { axiosInstance} from "./axiosClient";
import { axiosDAuthApiInstance } from "./axiosClient";
export const endpoints = {
    searchBoardingZones: "/search-zones",
    getBoardingZoneById: (id) => `/get-boarding-zone/${id}`,
    getBoardingZoneAmenities: (id) => `/get-boarding-zone-amenity/${id}`,
    getBoardingZoneEnvironment: (id) => `/get-boarding-zone-environment/${id}`,
    getBoardingZoneTarget: (id) => `/get-boarding-zone-target/${id}`,
    getAllBoardingZonesByLandlord: "/get-all-boarding-zone",
    addBoardingZone: "/add-boarding-zone",
    addBoardingZoneAmenity: "/add-boarding-zone-amenity",
    addBoardingZoneEnvironment: "/add-boarding-zone-environment",
    addBoardingZoneTarget: "/add-boarding-zone-target",
}

export const searchBoardingZones = async (filters) => {
    try {
        const response = await axiosInstance.get(endpoints.searchBoardingZones, { params: filters });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getBoardingZoneById = async (id) => {
    try {
        const response = await axiosInstance.get(endpoints.getBoardingZoneById(id));
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getBoardingZoneAmenities = async (id) => {
    try {
        const response = await axiosInstance.get(endpoints.getBoardingZoneAmenities(id));
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getBoardingZoneEnvironment = async (id) => {
    try {
        const response = await axiosInstance.get(endpoints.getBoardingZoneEnvironment(id));
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getBoardingZoneTarget = async (id) => {
    try {
        const response = await axiosInstance.get(endpoints.getBoardingZoneTarget(id));
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getAllBoardingZonesByLandlord = async (landLordId,page) => {
    try {
        const response = await axiosInstance.get(endpoints.getAllBoardingZonesByLandlord, { params: { landLordId, page } });     
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const addBoardingZoneFormData = async (formData, token) => {
    try {
        const response = await axiosDAuthApiInstance(token).post(endpoints.addBoardingZone, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const addBoardingZoneAmenity = async (data, token) => {
    try {
        const response = await axiosDAuthApiInstance(token).post(endpoints.addBoardingZoneAmenity, data);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const addBoardingZoneEnvironment = async (data, token) => {
    try {
        const response = await axiosDAuthApiInstance(token).post(endpoints.addBoardingZoneEnvironment, data);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const addBoardingZoneTarget = async (data, token) => {
    try {
        const response = await axiosDAuthApiInstance(token).post(endpoints.addBoardingZoneTarget, data);
        return response.data;
    } catch (error) {
        throw error;
    }
}

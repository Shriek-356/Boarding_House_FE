import { axiosDAuthApiInstance, axiosInstance } from "./axiosClient";

const endpoints = {
    getBoardingZoneComments: () => "/get-zone-comment",
    addZoneComment: () => "/add-zone-comment",
    
}

export const getBoardingZoneComments = async (token, boardingZoneId) => {
    try {
        const response = await axiosDAuthApiInstance(token).get(endpoints.getBoardingZoneComments({ params: { boardingZoneId } }));
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const addZoneComment = async (token, commentData) => {
    try {
        const response = await axiosDAuthApiInstance(token).post(endpoints.addZoneComment(), commentData);
        return response.data;
    } catch (error) {
        throw error;
    }
}


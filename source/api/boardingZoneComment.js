import { axiosDAuthApiInstance, axiosInstance } from "./axiosClient";

const endpoints = {
    getBoardingZoneComments: (id) => `/get-zone-comment/${id}`,
    addZoneComment: () => "/add-zone-comment",
    addZoneCommentResponse: () => "/add-zone-comment-response",
}

export const getBoardingZoneComments = async (boardingZoneId) => {
    try {
        const res = await axiosInstance.get(endpoints.getBoardingZoneComments(boardingZoneId));
        return res.data;
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

export const addZoneCommentResponse = async (token, responseData) => {
    try {
        const response = await axiosDAuthApiInstance(token).post(endpoints.addZoneCommentResponse(), responseData);
        return response.data;
    } catch (error) {
        throw error;
    }
}

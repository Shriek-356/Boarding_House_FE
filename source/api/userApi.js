import { axiosDAuthApiInstance, axiosInstance } from "./axiosClient";

const endpoint = {
    getUser:'/user',
    registerUser:'/register'
}

export const getUserProfile = async (Token) => {
    try {
        const response = await axiosDAuthApiInstance(Token).get(endpoint.getUser);
        return response.data;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
};

export const registerUser = async (userData) => {
    try {
        const response = await axiosInstance.post(endpoint.registerUser, userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

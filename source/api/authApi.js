import { axiosInstance } from "./axiosClient";

const endpoints = {
    login: "/login",
};

export const loginApi = async (data) => {
    try {
        const response = await axiosInstance.post(endpoints.login, data)
        return response.data;
    } catch (error) {
        console.error("Error logging in:", error);
        throw error;
    }
};
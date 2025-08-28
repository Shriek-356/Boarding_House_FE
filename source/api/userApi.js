import { axiosDAuthApiInstance, axiosInstance } from "./axiosClient";

const endpoint = {
    getUser: '/user',
    registerUser: '/register',
    searchUser:'/search-user'
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
        const response = await axiosInstance.post(endpoint.registerUser, userData, {
            headers: {
                "Content-Type": "multipart/form-data"
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};


export const searchUser = async (kw,page) => {
    try {
        const response = await axiosInstance.get(endpoint.searchUser, {
            params: { kw: kw, page: page }
        });
        return response.data;
    } catch (error) {
        console.error("Error searching user:", error);
        throw error;
    }
};

import { axiosDAuthApiInstance } from "./axiosClient";

const endpoint = {
    getUser:'/user',
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


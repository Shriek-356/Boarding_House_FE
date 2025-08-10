import { axiosDAuthApiInstance } from './axiosClient';

const endpoints = {
    addLandlordRequest: '/add-landlord-request',
};

export const addLandlordRequest = async (formData, token) => {
    try {
        const response = await axiosDAuthApiInstance(token).post(
            endpoints.addLandlordRequest,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data", // ⚠️ Bắt buộc
                    "Authorization": `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error adding landlord request:", error);
        throw error;
    }
};

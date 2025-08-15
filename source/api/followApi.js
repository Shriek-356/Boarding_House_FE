import { axiosInstance,axiosDAuthApiInstance } from './axiosClient';
import { getToken } from './axiosClient';

export const getFollowStatus = async (landlordId) => {
    try {
        const token = await getToken();
        const res = await axiosDAuthApiInstance(token).get(`/follows/status/${landlordId}`);
        return res.data; // { following: boolean, followers: number }
    } catch (error) {
        throw error;
    }
};

export const followLandlord = async (landlordId) => {
    try {
        const token = await getToken();
        const res = await axiosDAuthApiInstance(token).post(`/follows/${landlordId}`, null);
        return res.data; // { following: true, followers: number }
    } catch (error) {
        throw error;
    }
};

export const unfollowLandlord = async (landlordId) => {
    try {
        const token = await getToken();
        const res = await axiosDAuthApiInstance(token).delete(`/follows/${landlordId}`);
        return res.data; // { following: false, followers: number }
    } catch (error) {
        throw error;
    }
};

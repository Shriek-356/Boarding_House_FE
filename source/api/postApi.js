import { axiosInstance } from "./axiosClient";
import { axiosDAuthApiInstance } from "./axiosClient";

const endpoints = {
    getAllPosts:'/get-all-posts',
    createPost:'/create-post'
}

export const getAllPosts = async (page) => {
    try {
        const response = await axiosInstance.get(endpoints.getAllPosts,{params:{page}});
        return response.data;
    } catch (error) {
        console.error("Error fetching posts:", error);
        throw error;
    }
}

export const createPost=async (data, token) => {
    try {
        const response = await axiosDAuthApiInstance(token).post(endpoints.createPost, data);
        return response.data;
    } catch (error) {
        throw error;
    }
}
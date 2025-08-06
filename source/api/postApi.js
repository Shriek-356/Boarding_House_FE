import { axiosInstance } from "./axiosClient";

const endpoints = {
    getAllPosts:'/get-all-posts',
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
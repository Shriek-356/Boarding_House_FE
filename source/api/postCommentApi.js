import { axiosInstance } from "./axiosClient";

const endpoints = {
    getPostComments: '/get-post-comments',
    addPostComment: '/add-post-comment',
}

export const getPostComments = async (postId) => {
    try {
        const response = await axiosInstance.get(endpoints.getPostComments, { params: { postId } });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const addPostComment = async (data) => {
    try {
        const response = await axiosInstance.post(endpoints.addPostComment, data);
        return response.data;
    } catch (error) {
        throw error;
    }
}
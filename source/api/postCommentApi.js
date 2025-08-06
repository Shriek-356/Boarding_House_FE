import { axiosInstance } from "./axiosClient";
import { axiosDAuthApiInstance } from "./axiosClient";

const endpoints = {
    getPostComments: '/get-post-comments',
    addPostComment: '/add-post-comment',
    addPostCommentResponse: '/add-post-comment-response',
}

export const getPostComments = async (postId) => {
    try {
        const response = await axiosInstance.get(endpoints.getPostComments, { params: { postId } });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const addPostComment = async (data, token) => {
    try {
        const response = await axiosDAuthApiInstance(token).post(endpoints.addPostComment,data);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const addPostCommentResponse = async (data, token) => {
    try {
        const response = await axiosDAuthApiInstance(token).post(endpoints.addPostCommentResponse,data);
        return response.data;
    } catch (error) {
        throw error;
    }
}
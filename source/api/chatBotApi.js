import { axiosChatBotInstance } from "./axiosClient";

const endpoints = {
    chat: '/chat'
};

export const sendChatMessage = async (message) => {
    try {
        const response = await axiosChatBotInstance.post(endpoints.chat, {
            message
        });
        return response.data;
    } catch (error) {
        console.error('Error sending chat message:', error);
            throw error;
        }
};
import React, { createContext, useState } from 'react';
import { removeToken, saveToken } from '../api/axiosClient';
import { registerForPush, unregisterPush } from '../push/expoPush';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    let pushSession = null;

    const logout = async () => {
        await removeToken();
        setUser(null);
        await unregisterPush(pushSession?.fcmToken);
        pushSession?.detach?.();
        pushSession = null;
    }

    const login = async (tokens, userData) => {
        await saveToken(tokens);
        setUser(userData);
        pushSession = await registerForPush();
    }

    return (
        <AuthContext.Provider value={{ user, setUser, logout, login }}>
            {children}
        </AuthContext.Provider>
    );
};
import React, { createContext, useState } from 'react';
import { removeToken,saveToken } from '../api/axiosClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const logout = async () => {
        await removeToken();
        setUser(null);
    }

    const login = async (tokens, userData) => {
        await saveToken(tokens);
        setUser(userData);
    }

    return (
        <AuthContext.Provider value={{ user, setUser, logout, login }}>
            {children}
        </AuthContext.Provider>
    );
};
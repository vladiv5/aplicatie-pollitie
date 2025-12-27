// src/context/AuthContext.js
import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

// 1. Creăm Contextul
const AuthContext = createContext();

// 2. Creăm Componenta "Provider" (cea care va ține logica)
export const AuthProvider = ({ children }) => {
    // Aici ținem minte cine e logat (inițial, nimeni)
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user_data');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = (nume, parola) => {
        return new Promise((resolve, reject) => {
            axios.post('http://localhost:8080/api/auth/login', { nume, parola })
                .then(response => {
                    setUser(response.data);
                    localStorage.setItem('user_data', JSON.stringify(response.data));
                    resolve(response.data);
                })
                .catch(error => {
                    reject(error);
                });
        });
    };

    // Funcția de Logout
    const logout = () => {
        setUser(null);
        localStorage.removeItem('user_data');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
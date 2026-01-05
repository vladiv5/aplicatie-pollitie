import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

// 1. Creăm Contextul
const AuthContext = createContext();

// 2. Creăm Componenta "Provider" (cea care va ține logica)
export const AuthProvider = ({ children }) => {
    // Aici țin minte cine e logat (inițial, nimeni)
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

    // --- AM ADAUGAT FUNCTIA DE REGISTER (ACTIVARE CONT) ---
    const register = (registerData) => {
        // Aici trimit datele personale + user/parola noi catre backend
        return new Promise((resolve, reject) => {
            axios.post('http://localhost:8080/api/auth/register', registerData)
                .then(response => {
                    // Doar returnez succesul, nu loghez automat utilizatorul inca
                    resolve(response.data);
                })
                .catch(error => {
                    // Dacă primesc eroare de la server, o trimit mai departe
                    reject(error);
                });
        });
    };

    // Funcția de Logout
    const logout = () => {
        setUser(null);
        localStorage.removeItem('user_data');
    };

    // Am adaugat 'register' in lista de valori exportate
    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
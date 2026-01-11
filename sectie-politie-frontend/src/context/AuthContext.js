/** Contextul global de autentificare
 * Gestioneaza starea utilizatorului logat si metodele de Login/Register/Logout
 * @author Ivan Vlad-Daniel
 * @version 11 ianuarie 2026
 */
import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

// 1. Creez Contextul gol
const AuthContext = createContext();

// 2. Componenta Provider care invaluie aplicatia
export const AuthProvider = ({ children }) => {
    // Verific in LocalStorage daca utilizatorul este deja logat cand se incarca pagina
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user_data');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // Functia de Login: Trimite credentialele si salveaza raspunsul
    const login = (nume, parola) => {
        return new Promise((resolve, reject) => {
            axios.post('http://localhost:8080/api/auth/login', { nume, parola })
                .then(response => {
                    // Daca e succes, salvez user-ul in memorie si in browser (persistenta)
                    setUser(response.data);
                    localStorage.setItem('user_data', JSON.stringify(response.data));
                    resolve(response.data);
                })
                .catch(error => {
                    reject(error);
                });
        });
    };

    // Functia de Activare Cont (Register)
    const register = (registerData) => {
        return new Promise((resolve, reject) => {
            axios.post('http://localhost:8080/api/auth/register', registerData)
                .then(response => {
                    // Doar confirm succesul, nu loghez automat utilizatorul (il trimit la Login)
                    resolve(response.data);
                })
                .catch(error => {
                    reject(error);
                });
        });
    };

    // Functia de Deconectare
    const logout = () => {
        setUser(null);
        localStorage.removeItem('user_data');
    };

    // Expun valorile si functiile catre restul aplicatiei
    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personalizat pentru a accesa usor contextul
export const useAuth = () => {
    return useContext(AuthContext);
};
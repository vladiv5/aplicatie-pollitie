// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [nume, setNume] = useState('');
    const [parola, setParola] = useState(''); // <-- 1. Am schimbat aici
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        login(nume, parola)
            .then(() => {
                navigate('/politisti');
            })
            .catch(() => {
                setError('Nume sau Parolă incorectă!');
            });
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Pagină de Autentificare</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Nume (ex: Popescu)"
                    value={nume}
                    onChange={(e) => setNume(e.target.value)}
                    style={{ marginRight: '10px' }}
                />
                {/* 3. Am schimbat câmpul de parolă */}
                <input
                    type="password"
                    placeholder="Parolă (politist123)"
                    value={parola}
                    onChange={(e) => setParola(e.target.value)}
                    style={{ marginRight: '10px' }}
                />
                <button type="submit">Login</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default LoginPage;
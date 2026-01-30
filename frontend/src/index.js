import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import App from './App';
import { AuthProvider } from './context/AuthContext'; // 1. Importă

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        {/* 2. Îmbracă App-ul */}
        <AuthProvider>
            <App />
        </AuthProvider>
    </React.StrictMode>
);
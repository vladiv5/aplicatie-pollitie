import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/TableStyles.css';

const LiveSearchInput = ({ label, placeholder, apiUrl, onSelect, displayKey }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Funcția care caută în backend când scrii
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length > 0 && showSuggestions) {
                // Token-ul pentru securitate
                const token = localStorage.getItem('token');

                axios.get(`${apiUrl}?termen=${query}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                    .then(res => {
                        setSuggestions(res.data);
                    })
                    .catch(err => console.error("Eroare search:", err));
            } else {
                setSuggestions([]);
            }
        }, 300); // Așteaptă 300ms după ce te oprești din scris (Debounce)

        return () => clearTimeout(timer);
    }, [query, apiUrl, showSuggestions]);

    const handleSelect = (item) => {
        // Când selectezi, punem textul în input și trimitem obiectul complet la părinte

        // Construim textul de afișat (poate fi o funcție sau un string)
        let text = "";
        if (typeof displayKey === 'function') {
            text = displayKey(item);
        } else {
            text = item[displayKey]; // Ex: item['nume']
        }

        setQuery(text);
        setSuggestions([]);
        setShowSuggestions(false);
        onSelect(item); // Trimitem obiectul selectat către formularul părinte
    };

    return (
        <div className="form-group">
            {/* Label-ul (opțional) */}
            {label && <label style={{ marginBottom: '5px', fontWeight: 'bold' }}>{label}</label>}

            <div className="live-search-container">
                <input
                    type="text"
                    className="modal-input"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowSuggestions(true);
                        // Dacă șterge tot, resetăm selecția
                        if (e.target.value === '') onSelect(null);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    style={{ width: '100%' }} // Să ocupe tot spațiul
                />

                {/* Lista de sugestii */}
                {showSuggestions && suggestions.length > 0 && (
                    <ul className="suggestions-list">
                        {suggestions.map((item, index) => (
                            <li
                                key={index}
                                className="suggestion-item"
                                onClick={() => handleSelect(item)}
                            >
                                {/* Afișăm dinamic în funcție de props */}
                                {typeof displayKey === 'function' ? displayKey(item) : item[displayKey]}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default LiveSearchInput;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/TableStyles.css';

// Am adaugat prop-ul "defaultValue"
const LiveSearchInput = ({ label, placeholder, apiUrl, onSelect, displayKey, defaultValue }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Daca primim o valoare initiala (la Editare), o punem in input
    useEffect(() => {
        if (defaultValue) {
            setQuery(defaultValue);
        }
    }, [defaultValue]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length > 0 && showSuggestions) {
                const token = localStorage.getItem('token');
                axios.get(`${apiUrl}?termen=${query}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                    .then(res => setSuggestions(res.data))
                    .catch(err => console.error("Eroare search:", err));
            } else {
                setSuggestions([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, apiUrl, showSuggestions]);

    const handleSelect = (item) => {
        let text = "";
        if (typeof displayKey === 'function') {
            text = displayKey(item);
        } else {
            text = item[displayKey];
        }

        setQuery(text);
        setSuggestions([]);
        setShowSuggestions(false);
        onSelect(item);
    };

    return (
        <div className="form-group">
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
                        if (e.target.value === '') onSelect(null);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    style={{ width: '100%' }}
                />

                {showSuggestions && suggestions.length > 0 && (
                    <ul className="suggestions-list">
                        {suggestions.map((item, index) => (
                            <li
                                key={index}
                                className="suggestion-item"
                                onClick={() => handleSelect(item)}
                            >
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
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/TableStyles.css';

const LiveSearchInput = ({ label, placeholder, apiUrl, onSelect, displayKey, defaultValue }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Inițializare valoare (la Editare)
    useEffect(() => {
        if (defaultValue) {
            setQuery(defaultValue);
        }
    }, [defaultValue]);

    // Logică căutare (Debounce)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length > 0 && showSuggestions) {
                const token = localStorage.getItem('token');
                // Evităm request-ul dacă query-ul este exact valoarea inițială (pentru a nu deschide lista inutil la load)
                if (query !== defaultValue) {
                    axios.get(`${apiUrl}?termen=${query}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                        .then(res => setSuggestions(res.data))
                        .catch(err => console.error("Eroare search:", err));
                }
            } else {
                setSuggestions([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, apiUrl, showSuggestions, defaultValue]);

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

    // --- FUNCȚIE NOUĂ: CLEAR (X) ---
    const handleClear = () => {
        setQuery('');           // 1. Ștergem textul vizual
        setSuggestions([]);     // 2. Ștergem sugestiile
        setShowSuggestions(false);
        onSelect(null);         // 3. IMPORTANT: Anunțăm părintele că nu mai e nimic selectat (id = null)
    };

    return (
        <div className="form-group">
            {label && <label style={{ marginBottom: '5px', fontWeight: 'bold' }}>{label}</label>}

            {/* Containerul trebuie să fie relative pentru a poziționa X-ul */}
            <div className="live-search-container" style={{ position: 'relative' }}>
                <input
                    type="text"
                    className="modal-input"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowSuggestions(true);
                        // Dacă utilizatorul șterge manual tot textul, resetăm ID-ul
                        if (e.target.value === '') onSelect(null);
                    }}
                    onFocus={() => {
                        // Afișăm sugestii doar dacă avem text și nu e gol
                        if(query) setShowSuggestions(true);
                    }}
                    // Adăugăm padding la dreapta ca textul să nu intre sub X
                    style={{ width: '100%', paddingRight: '30px' }}
                />

                {/* --- BUTONUL X --- */}
                {query && (
                    <span
                        onClick={handleClear}
                        style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            cursor: 'pointer',
                            color: '#999',
                            fontWeight: 'bold',
                            fontSize: '18px',
                            lineHeight: '1',
                            userSelect: 'none',
                            zIndex: 10
                        }}
                        title="Șterge selecția"
                    >
                        &times;
                    </span>
                )}

                {/* Lista de Sugestii */}
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
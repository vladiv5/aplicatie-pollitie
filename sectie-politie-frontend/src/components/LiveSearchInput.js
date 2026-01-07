import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './styles/Forms.css'; // Asigură-te că importă stilurile noi

const LiveSearchInput = ({ label, apiUrl, displayKey, onSelect, defaultValue, icon, error }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef(null);

    // Inițializare valoare (pentru Edit)
    useEffect(() => {
        if (defaultValue) {
            setQuery(defaultValue);
        }
    }, [defaultValue]);

    // Închide lista când dai click în afară
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    // Logică căutare
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (query.length > 0 && showSuggestions) {
                const token = localStorage.getItem('token');
                // Adăugăm query param pentru filtrare în backend
                axios.get(`${apiUrl}?termen=${query}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                    .then(res => setSuggestions(res.data))
                    .catch(err => console.error(err));
            } else {
                setSuggestions([]);
            }
        }, 300); // Debounce
        return () => clearTimeout(timeoutId);
    }, [query, apiUrl, showSuggestions]);

    const handleSelect = (item) => {
        setQuery(displayKey(item)); // Afișează textul frumos în input
        setSuggestions([]);
        setShowSuggestions(false);
        if (onSelect) onSelect(item); // Trimite obiectul complet către părinte
    };

    const handleClear = () => {
        setQuery('');
        setSuggestions([]);
        if (onSelect) onSelect(null); // Trimite null către părinte (câmp opțional)
    };

    return (
        <div className="form-group-item" ref={wrapperRef}>
            <label className="form-label">
                {icon && <i className={`fa-solid ${icon}`} style={{ marginRight: '8px', color: '#d4af37' }}></i>}
                {label}
            </label>

            <div className="input-wrapper">
                <input
                    type="text"
                    className={`modal-input ${error ? 'input-error' : ''}`}
                    placeholder="Caută..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowSuggestions(true);
                        // Dacă utilizatorul șterge tot textul manual, trimitem null
                        if (e.target.value === '') {
                            if (onSelect) onSelect(null);
                        }
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    autoComplete="off"
                />

                {/* BUTON X AURIU - Stil unificat */}
                {query && (
                    <button type="button" className="search-clear-btn-gold" onClick={handleClear}>
                        <i className="fa-solid fa-circle-xmark"></i>
                    </button>
                )}

                {/* Lista Sugestii */}
                {showSuggestions && suggestions.length > 0 && (
                    <ul className="suggestions-list">
                        {suggestions.map((item, index) => (
                            <li key={index} onClick={() => handleSelect(item)} className="suggestion-item">
                                {displayKey(item)}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* MESAJ EROARE - Stil unificat */}
            {error && <span className="error-text">{error}</span>}
        </div>
    );
};

export default LiveSearchInput;
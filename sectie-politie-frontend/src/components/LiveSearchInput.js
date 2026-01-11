/** Componenta reutilizabila pentru cautare dinamica (dropdown cu sugestii)
 * Include debounce pentru performanta si encodeURIComponent pentru siguranta
 * @author Ivan Vlad-Daniel
 * @version 11 ianuarie 2026
 */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './styles/Forms.css';

const LiveSearchInput = ({ label, apiUrl, displayKey, onSelect, defaultValue, icon, error, placeholder }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef(null);

    // Initializare valoare (daca suntem in modul Edit)
    useEffect(() => {
        if (defaultValue) {
            setQuery(defaultValue);
        }
    }, [defaultValue]);

    // Inchid lista de sugestii daca dau click in afara componentei
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    // Logică de căutare cu debounce (astept 300ms dupa ultima tasta)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (query.length > 0 && showSuggestions) {
                const token = localStorage.getItem('token');
                // Codific textul pentru a preveni erori de caractere speciale (ex: /, [, %)
                const safeQuery = encodeURIComponent(query);

                axios.get(`${apiUrl}?termen=${safeQuery}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                    .then(res => setSuggestions(res.data))
                    .catch(err => console.error("Eroare LiveSearch:", err));
            } else {
                setSuggestions([]);
            }
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [query, apiUrl, showSuggestions]);

    const handleSelect = (item) => {
        setQuery(displayKey(item)); // Afisez textul prietenos in input
        setSuggestions([]);
        setShowSuggestions(false);
        if (onSelect) onSelect(item); // Trimit obiectul complet catre parinte
    };

    const handleClear = () => {
        setQuery('');
        setSuggestions([]);
        if (onSelect) onSelect(null); // Resetez selectia
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
                    placeholder={placeholder || "Caută..."}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowSuggestions(true);
                        // Daca sterg tot textul manual, resetez selectia
                        if (e.target.value === '') {
                            if (onSelect) onSelect(null);
                        }
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    autoComplete="off"
                />

                {/* Buton X auriu */}
                {query && (
                    <button type="button" className="search-clear-btn-gold" onClick={handleClear}>
                        <i className="fa-solid fa-circle-xmark"></i>
                    </button>
                )}

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
            {/* Mesaj de eroare din backend (daca exista) */}
            {error && <span className="error-text">{error}</span>}
        </div>
    );
};

export default LiveSearchInput;
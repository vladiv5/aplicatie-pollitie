/**
 * Reusable component for dynamic searching (dropdown with suggestions).
 * I use debounce for performance and encodeURIComponent for security.
 * @author Ivan Vlad-Daniel
 * @version January 11, 2026
 */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './styles/Forms.css';

const LiveSearchInput = ({ label, apiUrl, displayKey, onSelect, defaultValue, icon, error, placeholder }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef(null);

    // I initialize the value (if we are in Edit mode).
    useEffect(() => {
        if (defaultValue) {
            setQuery(defaultValue);
        }
    }, [defaultValue]);

    // I close the suggestions list if I click outside the component.
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    // Search logic with debounce (I wait 300ms after the last keystroke).
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (query.length > 0 && showSuggestions) {
                const token = localStorage.getItem('token');
                // I encode the text to prevent errors with special characters (e.g., /, [, %).
                const safeQuery = encodeURIComponent(query);

                axios.get(`${apiUrl}?termen=${safeQuery}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                    .then(res => setSuggestions(res.data))
                    .catch(err => console.error("Error LiveSearch:", err));
            } else {
                setSuggestions([]);
            }
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [query, apiUrl, showSuggestions]);

    const handleSelect = (item) => {
        setQuery(displayKey(item)); // I display the friendly text in the input.
        setSuggestions([]);
        setShowSuggestions(false);
        if (onSelect) onSelect(item); // I pass the full object to the parent.
    };

    const handleClear = () => {
        setQuery('');
        setSuggestions([]);
        if (onSelect) onSelect(null); // I reset the selection.
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
                    placeholder={placeholder || "Cauta..."}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowSuggestions(true);
                        // If I clear the text manually, I reset the selection.
                        if (e.target.value === '') {
                            if (onSelect) onSelect(null);
                        }
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    autoComplete="off"
                />

                {/* Gold X Button */}
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
            {/* Error message from backend (if any) */}
            {error && <span className="error-text">{error}</span>}
        </div>
    );
};

export default LiveSearchInput;
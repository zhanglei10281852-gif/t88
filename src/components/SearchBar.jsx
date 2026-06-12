import React, { useState, useRef, useEffect } from 'react';
import { BONES } from '../data/bonesData';

export default function SearchBar({ onSelectBone }) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const wrapperRef = useRef(null);
  
  useEffect(() => {
    if (query.trim().length > 0) {
      const filtered = BONES.filter(bone => 
        bone.name.toLowerCase().includes(query.toLowerCase()) ||
        bone.nameEn.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleSelect = (boneId) => {
    onSelectBone(boneId);
    setQuery('');
    setShowSuggestions(false);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleSelect(suggestions[0].id);
    }
  };
  
  return (
    <div className="search-bar-wrapper" ref={wrapperRef}>
      <form className="search-bar" onSubmit={handleSearch}>
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="搜索骨骼名称..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setShowSuggestions(true)}
          className="search-input"
        />
        {query && (
          <button
            type="button"
            className="clear-btn"
            onClick={() => setQuery('')}
          >
            ×
          </button>
        )}
      </form>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map(bone => (
            <div
              key={bone.id}
              className="suggestion-item"
              onClick={() => handleSelect(bone.id)}
            >
              <span className="suggestion-name">{bone.name}</span>
              <span className="suggestion-name-en">{bone.nameEn}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

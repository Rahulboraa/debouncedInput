import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./styles.css";

function Autocomplete() {
  const [inputValue, setInputValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(inputValue), 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  useEffect(() => {
    if (debouncedValue) {
      const fetchSuggestions = async () => {
        try {
          const response = await axios.get(
            "https://www.themealdb.com/api/json/v1/1/search.php",
            {
              params: { s: debouncedValue },
            }
          );
          setSuggestions(response.data.meals || []);
        } catch (error) {
          console.error("Error fetching data:", error);
          setSuggestions([]);
        }
      };
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [debouncedValue]);

  const handleInputChange = useCallback((e) => {
    setInputValue(e.target.value);
    setSelectedIndex(-1);
  }, []);

  const handleSuggestionClick = useCallback((suggestion) => {
    setInputValue(suggestion.strMeal);
    setSuggestions([]);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        handleSuggestionClick(suggestions[selectedIndex]);
      }
    },
    [suggestions, selectedIndex, handleSuggestionClick]
  );

  return (
    <div className="autocomplete-container">
      <h1>Search For Your Next Meal</h1>
      <input
        type="search"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Search for a meal..."
        className="autocomplete-input"
      />
      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.idMeal}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`suggestion-item ${
                index === selectedIndex ? "selected" : ""
              }`}
            >
              {suggestion.strMeal}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Autocomplete;

import React, { useState } from 'react';
import { X } from 'lucide-react';
import PropTypes from 'prop-types';

const TagInput = ({ tags, setTags, suggestions = [], placeholder, maxTags = 10 }) => {
    const [input, setInput] = useState('');
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInput(value);

        if (value.trim()) {
            const filtered = suggestions.filter(
                (suggestion) =>
                    suggestion.toLowerCase().includes(value.toLowerCase()) &&
                    !tags.includes(suggestion)
            );
            setFilteredSuggestions(filtered.slice(0, 10));
        } else {
            setFilteredSuggestions([]);
        }
    };

    const addTag = (tag) => {
        const trimmedTag = tag.trim().toLowerCase();
        if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
            setTags([...tags, trimmedTag]);
            setInput('');
            setFilteredSuggestions([]);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (input.trim()) {
                addTag(input);
            }
        } else if (e.key === 'Backspace' && !input && tags.length > 0) {
            removeTag(tags.length - 1);
        }
    };

    const removeTag = (index) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-3">
            {/* Input */}
            <div className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                {/* Suggestions Dropdown */}
                {filteredSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredSuggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => addTag(suggestion)}
                                className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Selected Tags */}
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => removeTag(index)}
                                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Counter */}
            <p className="text-sm text-gray-500">
                {tags.length} / {maxTags} skills selected
            </p>
        </div>
    );
};

TagInput.propTypes = {
    tags: PropTypes.array.isRequired,
    setTags: PropTypes.func.isRequired,
    suggestions: PropTypes.array,
    placeholder: PropTypes.string,
    maxTags: PropTypes.number,
};

export default TagInput;

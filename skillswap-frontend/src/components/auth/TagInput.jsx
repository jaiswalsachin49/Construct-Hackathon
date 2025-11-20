import React, { useState } from 'react';
import { X } from 'lucide-react';
import PropTypes from 'prop-types';

const TagInput = ({
    tags,
    setTags,
    suggestions = [],
    placeholder,
    maxTags = 10,
    theme = "pink",
}) => {

    const [input, setInput] = useState('');
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);

    // Theme styles
    const styles = {
        pink: {
            chip: "bg-pink-100 text-pink-700 hover:bg-pink-200",
            inputFocus: "focus:ring-pink-400",
            suggestionHover: "hover:bg-pink-50",
        },
        purple: {
            chip: "bg-purple-100 text-purple-700 hover:bg-purple-200",
            inputFocus: "focus:ring-purple-400",
            suggestionHover: "hover:bg-purple-50",
        },
    };

    const current = styles[theme];

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInput(value);

        if (value.trim()) {
            const filtered = suggestions.filter(
                s =>
                    s.toLowerCase().includes(value.toLowerCase()) &&
                    !tags.includes(s.toLowerCase())
            );
            setFilteredSuggestions(filtered.slice(0, 10));
        } else {
            setFilteredSuggestions([]);
        }
    };

    const addTag = (tag) => {
        const trimmed = tag.trim().toLowerCase();
        if (trimmed && !tags.includes(trimmed) && tags.length < maxTags) {
            setTags([...tags, trimmed]);
            setInput('');
            setFilteredSuggestions([]);
        }
    };

    const removeTag = (index) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (input.trim()) addTag(input);
        }
        if (e.key === "Backspace" && !input && tags.length > 0) {
            removeTag(tags.length - 1);
        }
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
                    className={`
                        w-full px-4 py-3 rounded-xl border border-gray-300
                        focus:outline-none focus:ring-2 focus:border-transparent
                        ${current.inputFocus}
                    `}
                />

                {/* Suggestions */}
                {filteredSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white rounded-xl border border-gray-200 shadow-lg max-h-48 overflow-y-auto">
                        {filteredSuggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => addTag(suggestion)}
                                className={`
                                    w-full px-4 py-2 text-left transition
                                    ${current.suggestionHover}
                                `}
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
                            className={`
                                inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-full
                                ${current.chip}
                            `}
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => removeTag(index)}
                                className="rounded-full p-0.5 hover:bg-white/30"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

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
    theme: PropTypes.oneOf(["pink", "purple"]),
};

export default TagInput;
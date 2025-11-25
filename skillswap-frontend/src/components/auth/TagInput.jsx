import React, { useState } from 'react';
import { X } from 'lucide-react';
import PropTypes from 'prop-types';

const TagInput = ({
    tags,
    setTags,
    suggestions = [],
    placeholder,
    maxTags = 10,
    theme = "blue",   // NEW
}) => {
    const [input, setInput] = useState('');
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);

    // THEME STYLES -------------------------
    const themeStyles = {
        blue: {
            tagBg: "bg-[#3B82F6]/15",
            tagBorder: "border-[#3B82F6]/40",
            tagText: "text-[#60A5FA]",
            tagGlow: "shadow-[0_0_10px_rgba(0,196,255,0.25)]",
            hoverBg: "hover:bg-[#3B82F6]/20",
            inputRing: "focus:ring-[#60A5FA]",
            suggestionHover: "hover:bg-[#3B82F6]/20",
        },
        purple: {
            tagBg: "bg-[#2563EB]/15",
            tagBorder: "border-[#2563EB]/40",
            tagText: "text-[#C8A4FF]",
            tagGlow: "shadow-[0_0_10px_rgba(122,62,249,0.25)]",
            hoverBg: "hover:bg-[#2563EB]/20",
            inputRing: "focus:ring-[#2563EB]",
            suggestionHover: "hover:bg-[#2563EB]/20",
        },
    };

    const T = themeStyles[theme];

    // --------------------------------------

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInput(value);

        if (value.trim()) {
            const filtered = suggestions.filter(
                (suggestion) =>
                    suggestion.toLowerCase().includes(value.toLowerCase()) &&
                    !tags.includes(suggestion.toLowerCase())
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

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (input.trim()) addTag(input);
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
                    className={`
                        w-full px-4 py-2.5 rounded-lg 
                        bg-white/5 border border-white/20 
                        text-[#E6E9EF] placeholder-gray-400
                        focus:outline-none
                        ${T.inputRing}
                    `}
                />

                {/* Suggestions Dropdown */}
                {filteredSuggestions.length > 0 && (
                    <div className="
                        absolute z-20 w-full mt-1 
                        bg-[#0A0F1F]/90 backdrop-blur-xl 
                        border border-white/10 
                        rounded-lg shadow-xl
                        max-h-48 overflow-y-auto
                    ">
                        {filteredSuggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => addTag(suggestion)}
                                className={`
                                    w-full px-4 py-2 text-left
                                    text-[#E6E9EF]
                                    transition
                                    ${T.suggestionHover}
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
                                inline-flex items-center gap-2
                                px-3 py-1.5 rounded-full 
                                text-sm font-medium
                                ${T.tagBg} 
                                ${T.tagBorder}
                                ${T.tagText}
                                ${T.tagGlow}
                            `}
                        >
                            {tag}

                            <button
                                type="button"
                                onClick={() => removeTag(index)}
                                className={`
                                    rounded-full p-0.5 transition
                                    ${T.hoverBg}
                                `}
                            >
                                <X className={`h-3 w-3 ${T.tagText}`} />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Counter */}
            <p className="text-sm text-[#8A90A2]">
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
    theme: PropTypes.string,
};

export default TagInput;
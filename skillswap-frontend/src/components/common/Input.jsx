import React from 'react';
import PropTypes from 'prop-types';

const Input = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    error,
    icon: Icon,
    iconPosition = 'left',
    disabled = false,
    required = false,
    className = '',
    ...props
}) => {
    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label htmlFor={name} className="block text-sm font-medium text-[#E6E9EF] mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                {Icon && iconPosition === 'left' && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon className="h-5 w-5 text-[#8A90A2]" />
                    </div>
                )}
                <input
                    type={type}
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    className={`
            block w-full rounded-lg border bg-[#101726]
            ${Icon && iconPosition === 'left' ? 'pl-10' : 'pl-3'}
            ${Icon && iconPosition === 'right' ? 'pr-10' : 'pr-3'}
            py-2 text-white placeholder-[#8A90A2]
            focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent
            disabled:bg-white/5 disabled:cursor-not-allowed
            ${error ? 'border-red-500' : 'border-white/10'}
          `}
                    {...props}
                />
                {Icon && iconPosition === 'right' && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Icon className="h-5 w-5 text-[#8A90A2]" />
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};

Input.propTypes = {
    label: PropTypes.string,
    type: PropTypes.string,
    name: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    error: PropTypes.string,
    icon: PropTypes.elementType,
    iconPosition: PropTypes.oneOf(['left', 'right']),
    disabled: PropTypes.bool,
    required: PropTypes.bool,
    className: PropTypes.string,
};

export default Input;

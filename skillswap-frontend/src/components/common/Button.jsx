import React from 'react';
import PropTypes from 'prop-types';
import { Loader2 } from 'lucide-react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    onClick,
    type = 'button',
    className = '',
    ...props
}) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        // Bright blue gradient button
        primary: `
        bg-gradient-to-r from-[#2563EB] to-[#3B82F6] 
        text-white font-semibold 
        hover:opacity-90 
        focus:ring-2 focus:ring-[#3B82F6]/40
    `,

        // Soft white button with blue text
        secondary: `
        bg-white/10 
        border border-white/20 
        text-[#E6E9EF] 
        backdrop-blur-xl
        hover:bg-white/20 
        focus:ring-2 focus:ring-[#3B82F6]/40
    `,

        // Futuristic danger button in hot pink
        danger: `
        bg-[#FF3DAB] 
        text-white 
        hover:bg-[#E53498] 
        focus:ring-2 focus:ring-[#FF3DAB]/40
    `,

        // Transparent cyber glass button
        ghost: `
        bg-transparent 
        border border-white/20 
        text-[#E6E9EF] 
        hover:bg-white/10 
        backdrop-blur-lg
        focus:ring-2 focus:ring-[#3B82F6]/30
    `,

        // Minimal blue text button (used in nav)
        ghostWarm: `
        text-[#60A5FA] 
        hover:text-[#3B82F6] 
        hover:bg-white/5
    `,

        // Big gradient CTA button (blue gradient)
        warm: `
        bg-gradient-to-r from-[#2563EB] to-[#3B82F6] 
        text-white font-semibold 
        hover:opacity-90 
        focus:ring-2 focus:ring-[#3B82F6]/40
    `,

        // CTA on dark background (glass button)
        warmAlt: `
        bg-black/40 
        border border-white/20 
        backdrop-blur-lg 
        text-white 
        hover:bg-black/60
    `,
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
};

Button.propTypes = {
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'ghost', 'ghostWarm', 'warm', 'warmAlt']),
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    isLoading: PropTypes.bool,
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
    type: PropTypes.oneOf(['button', 'submit', 'reset']),
    className: PropTypes.string,
};

export default Button;

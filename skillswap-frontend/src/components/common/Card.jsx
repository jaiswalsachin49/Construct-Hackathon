import React from 'react';
import PropTypes from 'prop-types';

const Card = ({
    children,
    header,
    footer,
    padding = 'normal',
    shadow = 'normal',
    border = true,
    className = '',
}) => {
    const paddingClasses = {
        none: '',
        sm: 'p-3',
        normal: 'p-4',
        lg: 'p-6',
    };

    const shadowClasses = {
        none: '',
        sm: 'shadow-sm',
        normal: 'shadow-md',
        lg: 'shadow-lg',
    };

    return (
        <div
            className={`
        bg-white/5 rounded-lg backdrop-blur-xl
        ${border ? 'border border-white/10' : ''}
        ${shadowClasses[shadow]}
        ${className}
      `}
        >
            {header && (
                <div className={`border-b border-gray-200 ${paddingClasses[padding]}`}>
                    {header}
                </div>
            )}
            <div className={paddingClasses[padding]}>
                {children}
            </div>
            {footer && (
                <div className={`border-t border-gray-200 ${paddingClasses[padding]}`}>
                    {footer}
                </div>
            )}
        </div>
    );
};

Card.propTypes = {
    children: PropTypes.node.isRequired,
    header: PropTypes.node,
    footer: PropTypes.node,
    padding: PropTypes.oneOf(['none', 'sm', 'normal', 'lg']),
    shadow: PropTypes.oneOf(['none', 'sm', 'normal', 'lg']),
    border: PropTypes.bool,
    className: PropTypes.string,
};

export default Card;

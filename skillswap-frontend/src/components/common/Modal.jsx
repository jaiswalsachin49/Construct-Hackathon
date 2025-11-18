import React from 'react';
import PropTypes from 'prop-types';
import { Loader2 } from 'lucide-react';

const Loading = ({ size = 'md', text, className = '' }) => {
    const sizes = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    };

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <Loader2 className={`${sizes[size]} animate-spin text-blue-600`} />
            {text && <p className="mt-2 text-sm text-gray-600">{text}</p>}
        </div>
    );
};

Loading.propTypes = {
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    text: PropTypes.string,
    className: PropTypes.string,
};

export default Loading;

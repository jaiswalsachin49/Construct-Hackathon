import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

const Toast = ({ type = 'info', message, onClose, duration = 3000 }) => {
    useEffect(() => {
        if (duration && onClose) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const types = {
        success: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            text: 'text-green-800',
            icon: CheckCircle,
            iconColor: 'text-green-500',
        },
        error: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-800',
            icon: XCircle,
            iconColor: 'text-red-500',
        },
        warning: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            text: 'text-yellow-800',
            icon: AlertCircle,
            iconColor: 'text-yellow-500',
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            text: 'text-blue-800',
            icon: Info,
            iconColor: 'text-blue-500',
        },
    };

    const config = types[type];
    const Icon = config.icon;

    return (
        <div
            className={`
        fixed top-4 right-4 z-50
        flex items-center gap-3 p-4 rounded-lg border shadow-lg
        ${config.bg} ${config.border} ${config.text}
        animate-in slide-in-from-top-5 duration-300
      `}
        >
            <Icon className={`h-5 w-5 ${config.iconColor} flex-shrink-0`} />
            <p className="text-sm font-medium">{message}</p>
            <button
                onClick={onClose}
                className={`ml-2 ${config.text} hover:opacity-70 transition-opacity`}
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
};

Toast.propTypes = {
    type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
    message: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    duration: PropTypes.number,
};

export default Toast;

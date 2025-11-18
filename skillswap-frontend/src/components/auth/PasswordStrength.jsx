import React from 'react';
import PropTypes from 'prop-types';

const PasswordStrength = ({ password }) => {
    const calculateStrength = (pass) => {
        if (!pass) return { strength: 0, label: '', color: '' };

        let strength = 0;

        // Length
        if (pass.length >= 8) strength += 1;
        if (pass.length >= 12) strength += 1;

        // Contains lowercase
        if (/[a-z]/.test(pass)) strength += 1;

        // Contains uppercase
        if (/[A-Z]/.test(pass)) strength += 1;

        // Contains numbers
        if (/\d/.test(pass)) strength += 1;

        // Contains special chars
        if (/[^A-Za-z0-9]/.test(pass)) strength += 1;

        if (strength <= 2) {
            return { strength: 1, label: 'Weak', color: 'bg-red-500' };
        } else if (strength <= 4) {
            return { strength: 2, label: 'Medium', color: 'bg-yellow-500' };
        } else {
            return { strength: 3, label: 'Strong', color: 'bg-green-500' };
        }
    };

    const { strength, label, color } = calculateStrength(password);

    if (!password) return null;

    return (
        <div className="mt-2">
            <div className="flex items-center gap-2">
                <div className="flex-1 flex gap-1">
                    <div className={`h-1.5 flex-1 rounded-full ${strength >= 1 ? color : 'bg-gray-200'}`} />
                    <div className={`h-1.5 flex-1 rounded-full ${strength >= 2 ? color : 'bg-gray-200'}`} />
                    <div className={`h-1.5 flex-1 rounded-full ${strength >= 3 ? color : 'bg-gray-200'}`} />
                </div>
                <span className="text-sm font-medium text-gray-600">{label}</span>
            </div>
        </div>
    );
};

PasswordStrength.propTypes = {
    password: PropTypes.string,
};

export default PasswordStrength;

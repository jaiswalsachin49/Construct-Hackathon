const rateLimit = require('express-rate-limit');

// Auth endpoints rate limiter (strict)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per 15 minutes
    message: 'Too many login attempts, try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

// General API rate limiter (moderate)
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { authLimiter, apiLimiter };
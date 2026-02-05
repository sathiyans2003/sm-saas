const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Global API Limiter (100 reqs per 15 mins)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
});

// Auth Limiter (Brute Force Protection - 10 reqs per hour)
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: { error: 'Too many login attempts, please try again later.' }
});

// Broadcast Limiter (Prevent Spam - 50 reqs per hour per IP)
const broadcastLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 50,
    message: { error: 'Broadcast limit reached.' }
});

module.exports = {
    helmet,
    apiLimiter,
    authLimiter,
    broadcastLimiter
};

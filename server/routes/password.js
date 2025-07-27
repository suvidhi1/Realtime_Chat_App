// server/routes/password.js - Password Reset Routes
const express = require('express');
const router = express.Router();
const { 
    requestPasswordReset,
    resetPassword
} = require('../controllers/passwordController');
const { body } = require('express-validator');
const { handleValidation } = require('../middleware/validation');

console.log('🔧 Loading password reset routes...');

// Validation middleware for password reset request
const validateResetRequest = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    handleValidation
];

// Validation middleware for password reset
const validatePasswordReset = [
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    handleValidation
];

// Password reset routes (public - no auth required)
router.post('/request', validateResetRequest, requestPasswordReset);
router.post('/reset/:token', validatePasswordReset, resetPassword);

// Route info endpoint
router.get('/', (req, res) => {
    res.json({
        message: 'Password Reset API',
        endpoints: [
            'POST /request - Request password reset (requires: email)',
            'POST /reset/:token - Reset password with token (requires: password)'
        ],
        note: 'These routes are public and do not require authentication',
        process: [
            '1. Send POST to /request with email',
            '2. Check email/console for reset token',
            '3. Send POST to /reset/:token with new password'
        ]
    });
});

// Test endpoint for development
router.get('/test', (req, res) => {
    res.json({
        message: 'Password reset routes working!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

console.log('✅ Password reset routes loaded');

module.exports = router;

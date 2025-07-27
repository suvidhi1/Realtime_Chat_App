// server/routes/auth.js - Production Version  
const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser, 
    getCurrentUser, 
    logoutUser, 
    refreshToken 
} = require('../controllers/authController');
const { auth } = require('../middleware/auth');

console.log('🔧 Loading production auth routes...');

// Public routes (no authentication required)
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes (authentication required)
router.get('/me', auth, getCurrentUser);
router.post('/logout', auth, logoutUser);
router.post('/refresh', auth, refreshToken);

// Test route for debugging
router.get('/test', (req, res) => {
    console.log('📍 Auth test route hit');
    res.json({
        message: 'Production auth routes working!',
        timestamp: new Date().toISOString(),
        availableEndpoints: [
            'POST /api/auth/register',
            'POST /api/auth/login', 
            'GET /api/auth/me (protected)',
            'POST /api/auth/logout (protected)',
            'POST /api/auth/refresh (protected)'
        ]
    });
});

// Route info endpoint
router.get('/', (req, res) => {
    res.json({
        message: 'Chat App Authentication API',
        version: '1.0.0',
        endpoints: {
            public: [
                'POST /register - Register new user',
                'POST /login - Login user'
            ],
            protected: [
                'GET /me - Get current user info',
                'POST /logout - Logout user',
                'POST /refresh - Refresh JWT token'
            ]
        },
        authRequired: 'Include Authorization: Bearer <token> header for protected routes'
    });
});

console.log('✅ Production auth routes loaded');

module.exports = router;
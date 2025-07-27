// server/routes/user.js - Production Version
const express = require('express');
const router = express.Router();
const { 
    searchUsers,
    getUserProfile,
    updateUserProfile,
    getAllUsers
} = require('../controllers/userController');
const { auth } = require('../middleware/auth');

console.log('🔧 Loading production user routes...');

// Apply authentication to all user routes
router.use(auth);

// User routes
router.get('/search', searchUsers);
router.get('/all', getAllUsers);
router.get('/:userId', getUserProfile);
router.put('/profile', updateUserProfile);

// Route info endpoint
router.get('/', (req, res) => {
    res.json({
        message: 'User API Routes',
        user: req.user.username,
        endpoints: [
            'GET /search?query=<searchterm> - Search users',
            'GET /all - Get all users',
            'GET /:userId - Get user profile',
            'PUT /profile - Update own profile'
        ],
        note: 'All routes require JWT authentication'
    });
});

console.log('✅ Production user routes loaded');

module.exports = router;
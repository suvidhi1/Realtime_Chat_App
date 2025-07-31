const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

console.log('🔧 Loading friend routes...');

// Apply auth to all routes
router.use(auth);

// Simple redirect endpoint to main user routes
router.get('/', (req, res) => {
    res.json({
        message: 'Friend routes have been consolidated under /api/users',
        redirects: {
            'GET /friends': 'GET /api/users/friends',
            'GET /friend-requests': 'GET /api/users/friend-requests',
            'POST /friend-request': 'POST /api/users/friend-request',
            'PUT /friend-request/:id/accept': 'PUT /api/users/friend-request/:id/accept',
            'PUT /friend-request/:id/decline': 'PUT /api/users/friend-request/:id/decline',
            'DELETE /friends/:id': 'DELETE /api/users/friends/:id'
        }
    });
});

console.log('✅ Friend routes loaded (redirected to user routes)');

module.exports = router;

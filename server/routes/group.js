// server/routes/group.js - Group Chat Management Routes
const express = require('express');
const router = express.Router();
const { 
    addMembersToGroup,
    removeMemberFromGroup,
    updateGroupInfo,
    leaveGroup
} = require('../controllers/groupController');
const { auth } = require('../middleware/auth');

console.log('🔧 Loading group chat routes...');

// Apply authentication to all group routes
router.use(auth);

// Group management routes
router.post('/:chatId/members', addMembersToGroup);
router.delete('/:chatId/members/:userId', removeMemberFromGroup);
router.put('/:chatId/info', updateGroupInfo);
router.post('/:chatId/leave', leaveGroup);

// Route info endpoint
router.get('/', (req, res) => {
    res.json({
        message: 'Group Chat Management API',
        user: req.user.username,
        endpoints: [
            'POST /:chatId/members - Add members to group',
            'DELETE /:chatId/members/:userId - Remove member from group',
            'PUT /:chatId/info - Update group name/avatar',
            'POST /:chatId/leave - Leave group'
        ],
        note: 'All routes require JWT authentication'
    });
});

console.log('✅ Group chat routes loaded');

module.exports = router;
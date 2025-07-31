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

// IMPORTANT: Put specific routes BEFORE parameterized routes
// These specific routes must come first

// Friends and friend requests routes (moved from friend.js to avoid conflicts)
router.get('/friends', async (req, res) => {
    try {
        console.log('👥 Getting friends for user:', req.user.username);
        
        const User = require('../models/User');
        const user = await User.findById(req.user.id)
            .populate('friends', 'username email avatar isOnline lastSeen')
            .select('friends');

        if (!user.friends) {
            user.friends = [];
        }

        res.json({
            success: true,
            friends: user.friends,
            count: user.friends.length
        });
    } catch (error) {
        console.error('❌ Get friends error:', error);
        res.status(500).json({ error: 'Failed to get friends list' });
    }
});

router.get('/friend-requests', async (req, res) => {
    try {
        console.log('📥 Getting friend requests for user:', req.user.username);
        console.log('📋 User ID:', req.user.id);
        
        const User = require('../models/User');
        const user = await User.findById(req.user.id)
            .populate('friendRequests.from', 'username email avatar createdAt')
            .select('friendRequests');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Initialize friendRequests if it doesn't exist
        if (!user.friendRequests) {
            user.friendRequests = [];
        }
        
        console.log('✅ Found friend requests:', user.friendRequests.length);
        
        res.json({ 
            success: true, 
            friendRequests: user.friendRequests,
            count: user.friendRequests.length
        });
    } catch (error) {
        console.error('❌ Get friend requests error:', error);
        res.status(500).json({ 
            error: 'Failed to get friend requests',
            details: error.message 
        });
    }
});

router.post('/friend-request', async (req, res) => {
    try {
        const { userId, targetUserId } = req.body;
        const targetId = userId || targetUserId;
        const currentUserId = req.user.id;
        
        console.log('📤 Friend request:', {
            from: currentUserId,
            to: targetId,
            fromUser: req.user.username
        });

        if (targetId === currentUserId) {
            return res.status(400).json({ error: "Can't send friend request to yourself" });
        }
        
        const User = require('../models/User');
        const targetUser = await User.findById(targetId);
        if (!targetUser) {
            console.log('❌ Target user not found:', targetId);
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Check if already friends
        if (targetUser.friends && targetUser.friends.includes(currentUserId)) {
            return res.status(400).json({ error: 'Already friends' });
        }
        
        // Initialize friendRequests array if it doesn't exist
        if (!targetUser.friendRequests) {
            targetUser.friendRequests = [];
        }
        
        // Check if request already sent
        const existingRequest = targetUser.friendRequests.find(
            req => req.from && req.from.toString() === currentUserId
        );
        
        if (existingRequest) {
            return res.status(400).json({ error: 'Friend request already sent' });
        }
        
        // Add friend request
        targetUser.friendRequests.push({ 
            from: currentUserId,
            status: 'pending',
            createdAt: new Date()
        });
        
        await targetUser.save();
        
        console.log('✅ Friend request saved to user:', targetUser.username);
        
        res.json({ 
            success: true, 
            message: 'Friend request sent successfully',
            targetUser: targetUser.username
        });
    } catch (error) {
        console.error('❌ Friend request error:', error);
        res.status(500).json({ error: 'Failed to send friend request' });
    }
});

// Accept friend request
router.put('/friend-request/:requestId/accept', async (req, res) => {
    try {
        const { requestId } = req.params;
        const currentUserId = req.user.id;
        
        console.log('✅ Accepting friend request:', { requestId, currentUserId });
        
        const User = require('../models/User');
        const user = await User.findById(currentUserId);
        if (!user || !user.friendRequests) {
            return res.status(404).json({ error: 'User or friend requests not found' });
        }
        
        const requestIndex = user.friendRequests.findIndex(
            req => req._id.toString() === requestId
        );
        
        if (requestIndex === -1) {
            return res.status(404).json({ error: 'Friend request not found' });
        }
        
        const senderId = user.friendRequests[requestIndex].from;
        
        // Initialize friends arrays if they don't exist
        if (!user.friends) user.friends = [];
        
        const senderUser = await User.findById(senderId);
        if (!senderUser.friends) senderUser.friends = [];
        
        // Add each other as friends
        await User.findByIdAndUpdate(currentUserId, {
            $push: { friends: senderId },
            $pull: { friendRequests: { _id: requestId } }
        });
        
        await User.findByIdAndUpdate(senderId, {
            $push: { friends: currentUserId }
        });
        
        console.log('✅ Friend request accepted successfully');
        
        res.json({ success: true, message: 'Friend request accepted' });
    } catch (error) {
        console.error('❌ Accept friend request error:', error);
        res.status(500).json({ error: 'Failed to accept friend request' });
    }
});

// Decline friend request
router.put('/friend-request/:requestId/decline', async (req, res) => {
    try {
        const { requestId } = req.params;
        const currentUserId = req.user.id;
        
        const User = require('../models/User');
        await User.findByIdAndUpdate(currentUserId, {
            $pull: { friendRequests: { _id: requestId } }
        });
        
        res.json({ success: true, message: 'Friend request declined' });
    } catch (error) {
        console.error('❌ Decline friend request error:', error);
        res.status(500).json({ error: 'Failed to decline friend request' });
    }
});

// Remove friend
router.delete('/friends/:friendId', async (req, res) => {
    try {
        const { friendId } = req.params;
        const currentUserId = req.user.id;
        
        const User = require('../models/User');
        await User.findByIdAndUpdate(currentUserId, {
            $pull: { friends: friendId }
        });
        
        await User.findByIdAndUpdate(friendId, {
            $pull: { friends: currentUserId }
        });
        
        res.json({ success: true, message: 'Friend removed' });
    } catch (error) {
        console.error('❌ Remove friend error:', error);
        res.status(500).json({ error: 'Failed to remove friend' });
    }
});

// Other user routes
router.get('/search', searchUsers);
router.get('/all', getAllUsers);
router.put('/profile', updateUserProfile);

// Route info endpoint
router.get('/', (req, res) => {
    res.json({
        message: 'User API Routes',
        user: req.user.username,
        endpoints: [
            'GET /search?query=<searchterm> - Search users',
            'GET /all - Get all users',
            'GET /friends - Get friends list',
            'GET /friend-requests - Get friend requests',
            'POST /friend-request - Send friend request',
            'PUT /friend-request/:id/accept - Accept friend request',
            'PUT /friend-request/:id/decline - Decline friend request',
            'DELETE /friends/:id - Remove friend',
            'GET /:userId - Get user profile',
            'PUT /profile - Update own profile'
        ],
        note: 'All routes require JWT authentication'
    });
});

// Parameterized routes MUST come LAST to avoid conflicts
router.get('/:userId', getUserProfile);

console.log('✅ Production user routes loaded');

module.exports = router;

// server/routes/search.js - Search Functionality Routes
const express = require('express');
const router = express.Router();
const { searchMessages } = require('../controllers/searchController');
const { auth } = require('../middleware/auth');
const { validateSearch, validatePagination } = require('../middleware/validation');
const User = require('../models/User');
const Chat = require('../models/Chat');

console.log('🔧 Loading search routes...');

// Apply authentication to all search routes
router.use(auth);

// Search messages
router.get('/messages', validateSearch, validatePagination, searchMessages);

// Search users (enhanced from userController)
router.get('/users', async (req, res) => {
    try {
        const { query, limit = 20 } = req.query;
        const currentUserId = req.user.id;

        if (!query || query.trim().length < 2) {
            return res.status(400).json({ 
                error: 'Search query must be at least 2 characters' 
            });
        }

        const searchTerm = query.trim();
        const users = await User.find({
            _id: { $ne: currentUserId },
            $or: [
                { username: { $regex: searchTerm, $options: 'i' } },
                { email: { $regex: searchTerm, $options: 'i' } }
            ]
        })
        .select('username email avatar isOnline lastSeen')
        .limit(parseInt(limit))
        .sort({ username: 1 });

        res.json({
            success: true,
            type: 'users',
            results: users,
            count: users.length,
            query: searchTerm
        });

    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// Search chats
router.get('/chats', async (req, res) => {
    try {
        const { query, limit = 20 } = req.query;
        const currentUserId = req.user.id;

        if (!query || query.trim().length < 2) {
            return res.status(400).json({ 
                error: 'Search query must be at least 2 characters' 
            });
        }

        const searchTerm = query.trim();
        const chats = await Chat.find({
            participants: currentUserId,
            $or: [
                { name: { $regex: searchTerm, $options: 'i' } },
                // For non-group chats, search participant usernames
                {
                    $and: [
                        { isGroup: false },
                        { 
                            participants: { 
                                $in: await User.find({
                                    username: { $regex: searchTerm, $options: 'i' },
                                    _id: { $ne: currentUserId }
                                }).distinct('_id')
                            }
                        }
                    ]
                }
            ]
        })
        .populate('participants', 'username avatar isOnline')
        .populate('lastMessage', 'content createdAt')
        .limit(parseInt(limit))
        .sort({ updatedAt: -1 });

        // Format chat names for response
        const formattedChats = chats.map(chat => {
            let displayName = chat.name;
            if (!chat.isGroup) {
                const otherParticipant = chat.participants.find(
                    p => p._id.toString() !== currentUserId
                );
                displayName = otherParticipant ? otherParticipant.username : 'Unknown User';
            }

            return {
                ...chat.toObject(),
                displayName
            };
        });

        res.json({
            success: true,
            type: 'chats',
            results: formattedChats,
            count: formattedChats.length,
            query: searchTerm
        });

    } catch (error) {
        console.error('Search chats error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// Global search (users + chats + messages)
router.get('/global', async (req, res) => {
    try {
        const { query, limit = 10 } = req.query;
        const currentUserId = req.user.id;

        if (!query || query.trim().length < 2) {
            return res.status(400).json({ 
                error: 'Search query must be at least 2 characters' 
            });
        }

        const searchTerm = query.trim();
        const searchLimit = Math.min(parseInt(limit), 50);

        // Search users
        const users = await User.find({
            _id: { $ne: currentUserId },
            $or: [
                { username: { $regex: searchTerm, $options: 'i' } },
                { email: { $regex: searchTerm, $options: 'i' } }
            ]
        })
        .select('username email avatar isOnline')
        .limit(searchLimit);

        // Search chats
        const chats = await Chat.find({
            participants: currentUserId,
            name: { $regex: searchTerm, $options: 'i' }
        })
        .populate('participants', 'username avatar')
        .limit(searchLimit);

        // Search messages (simplified - you might want to use the full searchMessages function)
        const userChats = await Chat.find({ participants: currentUserId }).select('_id');
        const chatIds = userChats.map(chat => chat._id);
        
        const Message = require('../models/Message');
        const messages = await Message.find({
            chat: { $in: chatIds },
            messageType: 'text'
        })
        .populate('sender', 'username avatar')
        .populate('chat', 'name isGroup')
        .sort({ createdAt: -1 })
        .limit(searchLimit);

        res.json({
            success: true,
            type: 'global',
            results: {
                users: users.map(u => ({ ...u.toObject(), resultType: 'user' })),
                chats: chats.map(c => ({ ...c.toObject(), resultType: 'chat' })),
                messages: messages.map(m => ({ ...m.toObject(), resultType: 'message' }))
            },
            counts: {
                users: users.length,
                chats: chats.length,
                messages: messages.length,
                total: users.length + chats.length + messages.length
            },
            query: searchTerm
        });

    } catch (error) {
        console.error('Global search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// Route info endpoint
router.get('/', (req, res) => {
    res.json({
        message: 'Search API',
        user: req.user.username,
        endpoints: [
            'GET /messages?query=<term> - Search messages in user chats',
            'GET /users?query=<term> - Search users by username/email',
            'GET /chats?query=<term> - Search chats by name',
            'GET /global?query=<term> - Search users, chats, and messages'
        ],
        parameters: {
            query: 'Search term (minimum 2 characters)',
            limit: 'Maximum results to return (default: 20, max: 50)',
            chatId: 'Specific chat ID for message search',
            dateFrom: 'Start date for message search (ISO format)',
            dateTo: 'End date for message search (ISO format)'
        },
        note: 'All routes require JWT authentication'
    });
});

console.log('✅ Search routes loaded');

module.exports = router;

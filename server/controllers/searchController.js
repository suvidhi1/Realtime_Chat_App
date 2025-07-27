//controllers-searchController.js
// Advanced search functionality
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const { decryptMessage } = require('../utils/encryption');

// Search messages in user's chats
const searchMessages = async (req, res) => {
    const { query, chatId, dateFrom, dateTo } = req.query;
    const userId = req.user.id;
    
    if (!query || query.length < 2) {
        return res.status(400).json({ error: 'Search query too short' });
    }
    
    // Get user's chats
    const userChats = await Chat.find({ participants: userId }).select('_id');
    const chatIds = userChats.map(chat => chat._id);
    
    let searchFilter = {
        chat: { $in: chatIds },
        messageType: 'text'
    };
    
    if (chatId) {
        searchFilter.chat = chatId;
    }
    
    if (dateFrom || dateTo) {
        searchFilter.createdAt = {};
        if (dateFrom) searchFilter.createdAt.$gte = new Date(dateFrom);
        if (dateTo) searchFilter.createdAt.$lte = new Date(dateTo);
    }
    
    const messages = await Message.find(searchFilter)
        .populate('sender', 'username avatar')
        .populate('chat', 'name isGroup')
        .sort({ createdAt: -1 })
        .limit(50);
    
    // Decrypt and filter messages
    const filteredMessages = messages.filter(message => {
        let content = message.content;
        
        if (message.encrypted) {
            try {
                const encryptedData = JSON.parse(message.content);
                content = decryptMessage(encryptedData);
            } catch (error) {
                return false;
            }
        }
        
        return content.toLowerCase().includes(query.toLowerCase());
    }).map(message => {
        let content = message.content;
        
        if (message.encrypted) {
            try {
                const encryptedData = JSON.parse(message.content);
                content = decryptMessage(encryptedData);
            } catch (error) {
                content = '[Encrypted]';
            }
        }
        
        return {
            ...message.toObject(),
            content
        };
    });
    
    res.json({
        success: true,
        messages: filteredMessages,
        count: filteredMessages.length,
        query
    });
};

module.exports = {
    searchMessages
};
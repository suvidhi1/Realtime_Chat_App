// server/controllers/chatController.js - Production Version
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const { encryptMessage, decryptMessage } = require('../utils/encryption');

console.log('Loading production chat controller...');

// Get user's chats
const getUserChats = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('📍 Getting chats for user:', req.user.username);
        
        const chats = await Chat.find({
            participants: userId
        })
        .populate('participants', 'username avatar isOnline lastSeen')
        .populate({
            path: 'lastMessage',
            populate: { path: 'sender', select: 'username' }
        })
        .populate('admin', 'username')
        .sort({ updatedAt: -1 });

        console.log(`✅ Found ${chats.length} chats for user`);

        // Format chats for response
        const formattedChats = chats.map(chat => {
            let chatName = chat.name;
            
            // Generate name for one-on-one chats
            if (!chat.isGroup) {
                const otherParticipant = chat.participants.find(
                    p => p._id.toString() !== userId
                );
                chatName = otherParticipant ? otherParticipant.username : 'Unknown User';
            }

            // Decrypt last message if it exists and is encrypted
            let lastMessageContent = null;
            if (chat.lastMessage && chat.lastMessage.content) {
                if (chat.lastMessage.encrypted) {
                    try {
                        const encryptedData = JSON.parse(chat.lastMessage.content);
                        lastMessageContent = decryptMessage(encryptedData);
                    } catch (error) {
                        console.error('Error decrypting last message:', error);
                        lastMessageContent = '[Encrypted message]';
                    }
                } else {
                    lastMessageContent = chat.lastMessage.content;
                }
            }

            return {
                id: chat._id,
                name: chatName,
                isGroup: chat.isGroup,
                participants: chat.participants,
                admin: chat.admin,
                lastMessage: chat.lastMessage ? {
                    ...chat.lastMessage.toObject(),
                    content: lastMessageContent
                } : null,
                groupAvatar: chat.groupAvatar,
                updatedAt: chat.updatedAt,
                createdAt: chat.createdAt
            };
        });

        res.json({
            success: true,
            chats: formattedChats,
            count: formattedChats.length
        });

    } catch (error) {
        console.error('❌ Get chats error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch chats',
            message: error.message 
        });
    }
};

// Create new chat (one-on-one or group)
const createChat = async (req, res) => {
    try {
        const { participantIds, isGroup = false, name = '' } = req.body;
        const currentUserId = req.user.id;

        console.log('📍 Creating chat:', { participantIds, isGroup, name, currentUser: req.user.username });

        // Validation
        if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
            return res.status(400).json({ 
                error: 'Participants are required',
                hint: 'Provide participantIds as an array of user IDs'
            });
        }

        // For group chats, require a name
        if (isGroup && !name.trim()) {
            return res.status(400).json({ 
                error: 'Group name is required for group chats' 
            });
        }

        // Verify all participants exist
        const participants = await User.find({
            _id: { $in: participantIds }
        }).select('_id username');

        if (participants.length !== participantIds.length) {
            return res.status(400).json({ 
                error: 'One or more participants not found' 
            });
        }

        // Add current user to participants if not already included
        const allParticipantIds = [...new Set([currentUserId, ...participantIds])];

        console.log('👥 All participants:', allParticipantIds);

        // For one-on-one chats, check if chat already exists
        if (!isGroup && allParticipantIds.length === 2) {
            const existingChat = await Chat.findOne({
                participants: { $all: allParticipantIds, $size: 2 },
                isGroup: false
            })
            .populate('participants', 'username avatar isOnline')
            .populate('admin', 'username');

            if (existingChat) {
                console.log('✅ Found existing one-on-one chat');
                return res.status(200).json({
                    success: true,
                    message: 'Chat already exists',
                    chat: existingChat,
                    isExisting: true
                });
            }
        }

        // Create new chat
        const newChat = await Chat.create({
            name: isGroup ? name.trim() : '',
            isGroup,
            participants: allParticipantIds,
            admin: isGroup ? currentUserId : null
        });

        console.log('✅ Chat created with ID:', newChat._id);

        // Populate the chat for response
        const populatedChat = await Chat.findById(newChat._id)
            .populate('participants', 'username avatar isOnline')
            .populate('admin', 'username');

        // Emit to all participants via Socket.IO
        const io = req.app.get('io');
        if (io) {
            allParticipantIds.forEach(participantId => {
                if (participantId !== currentUserId) {
                    io.to(participantId).emit('newChat', {
                        chat: populatedChat,
                        createdBy: req.user.username
                    });
                }
            });
        }

        res.status(201).json({
            success: true,
            message: 'Chat created successfully',
            chat: populatedChat
        });

    } catch (error) {
        console.error('❌ Create chat error:', error);
        res.status(500).json({ 
            error: 'Failed to create chat',
            message: error.message 
        });
    }
};

// Get chat messages with pagination
const getChatMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const userId = req.user.id;

        console.log(`📍 Getting messages for chat: ${chatId}, page: ${page}, user: ${req.user.username}`);

        // Verify user is part of the chat
        const chat = await Chat.findOne({
            _id: chatId,
            participants: userId
        });

        if (!chat) {
            console.log('❌ User not part of chat or chat not found');
            return res.status(403).json({ 
                error: 'Access denied to this chat' 
            });
        }

        // Get messages with pagination
        const messages = await Message.find({ chat: chatId })
            .populate('sender', 'username avatar')
            .populate({
                path: 'replyTo',
                populate: { path: 'sender', select: 'username' }
            })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        console.log(`✅ Found ${messages.length} messages`);

        // Decrypt messages for display
        const decryptedMessages = messages.map(message => {
            let decryptedContent = message.content;
            
            if (message.encrypted && message.content) {
                try {
                    const encryptedData = JSON.parse(message.content);
                    decryptedContent = decryptMessage(encryptedData);
                } catch (error) {
                    console.error('Message decryption error:', error);
                    decryptedContent = '[Encrypted message - decryption failed]';
                }
            }

            return {
                ...message.toObject(),
                content: decryptedContent
            };
        });

        // Get total count for pagination
        const totalMessages = await Message.countDocuments({ chat: chatId });

        res.json({
            success: true,
            messages: decryptedMessages.reverse(), // Return in chronological order
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalMessages,
                pages: Math.ceil(totalMessages / parseInt(limit)),
                hasMore: (parseInt(page) * parseInt(limit)) < totalMessages
            }
        });

    } catch (error) {
        console.error('❌ Get messages error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch messages',
            message: error.message 
        });
    }
};

// Send message
const sendMessage = async (req, res) => {
    try {
        const { chatId, content, messageType = 'text', replyTo } = req.body;
        const senderId = req.user.id;

        console.log(`📍 Sending message to chat ${chatId} from ${req.user.username}`);

        // Validation
        if (!content || !content.trim()) {
            return res.status(400).json({ 
                error: 'Message content is required' 
            });
        }

        // Verify user is part of the chat
        const chat = await Chat.findOne({
            _id: chatId,
            participants: senderId
        }).populate('participants', '_id username');

        if (!chat) {
            console.log('❌ User not part of chat or chat not found');
            return res.status(403).json({ 
                error: 'Access denied to this chat' 
            });
        }

        // Encrypt message content
        const encryptedData = encryptMessage(content.trim());

        // Create message
        const newMessage = await Message.create({
            sender: senderId,
            chat: chatId,
            content: JSON.stringify(encryptedData),
            messageType,
            encrypted: true,
            replyTo: replyTo || null,
            readBy: [{ user: senderId, readAt: new Date() }]
        });

        console.log('✅ Message created with ID:', newMessage._id);

        // Update chat's last message and timestamp
        await Chat.findByIdAndUpdate(chatId, {
            lastMessage: newMessage._id,
            updatedAt: new Date()
        });

        // Populate message for response
        const populatedMessage = await Message.findById(newMessage._id)
            .populate('sender', 'username avatar')
            .populate({
                path: 'replyTo',
                populate: { path: 'sender', select: 'username' }
            });

        // Emit to all chat participants via Socket.IO
        const io = req.app.get('io');
        if (io) {
            chat.participants.forEach(participant => {
                const participantId = participant._id.toString();
                if (participantId !== senderId) {
                    io.to(participantId).emit('newMessage', {
                        ...populatedMessage.toObject(),
                        content: content, // Send decrypted content to real-time listeners
                        chatId: chatId
                    });
                }
            });
        }

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: {
                ...populatedMessage.toObject(),
                content: content // Return decrypted content
            }
        });

    } catch (error) {
        console.error('❌ Send message error:', error);
        res.status(500).json({ 
            error: 'Failed to send message',
            message: error.message 
        });
    }
};

// Mark messages as read
const markMessagesAsRead = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.id;

        console.log(`📍 Marking messages as read in chat ${chatId} for user ${req.user.username}`);

        // Verify user is part of the chat
        const chat = await Chat.findOne({
            _id: chatId,
            participants: userId
        });

        if (!chat) {
            return res.status(403).json({ 
                error: 'Access denied to this chat' 
            });
        }

        // Update all unread messages in the chat
        const result = await Message.updateMany(
            {
                chat: chatId,
                'readBy.user': { $ne: userId }
            },
            {
                $push: {
                    readBy: {
                        user: userId,
                        readAt: new Date()
                    }
                }
            }
        );

        console.log(`✅ Marked ${result.modifiedCount} messages as read`);

        // Emit read receipt via Socket.IO
        const io = req.app.get('io');
        if (io) {
            io.to(chatId).emit('messagesRead', {
                chatId,
                userId,
                username: req.user.username,
                readAt: new Date()
            });
        }

        res.json({
            success: true,
            message: 'Messages marked as read',
            markedCount: result.modifiedCount
        });

    } catch (error) {
        console.error('❌ Mark as read error:', error);
        res.status(500).json({ 
            error: 'Failed to mark messages as read',
            message: error.message 
        });
    }
};

console.log('✅ Production chat controller loaded');

module.exports = {
    getUserChats,
    createChat,
    getChatMessages,
    sendMessage,
    markMessagesAsRead
};
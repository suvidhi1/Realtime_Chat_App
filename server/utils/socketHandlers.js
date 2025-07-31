// server/utils/socketHandlers.js - Enhanced Version
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { client: redisClient } = require('../config/redis');

console.log('Loading enhanced socket handlers...');

// Store active connections
const activeConnections = new Map();

// Socket authentication middleware
const authenticateSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
            console.log('❌ Socket connection without token');
            return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            console.log('❌ Socket connection with invalid user');
            return next(new Error('User not found'));
        }

        socket.userId = user._id.toString();
        socket.username = user.username;
        
        console.log(`✅ Socket authenticated for user: ${user.username}`);
        next();
        
    } catch (error) {
        console.log('❌ Socket authentication failed:', error.message);
        next(new Error('Authentication failed'));
    }
};

// Update user online status
const updateUserOnlineStatus = async (userId, isOnline) => {
    try {
        await User.findByIdAndUpdate(userId, {
            isOnline,
            lastSeen: new Date()
        });

        // Store in Redis for quick access
        if (redisClient && redisClient.isOpen) {
            await redisClient.setEx(`user:${userId}:online`, 300, isOnline ? '1' : '0'); // 5 min expiry
        }

        console.log(`📡 User ${userId} status updated: ${isOnline ? 'online' : 'offline'}`);
    } catch (error) {
        console.error('❌ Error updating user status:', error);
    }
};

// Broadcast user status to friends
const broadcastUserStatus = async (io, userId, isOnline) => {
    try {
        const user = await User.findById(userId)
            .populate('friends', '_id')
            .select('username friends');

        if (user && user.friends.length > 0) {
            user.friends.forEach(friend => {
                io.to(friend._id.toString()).emit('userStatusChanged', {
                    userId,
                    username: user.username,
                    isOnline,
                    lastSeen: new Date()
                });
            });

            console.log(`📡 Status broadcasted to ${user.friends.length} friends`);
        }
    } catch (error) {
        console.error('❌ Error broadcasting user status:', error);
    }
};

// Handle typing indicators with throttling
const typingUsers = new Map(); // chatId -> Set of userIds

const handleTyping = (socket, data) => {
    const { chatId, isTyping } = data;
    const userId = socket.userId;
    const username = socket.username;

    if (!chatId) return;

    if (isTyping) {
        // Add user to typing list
        if (!typingUsers.has(chatId)) {
            typingUsers.set(chatId, new Set());
        }
        typingUsers.get(chatId).add(userId);

        // Broadcast to chat members
        socket.to(chatId).emit('userTyping', {
            userId,
            username,
            chatId
        });

        // Auto-remove after 3 seconds of no activity
        setTimeout(() => {
            if (typingUsers.has(chatId)) {
                typingUsers.get(chatId).delete(userId);
                if (typingUsers.get(chatId).size === 0) {
                    typingUsers.delete(chatId);
                }
            }
            socket.to(chatId).emit('userStoppedTyping', {
                userId,
                chatId
            });
        }, 3000);

    } else {
        // Remove user from typing list
        if (typingUsers.has(chatId)) {
            typingUsers.get(chatId).delete(userId);
            if (typingUsers.get(chatId).size === 0) {
                typingUsers.delete(chatId);
            }
        }

        socket.to(chatId).emit('userStoppedTyping', {
            userId,
            chatId
        });
    }
};

// Main connection handler
const handleConnection = (io) => {
    console.log('🔌 Enhanced socket handler initialized');

    // Apply authentication middleware
    io.use(authenticateSocket);

    io.on('connection', async (socket) => {
        const userId = socket.userId;
        const username = socket.username;

        console.log(`👤 User connected: ${username} (${socket.id})`);

        // Store active connection
        activeConnections.set(userId, {
            socketId: socket.id,
            username,
            connectedAt: new Date()
        });

        // Update user online status
        await updateUserOnlineStatus(userId, true);
        
        // Broadcast online status to friends
        await broadcastUserStatus(io, userId, true);

        // Join user to their personal room
        socket.join(userId);

        // Handle joining chat rooms
        socket.on('joinChat', (chatId) => {
            if (chatId) {
                socket.join(chatId);
                console.log(`👤 ${username} joined chat: ${chatId}`);
                
                socket.to(chatId).emit('userJoinedChat', {
                    userId,
                    username,
                    chatId
                });
            }
        });

        // Handle leaving chat rooms
        socket.on('leaveChat', (chatId) => {
            if (chatId) {
                socket.leave(chatId);
                console.log(`👤 ${username} left chat: ${chatId}`);
                
                socket.to(chatId).emit('userLeftChat', {
                    userId,
                    username,
                    chatId
                });
            }
        });

        // Handle typing indicators
        socket.on('typing', (data) => handleTyping(socket, { ...data, isTyping: true }));
        socket.on('stopTyping', (data) => handleTyping(socket, { ...data, isTyping: false }));

        // Handle direct typing for one-on-one chats
        socket.on('typingDirect', (data) => {
            const { targetUserId } = data;
            if (targetUserId) {
                socket.to(targetUserId).emit('userTypingDirect', {
                    userId,
                    username
                });
            }
        });

        socket.on('stopTypingDirect', (data) => {
            const { targetUserId } = data;
            if (targetUserId) {
                socket.to(targetUserId).emit('userStoppedTypingDirect', {
                    userId
                });
            }
        });

        // Handle message delivery confirmation
        socket.on('messageDelivered', (data) => {
            const { messageId, chatId } = data;
            socket.to(chatId).emit('messageDeliveryConfirmed', {
                messageId,
                deliveredTo: userId,
                deliveredAt: new Date()
            });
        });

        // Handle voice call signals (for future implementation)
        socket.on('callUser', (data) => {
            const { targetUserId, offer, callType } = data;
            socket.to(targetUserId).emit('incomingCall', {
                from: userId,
                username,
                offer,
                callType
            });
        });

        socket.on('answerCall', (data) => {
            const { targetUserId, answer } = data;
            socket.to(targetUserId).emit('callAnswered', {
                from: userId,
                answer
            });
        });

        socket.on('rejectCall', (data) => {
            const { targetUserId } = data;
            socket.to(targetUserId).emit('callRejected', {
                from: userId
            });
        });

        // Handle ICE candidates for WebRTC
        socket.on('iceCandidate', (data) => {
            const { targetUserId, candidate } = data;
            socket.to(targetUserId).emit('iceCandidate', {
                from: userId,
                candidate
            });
        });

        // Handle file sharing notifications
        socket.on('fileShared', (data) => {
            const { chatId, fileName, fileSize, fileType } = data;
            socket.to(chatId).emit('fileShared', {
                from: userId,
                username,
                fileName,
                fileSize,
                fileType,
                chatId,
                sharedAt: new Date()
            });
        });

        // Handle user activity (for auto-away status)
        socket.on('userActivity', async () => {
            await updateUserOnlineStatus(userId, true);
            
            // Reset auto-away timer
            clearTimeout(socket.awayTimer);
            socket.awayTimer = setTimeout(async () => {
                await updateUserOnlineStatus(userId, false);
                await broadcastUserStatus(io, userId, false);
            }, 5 * 60 * 1000); // 5 minutes of inactivity
        });

        // Handle disconnect
        socket.on('disconnect', async (reason) => {
            console.log(`👤 User disconnected: ${username} (${reason})`);

            // Remove from active connections
            activeConnections.delete(userId);

            // Clear typing indicators
            typingUsers.forEach((users, chatId) => {
                if (users.has(userId)) {
                    users.delete(userId);
                    socket.to(chatId).emit('userStoppedTyping', {
                        userId,
                        chatId
                    });
                }
            });

            // Clear auto-away timer
            if (socket.awayTimer) {
                clearTimeout(socket.awayTimer);
            }

            // Update user offline status (with small delay in case of reconnection)
            setTimeout(async () => {
                if (!activeConnections.has(userId)) {
                    await updateUserOnlineStatus(userId, false);
                    await broadcastUserStatus(io, userId, false);
                }
            }, 2000);
        });

        // Send initial data
        socket.emit('connected', {
            userId,
            username,
            message: 'Connected to chat server',
            serverTime: new Date(),
            features: [
                'real-time messaging',
                'typing indicators', 
                'online status',
                'message delivery',
                'file sharing',
                'voice calls (coming soon)'
            ]
        });
    });

    // Periodic cleanup of typing indicators
    setInterval(() => {
        typingUsers.forEach((users, chatId) => {
            if (users.size === 0) {
                typingUsers.delete(chatId);
            }
        });
    }, 30000); // Clean up every 30 seconds
};

// Get active users count
const getActiveUsersCount = () => {
    return activeConnections.size;
};

// Get active users for a specific chat
const getActiveChatUsers = (chatId) => {
    const activeChatUsers = [];
    activeConnections.forEach((connection, userId) => {
        // This would need to be enhanced to track which chats users are in
        activeChatUsers.push({
            userId,
            username: connection.username,
            connectedAt: connection.connectedAt
        });
    });
    return activeChatUsers;
};

console.log('✅ Enhanced socket handlers defined');

module.exports = {
    handleConnection,
    getActiveUsersCount,
    getActiveChatUsers
};

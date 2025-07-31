const express = require('express');
const http = require('http');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

console.log('Starting Chat Server...');

// Create HTTP server first
const server = http.createServer(app);

// CORS Configuration
const allowedOrigins = ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Request logging middleware (before parsing)
app.use((req, res, next) => {
    console.log(`🌐 ${req.method} ${req.path}`);
    console.log('📦 Content-Type:', req.headers['content-type']);
    next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add error handling for malformed JSON
app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        console.error('❌ Bad JSON:', error.message);
        return res.status(400).json({ 
            error: 'Invalid JSON format',
            message: 'Please check your request body'
        });
    }
    next();
});

console.log('Middleware loaded...');

// Database connection
try {
    console.log('Attempting to load database...');
    const connectDB = require('./server/config/database');
    connectDB();
    console.log('Database connection loaded successfully');
} catch (error) {
    console.error('Database connection error:', error.message);
}

// Redis connection
try {
    console.log('Attempting to load Redis...');
    const { connectRedis } = require('./server/config/redis');
    connectRedis();
    console.log('Redis connection loaded successfully');
} catch (error) {
    console.error('Redis connection error:', error.message);
}

// API Information Routes
app.get('/', (req, res) => {
    res.json({ 
        message: 'Real-Time Chat API Server',
        version: '1.0.0',
        status: 'active',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Chat API is working!',
        method: req.method,
        path: req.path,
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK',
        uptime: Math.floor(process.uptime()),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
});

// DEBUG ROUTES
app.get('/debug/database', async (req, res) => {
    try {
        console.log('🔍 Database debug endpoint hit');
        
        let User, Chat, Message;
        
        try {
            User = require('./server/models/User');
            Chat = require('./server/models/Chat');
            Message = require('./server/models/Message');
            console.log('✅ Models loaded successfully');
        } catch (error) {
            console.error('❌ Models loading error:', error);
            return res.json({
                error: 'Models not found',
                message: error.message,
                modelsAvailable: false
            });
        }

        const userCount = await User.countDocuments();
        const chatCount = await Chat.countDocuments();
        const messageCount = await Message.countDocuments();

        console.log(`📊 Counts - Users: ${userCount}, Chats: ${chatCount}, Messages: ${messageCount}`);

        const sampleUsers = await User.find().limit(5).select('username email createdAt');
        const sampleChats = await Chat.find().limit(5).select('name isGroup participants createdAt');
        const sampleMessages = await Message.find().limit(5).select('content sender chat createdAt');

        res.json({
            success: true,
            database: 'chatapp',
            collections: {
                users: {
                    count: userCount,
                    samples: sampleUsers
                },
                chats: {
                    count: chatCount,
                    samples: sampleChats
                },
                messages: {
                    count: messageCount,
                    samples: sampleMessages
                }
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Database debug error:', error);
        res.status(500).json({
            error: 'Database debug failed',
            message: error.message,
            stack: error.stack
        });
    }
});

app.get('/debug/users', async (req, res) => {
    try {
        const User = require('./server/models/User');
        const users = await User.find().select('-password');
        
        res.json({
            success: true,
            count: users.length,
            users: users,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Debug users error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/debug/chats', async (req, res) => {
    try {
        const Chat = require('./server/models/Chat');
        const chats = await Chat.find()
            .populate('participants', 'username email')
            .populate('admin', 'username');
        
        res.json({
            success: true,
            count: chats.length,
            chats: chats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Debug chats error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/debug/messages', async (req, res) => {
    try {
        const Message = require('./server/models/Message');
        const messages = await Message.find()
            .populate('sender', 'username')
            .populate('chat', 'name isGroup')
            .sort({ createdAt: -1 })
            .limit(20);
        
        res.json({
            success: true,
            count: messages.length,
            messages: messages,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Debug messages error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/debug/create-user', async (req, res) => {
    try {
        console.log('🔍 Create user debug endpoint hit with data:', req.body);
        
        const User = require('./server/models/User');
        
        const userData = {
            username: req.body.username || 'test_user_' + Date.now(),
            email: req.body.email || `test${Date.now()}@example.com`,
            password: req.body.password || 'test123'
        };

        console.log('📝 Creating user with data:', userData);

        const newUser = await User.create(userData);
        
        console.log('✅ User created successfully:', newUser.username);
        
        res.json({
            success: true,
            message: 'User created successfully',
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                createdAt: newUser.createdAt
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Create user error:', error);
        res.status(500).json({
            error: 'Failed to create user',
            message: error.message,
            code: error.code,
            details: error.errors
        });
    }
});

app.post('/debug/create-chat', async (req, res) => {
    try {
        console.log('🔍 Create chat debug endpoint hit');
        
        const Chat = require('./server/models/Chat');
        const User = require('./server/models/User');
        
        const users = await User.find().limit(2);
        
        if (users.length < 1) {
            return res.status(400).json({
                error: 'No users found. Create some users first.',
                message: 'Use POST /debug/create-user to create users'
            });
        }
        
        const chatData = {
            name: req.body.name || 'Debug Chat ' + Date.now(),
            isGroup: req.body.isGroup || false,
            participants: users.map(u => u._id),
            admin: users[0]._id
        };

        const newChat = await Chat.create(chatData);
        
        const populatedChat = await Chat.findById(newChat._id)
            .populate('participants', 'username email')
            .populate('admin', 'username');
        
        res.json({
            success: true,
            message: 'Chat created successfully',
            chat: populatedChat,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Create chat error:', error);
        res.status(500).json({
            error: 'Failed to create chat',
            message: error.message
        });
    }
});

app.post('/debug/create-message', async (req, res) => {
    try {
        console.log('🔍 Create message debug endpoint hit');
        
        const Message = require('./server/models/Message');
        const Chat = require('./server/models/Chat');
        const User = require('./server/models/User');
        
        const user = await User.findOne();
        const chat = await Chat.findOne();
        
        if (!user || !chat) {
            return res.status(400).json({
                error: 'No user or chat found',
                message: 'Create users and chats first'
            });
        }
        
        const messageData = {
            sender: user._id,
            chat: chat._id,
            content: req.body.content || 'Debug message ' + Date.now(),
            messageType: 'text',
            encrypted: false
        };

        const newMessage = await Message.create(messageData);
        
        const populatedMessage = await Message.findById(newMessage._id)
            .populate('sender', 'username')
            .populate('chat', 'name');
        
        res.json({
            success: true,
            message: 'Message created successfully',
            data: populatedMessage,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Create message error:', error);
        res.status(500).json({
            error: 'Failed to create message',
            message: error.message
        });
    }
});

// Load main routes
try {
    console.log('Loading main routes...');
    
    // Auth routes
    const authRoutes = require('./server/routes/auth');
    app.use('/api/auth', authRoutes);
    console.log('✅ Auth routes loaded');
    
    // Chat routes
    const chatRoutes = require('./server/routes/chat');
    app.use('/api/chat', chatRoutes);
    console.log('✅ Chat routes loaded');
    
    // User routes (includes friend functionality)
    const userRoutes = require('./server/routes/user');
    app.use('/api/users', userRoutes);
    console.log('✅ User routes loaded');

    // Group routes  
    const groupRoutes = require('./server/routes/group');
    app.use('/api/groups', groupRoutes);
    console.log('✅ Group routes loaded');
    
    // Optional additional routes (only if files exist)
    try {
        const searchRoutes = require('./server/routes/search');
        app.use('/api/search', searchRoutes);
        console.log('✅ Search routes loaded');
    } catch (error) {
        console.log('ℹ️ Search routes not found, skipping...');
    }
    
    try {
        const uploadRoutes = require('./server/routes/upload');
        app.use('/api/upload', uploadRoutes);
        console.log('✅ Upload routes loaded');
    } catch (error) {
        console.log('ℹ️ Upload routes not found, skipping...');
    }
    
    try {
        const passwordRoutes = require('./server/routes/password');
        app.use('/api/password', passwordRoutes);
        console.log('✅ Password routes loaded');
    } catch (error) {
        console.log('ℹ️ Password routes not found, skipping...');
    }
    
    // Friend routes (simplified redirect)
    const friendRoutes = require('./server/routes/friend');
    app.use('/api/friends', friendRoutes);
    console.log('✅ Friend routes loaded (redirect only)');
    
} catch (error) {
    console.error('Routes loading error:', error.message);
    console.error('Stack trace:', error.stack);
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Express error:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
    });
    
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ 
            error: 'Invalid JSON format',
            message: 'Please check your request body'
        });
    }
    
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: err.message,
        path: req.path,
        method: req.method
    });
});

// 404 handler
app.use('*', (req, res) => {
    console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ 
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method,
        availableRoutes: [
            'GET /',
            'GET /api/test',
            'GET /health',
            'GET /debug/database',
            'GET /debug/users',
            'GET /debug/chats', 
            'GET /debug/messages',
            'POST /debug/create-user',
            'POST /debug/create-chat',
            'POST /debug/create-message',
            'POST /api/auth/register',
            'POST /api/auth/login',
            'GET /api/auth/me',
            'GET /api/chat',
            'GET /api/users/search',
            'GET /api/users/friends',
            'GET /api/users/friend-requests',
            'POST /api/users/friend-request'
        ]
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`🚀 Chat Server running on port ${PORT}`);
    console.log(`📡 API URL: http://localhost:${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📋 Available endpoints:`);
    console.log(`   GET  / - Server info`);
    console.log(`   GET  /health - Health check`);
    console.log(`   GET  /api/test - API test`);
    console.log(`   GET  /debug/database - Database debug`);
    console.log(`   POST /api/auth/register - User registration`);
    console.log(`   POST /api/auth/login - User login`);
    console.log(`   GET  /api/users/friends - Get friends`);
    console.log(`   GET  /api/users/friend-requests - Get friend requests`);
    console.log(`   POST /api/users/friend-request - Send friend request`);
    
    // Setup Socket.IO
    try {
        console.log('Setting up Socket.IO...');
        const { handleConnection } = require('./server/utils/socketHandlers');
        const { Server } = require('socket.io');
        
        const io = new Server(server, {
            cors: {
                origin: process.env.CLIENT_URL || 'http://localhost:3000',
                methods: ['GET', 'POST'],
                credentials: true
            }
        });

        app.set('io', io);
        handleConnection(io);
        console.log('✅ Socket.IO setup complete');
        
    } catch (error) {
        console.error('❌ Socket.IO setup error:', error.message);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

module.exports = { app, server };

// server/middleware/auth.js - Production Version
const jwt = require('jsonwebtoken');
const User = require('../models/User');

console.log('Loading production auth middleware...');

const auth = async (req, res, next) => {
    try {
        console.log('🔐 Auth middleware called for:', req.method, req.path);

        // Get token from header
        const authHeader = req.header('Authorization');
        
        if (!authHeader) {
            console.log('❌ No authorization header found');
            return res.status(401).json({ 
                error: 'Access denied. No token provided.',
                hint: 'Include Authorization header with Bearer token'
            });
        }

        // Check if header starts with 'Bearer '
        if (!authHeader.startsWith('Bearer ')) {
            console.log('❌ Invalid authorization header format');
            return res.status(401).json({ 
                error: 'Access denied. Invalid token format.',
                hint: 'Use format: Authorization: Bearer <token>'
            });
        }

        // Extract token
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        if (!token) {
            console.log('❌ No token found after Bearer');
            return res.status(401).json({ 
                error: 'Access denied. No token provided.' 
            });
        }

        console.log('🔍 Token found, verifying...');

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token verified for user ID:', decoded.userId);

        // Get user from database
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            console.log('❌ User not found for token');
            return res.status(401).json({ 
                error: 'Access denied. User not found.' 
            });
        }

        // Add user to request object
        req.user = {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            isOnline: user.isOnline
        };

        console.log('✅ Auth middleware passed for user:', user.username);
        next();

    } catch (error) {
        console.error('❌ Auth middleware error:', error.message);

        // Handle different JWT errors
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                error: 'Access denied. Invalid token.',
                details: 'Token is malformed'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Access denied. Token expired.',
                details: 'Please login again'
            });
        }

        if (error.name === 'NotBeforeError') {
            return res.status(401).json({ 
                error: 'Access denied. Token not active yet.' 
            });
        }

        // General error
        res.status(500).json({ 
            error: 'Server error during authentication',
            message: error.message
        });
    }
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('ℹ️ No auth header found, continuing without auth');
            return next();
        }

        const token = authHeader.substring(7);
        
        if (!token) {
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (user) {
            req.user = {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                avatar: user.avatar
            };
            console.log('✅ Optional auth passed for user:', user.username);
        }

        next();

    } catch (error) {
        console.log('ℹ️ Optional auth failed, continuing without auth:', error.message);
        next(); // Continue even if auth fails
    }
};

console.log('✅ Production auth middleware loaded');

module.exports = { auth, optionalAuth };
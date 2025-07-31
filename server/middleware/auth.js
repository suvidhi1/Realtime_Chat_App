const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        console.log('🔐 Auth middleware - Headers:', req.headers.authorization);
        
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log('❌ No authorization header');
            return res.status(401).json({ error: 'Access token required' });
        }

        const token = authHeader.split(' ')[1]; // Bearer TOKEN
        if (!token) {
            console.log('❌ No token in authorization header');
            return res.status(401).json({ error: 'Access token required' });
        }

        console.log('🔍 Token received:', token.substring(0, 20) + '...');

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token decoded:', { userId: decoded.userId, username: decoded.username });

        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            console.log('❌ User not found for token');
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = { id: user._id, username: user.username, email: user.email };
        console.log('✅ User authenticated:', req.user.username);
        next();
    } catch (error) {
        console.error('❌ Auth middleware error:', error.message);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(401).json({ error: 'Authentication failed' });
    }
};

module.exports = { auth };

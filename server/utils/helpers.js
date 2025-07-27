// server/utils/helpers.js
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Generate random string
const generateRandomString = (length = 10) => {
    return crypto.randomBytes(length).toString('hex');
};

// Generate secure password reset token
const generateResetToken = () => {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    return { resetToken, hashedToken };
};

// Validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Generate JWT token with custom expiry
const generateJWT = (payload, expiresIn = '7d') => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

// Sanitize user input
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
};

// Format date for display
const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Calculate time ago
const timeAgo = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(date);
};

// Generate chat name for one-on-one chats
const generateChatName = (participants, currentUserId) => {
    const otherUser = participants.find(p => p._id.toString() !== currentUserId.toString());
    return otherUser ? otherUser.username : 'Unknown User';
};

// Paginate results
const paginate = (page = 1, limit = 20) => {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    return {
        skip,
        limit: parseInt(limit),
        page: parseInt(page)
    };
};

// Check if user is online (based on last seen)
const isUserOnline = (lastSeen, onlineStatus) => {
    if (!onlineStatus) return false;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return new Date(lastSeen) > fiveMinutesAgo;
};

// Generate unique filename
const generateUniqueFilename = (originalName) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const extension = originalName.split('.').pop();
    return `${timestamp}_${random}.${extension}`;
};

// File size formatter
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Validate file type
const isValidFileType = (mimetype, allowedTypes = []) => {
    if (allowedTypes.length === 0) return true;
    return allowedTypes.includes(mimetype);
};

// Rate limiting helper
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
    const requests = new Map();
    
    return (identifier) => {
        const now = Date.now();
        const windowStart = now - windowMs;
        
        // Clean old entries
        for (const [key, timestamps] of requests.entries()) {
            requests.set(key, timestamps.filter(t => t > windowStart));
            if (requests.get(key).length === 0) {
                requests.delete(key);
            }
        }
        
        // Check current requests
        const userRequests = requests.get(identifier) || [];
        if (userRequests.length >= max) {
            return false; // Rate limited
        }
        
        // Add current request
        userRequests.push(now);
        requests.set(identifier, userRequests);
        return true; // Allowed
    };
};

module.exports = {
    generateRandomString,
    generateResetToken,
    isValidEmail,
    generateJWT,
    sanitizeInput,
    formatDate,
    timeAgo,
    generateChatName,
    paginate,
    isUserOnline,
    generateUniqueFilename,
    formatFileSize,
    isValidFileType,
    createRateLimiter
};
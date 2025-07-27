// server/models/Message.js - ENHANCED VERSION
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    messageType: {
        type: String,
        enum: [
            'text',           // Regular text message
            'image',          // Image attachment
            'file',           // File attachment
            'system',         // System notifications (group changes, etc.)
            'call',           // Voice/video call notifications
            'location',       // Location sharing
            'contact'         // Contact sharing
        ],
        default: 'text'
    },
    encrypted: {
        type: Boolean,
        default: function() {
            // Don't encrypt system messages
            return this.messageType !== 'system';
        }
    },
    // File/media metadata
    fileData: {
        fileName: String,
        fileSize: Number,
        mimeType: String,
        url: String
    },
    // Call metadata
    callData: {
        duration: Number,
        callType: {
            type: String,
            enum: ['voice', 'video']
        },
        answered: Boolean
    },
    readBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],
    editedAt: {
        type: Date
    },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    // For message reactions (future feature)
    reactions: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        emoji: String,
        reactedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Index for faster queries
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ messageType: 1 });

// Virtual for checking if message is a system message
messageSchema.virtual('isSystemMessage').get(function() {
    return this.messageType === 'system';
});

module.exports = mongoose.model('Message', messageSchema);
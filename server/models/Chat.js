//models-chat.js
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        default: ''
    },
    isGroup: {
        type: Boolean,
        default: false
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    groupAvatar: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Create chat name for non-group chats
chatSchema.methods.generateChatName = function(currentUserId) {
    if (this.isGroup) return this.name;
    
    const otherParticipant = this.participants.find(
        participant => participant.toString() !== currentUserId.toString()
    );
    return otherParticipant?.username || 'Unknown User';
};

module.exports = mongoose.model('Chat', chatSchema);

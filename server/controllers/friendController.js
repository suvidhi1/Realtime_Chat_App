//controllers-friendController.js
// Complete friend system with requests, accept/decline
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

// Send friend request
const sendFriendRequest = async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    
    if (userId === currentUserId) {
        return res.status(400).json({ error: "Can't send friend request to yourself" });
    }
    
    const targetUser = await User.findById(userId);
    if (!targetUser) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if already friends
    if (targetUser.friends.includes(currentUserId)) {
        return res.status(400).json({ error: 'Already friends' });
    }
    
    // Check if request already sent
    const existingRequest = targetUser.friendRequests.find(
        req => req.from.toString() === currentUserId
    );
    
    if (existingRequest) {
        return res.status(400).json({ error: 'Friend request already sent' });
    }
    
    targetUser.friendRequests.push({ from: currentUserId });
    await targetUser.save();
    
    res.json({ success: true, message: 'Friend request sent' });
};

// Accept friend request
const acceptFriendRequest = async (req, res) => {
    const { requestId } = req.params;
    const currentUserId = req.user.id;
    
    const user = await User.findById(currentUserId);
    const requestIndex = user.friendRequests.findIndex(
        req => req._id.toString() === requestId
    );
    
    if (requestIndex === -1) {
        return res.status(404).json({ error: 'Friend request not found' });
    }
    
    const senderId = user.friendRequests[requestIndex].from;
    
    // Add each other as friends
    await User.findByIdAndUpdate(currentUserId, {
        $push: { friends: senderId },
        $pull: { friendRequests: { _id: requestId } }
    });
    
    await User.findByIdAndUpdate(senderId, {
        $push: { friends: currentUserId }
    });
    
    res.json({ success: true, message: 'Friend request accepted' });
};

// Decline friend request
const declineFriendRequest = async (req, res) => {
    const { requestId } = req.params;
    const currentUserId = req.user.id;
    
    await User.findByIdAndUpdate(currentUserId, {
        $pull: { friendRequests: { _id: requestId } }
    });
    
    res.json({ success: true, message: 'Friend request declined' });
};

// Remove friend
const removeFriend = async (req, res) => {
    const { friendId } = req.params;
    const currentUserId = req.user.id;
    
    await User.findByIdAndUpdate(currentUserId, {
        $pull: { friends: friendId }
    });
    
    await User.findByIdAndUpdate(friendId, {
        $pull: { friends: currentUserId }
    });
    
    res.json({ success: true, message: 'Friend removed' });
};

// Get friend requests
const getFriendRequests = async (req, res) => {
    const user = await User.findById(req.user.id)
        .populate('friendRequests.from', 'username avatar');
    
    res.json({ 
        success: true, 
        requests: user.friendRequests 
    });
};

module.exports = {
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    getFriendRequests
};
// server/controllers/userController.js - Production Version
const User = require('../models/User');

console.log('Loading production user controller...');

// Search users (for adding to chats/friends)
const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        const currentUserId = req.user.id;

        console.log(`📍 Searching users with query: "${query}" by user: ${req.user.username}`);

        if (!query || query.trim().length < 2) {
            return res.status(400).json({ 
                error: 'Search query must be at least 2 characters',
                received: query 
            });
        }

        const searchTerm = query.trim();

        // Search users by username or email (excluding current user)
        const users = await User.find({
            _id: { $ne: currentUserId },
            $or: [
                { username: { $regex: searchTerm, $options: 'i' } },
                { email: { $regex: searchTerm, $options: 'i' } }
            ]
        })
        .select('username email avatar isOnline lastSeen')
        .limit(20)
        .sort({ username: 1 });

        console.log(`✅ Found ${users.length} users matching search`);

        res.json({
            success: true,
            users,
            searchQuery: searchTerm,
            count: users.length
        });

    } catch (error) {
        console.error('❌ Search users error:', error);
        res.status(500).json({ 
            error: 'Failed to search users',
            message: error.message 
        });
    }
};

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        console.log(`📍 Getting profile for user ID: ${userId} requested by: ${req.user.username}`);

        const user = await User.findById(userId)
            .select('username email avatar isOnline lastSeen friends createdAt')
            .populate('friends', 'username avatar isOnline');

        if (!user) {
            console.log('❌ User not found');
            return res.status(404).json({ 
                error: 'User not found' 
            });
        }

        // Check if requesting own profile or other user's profile
        const isOwnProfile = userId === currentUserId;

        const profileData = {
            id: user._id,
            username: user.username,
            avatar: user.avatar,
            isOnline: user.isOnline,
            lastSeen: user.lastSeen,
            createdAt: user.createdAt,
            isOwnProfile
        };

        // Include additional info for own profile
        if (isOwnProfile) {
            profileData.email = user.email;
            profileData.friends = user.friends;
            profileData.friendCount = user.friends.length;
        } else {
            // For other users, check if they are friends
            const isFriend = user.friends.some(friend => 
                friend._id.toString() === currentUserId
            );
            profileData.isFriend = isFriend;
            profileData.friendCount = user.friends.length;
        }

        console.log(`✅ Profile retrieved for: ${user.username}`);

        res.json({
            success: true,
            user: profileData
        });

    } catch (error) {
        console.error('❌ Get user profile error:', error);
        res.status(500).json({ 
            error: 'Failed to get user profile',
            message: error.message 
        });
    }
};

// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, avatar } = req.body;

        console.log(`📍 Updating profile for user: ${req.user.username}`);

        const updateData = {};
        
        if (username && username.trim()) {
            updateData.username = username.trim();
        }
        
        if (avatar !== undefined) {
            updateData.avatar = avatar;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                error: 'No valid fields to update',
                allowedFields: ['username', 'avatar']
            });
        }

        // Check if username is already taken (if username is being updated)
        if (updateData.username) {
            const existingUser = await User.findOne({
                username: { $regex: `^${updateData.username}$`, $options: 'i' },
                _id: { $ne: userId }
            });

            if (existingUser) {
                return res.status(400).json({
                    error: 'Username already taken'
                });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        console.log(`✅ Profile updated for: ${updatedUser.username}`);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error('❌ Update profile error:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                error: 'Validation failed',
                details: validationErrors
            });
        }

        res.status(500).json({ 
            error: 'Failed to update profile',
            message: error.message 
        });
    }
};

// Get all users (admin/debug purpose)
const getAllUsers = async (req, res) => {
    try {
        const currentUserId = req.user.id;

        console.log(`📍 Getting all users requested by: ${req.user.username}`);

        const users = await User.find({ _id: { $ne: currentUserId } })
            .select('username email avatar isOnline lastSeen createdAt')
            .sort({ username: 1 });

        console.log(`✅ Retrieved ${users.length} users`);

        res.json({
            success: true,
            users,
            count: users.length,
            requestedBy: req.user.username
        });

    } catch (error) {
        console.error('❌ Get all users error:', error);
        res.status(500).json({ 
            error: 'Failed to get users',
            message: error.message 
        });
    }
};

console.log('✅ Production user controller loaded');

module.exports = {
    searchUsers,
    getUserProfile,
    updateUserProfile,
    getAllUsers
};
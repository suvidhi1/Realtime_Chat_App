// server/controllers/groupController.js - Group Chat Management
const Chat = require('../models/Chat');
const User = require('../models/User');
const Message = require('../models/Message');

console.log('Loading group chat controller...');

// Add members to group chat
const addMembersToGroup = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { userIds } = req.body;
        const currentUserId = req.user.id;

        console.log(`📍 Adding members to group ${chatId} by ${req.user.username}`);

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                error: 'User IDs array is required'
            });
        }

        // Get the chat and verify user is admin
        const chat = await Chat.findById(chatId)
            .populate('participants', 'username')
            .populate('admin', 'username');

        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        if (!chat.isGroup) {
            return res.status(400).json({ error: 'Cannot add members to non-group chat' });
        }

        if (chat.admin._id.toString() !== currentUserId) {
            return res.status(403).json({ error: 'Only group admin can add members' });
        }

        // Verify all users exist
        const usersToAdd = await User.find({
            _id: { $in: userIds }
        }).select('_id username');

        if (usersToAdd.length !== userIds.length) {
            return res.status(400).json({ error: 'One or more users not found' });
        }

        // Filter out users already in the group
        const currentParticipantIds = chat.participants.map(p => p._id.toString());
        const newMemberIds = userIds.filter(userId => !currentParticipantIds.includes(userId));

        if (newMemberIds.length === 0) {
            return res.status(400).json({ error: 'All users are already group members' });
        }

        // Add new members
        chat.participants.push(...newMemberIds);
        await chat.save();

        // Create system message about added members
        const addedUsers = usersToAdd.filter(u => newMemberIds.includes(u._id.toString()));
        const addedUsernames = addedUsers.map(u => u.username).join(', ');

        const systemMessage = await Message.create({
            sender: currentUserId,
            chat: chatId,
            content: `${req.user.username} added ${addedUsernames} to the group`,
            messageType: 'system',
            encrypted: false
        });

        // Update chat timestamp
        await Chat.findByIdAndUpdate(chatId, {
            lastMessage: systemMessage._id,
            updatedAt: new Date()
        });

        // Get updated chat
        const updatedChat = await Chat.findById(chatId)
            .populate('participants', 'username avatar isOnline')
            .populate('admin', 'username');

        // Emit to all group members
        const io = req.app.get('io');
        if (io) {
            updatedChat.participants.forEach(participant => {
                io.to(participant._id.toString()).emit('groupMembersAdded', {
                    chatId,
                    addedBy: req.user.username,
                    newMembers: addedUsers.map(u => ({
                        id: u._id,
                        username: u.username
                    }))
                });
            });
        }

        console.log(`✅ Added ${newMemberIds.length} members to group`);

        res.json({
            success: true,
            message: `Added ${newMemberIds.length} members to group`,
            chat: updatedChat,
            addedMembers: addedUsers
        });

    } catch (error) {
        console.error('❌ Add members error:', error);
        res.status(500).json({ 
            error: 'Failed to add members',
            message: error.message 
        });
    }
};

// Remove member from group chat
const removeMemberFromGroup = async (req, res) => {
    try {
        const { chatId, userId } = req.params;
        const currentUserId = req.user.id;

        console.log(`📍 Removing member ${userId} from group ${chatId} by ${req.user.username}`);

        // Get the chat and verify user is admin
        const chat = await Chat.findById(chatId)
            .populate('participants', 'username')
            .populate('admin', 'username');

        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        if (!chat.isGroup) {
            return res.status(400).json({ error: 'Cannot remove members from non-group chat' });
        }

        if (chat.admin._id.toString() !== currentUserId) {
            return res.status(403).json({ error: 'Only group admin can remove members' });
        }

        // Cannot remove admin
        if (userId === chat.admin._id.toString()) {
            return res.status(400).json({ error: 'Cannot remove group admin' });
        }

        // Check if user is in the group
        const isParticipant = chat.participants.some(p => p._id.toString() === userId);
        if (!isParticipant) {
            return res.status(400).json({ error: 'User is not a group member' });
        }

        // Get user being removed
        const userToRemove = await User.findById(userId).select('username');
        if (!userToRemove) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Remove member
        chat.participants = chat.participants.filter(p => p._id.toString() !== userId);
        await chat.save();

        // Create system message
        const systemMessage = await Message.create({
            sender: currentUserId,
            chat: chatId,
            content: `${req.user.username} removed ${userToRemove.username} from the group`,
            messageType: 'system',
            encrypted: false
        });

        // Update chat timestamp
        await Chat.findByIdAndUpdate(chatId, {
            lastMessage: systemMessage._id,
            updatedAt: new Date()
        });

        // Emit to all group members and removed user
        const io = req.app.get('io');
        if (io) {
            // Notify remaining members
            chat.participants.forEach(participant => {
                io.to(participant._id.toString()).emit('groupMemberRemoved', {
                    chatId,
                    removedBy: req.user.username,
                    removedUser: {
                        id: userId,
                        username: userToRemove.username
                    }
                });
            });

            // Notify removed user
            io.to(userId).emit('removedFromGroup', {
                chatId,
                chatName: chat.name,
                removedBy: req.user.username
            });
        }

        console.log(`✅ Removed member ${userToRemove.username} from group`);

        res.json({
            success: true,
            message: `Removed ${userToRemove.username} from group`,
            removedUser: {
                id: userId,
                username: userToRemove.username
            }
        });

    } catch (error) {
        console.error('❌ Remove member error:', error);
        res.status(500).json({ 
            error: 'Failed to remove member',
            message: error.message 
        });
    }
};

// Update group info (name, avatar)
const updateGroupInfo = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { name, groupAvatar } = req.body;
        const currentUserId = req.user.id;

        console.log(`📍 Updating group info for ${chatId} by ${req.user.username}`);

        // Get the chat and verify user is admin
        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        if (!chat.isGroup) {
            return res.status(400).json({ error: 'Cannot update non-group chat info' });
        }

        if (chat.admin.toString() !== currentUserId) {
            return res.status(403).json({ error: 'Only group admin can update group info' });
        }

        const updateData = {};
        let changes = [];

        if (name && name.trim() !== chat.name) {
            updateData.name = name.trim();
            changes.push(`changed group name to "${name.trim()}"`);
        }

        if (groupAvatar !== undefined && groupAvatar !== chat.groupAvatar) {
            updateData.groupAvatar = groupAvatar;
            changes.push('updated group avatar');
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No changes provided' });
        }

        // Update chat
        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { ...updateData, updatedAt: new Date() },
            { new: true }
        ).populate('participants', 'username avatar isOnline')
         .populate('admin', 'username');

        // Create system message about changes
        if (changes.length > 0) {
            const systemMessage = await Message.create({
                sender: currentUserId,
                chat: chatId,
                content: `${req.user.username} ${changes.join(' and ')}`,
                messageType: 'system',
                encrypted: false
            });

            updatedChat.lastMessage = systemMessage._id;
            await updatedChat.save();
        }

        // Emit to all group members
        const io = req.app.get('io');
        if (io) {
            updatedChat.participants.forEach(participant => {
                io.to(participant._id.toString()).emit('groupInfoUpdated', {
                    chatId,
                    updatedBy: req.user.username,
                    changes: updateData,
                    newName: updatedChat.name,
                    newAvatar: updatedChat.groupAvatar
                });
            });
        }

        console.log(`✅ Group info updated: ${changes.join(', ')}`);

        res.json({
            success: true,
            message: 'Group info updated successfully',
            chat: updatedChat,
            changes: changes
        });

    } catch (error) {
        console.error('❌ Update group info error:', error);
        res.status(500).json({ 
            error: 'Failed to update group info',
            message: error.message 
        });
    }
};

// Leave group chat
const leaveGroup = async (req, res) => {
    try {
        const { chatId } = req.params;
        const currentUserId = req.user.id;

        console.log(`📍 User ${req.user.username} leaving group ${chatId}`);

        // Get the chat
        const chat = await Chat.findById(chatId)
            .populate('participants', 'username')
            .populate('admin', 'username');

        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        if (!chat.isGroup) {
            return res.status(400).json({ error: 'Cannot leave non-group chat' });
        }

        // Check if user is in the group
        const isParticipant = chat.participants.some(p => p._id.toString() === currentUserId);
        if (!isParticipant) {
            return res.status(400).json({ error: 'You are not a member of this group' });
        }

        // If admin is leaving, need to transfer admin rights or delete group
        if (chat.admin._id.toString() === currentUserId) {
            const remainingParticipants = chat.participants.filter(p => p._id.toString() !== currentUserId);
            
            if (remainingParticipants.length === 0) {
                // Delete group if admin is the last member
                await Chat.findByIdAndDelete(chatId);
                await Message.deleteMany({ chat: chatId });
                
                console.log(`✅ Group deleted as admin was the last member`);
                
                return res.json({
                    success: true,
                    message: 'Group deleted as you were the last member',
                    groupDeleted: true
                });
            } else {
                // Transfer admin to first remaining participant
                const newAdmin = remainingParticipants[0];
                chat.admin = newAdmin._id;
                
                // Create system message about admin transfer
                const systemMessage = await Message.create({
                    sender: currentUserId,
                    chat: chatId,
                    content: `${req.user.username} left the group. ${newAdmin.username} is now the admin.`,
                    messageType: 'system',
                    encrypted: false
                });

                chat.lastMessage = systemMessage._id;
            }
        } else {
            // Create system message about leaving
            const systemMessage = await Message.create({
                sender: currentUserId,
                chat: chatId,
                content: `${req.user.username} left the group`,
                messageType: 'system',
                encrypted: false
            });

            chat.lastMessage = systemMessage._id;
        }

        // Remove user from participants
        chat.participants = chat.participants.filter(p => p._id.toString() !== currentUserId);
        chat.updatedAt = new Date();
        await chat.save();

        // Emit to remaining group members
        const io = req.app.get('io');
        if (io) {
            chat.participants.forEach(participant => {
                io.to(participant._id.toString()).emit('userLeftGroup', {
                    chatId,
                    leftUser: {
                        id: currentUserId,
                        username: req.user.username
                    },
                    newAdmin: chat.admin.toString() !== currentUserId ? null : chat.participants[0]?.username
                });
            });
        }

        console.log(`✅ User ${req.user.username} left group successfully`);

        res.json({
            success: true,
            message: 'Left group successfully'
        });

    } catch (error) {
        console.error('❌ Leave group error:', error);
        res.status(500).json({ 
            error: 'Failed to leave group',
            message: error.message 
        });
    }
};

console.log('✅ Group chat controller loaded');

module.exports = {
    addMembersToGroup,
    removeMemberFromGroup,
    updateGroupInfo,
    leaveGroup
};
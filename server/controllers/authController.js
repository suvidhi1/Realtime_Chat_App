// server/controllers/authController.js - Production Version
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

console.log('Loading production auth controller...');

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};

// Register new user
const registerUser = async (req, res) => {
    try {
        console.log('📝 Register endpoint hit with data:', {
            username: req.body.username,
            email: req.body.email
        });

        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({
                error: 'All fields are required',
                required: ['username', 'email', 'password']
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                error: 'Password must be at least 6 characters long'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { username: username.toLowerCase() }
            ]
        });

        if (existingUser) {
            const field = existingUser.email === email.toLowerCase() ? 'email' : 'username';
            return res.status(400).json({
                error: `User with this ${field} already exists`
            });
        }

        // Create new user (password will be hashed by mongoose pre-save hook)
        const newUser = await User.create({
            username: username.trim(),
            email: email.toLowerCase().trim(),
            password
        });

        // Generate JWT token
        const token = generateToken(newUser._id);

        console.log('✅ User registered successfully:', newUser.username);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                avatar: newUser.avatar,
                isOnline: newUser.isOnline,
                createdAt: newUser.createdAt
            }
        });

    } catch (error) {
        console.error('❌ Registration error:', error);
        
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                error: 'Validation failed',
                details: validationErrors
            });
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                error: `${field} already exists`
            });
        }

        res.status(500).json({
            error: 'Server error during registration'
        });
    }
};

// Login user
const loginUser = async (req, res) => {
    try {
        console.log('🔐 Login endpoint hit for:', req.body.email);

        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required'
            });
        }

        // Find user by email
        const user = await User.findOne({ 
            email: email.toLowerCase().trim() 
        }).select('+password'); // Include password for comparison

        if (!user) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        // Update user online status
        await User.findByIdAndUpdate(user._id, {
            isOnline: true,
            lastSeen: new Date()
        });

        // Generate JWT token
        const token = generateToken(user._id);

        console.log('✅ User logged in successfully:', user.username);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                isOnline: true,
                lastSeen: new Date(),
                friends: user.friends
            }
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            error: 'Server error during login'
        });
    }
};

// Get current user
const getCurrentUser = async (req, res) => {
    try {
        console.log('👤 Get current user for ID:', req.user.id);

        const user = await User.findById(req.user.id)
            .populate('friends', 'username avatar isOnline lastSeen')
            .select('-password');

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                isOnline: user.isOnline,
                lastSeen: user.lastSeen,
                friends: user.friends,
                friendRequests: user.friendRequests
            }
        });

    } catch (error) {
        console.error('❌ Get current user error:', error);
        res.status(500).json({
            error: 'Server error fetching user data'
        });
    }
};

// Logout user
const logoutUser = async (req, res) => {
    try {
        console.log('👋 Logout user:', req.user.id);

        // Update user offline status
        await User.findByIdAndUpdate(req.user.id, {
            isOnline: false,
            lastSeen: new Date()
        });

        res.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('❌ Logout error:', error);
        res.status(500).json({
            error: 'Server error during logout'
        });
    }
};

// Refresh token
const refreshToken = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        const newToken = generateToken(user._id);

        res.json({
            success: true,
            token: newToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                isOnline: user.isOnline
            }
        });

    } catch (error) {
        console.error('❌ Refresh token error:', error);
        res.status(500).json({
            error: 'Server error refreshing token'
        });
    }
};

console.log('✅ Production auth controller loaded');

module.exports = {
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser,
    refreshToken
};
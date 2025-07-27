//controllers-passwordController.js
// Password reset functionality
const User = require('../models/User');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { generateResetToken } = require('../utils/helpers');

// Request password reset
const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const { resetToken, hashedToken } = generateResetToken();
    
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();
    
    // In production, send email with resetToken
    console.log('Password reset token:', resetToken);
    
    res.json({ 
        success: true, 
        message: 'Password reset token sent',
        // Remove this in production:
        resetToken 
    });
};

// Reset password
const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) {
        return res.status(400).json({ error: 'Token is invalid or has expired' });
    }
    
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    
    res.json({ success: true, message: 'Password reset successful' });
};

module.exports = {
    requestPasswordReset,
    resetPassword
};
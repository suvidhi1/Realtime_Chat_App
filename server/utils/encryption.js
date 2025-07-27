//utils-encryption.js
const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const KEY = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key-change-this', 'salt', 32);

// Encrypt message
const encryptMessage = (text) => {
    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipherGCM(ALGORITHM, KEY, iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag();
        
        return {
            encrypted,
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex')
        };
    } catch (error) {
        console.error('Encryption error:', error);
        return { encrypted: text, iv: '', authTag: '' }; // Fallback to plain text
    }
};

// Decrypt message
const decryptMessage = (encryptedData) => {
    try {
        const { encrypted, iv, authTag } = encryptedData;
        
        if (!iv || !authTag) {
            return encrypted; // Return as-is if not properly encrypted
        }
        
        const decipher = crypto.createDecipherGCM(ALGORITHM, KEY, Buffer.from(iv, 'hex'));
        decipher.setAuthTag(Buffer.from(authTag, 'hex'));
        
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        return encryptedData.encrypted; // Fallback to encrypted text
    }
};

module.exports = {
    encryptMessage,
    decryptMessage
};
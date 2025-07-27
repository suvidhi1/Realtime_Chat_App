//middleware-upload.js
// File upload middleware using multer
const multer = require('multer');
const path = require('path');
const { generateUniqueFilename } = require('../utils/helpers');

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/';
        
        if (file.fieldname === 'avatar') {
            uploadPath += 'avatars/';
        } else if (file.fieldname === 'groupAvatar') {
            uploadPath += 'groups/';
        } else {
            uploadPath += 'files/';
        }
        
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = generateUniqueFilename(file.originalname);
        cb(null, uniqueName);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = {
        avatar: ['image/jpeg', 'image/png', 'image/gif'],
        groupAvatar: ['image/jpeg', 'image/png', 'image/gif'],
        file: [] // Allow all types for general files
    };
    
    const allowed = allowedTypes[file.fieldname] || [];
    
    if (allowed.length === 0 || allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type for ${file.fieldname}`), false);
    }
};

// Configure multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

module.exports = upload;
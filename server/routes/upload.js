// server/routes/upload.js - File Upload Routes
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { auth } = require('../middleware/auth');
const path = require('path');
const fs = require('fs').promises;
const { formatFileSize } = require('../utils/helpers');

console.log('🔧 Loading file upload routes...');

// Apply authentication to all upload routes
router.use(auth);

// Upload avatar (profile picture)
router.post('/avatar', upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const User = require('../models/User');
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;

        // Update user's avatar in database
        await User.findByIdAndUpdate(req.user.id, { avatar: avatarUrl });

        console.log(`✅ Avatar uploaded for user: ${req.user.username}`);

        res.json({
            success: true,
            message: 'Avatar uploaded successfully',
            avatar: avatarUrl,
            fileInfo: {
                originalName: req.file.originalname,
                fileName: req.file.filename,
                size: formatFileSize(req.file.size),
                mimeType: req.file.mimetype
            }
        });

    } catch (error) {
        console.error('Avatar upload error:', error);
        res.status(500).json({ error: 'Failed to upload avatar' });
    }
});

// Upload group avatar
router.post('/group-avatar', upload.single('groupAvatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const avatarUrl = `/uploads/groups/${req.file.filename}`;

        console.log(`✅ Group avatar uploaded by user: ${req.user.username}`);

        res.json({
            success: true,
            message: 'Group avatar uploaded successfully',
            groupAvatar: avatarUrl,
            fileInfo: {
                originalName: req.file.originalname,
                fileName: req.file.filename,
                size: formatFileSize(req.file.size),
                mimeType: req.file.mimetype
            }
        });

    } catch (error) {
        console.error('Group avatar upload error:', error);
        res.status(500).json({ error: 'Failed to upload group avatar' });
    }
});

// Upload file for chat (documents, images, etc.)
router.post('/file', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileUrl = `/uploads/files/${req.file.filename}`;

        console.log(`✅ File uploaded by user: ${req.user.username}`);

        res.json({
            success: true,
            message: 'File uploaded successfully',
            file: {
                url: fileUrl,
                originalName: req.file.originalname,
                fileName: req.file.filename,
                size: req.file.size,
                sizeFormatted: formatFileSize(req.file.size),
                mimeType: req.file.mimetype,
                uploadedBy: req.user.username,
                uploadedAt: new Date()
            }
        });

    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

// Upload multiple files
router.post('/multiple', upload.array('files', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const uploadedFiles = req.files.map(file => ({
            url: `/uploads/files/${file.filename}`,
            originalName: file.originalname,
            fileName: file.filename,
            size: file.size,
            sizeFormatted: formatFileSize(file.size),
            mimeType: file.mimetype
        }));

        console.log(`✅ ${req.files.length} files uploaded by user: ${req.user.username}`);

        res.json({
            success: true,
            message: `${req.files.length} files uploaded successfully`,
            files: uploadedFiles,
            uploadedBy: req.user.username,
            uploadedAt: new Date()
        });

    } catch (error) {
        console.error('Multiple files upload error:', error);
        res.status(500).json({ error: 'Failed to upload files' });
    }
});

// Get file info
router.get('/info/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(__dirname, '../../uploads/files', filename);

        const stats = await fs.stat(filePath);
        
        res.json({
            success: true,
            file: {
                filename,
                size: stats.size,
                sizeFormatted: formatFileSize(stats.size),
                createdAt: stats.birthtime,
                modifiedAt: stats.mtime
            }
        });

    } catch (error) {
        if (error.code === 'ENOENT') {
            return res.status(404).json({ error: 'File not found' });
        }
        res.status(500).json({ error: 'Failed to get file info' });
    }
});

// Delete uploaded file
router.delete('/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        
        // Check multiple possible locations
        const possiblePaths = [
            path.join(__dirname, '../../uploads/files', filename),
            path.join(__dirname, '../../uploads/avatars', filename),
            path.join(__dirname, '../../uploads/groups', filename)
        ];

        let fileDeleted = false;
        for (const filePath of possiblePaths) {
            try {
                await fs.unlink(filePath);
                fileDeleted = true;
                console.log(`✅ File deleted: ${filename} by user: ${req.user.username}`);
                break;
            } catch (error) {
                // Continue to next path
                continue;
            }
        }

        if (!fileDeleted) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.json({
            success: true,
            message: 'File deleted successfully',
            filename
        });

    } catch (error) {
        console.error('File deletion error:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

// Route info endpoint
router.get('/', (req, res) => {
    res.json({
        message: 'File Upload API',
        user: req.user.username,
        endpoints: [
            'POST /avatar - Upload profile avatar (field: avatar)',
            'POST /group-avatar - Upload group avatar (field: groupAvatar)', 
            'POST /file - Upload single file (field: file)',
            'POST /multiple - Upload multiple files (field: files, max: 5)',
            'GET /info/:filename - Get file information',
            'DELETE /:filename - Delete uploaded file'
        ],
        limits: {
            fileSize: '10MB per file',
            multipleFiles: 'Maximum 5 files at once',
            allowedTypes: {
                avatar: ['image/jpeg', 'image/png', 'image/gif'],
                groupAvatar: ['image/jpeg', 'image/png', 'image/gif'],
                file: 'All file types allowed'
            }
        },
        note: 'All routes require JWT authentication'
    });
});

console.log('✅ File upload routes loaded');

module.exports = router;
// server/middleware/validation.js
const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};

// User validation rules
const validateRegister = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be 3-30 characters')
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Username can only contain letters, numbers, _ and -'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    handleValidation
];

const validateLogin = [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    handleValidation
];

// Chat validation rules
const validateCreateChat = [
    body('participantIds')
        .isArray({ min: 1 })
        .withMessage('At least one participant required'),
    body('isGroup').optional().isBoolean(),
    body('name').optional().trim().isLength({ max: 100 }),
    handleValidation
];

const validateSendMessage = [
    body('content')
        .trim()
        .notEmpty()
        .withMessage('Message content is required')
        .isLength({ max: 5000 })
        .withMessage('Message too long'),
    body('messageType').optional().isIn(['text', 'image', 'file', 'system']),
    body('replyTo').optional().isMongoId(),
    handleValidation
];

// Group validation rules
const validateAddMembers = [
    body('userIds')
        .isArray({ min: 1 })
        .withMessage('At least one user ID required'),
    body('userIds.*').isMongoId().withMessage('Invalid user ID'),
    handleValidation
];

const validateUpdateGroup = [
    body('name').optional().trim().isLength({ min: 1, max: 100 }),
    body('groupAvatar').optional().isURL().withMessage('Invalid avatar URL'),
    handleValidation
];

// Parameter validation
const validateMongoId = [
    param('id').isMongoId().withMessage('Invalid ID format'),
    handleValidation
];

const validateChatId = [
    param('chatId').isMongoId().withMessage('Invalid chat ID'),
    handleValidation
];

const validateUserId = [
    param('userId').isMongoId().withMessage('Invalid user ID'),
    handleValidation
];

// Query validation
const validateSearch = [
    query('query')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Search query must be 2-50 characters'),
    handleValidation
];

const validatePagination = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
    handleValidation
];

module.exports = {
    validateRegister,
    validateLogin,
    validateCreateChat,
    validateSendMessage,
    validateAddMembers,
    validateUpdateGroup,
    validateMongoId,
    validateChatId,
    validateUserId,
    validateSearch,
    validatePagination,
    handleValidation
};
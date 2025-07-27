// create-upload-dirs.js - Run this script to create necessary directories
const fs = require('fs');
const path = require('path');

const directories = [
    'uploads',
    'uploads/avatars',
    'uploads/groups', 
    'uploads/files'
];

console.log('Creating upload directories...');

directories.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
    } else {
        console.log(`ℹ️  Directory already exists: ${dir}`);
    }
});
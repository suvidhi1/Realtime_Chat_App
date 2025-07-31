# 💬 Realtime Chat App

A modern, feature-rich real-time chat application built with React, TypeScript, Material-UI, and Socket.IO.

![Chat App](https://img.shields.io/badge/Status-Active-brightgreen)
![React](https://img.shields.io/badge/React-18.x-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Material-UI](https://img.shields.io/badge/Material--UI-5.x-blue)

## 📖 Overview

Realtime Chat App is a comprehensive messaging platform that enables users to communicate instantly through direct messages and group chats. The application features a modern Material Design interface with support for both light and dark themes, real-time messaging with Socket.IO, file sharing capabilities, and a robust friend system.

## ✨ Features

### 🔐 Authentication
- User registration and login
- JWT-based authentication
- Secure profile management
- Avatar upload support

### 💬 Messaging
- Real-time messaging with Socket.IO
- Direct messages between users
- Group chat functionality
- Message reactions with emojis
- Typing indicators
- Message editing and deletion
- Reply to messages
- Read receipts

### 👥 Social Features
- Friend request system
- Add friends by username
- Accept/decline friend requests
- Online status indicators
- Last seen timestamps

### 📁 File Sharing
- Image upload with preview
- File attachments (PDF, DOC, TXT, ZIP)
- Upload progress indicators
- File size validation (10MB limit)

### 🎨 UI/UX
- Light/Dark theme toggle
- Multiple color variants (Blue, Purple, Green, Orange)
- Auto-detect system theme
- Responsive design for all devices
- Smooth animations and transitions
- Full-height optimized layout

### 🔧 Advanced Features
- Message search and filtering
- User presence system
- Notification system
- Chat customization
- Debug tools for development

## 🛠️ Tech Stack

**Frontend:**
- React 18.x with TypeScript
- Material-UI (MUI) for components
- Zustand for state management
- Socket.IO Client for real-time communication
- React Hot Toast for notifications
- Date-fns for date formatting

**Backend:**
- Node.js with Express
- Socket.IO server
- MongoDB for data storage
- JWT for authentication
- Multer for file uploads

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB

### Installation

1. **Clone the repository:**
- git clone https://github.com/suvidhi1/Realtime_Chat_App.git
- cd Realtime_Chat_App

2. **Install dependencies**
- cd chat-frontend
- npm install

3. **Install additional packages**
- npm install @react-spring/web zustand date-fns

4. **Environment setup**
- Create `.env` file:
- REACT_APP_API_URL=http://localhost:5000/api
- REACT_APP_SOCKET_URL=http://localhost:5000

5. **Start development server**
- npm start


const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Message = require('../models/Message');

// GET /api/messages/:chatId - Fetch messages for a chat
router.get("/:chatId", async (req, res) => {
  try {
    const chatId = new mongoose.Types.ObjectId(req.params.chatId); // ✅ Fix here
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "username")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("❌ Error fetching messages:", error.message);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

module.exports = router;

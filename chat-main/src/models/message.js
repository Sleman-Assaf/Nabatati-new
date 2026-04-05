
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    //conversationId -> conversationId that the message belongs to.
  consultationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  senderId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['text', 'image'], 
    required: true,
  },
  content: {
    type: String,
    required: true, 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});
MessageSchema.index({ consultationId: 1 });

module.exports = mongoose.model('Message', MessageSchema);

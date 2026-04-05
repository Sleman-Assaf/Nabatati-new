
// This file defines the schema for the conversation model in MongoDB using Mongoose.

const mongoose = require('mongoose');

const ConsultationSchema = new mongoose.Schema({
  userId: {
    type: Number ,
    required: true,
  },
  engineerId: {
    type: Number,
    required: null, ///
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'closed', 'expired'],
    default: 'pending',
  },
  reminderSent: {
    type: Boolean,
    default: false,
  },
  closedAt: {
    type: Date,
    default: null, 
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  updatedAt: {
    type: Date,
    default: null,
  },
  messages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    }
  ],
  newMessagesForUser: { type: Boolean, default: false },
  newMessagesForEngineer: { type: Boolean, default: false }
},{ timestamps: true });

ConsultationSchema.index({ status: 1 });
ConsultationSchema.index({ createdAt: 1 });
ConsultationSchema.index({ closedAt: 1 });
ConsultationSchema.index({ reminderSent: 1 });

module.exports = mongoose.model('Conversation', ConsultationSchema);



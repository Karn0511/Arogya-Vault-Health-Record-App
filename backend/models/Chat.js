const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    messages: [
        {
            senderId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            senderRole: {
                type: String,
                enum: ['PATIENT', 'DOCTOR']
            },
            message: {
                type: String,
                required: true
            },
            attachments: [String], // URLs of files/images
            timestamp: {
                type: Date,
                default: Date.now
            },
            isRead: {
                type: Boolean,
                default: false
            },
            readAt: Date
        }
    ],
    lastMessage: String,
    lastMessageTime: Date,
    status: {
        type: String,
        enum: ['ACTIVE', 'ARCHIVED', 'CLOSED'],
        default: 'ACTIVE'
    },
    unreadCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Chat', chatSchema);

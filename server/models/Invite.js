// models/Invite.js

const mongoose = require('mongoose');

const InviteSchema = new mongoose.Schema({
    recipient_email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true,
        unique: true, // Prevent duplicate invites
        match: [/.+\@.+\..+/, "Please fill a valid email address"]
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'accepted', 'declined', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: true 
});

module.exports = mongoose.model('Invite', InviteSchema);
const mongoose = require('mongoose');

const timeCapsuleSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    mediaUrls: [{
        type: String
    }],
    unlockDate: {
        type: Date,
        required: true
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['locked', 'unlocked'],
        default: 'locked'
    }
}, {
    timestamps: true
});
/ Instance method to check if capsule is ready to unlock/
timeCapsuleSchema.methods.isReadyToUnlock = function() {
    return new Date() >= this.unlockDate;
};

// Static method to find all public capsules
timeCapsuleSchema.statics.findPublicCapsules = function() {
    return this.find({ isPublic: true }).populate('creator');
};

// Static method to find user's capsules
timeCapsuleSchema.statics.findUserCapsules = function(userId) {
    return this.find({ creator: userId }).sort({ unlockDate: 'asc' });
};
module.exports = mongoose.model('timeCapsule', timeCapsuleSchema);

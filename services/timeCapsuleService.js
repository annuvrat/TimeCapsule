const TimeCapsule = require('../models/timeCapsule');

class TimeCapsuleService {
    async createCapsule(capsuleData, userId) {
        const capsule = await TimeCapsule.create({
            ...capsuleData,
            creator: userId
        });
        return capsule;
    }
    async checkAndUpdateStatus() {
        const now = new Date();
        // Update all capsules that should be unlocked
        await TimeCapsule.updateMany(
            {
                status: 'locked',
                unlockDate: { $lte: now }
            },
            {
                status: 'unlocked'
            }
        );
    }

    async getCapsule(capsuleId, userId) {
        const capsule = await TimeCapsule.findById(capsuleId)
            .populate('creator', 'username email')
            .populate('recipients', 'username email');

        if (!capsule) {
            throw new Error('Capsule not found');
        }

        // Check if user has access to capsule
        if (!this.hasAccess(capsule, userId)) {
            throw new Error('Access denied');
        }

        // Check if capsule is unlocked
        if (capsule.status === 'locked' && new Date() < capsule.unlockDate) {
            throw new Error('Capsule is still locked');
        }

        return capsule;
    }

    async getUserCapsules(userId) {
        return TimeCapsule.find({
            $or: [
                { creator: userId },
                { recipients: userId }
            ]
        }).populate('creator', 'username email');
    }

    async updateCapsule(capsuleId, userId, updateData) {
        const capsule = await TimeCapsule.findById(capsuleId);
        
        if (!capsule) {
            throw new Error('Capsule not found');
        }

        // Only creator can update
        if (capsule.creator.toString() !== userId) {
            throw new Error('Not authorized to update this capsule');
        }

        // Don't allow updates if already unlocked
        if (capsule.status === 'unlocked') {
            throw new Error('Cannot update unlocked capsule');
        }

        return TimeCapsule.findByIdAndUpdate(
            capsuleId,
            updateData,
            { new: true }
        );
    }

    async deleteCapsule(capsuleId, userId) {
        const capsule = await TimeCapsule.findById(capsuleId);
        
        if (!capsule) {
            throw new Error('Capsule not found');
        }

        // Only creator can delete
        if (capsule.creator.toString() !== userId) {
            throw new Error('Not authorized to delete this capsule');
        }

        await capsule.deleteOne();
        return { message: 'Capsule deleted successfully' };
    }

    hasAccess(capsule, userId) {
        return capsule.isPublic || 
               capsule.creator.toString() === userId || 
               capsule.recipients.some(r => r.toString() === userId);
    }
        
    async sendCapsule(capsuleId, recipientEmails, userId) {
        const capsule = await TimeCapsule.findById(capsuleId);
        
        if (!capsule) {
            throw new Error('Capsule not found');
        }

        // Verify sender is the creator
        if (capsule.creator.toString() !== userId) {
            throw new Error('Only creator can send this capsule');
        }

        // Find users by their emails and verify they exist
        const User = require('../models/user'); // Import your User model
        const recipients = await User.find({ email: { $in: recipientEmails } });
        
        // Check if all recipients were found
        if (recipients.length !== recipientEmails.length) {
            throw new Error('One or more recipients are not registered users');
        }

        // Add recipient IDs to capsule
        capsule.recipients = recipients.map(user => user._id);
        capsule.status = 'locked';
        await capsule.save();
        
        return capsule;
    }
}

module.exports = new TimeCapsuleService(); 

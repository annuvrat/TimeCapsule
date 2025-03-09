const TimeCapsuleService = require('../services/timeCapsuleService');

class TimeCapsuleController {
    async createCapsule(req, res) {
        try {
            const capsule = await TimeCapsuleService.createCapsule(req.body, req.user.id);
            res.status(201).json(capsule);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getCapsule(req, res) {
        try {
            const capsule = await TimeCapsuleService.getCapsule(req.params.id, req.user.id);
            res.json(capsule);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    async getUserCapsules(req, res) {
        try {
            const capsules = await TimeCapsuleService.getUserCapsules(req.user.id);
            res.json(capsules);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async updateCapsule(req, res) {
        try {
            const capsule = await TimeCapsuleService.updateCapsule(
                req.params.id,
                req.user.id,
                req.body
            );
            res.json(capsule);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async deleteCapsule(req, res) {
        try {
            const result = await TimeCapsuleService.deleteCapsule(req.params.id, req.user.id);
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async sendCapsule(req, res) {
        try {
            const { capsuleId, recipientEmails } = req.body;
            const capsule = await TimeCapsuleService.sendCapsule(
                capsuleId,
                recipientEmails,
                req.user.id
            );
            res.json(capsule);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // New controller method for checking status
    async checkStatus(req, res) {
        try {
            await TimeCapsuleService.checkAndUpdateStatus();
            res.json({ message: 'Status check completed successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new TimeCapsuleController(); 
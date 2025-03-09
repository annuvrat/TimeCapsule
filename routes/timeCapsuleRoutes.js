const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const TimeCapsuleController = require('../controllers/timeCapsuleController');

router.use(protect); // All routes require authentication

router.post('/', protect, TimeCapsuleController.createCapsule);
router.get('/my-capsules', protect,TimeCapsuleController.getUserCapsules);
router.get('/:id',protect, TimeCapsuleController.getCapsule);
router.put('/:id', protect,TimeCapsuleController.updateCapsule);
router.delete('/:id',protect, TimeCapsuleController.deleteCapsule);
router.post('/send', TimeCapsuleController.sendCapsule);

// Status check (might want to restrict this to admin users)
router.post('/check-status', TimeCapsuleController.checkStatus);

module.exports = router; 
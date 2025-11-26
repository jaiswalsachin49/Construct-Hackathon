const express = require('express');
const router = express.Router();
const waveController = require('../controllers/waveController');
const authenticateToken = require('../middlewares/auth');
const upload = require('../config/multer');

router.post('/', authenticateToken, upload.single('file'), waveController.createWave);
router.get('/me', authenticateToken, waveController.getMyWaves);
router.get('/allies', authenticateToken, waveController.getAlliesWaves);
router.post('/:waveId/view', authenticateToken, waveController.viewWave);
router.delete('/:waveId', authenticateToken, waveController.deleteWave);
router.get('/:waveId/likes', authenticateToken, waveController.getWaveLikes);
router.get('/:waveId/viewers', authenticateToken, waveController.getWaveViewers); // New route

module.exports = router;
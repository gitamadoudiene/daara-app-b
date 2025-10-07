const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.get('/', dashboardController.getDashboardData);
router.get('/stats', auth, dashboardController.getAdminStats);
router.get('/users/counts', auth, dashboardController.getUserCounts);

module.exports = router;

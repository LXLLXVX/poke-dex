const { Router } = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddleware');

const router = Router();

router.use(authenticate);

router.get('/team-distribution', authorizeRoles('admin'), dashboardController.getTeamDistribution);

module.exports = router;

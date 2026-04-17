const { Router } = require('express');
const trainerController = require('../controllers/trainerController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddleware');

const router = Router();

router.use(authenticate);

router.get('/', authorizeRoles('admin', 'trainer'), trainerController.listTrainers);
router.post('/', authorizeRoles('admin'), trainerController.createTrainer);
router.put('/:id', authorizeRoles('admin'), trainerController.updateTrainer);
router.delete('/:id', authorizeRoles('admin'), trainerController.deleteTrainer);

module.exports = router;

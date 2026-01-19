const { Router } = require('express');
const trainerController = require('../controllers/trainerController');

const router = Router();

router.get('/', trainerController.listTrainers);
router.post('/', trainerController.createTrainer);
router.put('/:id', trainerController.updateTrainer);
router.delete('/:id', trainerController.deleteTrainer);

module.exports = router;

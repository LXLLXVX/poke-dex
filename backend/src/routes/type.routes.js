const { Router } = require('express');
const typeController = require('../controllers/typeController');

const router = Router();

router.get('/', typeController.listTypes);
router.post('/', typeController.createType);
router.put('/:id', typeController.updateType);
router.delete('/:id', typeController.deleteType);

module.exports = router;

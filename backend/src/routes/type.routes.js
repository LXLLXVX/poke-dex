const { Router } = require('express');
const typeController = require('../controllers/typeController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddleware');

const router = Router();

router.use(authenticate);

router.get('/', authorizeRoles('admin', 'trainer'), typeController.listTypes);
router.post('/', authorizeRoles('admin'), typeController.createType);
router.put('/:id', authorizeRoles('admin'), typeController.updateType);
router.delete('/:id', authorizeRoles('admin'), typeController.deleteType);

module.exports = router;

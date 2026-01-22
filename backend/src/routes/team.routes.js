const { Router } = require('express');
const teamController = require('../controllers/teamController');

const router = Router();

router.get('/', teamController.listTeam);
router.post('/', teamController.createMember);
router.put('/:id', teamController.updateMember);
router.delete('/:id', teamController.deleteMember);

module.exports = router;

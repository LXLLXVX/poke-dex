const { Router } = require('express');
const pokemonController = require('../controllers/pokemonController');

const router = Router();

router.get('/', pokemonController.listPokemon);
router.post('/', pokemonController.createPokemon);
router.get('/:nationalDex', pokemonController.getPokemon);
router.put('/:nationalDex', pokemonController.updatePokemon);
router.delete('/:nationalDex', pokemonController.deletePokemon);

module.exports = router;

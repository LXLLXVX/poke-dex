const pokemonService = require('../services/pokemonService');

async function listPokemon(req, res, next) {
	try {
		const pokemon = await pokemonService.listPokemon({
			search: req.query.search,
			type: req.query.type,
			types: req.query.types,
			limit: req.query.limit,
			offset: req.query.offset,
		});

		res.json({ data: pokemon });
	} catch (error) {
		next(error);
	}
}

async function getPokemon(req, res, next) {
	try {
		const pokemon = await pokemonService.getPokemonByNationalDex(req.params.nationalDex);
		if (!pokemon) {
			return res.status(404).json({ message: 'Pokémon not found' });
		}

		return res.json({ data: pokemon });
	} catch (error) {
		return next(error);
	}
}

async function createPokemon(req, res, next) {
	try {
		const pokemon = await pokemonService.createPokemon(req.body);
		res.status(201).json({ data: pokemon });
	} catch (error) {
		next(error);
	}
}

async function updatePokemon(req, res, next) {
	try {
		const pokemon = await pokemonService.updatePokemon(req.params.nationalDex, req.body);
		res.json({ data: pokemon });
	} catch (error) {
		next(error);
	}
}

async function deletePokemon(req, res, next) {
	try {
		await pokemonService.deletePokemon(req.params.nationalDex);
		res.status(204).send();
	} catch (error) {
		next(error);
	}
}

module.exports = {
	listPokemon,
	getPokemon,
	createPokemon,
	updatePokemon,
	deletePokemon,
};

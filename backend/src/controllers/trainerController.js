const trainerService = require('../services/trainerService');

async function listTrainers(req, res, next) {
	try {
		const trainers = await trainerService.listTrainers();
		res.json({ data: trainers });
	} catch (error) {
		next(error);
	}
}

async function createTrainer(req, res, next) {
	try {
		const trainer = await trainerService.createTrainer(req.body);
		res.status(201).json({ data: trainer });
	} catch (error) {
		next(error);
	}
}

async function updateTrainer(req, res, next) {
	try {
		const updated = await trainerService.updateTrainer(req.params.id, req.body);
		res.json({ data: updated });
	} catch (error) {
		next(error);
	}
}

async function deleteTrainer(req, res, next) {
	try {
		await trainerService.deleteTrainer(req.params.id);
		res.status(204).send();
	} catch (error) {
		next(error);
	}
}

module.exports = {
	listTrainers,
	createTrainer,
	updateTrainer,
	deleteTrainer,
};

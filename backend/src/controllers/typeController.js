const typeService = require('../services/typeService');

async function listTypes(req, res, next) {
	try {
		const types = await typeService.listTypes();
		res.json({ data: types });
	} catch (error) {
		next(error);
	}
}

async function createType(req, res, next) {
	try {
		const type = await typeService.createType(req.body);
		res.status(201).json({ data: type });
	} catch (error) {
		next(error);
	}
}

async function updateType(req, res, next) {
	try {
		const updated = await typeService.updateType(req.params.id, req.body);
		res.json({ data: updated });
	} catch (error) {
		next(error);
	}
}

async function deleteType(req, res, next) {
	try {
		await typeService.deleteType(req.params.id);
		res.status(204).send();
	} catch (error) {
		next(error);
	}
}

module.exports = {
	listTypes,
	createType,
	updateType,
	deleteType,
};

const teamService = require('../services/teamService');

async function listTeam(req, res, next) {
	try {
		const team = await teamService.listTeam();
		res.json({ data: team });
	} catch (error) {
		next(error);
	}
}

async function createMember(req, res, next) {
	try {
		const member = await teamService.addMember(req.body);
		res.status(201).json({ data: member });
	} catch (error) {
		next(error);
	}
}

async function updateMember(req, res, next) {
	try {
		const member = await teamService.updateMember(req.params.id, req.body);
		res.json({ data: member });
	} catch (error) {
		next(error);
	}
}

async function deleteMember(req, res, next) {
	try {
		await teamService.removeMember(req.params.id);
		res.status(204).send();
	} catch (error) {
		next(error);
	}
}

module.exports = {
	listTeam,
	createMember,
	updateMember,
	deleteMember,
};

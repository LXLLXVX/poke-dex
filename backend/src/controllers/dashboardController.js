const dashboardService = require('../services/dashboardService');

async function getTeamDistribution(req, res, next) {
	try {
		const result = await dashboardService.getTeamDistribution(req.query ?? {});
		res.json({ data: result });
	} catch (error) {
		next(error);
	}
}

module.exports = {
	getTeamDistribution,
};

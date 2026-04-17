const authService = require('../services/authService');

async function login(req, res, next) {
	try {
		const { username, password } = req.body;
		const { user, token } = await authService.loginWithPassword(username, password);

		res.json({
			data: {
				token,
				tokenType: 'Bearer',
				user,
			},
		});
	} catch (error) {
		next(error);
	}
}

module.exports = {
	login,
};

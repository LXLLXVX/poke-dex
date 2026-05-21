const authService = require('../services/authService');

async function login(req, res, next) {
	try {
		const { username, password } = req.body;
		const { user, token } = await authService.loginWithPassword(username, password);

		// Return bearer token (stateless auth). Do not create a server session.
		res.json({
			data: {
				user,
				token,
			},
		});
	} catch (error) {
		next(error);
	}
}

async function logout(req, res, next) {
	try {
		// Stateless logout: instruct client to drop the token. Server cannot
		// invalidate JWTs without a revocation store. Return 204 to indicate
		// the client should remove the token locally.
		return res.status(204).send();
	} catch (error) {
		next(error);
	}
}

function me(req, res, next) {
	try {
		if (!req.auth?.user) {
			return res.status(401).json({ message: 'No valid token' });
		}

		return res.json({ data: { user: req.auth.user, via: req.auth.via } });
	} catch (error) {
		next(error);
	}
}

module.exports = {
	login,
	logout,
	me,
};

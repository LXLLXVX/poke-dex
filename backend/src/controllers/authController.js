const authService = require('../services/authService');

async function login(req, res, next) {
	try {
		const { username, password } = req.body;
		const { user, token } = await authService.loginWithPassword(username, password);

		if (req.session) {
			req.session.user = user;
		}

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
		if (req.session) {
			return req.session.destroy((error) => {
				if (error) {
					return next(error);
				}

				return res.clearCookie('poke.team.sid').status(204).send();
			});
		}

		return res.status(204).send();
	} catch (error) {
		next(error);
	}
}

function me(req, res, next) {
	try {
		if (!req.auth?.user) {
			return res.status(401).json({ message: 'No valid session or token' });
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

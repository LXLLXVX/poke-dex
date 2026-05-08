const authService = require('../services/authService');

async function login(req, res, next) {
	try {
		const { username, password } = req.body;
		const { user } = await authService.loginWithPassword(username, password);

		req.session.authUser = {
			id: user.id,
			username: user.username,
			role: user.role,
		};

		res.json({
			data: {
				user,
				session: true,
			},
		});
	} catch (error) {
		next(error);
	}
}

async function logout(req, res, next) {
	try {
		req.session.destroy((error) => {
			if (error) {
				return next(error);
			}

			res.clearCookie('poke.sid');
			return res.status(204).send();
		});
	} catch (error) {
		next(error);
	}
}

function me(req, res, next) {
	try {
		if (!req.session?.authUser) {
			return res.status(401).json({ message: 'No active session' });
		}

		return res.json({ data: { user: req.session.authUser } });
	} catch (error) {
		next(error);
	}
}

module.exports = {
	login,
	logout,
	me,
};

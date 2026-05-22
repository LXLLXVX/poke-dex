const authService = require('../services/authService');
const { httpError } = require('../utils/httpError');

function parseAuthorizationHeader(req) {
	const header = req.headers.authorization;
	if (!header) {
		return null;
	}

	const [scheme, credentials] = header.split(' ');
	if (!scheme || !credentials) {
		throw httpError(401, 'Invalid authorization format');
	}

	return { scheme: scheme.toLowerCase(), credentials };
}

async function authenticate(req, res, next) {
	try {
		const headerAuth = parseAuthorizationHeader(req);

		if (headerAuth) {
			const { scheme, credentials } = headerAuth;

			if (scheme !== 'bearer') {
				throw httpError(401, 'Only Bearer authentication is supported');
			}

			const payload = authService.verifyToken(credentials);
			req.auth = {
				user: {
					id: payload.sub,
					username: payload.username,
					role: payload.role,
				},
				via: 'bearer',
			};
			return next();
		}

		if (req.session?.user) {
			req.auth = {
				user: req.session.user,
				via: 'session',
			};
			return next();
		}

		throw httpError(401, 'Authorization header or session is required');
	} catch (error) {
		next(error);
	}
}

function authorizeRoles(...allowedRoles) {
	return (req, res, next) => {
		if (!req.auth?.user) {
			return next(httpError(401, 'Authentication required'));
		}

		if (!allowedRoles.includes(req.auth.user.role)) {
			return next(httpError(403, 'Access denied for this role'));
		}

		return next();
	};
}

module.exports = {
	authenticate,
	authorizeRoles,
};

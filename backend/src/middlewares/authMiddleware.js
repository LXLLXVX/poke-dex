const authService = require('../services/authService');
const { httpError } = require('../utils/httpError');

function parseAuthorizationHeader(req) {
	const header = req.headers.authorization;
	if (!header) {
		throw httpError(401, 'Authorization header is required');
	}

	const [scheme, credentials] = header.split(' ');
	if (!scheme || !credentials) {
		throw httpError(401, 'Invalid authorization format');
	}

	return { scheme: scheme.toLowerCase(), credentials };
}

async function authenticate(req, res, next) {
	try {
		const { scheme, credentials } = parseAuthorizationHeader(req);

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

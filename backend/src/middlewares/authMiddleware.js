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

async function parseBasicCredentials(encodedCredentials) {
	let decoded;
	try {
		decoded = Buffer.from(encodedCredentials, 'base64').toString('utf-8');
	} catch {
		throw httpError(401, 'Invalid basic auth credentials');
	}

	const separatorIndex = decoded.indexOf(':');
	if (separatorIndex <= 0) {
		throw httpError(401, 'Invalid basic auth payload');
	}

	const username = decoded.slice(0, separatorIndex).trim();
	const password = decoded.slice(separatorIndex + 1).trim();
	return authService.validateCredentials(username, password);
}

async function authenticate(req, res, next) {
	try {
		const { scheme, credentials } = parseAuthorizationHeader(req);

		if (scheme === 'bearer') {
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

		if (scheme === 'basic') {
			const user = await parseBasicCredentials(credentials);
			req.auth = {
				user,
				via: 'basic',
			};
			return next();
		}

		throw httpError(401, 'Unsupported authorization scheme');
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

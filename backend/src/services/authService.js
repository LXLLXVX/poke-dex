const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user');
const { httpError } = require('../utils/httpError');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

function sanitizeString(value) {
	return typeof value === 'string' ? value.trim() : '';
}

async function validateCredentials(username, password) {
	const cleanUsername = sanitizeString(username);
	const cleanPassword = sanitizeString(password);

	if (!cleanUsername || !cleanPassword) {
		throw httpError(401, 'Invalid credentials');
	}

	const user = await userModel.findByUsername(cleanUsername);
	if (!user) {
		throw httpError(401, 'Invalid credentials');
	}

	const isMatch = await bcrypt.compare(cleanPassword, user.passwordHash);
	if (!isMatch) {
		throw httpError(401, 'Invalid credentials');
	}

	return {
		id: user.id,
		username: user.username,
		role: user.role,
	};
}

function signToken(user) {
	return jwt.sign(
		{
			sub: user.id,
			username: user.username,
			role: user.role,
		},
		JWT_SECRET,
		{ expiresIn: JWT_EXPIRES_IN }
	);
}

async function loginWithPassword(username, password) {
	const user = await validateCredentials(username, password);
	const token = signToken(user);

	return { user, token };
}

function verifyToken(token) {
	try {
		return jwt.verify(token, JWT_SECRET);
	} catch {
		throw httpError(401, 'Invalid or expired token');
	}
}

module.exports = {
	loginWithPassword,
	validateCredentials,
	verifyToken,
};

const TOKEN_KEY = 'poke.team.authToken';

export function getAuthToken() {
	return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
	if (token) {
		localStorage.setItem(TOKEN_KEY, token);
	}
}

export function clearAuthToken() {
	localStorage.removeItem(TOKEN_KEY);
}

export function buildAuthHeaders(extraHeaders = {}) {
	const token = getAuthToken();
	if (!token) {
		return extraHeaders;
	}

	return {
		...extraHeaders,
		Authorization: `Bearer ${token}`,
	};
}
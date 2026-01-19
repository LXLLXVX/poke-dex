const API_BASE_URL = 'https://pokeapi.co/api/v2';
const GEN_ONE_LIMIT = 151;
const DEFAULT_OFFSET = 0;
const DEFAULT_BATCH_SIZE = 20;

let cachedFetch = null;

async function ensureFetch() {
	if (typeof fetch === 'function') {
		return fetch;
	}

	if (!cachedFetch) {
		const nodeFetch = await import('node-fetch');
		cachedFetch = nodeFetch.default || nodeFetch;
	}

	return cachedFetch;
}

async function fetchJson(url, context) {
	const runtimeFetch = await ensureFetch();
	const response = await runtimeFetch(url);
	if (!response.ok) {
		const message = `${context} failed with ${response.status} ${response.statusText}`;
		throw new Error(message);
	}

	return response.json();
}

async function fetchPokemonCatalogue(limit = GEN_ONE_LIMIT, offset = DEFAULT_OFFSET) {
	const url = `${API_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`;
	const payload = await fetchJson(url, 'Fetching Pokémon catalogue');
	return payload.results ?? [];
}

async function fetchPokemonDetails(url) {
	return fetchJson(url, 'Fetching Pokémon details');
}

function normalizePokemon(rawPokemon) {
	return {
		nationalDex: rawPokemon.id,
		name: rawPokemon.name,
		height: rawPokemon.height,
		weight: rawPokemon.weight,
		baseExperience: rawPokemon.base_experience,
		sprite:
			rawPokemon.sprites?.other?.['official-artwork']?.front_default ||
			rawPokemon.sprites?.front_default ||
			null,
		types: rawPokemon.types?.map((entry) => entry.type.name) || [],
		abilities:
			rawPokemon.abilities?.map((entry) => ({
				name: entry.ability.name,
				isHidden: Boolean(entry.is_hidden),
			})) || [],
		stats:
			rawPokemon.stats?.map((entry) => ({
				name: entry.stat.name,
				base: entry.base_stat,
			})) || [],
	};
}

async function fetchGenerationOnePokemon(options = {}) {
	const { batchSize = DEFAULT_BATCH_SIZE } = options;
	const catalogue = await fetchPokemonCatalogue(GEN_ONE_LIMIT, DEFAULT_OFFSET);
	const normalizedEntries = [];

	for (let i = 0; i < catalogue.length; i += batchSize) {
		const batch = catalogue.slice(i, i + batchSize);
		const details = await Promise.all(batch.map((entry) => fetchPokemonDetails(entry.url)));
		normalizedEntries.push(...details.map(normalizePokemon));
	}

	return normalizedEntries;
}

async function fetchAndPersistGenerationOne(saveFn, options) {
	if (typeof saveFn !== 'function') {
		throw new Error('saveFn must be a function that persists an array of Pokémon.');
	}

	const entries = await fetchGenerationOnePokemon(options);
	await saveFn(entries);
	return entries.length;
}

module.exports = {
	fetchPokemonCatalogue,
	fetchPokemonDetails,
	normalizePokemon,
	fetchGenerationOnePokemon,
	fetchAndPersistGenerationOne,
};

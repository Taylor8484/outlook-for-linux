'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { readFileSync } = require('node:fs');
const { createRequire } = require('node:module');
const path = require('node:path');
const vm = require('node:vm');

// With auth.webauthn.enabled off, Electron on Linux has no WebAuthn prompt, so a
// native publicKey get()/create() never settles and Microsoft's sign-in page
// spins on "Face, fingerprint, PIN or security key". The preload tool must fail
// those calls fast with NotAllowedError (what a cancelled browser prompt
// returns) and leave conditional mediation and non-publicKey requests native.

const OVERRIDE_PATH = path.join(__dirname, '..', '..', 'app', 'browser', 'tools', 'webauthnOverride.js');
const source = readFileSync(OVERRIDE_PATH, 'utf8');
const CHALLENGE = new Uint8Array(32);

function load({ platform = 'linux', enabled = false } = {}) {
	const nativeCalls = [];
	// Native WebAuthn on Linux never settles; model that with a pending promise.
	const credentials = {
		get: (options) => { nativeCalls.push(['get', options]); return new Promise(() => {}); },
		create: (options) => { nativeCalls.push(['create', options]); return new Promise(() => {}); },
	};
	const module = { exports: {} };
	new vm.Script(source, { filename: 'webauthnOverride.js' }).runInNewContext({
		DOMException,
		console: { debug: () => {}, error: () => {}, info: () => {}, warn: () => {} },
		module,
		navigator: { credentials },
		process: { platform },
		require: createRequire(OVERRIDE_PATH),
		window: { addEventListener: () => {} },
	});
	module.exports.init({ auth: { webauthn: { enabled } } }, { invoke: async () => ({ success: false }) });
	return { credentials, nativeCalls };
}

async function rejectionOf(promise) {
	try {
		await promise;
		return null;
	} catch (error) {
		return error;
	}
}

describe('webauthnOverride with auth.webauthn.enabled off', () => {
	it('rejects a publicKey credentials.get() with NotAllowedError without calling native', async () => {
		const { credentials, nativeCalls } = load();
		const error = await rejectionOf(credentials.get({ publicKey: { challenge: CHALLENGE } }));
		assert.strictEqual(error?.name, 'NotAllowedError');
		assert.deepStrictEqual(nativeCalls, []);
	});

	it('rejects a publicKey credentials.create() with NotAllowedError without calling native', async () => {
		const { credentials, nativeCalls } = load();
		const error = await rejectionOf(credentials.create({ publicKey: { challenge: CHALLENGE } }));
		assert.strictEqual(error?.name, 'NotAllowedError');
		assert.deepStrictEqual(nativeCalls, []);
	});

	it('leaves conditional mediation (passkey autofill) to the native implementation', () => {
		const { credentials, nativeCalls } = load();
		credentials.get({ mediation: 'conditional', publicKey: { challenge: CHALLENGE } });
		assert.deepStrictEqual(nativeCalls.map(([kind]) => kind), ['get']);
	});

	it('leaves non-publicKey requests to the native implementation', () => {
		const { credentials, nativeCalls } = load();
		credentials.get({ password: true });
		credentials.create({ password: {} });
		assert.deepStrictEqual(nativeCalls.map(([kind]) => kind), ['get', 'create']);
	});

	it('does not patch anything outside Linux', () => {
		const { credentials, nativeCalls } = load({ platform: 'darwin' });
		credentials.get({ publicKey: { challenge: CHALLENGE } });
		assert.deepStrictEqual(nativeCalls.map(([kind]) => kind), ['get']);
	});
});

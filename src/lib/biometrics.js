const CRED_KEY    = 'bio_credential_id';
const ENABLED_KEY = 'bio_enabled';

function uint8ToBase64(arr) {
  let s = '';
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s);
}

function base64ToUint8(b64) {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

function randomBytes(len) {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return arr;
}

export async function isAvailable() {
  if (!window.PublicKeyCredential) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export function isEnabled() {
  return localStorage.getItem(ENABLED_KEY) === 'true';
}

export async function register() {
  const cred = await navigator.credentials.create({
    publicKey: {
      challenge: randomBytes(32),
      rp: { name: 'TambourWallet', id: location.hostname },
      user: {
        id: randomBytes(16),
        name: 'kassenwart',
        displayName: 'Kassenwart',
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },   // ES256
        { type: 'public-key', alg: -257 },  // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'preferred',
      },
      timeout: 60000,
    },
  });

  localStorage.setItem(CRED_KEY, uint8ToBase64(new Uint8Array(cred.rawId)));
  localStorage.setItem(ENABLED_KEY, 'true');
  return true;
}

export async function authenticate() {
  const credIdB64 = localStorage.getItem(CRED_KEY);
  if (!credIdB64) throw new Error('Kein Credential gespeichert');

  await navigator.credentials.get({
    publicKey: {
      challenge: randomBytes(32),
      rpId: location.hostname,
      allowCredentials: [{ id: base64ToUint8(credIdB64), type: 'public-key' }],
      userVerification: 'required',
      timeout: 60000,
    },
  });

  return true;
}

export function disable() {
  localStorage.removeItem(CRED_KEY);
  localStorage.removeItem(ENABLED_KEY);
}

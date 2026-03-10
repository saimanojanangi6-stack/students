const USERS = [
  {
    id: 'principal_001',
    username: 'principal',
    password: 'principal@123',
    name: 'Dr. Rajesh Kumar',
    role: 'principal',
    avatar: 'P',
    permissions: ['view', 'add', 'edit', 'delete', 'reports'],
  },
  {
    id: 'receptionist_001',
    username: 'receptionist',
    password: 'reception@123',
    name: 'Priya Sharma',
    role: 'receptionist',
    avatar: 'R',
    permissions: ['view', 'add', 'edit'],
  },
];

function getSecret() {
  return process.env.JWT_SECRET || 'schoolpro-default-secret-2024';
}

function toBase64Url(str) {
  try {
    const b64 = btoa(str);
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (e) {
    const b64 = Buffer.from(str, 'utf-8').toString('base64');
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}

function fromBase64Url(str) {
  try {
    const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
    return atob(b64);
  } catch (e) {
    return Buffer.from(str, 'base64url').toString('utf-8');
  }
}

async function hmacSign(msg, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg));
  const bytes = new Uint8Array(sig);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return toBase64Url(bin);
}

export function validateCredentials(username, password) {
  const user = USERS.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    permissions: user.permissions,
  };
}

export async function createToken(user) {
  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const payload = toBase64Url(
    JSON.stringify({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      permissions: user.permissions,
      iat: now,
      exp: now + 86400,
    })
  );
  const sig = await hmacSign(`${header}.${payload}`, getSecret());
  return `${header}.${payload}.${sig}`;
}

export async function verifyToken(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, sig] = parts;
    const expected = await hmacSign(`${header}.${payload}`, getSecret());
    if (expected !== sig) return null;

    const decoded = JSON.parse(fromBase64Url(payload));
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) return null;

    return decoded;
  } catch (error) {
    return null;
  }
}
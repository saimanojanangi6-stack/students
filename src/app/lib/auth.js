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
  return process.env.JWT_SECRET || 'schoolpro-secret-key-2024-change-this';
}

function base64UrlEncode(str) {
  if (typeof btoa === 'function') {
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  return Buffer.from(str).toString('base64url');
}

function base64UrlDecode(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  if (typeof atob === 'function') {
    return atob(padded);
  }
  return Buffer.from(padded, 'base64').toString('utf-8');
}

async function hmacSign(message, secret) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
  const bytes = new Uint8Array(signature);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return base64UrlEncode(binary);
}

async function hmacVerify(message, signature, secret) {
  const expectedSig = await hmacSign(message, secret);
  return expectedSig === signature;
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
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));

  const now = Math.floor(Date.now() / 1000);
  const payload = base64UrlEncode(
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

  const signature = await hmacSign(`${header}.${payload}`, getSecret());

  return `${header}.${payload}.${signature}`;
}

export async function verifyToken(token) {
  try {
    if (!token || typeof token !== 'string') return null;

    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;

    const isValid = await hmacVerify(`${header}.${payload}`, signature, getSecret());
    if (!isValid) return null;

    const decoded = JSON.parse(base64UrlDecode(payload));

    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) return null;

    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export function hasPermission(user, permission) {
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permission);
}
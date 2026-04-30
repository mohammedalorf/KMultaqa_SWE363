import crypto from 'crypto';

const keyLength = 64;
const scryptOptions = {
  N: 16384,
  r: 8,
  p: 1,
};

function scrypt(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, keyLength, scryptOptions, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(derivedKey);
    });
  });
}

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt);

  return `${salt}:${hash.toString('hex')}`;
}

export async function verifyPassword(password, storedPassword) {
  if (typeof password !== 'string' || typeof storedPassword !== 'string') {
    return false;
  }

  const [salt, originalHash] = storedPassword.split(':');

  if (!salt || !originalHash) {
    return false;
  }

  const computedHash = await scrypt(password, salt);
  const expectedHash = Buffer.from(originalHash, 'hex');

  return (
    computedHash.length === expectedHash.length &&
    crypto.timingSafeEqual(computedHash, expectedHash)
  );
}

import crypto from 'crypto';

export const sha512 = (str: string) => {
  const HASHING_SECRET = process.env.HASHING_SECRET;
  const hash = crypto.createHmac('sha512', HASHING_SECRET);
  hash.update(str);
  return hash.digest('hex');
};
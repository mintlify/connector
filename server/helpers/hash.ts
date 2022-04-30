import crypto from 'crypto';

export const sha512Hash = (str: string, secret = process.env.HASHING_SECRET) => {
  const hash = crypto.createHmac('sha512', secret);
  hash.update(str);
  return hash.digest('hex');
};
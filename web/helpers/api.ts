const ISDEV = process.env.NODE_ENV === 'development';

export const API_ENDPOINT = ISDEV ? 'http://localhost:5000' : 'https://connect.mintlify.com'
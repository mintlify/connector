const ISDEV = process.env.NODE_ENV === 'development';
export const ADMIN_LOGIN = ISDEV ? 'mintlify-connect-dev' : 'mintlify-connect';
export const ENDPOINT = ISDEV ? 'http://localhost:5000' : 'https://api.mintlify.com'
export const ACCEPTED_LANGUAGES = ['ts', 'md'];
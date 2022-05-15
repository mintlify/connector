import { withIronSession } from 'next-iron-session';

export const withSession = (handler: any) => withIronSession(handler, {
  password: process.env.SESSION_PASSWORD as string,
  cookieName: 'auth-user',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  }
})
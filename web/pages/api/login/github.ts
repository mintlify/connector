import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { loadStytch } from "../../../lib/loadStytch";

const GITHUB_OAUTH_URI = process.env.NODE_ENV === 'production' ? 'https://api.stytch.com/v1/public/oauth/github/start?public_token=public-token-live-f45a72f8-f406-4a08-a101-a432747bc0d6' : 'https://test.stytch.com/v1/public/oauth/github/start?public_token=public-token-test-363ed94e-39d5-4a4a-a0e2-7ebc82a5124c';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const redirectUrl = 'http://localhost:3000/api/auth/oauth';
  res.redirect(`${GITHUB_OAUTH_URI}&signup_redirect_url=${redirectUrl}&login_redirect_url=${redirectUrl}`);
}
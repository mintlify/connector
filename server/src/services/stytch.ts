import * as stytch from 'stytch';
import { ISDEV } from '../helpers/environment';
import { ENDPOINT } from '../helpers/github/octokit';

export const client = new stytch.Client({
    project_id: process.env.STYTCH_PROJECT_ID || '',
    secret: process.env.STYTCH_SECRET || '',
    env: ISDEV ? stytch.envs.test : stytch.envs.live,
  }
);

export const getGoogleRedirectUrl = (state: any) => {
  const GOOGLE_OAUTH_URI = ISDEV ? 'https://test.stytch.com/v1/public/oauth/google/start?public_token=public-token-test-363ed94e-39d5-4a4a-a0e2-7ebc82a5124c' : 'https://api.stytch.com/v1/public/oauth/google/start?public_token=public-token-live-f45a72f8-f406-4a08-a101-a432747bc0d6';
  const redirectUrl = `${ENDPOINT}/routes/user/anonymous/login?state=${JSON.stringify(state)}`;
  return `${GOOGLE_OAUTH_URI}&signup_redirect_url=${redirectUrl}&login_redirect_url=${redirectUrl}`;
}

export const getGitHubRedirectUrl = (state: any) => {
  const GITHUB_OAUTH_URI = ISDEV ? 'https://test.stytch.com/v1/public/oauth/github/start?public_token=public-token-test-363ed94e-39d5-4a4a-a0e2-7ebc82a5124c' : 'https://api.stytch.com/v1/public/oauth/github/start?public_token=public-token-live-f45a72f8-f406-4a08-a101-a432747bc0d6';
  const redirectUrl = `${ENDPOINT}/routes/user/anonymous/login?state=${JSON.stringify(state)}`;
  return `${GITHUB_OAUTH_URI}&signup_redirect_url=${redirectUrl}&login_redirect_url=${redirectUrl}`;
}
import axios from "axios"
import { ENDPOINT } from "../helpers/github/octokit"

export type GitHubAuthResponse = {
  access_token: string,
  expires_in: number,
  refresh_token: string,
  refresh_token_expires_in: number,
  scope: string,
  token_type: string
}

type GitHubAuthData = {
  response?: string,
  error?: string
}

export const githubRedirectUrl = `${ENDPOINT}/routes/integrations/github/authorization`;
export const getGitHubAccessTokenFromCode = async (code: string, state: Object): Promise<GitHubAuthData> => {
  try {
    const { data }: { data: string } = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: githubRedirectUrl,
      state,
    });
    return { response: data }
  }
  catch (error: any) {
    return { error };
  }
}
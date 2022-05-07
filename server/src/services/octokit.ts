import { request } from '@octokit/request';
import { createAppAuth } from '@octokit/auth-app';

export const getOctokitRequest = (installationId: string) => {
  const auth = createAppAuth({
    appId: process.env.APP_ID || '',
    privateKey: process.env.PRIVATE_KEY || '',
    installationId: installationId
  });
  
  const requestWithAuth = request.defaults({
    request: {
      hook: auth.hook
    }
  })

  return requestWithAuth;
}
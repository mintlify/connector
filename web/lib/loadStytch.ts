import * as stytch from 'stytch'

let client: stytch.Client;

export const loadStytch = () => {
  if (!client) {
    client = new stytch.Client({
      project_id: process.env.STYTCH_PROJECT_ID || '',
      secret: process.env.STYTCH_SECRET || '',
      env: stytch.envs.test,
    });
  }

  return client;
};
import * as stytch from 'stytch'
import { ISDEV } from '../helpers/api';

let client: stytch.Client;

export const loadStytch = () => {
  if (!client) {
    client = new stytch.Client({
      project_id: process.env.STYTCH_PROJECT_ID || '',
      secret: process.env.STYTCH_SECRET || '',
      env: ISDEV ? stytch.envs.test : stytch.envs.live,
    });
  }

  return client;
};
import * as stytch from 'stytch';
import { ISDEV } from '../helpers/environment';

export const client = new stytch.Client({
    project_id: process.env.STYTCH_PROJECT_ID || '',
    secret: process.env.STYTCH_SECRET || '',
    env: ISDEV ? stytch.envs.test : stytch.envs.live,
  }
);
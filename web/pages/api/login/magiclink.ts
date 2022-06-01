import { NextApiRequest, NextApiResponse } from "next";
import { API_ENDPOINT } from "../../../helpers/api";
import { loadStytch } from "../../../lib/loadStytch";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email } = req.body;
  const client = loadStytch();
  const state = JSON.stringify({
    method: 'magiclink',
    host: req.headers.host,
  })
  const redirectUrl = `${API_ENDPOINT}/routes/user/login?state=${state}`;

  const response = await client.magicLinks.email.loginOrCreate({
    email,
    login_magic_link_url: redirectUrl,
    signup_magic_link_url: redirectUrl,
  });

  res.json(response);
}
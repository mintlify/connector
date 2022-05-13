import { NextApiRequest, NextApiResponse } from "next";
import { loadStytch } from "../../lib/loadStytch";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email } = req.body;
  const client = loadStytch();
  const response = await client.magicLinks.email.loginOrCreate({
    email,
    login_magic_link_url: 'http://localhost:3000/api/authenticate',
    signup_magic_link_url: 'http://localhost:3000/api/authenticate',
  });

  res.json(response);
}
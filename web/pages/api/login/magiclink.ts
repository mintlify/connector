import { NextApiRequest, NextApiResponse } from "next";
import { PROTOCOL } from "../../../helpers/api";
import { loadStytch } from "../../../lib/loadStytch";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email } = req.body;
  const client = loadStytch();
  const redirectUrl = `${PROTOCOL}://${req.headers.host}/api/auth?state=magiclink`;

  const response = await client.magicLinks.email.loginOrCreate({
    email,
    login_magic_link_url: redirectUrl,
    signup_magic_link_url: redirectUrl,
  });

  res.json(response);
}
import axios from "axios";
import { NextApiResponse } from "next";
import { API_ENDPOINT } from "../../helpers/api";
import { withSession } from "../../lib/withSession";
import { redirectToVSCode } from "./login/vscode";

async function handler(req: any, res: NextApiResponse) {
  const { email, firstName, lastName, orgName } = req.query;
  const { user_id } = req.session.get('user');

  const { data: { user } } = await axios.post(`${API_ENDPOINT}/routes/user`, {
    userId: user_id,
    email,
    firstName,
    lastName,
    orgName,
  });

  req.session.destroy();
  req.session.set('user', {
    user_id,
    email,
    firstName,
    lastName,
    user,
  });
  await req.session.save();

  if (req.session.get('authSource')?.source === 'vscode') {
    redirectToVSCode(res, user);
  }

  return res.redirect('/');
}

export default withSession(handler);
import axios from "axios";
import { NextApiResponse } from "next";
import { API_ENDPOINT } from "../../../helpers/api";
import { withSession } from "../../../lib/withSession";

export const redirectToVSCode = (res: NextApiResponse, user: any) => {
  axios.put(`${API_ENDPOINT}/routes/user/${user.userId}/install-vscode`);
  const userQuery = `user=${JSON.stringify(user)}`;
  return res.redirect(`vscode://mintlify.connector/auth?${userQuery}`);
}

async function handler(req: any, res: NextApiResponse) {  
  try {
    const user = req.session.get('user')?.user;
    if (user == null) {
      req.session.set('authSource', {
        source: 'vscode'
      });
      await req.session.save();
      return res.redirect('/');
    }

    return redirectToVSCode(res, user);
  } catch (e) {
    const errorString = JSON.stringify(e);
    return res.status(400).json({errorString});
  }
}

export default withSession(handler);
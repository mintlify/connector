import axios from "axios";
import { NextApiResponse } from "next";
import { API_ENDPOINT } from "../../helpers/api";
import { withSession } from "../../lib/withSession";
import { redirectToVSCode } from "./login/vscode";

async function handler(req: any, res: NextApiResponse) {
  const { email, firstName, lastName, orgId } = req.query;
  const { userId } = req.session.get("user");

  try {
    const {
      data: { user, org },
    } = await axios.post(`${API_ENDPOINT}/routes/user/${userId}/join/${orgId}`, {
      email,
      firstName,
      lastName,
    });
  
    req.session.destroy();
    req.session.set("user", {
      userId,
      user,
      org,
    });
    await req.session.save();
  
    if (req.session.get('authSource')?.source === 'vscode') {
      return redirectToVSCode(res, user);
    }
  
    return res.redirect("/");
  } catch (error) {
    res.send('You do not have access to this organization');
  }
}

export default withSession(handler);

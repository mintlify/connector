import { NextApiResponse } from "next";
import { getUserFromUserId } from "../../../helpers/user";
import { loadStytch } from "../../../lib/loadStytch";
import { withSession } from "../../../lib/withSession";

async function handler(req: any, res: NextApiResponse) {
  const token = req.query.token as string;
  
  const client = loadStytch();
  
  try {
    const response = await client.magicLinks.authenticate(token);
    const { emails: [{ email }] } = await client.users.get(response.user_id);
    const user = await getUserFromUserId(response.user_id);
    req.session.destroy();
    req.session.set('user', {
      user_id: response.user_id,
      email,
      user,
    });

    await req.session.save();
    res.redirect('/');
  } catch (e) {
    const errorString = JSON.stringify(e);
    return res.status(400).json({errorString});
  }
}

export default withSession(handler);
import { NextApiResponse } from "next";
import { getUserFromUserId } from "../../helpers/user";
import { withSession } from "../../lib/withSession";

async function handler(req: any, res: NextApiResponse) {
  // await req.session.destroy();
  const userSession = req.session.get('user');

  if (!userSession?.user_id) {
    return res.redirect('/');
  }

  const user = await getUserFromUserId(userSession.user_id);

  req.session.set('user', {
    ...userSession,
    user
  });

  await req.session.save();
  res.end();
}

export default withSession(handler);
import { NextApiResponse } from "next";
import { getOrgFromSubdomain, getSubdomain, getUserFromUserId } from "../../helpers/user";
import { withSession } from "../../lib/withSession";

async function handler(req: any, res: NextApiResponse) {
  // await req.session.destroy();
  const userSession = req.session.get('user');

  if (!userSession?.userId) {
    return res.redirect('/');
  }

  const user = await getUserFromUserId(userSession.userId);
  const subdomain = getSubdomain(req.headers.host);
  const org = await getOrgFromSubdomain(subdomain, userSession.userId);

  res.send({ user, org });
}

export default withSession(handler);
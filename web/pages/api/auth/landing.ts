import { NextApiResponse } from "next";
import { getOrgFromSubdomain, getSubdomain, getUserFromUserId } from "../../../helpers/user";
import { loadStytch } from "../../../lib/loadStytch";
import { withSession } from "../../../lib/withSession";

async function handler(req: any, res: NextApiResponse) {
  const { sessionToken } = req.query;
  const client = loadStytch();

  try {
    const userAuth = await client.sessions.authenticate({ session_token: sessionToken });
    const userId = userAuth.session.user_id;
    const userPromise = getUserFromUserId(userId);
    const subdomain = getSubdomain(req.headers.host);
    const orgPromise = getOrgFromSubdomain(subdomain, userId);

    const [user, org] = await Promise.all([userPromise, orgPromise]);

    req.session.set("user", {
      userId: user.userId,
      user: user,
      org,
    });
    await req.session.save();
    return res.redirect("/");
  } catch {
    return res.redirect("/");
  }
}

export default withSession(handler);

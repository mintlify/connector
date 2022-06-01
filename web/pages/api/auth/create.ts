import { NextApiResponse } from "next";
import { getOrgFromSubdomain, getSubdomain, getUserFromUserId } from "../../../helpers/user";
import { withSession } from "../../../lib/withSession";

async function handler(req: any, res: NextApiResponse) {
  const { userId } = req.query;

  if (!userId) {
    return res.redirect("/");
  }

  const userPromise = getUserFromUserId(userId);
  const subdomain = getSubdomain(window.location.host);
  const orgPromise = getOrgFromSubdomain(subdomain, userId);

  const [user, org] = await Promise.all([userPromise, orgPromise]);

  req.session.set("user", {
    userId: user.userId,
    user: user,
    org,
  });
  await req.session.save();
  return res.redirect("/");
}

export default withSession(handler);

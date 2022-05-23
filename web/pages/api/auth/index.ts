import {  NextApiResponse } from "next";
import { User } from "../..";
import { getOrgFromSubdomainAndPotentiallyJoin, getOrgFromSubdomain, getOrgFromSubdomainForAuth, getSubdomain, getUserFromUserId } from "../../../helpers/user";
import { loadStytch } from "../../../lib/loadStytch";
import { withSession } from "../../../lib/withSession";
import { redirectToVSCode } from "../login/vscode";

async function handler(req: any, res: NextApiResponse) {
  const token = req.query.token as string;
  const state = req.query.state as string;

  const client = loadStytch();

  try {
    let response;
    if (state === "magiclink") {
      response = await client.magicLinks.authenticate(token);
    } else if (state === "oauth") {
      response = await client.oauth.authenticate(token);
    }

    if (response == null) {
      return res.end();
    }

    const subdomain = getSubdomain(req.headers.host);
    const existingUser: User = await getUserFromUserId(response.user_id);

    const authSource = req.session.get("authSource");
    req.session.destroy();

    if (existingUser) {
      // For existing users
      const { org } = await getOrgFromSubdomainAndPotentiallyJoin(subdomain, existingUser.userId)
      // TBD: Show that you do not have access
      if (org == null) {
        res.redirect('/');
        return;
      }
      
      req.session.set("user", {
        userId: response.user_id,
        user: existingUser,
        org,
      });
      if (authSource?.source === 'vscode') {
        redirectToVSCode(res, existingUser);
        return;
      }
    } else {
      // For new users
      const [authUserData, orgForAuth] = await Promise.all([client.users.get(response.user_id), getOrgFromSubdomainForAuth(subdomain)]);
      const { id: orgId, name: orgName } = orgForAuth;

      const {
        name: { first_name, last_name },
        emails: [{ email }],
      } = authUserData;
      req.session.set("user", {
        userId: response.user_id,
        tempAuthData: {
          email,
          firstName: first_name,
          lastName: last_name,
          orgId,
          orgName,
        }
      });
    }

    await req.session.save();
    return res.redirect("/");
  } catch (e) {
    const errorString = JSON.stringify(e);
    return res.status(400).json({ errorString });
  }
}

export default withSession(handler);

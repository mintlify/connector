import {  NextApiResponse } from "next";
import { getOrgFromSubdomain, getSubdomain, getUserFromUserId } from "../../../helpers/user";
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
    console.log({subdomain});
    const [authUserData, user, org] = await Promise.all([client.users.get(response.user_id), getUserFromUserId(response.user_id), getOrgFromSubdomain(subdomain)]);

    const { id: orgId, name: orgName } = org;

    const {
      name: { first_name, last_name },
      emails: [{ email }],
    } = authUserData;

    const authSource = req.session.get("authSource");

    req.session.destroy();
    req.session.set("user", {
      user_id: response.user_id,
      user,
      email,
      firstName: first_name,
      lastName: last_name,
      orgId,
      orgName,
    });

    await req.session.save();
    if (authSource?.source === 'vscode') {
      return redirectToVSCode(res, user);
    }

    return res.redirect("/");
  } catch (e) {
    const errorString = JSON.stringify(e);
    return res.status(400).json({ errorString });
  }
}

export default withSession(handler);

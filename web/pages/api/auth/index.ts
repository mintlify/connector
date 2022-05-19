import { NextApiResponse } from "next";
import { getUserFromUserId } from "../../../helpers/user";
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

    const {
      name: { first_name, last_name },
      emails: [{ email }],
    } = await client.users.get(response.user_id);
    const user = await getUserFromUserId(response.user_id);

    const authSource = req.session.get("authSource");

    req.session.destroy();
    req.session.set("user", {
      user_id: response.user_id,
      email,
      firstName: first_name,
      lastName: last_name,
      user,
    });

    await req.session.save();
    if (authSource?.source === 'vscode') {
      redirectToVSCode(res, user);
    }

    return res.redirect("/");
  } catch (e) {
    const errorString = JSON.stringify(e);
    return res.status(400).json({ errorString });
  }
}

export default withSession(handler);

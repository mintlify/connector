import axios from "axios";
import { NextApiResponse } from "next";
import { API_ENDPOINT } from "../../helpers/api";
import { withSession } from "../../lib/withSession";

async function handler(req: any, res: NextApiResponse) {
  const { email, firstName, lastName, orgName } = req.query;
  const {
    user: { user_id },
  } = req.session.get();

  const {
    data: { user },
  } = await axios.post(`${API_ENDPOINT}/routes/user`, {
    userId: user_id,
    email,
    firstName,
    lastName,
    orgName,
  });

  req.session.set("user", {
    user_id,
    email,
    firstName,
    lastName,
    user,
  });
  await req.session.save();

  res.redirect("/");
}

export default withSession(handler);

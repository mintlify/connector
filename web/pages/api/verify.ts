import axios from "axios";
import { NextApiResponse } from "next";
import { API_ENDPOINT } from "../../helpers/api";
import { withSession } from "../../lib/withSession";

// verify users after they haven't accepted the join invite
async function handler(req: any, res: NextApiResponse) {
  const { email, firstName, lastName } = req.query;
  const {
    user: { user_id },
  } = req.session.get();

  const {
    data: { user },
  } = await axios.put(`${API_ENDPOINT}/routes/user/verify`, {
    userId: user_id,
    email,
    firstName,
    lastName,
  });

  console.log("user = ", user);

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

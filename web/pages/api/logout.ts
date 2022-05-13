import { NextApiResponse } from "next";
import { withSession } from "../../lib/withSession";

async function handler(req: any, res: NextApiResponse) {
  await req.session.destroy();
  res.redirect('/');
}

export default withSession(handler);
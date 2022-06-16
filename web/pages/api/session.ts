import { NextApiResponse } from "next";
import { withSession } from "../../lib/withSession";

async function handler(req: any, res: NextApiResponse) {
  const session = req.session.get('user');
  res.send(session);
}

export default withSession(handler);
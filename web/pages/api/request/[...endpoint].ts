import axios from "axios";
import { NextApiResponse } from "next";
import { API_ENDPOINT } from "../../../helpers/api";
import { getSubdomain } from "../../../helpers/user";
import { withSession } from "../../../lib/withSession";

async function handler(req: any, res: NextApiResponse) {
  const session = req.session.get('user');

  if (session?.userId == null) {
    return res.status(400).send({ error: 'User not authenticated' });
  }

  const { endpoint } = req.query;

  const { data: response } = await axios({
    method: req.method,
    url: `${API_ENDPOINT}/${endpoint.join('/')}`,
    data: req.body,
    params: {
      userId: session.userId,
      subdomain: getSubdomain(req.headers.host),
      ...req.query,
    }
  });

  res.send(response);
}

export default withSession(handler);
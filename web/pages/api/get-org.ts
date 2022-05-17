import axios from "axios";
import { NextApiResponse } from "next";
import { API_ENDPOINT } from "../../helpers/api";
import { withSession } from "../../lib/withSession";

// Given an organization id from the request query, return the matched organization object.
async function handler(req: any, res: NextApiResponse) {
  const {orgId} = req.query;

  console.log('orgId = ', orgId)

  const org = await axios.get(`${API_ENDPOINT}/routes/org?orgId=${orgId}`).then(res => res.data.org).catch(err => {
    return res.status(500).json({err})
  });

  return res.status(200).json({org})
}

export default withSession(handler);
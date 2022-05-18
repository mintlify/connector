import { NextApiResponse } from "next";
import { withSession } from "../../../lib/withSession";

async function handler(req: any, res: NextApiResponse) {  
  try {
    const user = req.session.get('user');
    if (user == null) {
      req.session.set('authSource', {
        source: 'vscode'
      });
      await req.session.save();
      return res.redirect('/');
    }
    
    return res.redirect('vscode://mintlify.connect/auth');
  } catch (e) {
    const errorString = JSON.stringify(e);
    return res.status(400).json({errorString});
  }
}

export default withSession(handler);
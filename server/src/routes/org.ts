import express from 'express';
import Org from '../models/Org';
import { userMiddleware } from './user';

const orgRouter = express.Router();

orgRouter.put('/:orgId/name', userMiddleware, async (req, res) => {
  const { orgId } = req.params;
  const userOrgId = res.locals.user.org.toString();
  const { name } = req.body;

  if (!name) {
    return res.status(400).send({error: 'Name not provided'});
  }

  if (userOrgId !== orgId) {
    return res.status(403).send({error: 'User does not have permission'});
  }

  try {
    await Org.findByIdAndUpdate(orgId, { name });
    return res.end();
  }
  catch (error) {
    return res.status(500).send({error});
  }
});

orgRouter.get('/repos', userMiddleware, async (_, res) => {
  const orgId = res.locals.user.org.toString(); 

  console.log('Hey there')

  try {
    const org = await Org.findById(orgId);
    if (org?.integrations?.github?.installations == null) {
      return res.send({repos: []});
    }

    const allRepos: string[] = [];
    org.integrations.github.installations.map((installation: any) => {
      installation.repositories.forEach((repo: { name: string }) => {
        allRepos.push(repo.name);
      })
    })

    return res.send({repos: allRepos});
  }
  catch (error) {
    return res.status(500).send({error});
  }
})

export default orgRouter;
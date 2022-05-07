import express from 'express';
// import { getOctokitRequest } from '../services/octokit';
import { getContentFromWebpage } from '../services/webscraper';

const diffRouter = express.Router();

// TBD: Convert into a cron job
// diffRouter.post('/', async (_, res) => {
//   const url = 'https://mintlify.readme.io/reference/start';

//   const content = await getContentFromWebpage(url);
//   const octokitRequest = getOctokitRequest('24714487');

//   await octokitRequest('POST /repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies', {
//       owner: 'mintlify',
//       repo: 'connect',
//       pull_number: 42,
//       comment_id: 862409014,
//       body: content
//   });

//   res.end();
// });

// To be deleted
diffRouter.post('/content', async (req, res) => {
  const { url } = req.body;
  try {
    const content = await getContentFromWebpage(url);
    res.send({content});
  } catch (error) {
    res.status(500).send({error})
  }
})

export default diffRouter;
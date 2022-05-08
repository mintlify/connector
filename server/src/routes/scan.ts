import express from 'express';
import { getOctokitRequest } from '../services/octokit';
import { getDataFromWebpage } from '../services/webscraper';

const scanRouter = express.Router();

scanRouter.post('/', async (_, res) => {
  const url = 'https://mintlify.readme.io/reference/start';

  const  { content } = await getDataFromWebpage(url);
  const octokitRequest = getOctokitRequest('24714487');

  await octokitRequest('POST /repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies', {
      owner: 'mintlify',
      repo: 'connect',
      pull_number: 42,
      comment_id: 862409014,
      body: content
  });

  res.end();
});

export default scanRouter;
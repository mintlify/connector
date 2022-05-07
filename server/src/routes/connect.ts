import express from 'express';
import Link from '../models/Link';

const connectRouter = express.Router();

connectRouter.post('/', async (req, res) => {
    const { doc, url, sha, provider, file, org, repo, type, branch, line, endLine } = req.body;
    const link = {
        doc,
        url,
        sha,
        provider,
        file,
        org,
        repo,
        type,
        branch,
        line,
        endLine
    };
    await Link.create(link);
    return res.send({success: true});
});

export default connectRouter;
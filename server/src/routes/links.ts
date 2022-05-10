import express from 'express';
import Code, { CodeType } from '../models/Code';
import { createDocFromUrl } from './docs';

const linksRouter = express.Router();

linksRouter.put('/', async (req, res) => {
    const { docId, codes } = req.body;
    const codePromises: Promise<CodeType>[] = codes.map((code: CodeType) => {
        code.doc = docId;
        return Code.create(code);
    });
    await Promise.all(codePromises);
    return res.send({success: true});
});

linksRouter.post('/', async (req, res) => {
    const { url, org, codes } = req.body;

    const { doc } = await createDocFromUrl(url, org);

    const codePromises: Promise<CodeType>[] = codes.map((code: CodeType) => {
        code.doc = doc._id;
        return Code.create(code);
    });
    await Promise.all(codePromises);
    return res.send({success: true});
});

export default linksRouter;
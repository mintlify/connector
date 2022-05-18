import express from 'express';
import Code, { CodeType } from '../models/Code';
import { userMiddleware } from './user';

const linksRouter = express.Router();

linksRouter.put('/', userMiddleware, async (req, res) => {
    const { docId, codes } = req.body;
    const codePromises: Promise<CodeType>[] = codes.map((code: CodeType) => {
        code.doc = docId;
        return Code.create(code);
    });
    await Promise.all(codePromises);
    return res.send({success: true});
});

export default linksRouter;
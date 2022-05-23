import express from 'express';
import Code, { CodeType } from '../models/Code';
import Doc from '../models/Doc';
import { userMiddleware } from './user';

const linksRouter = express.Router();

linksRouter.put('/', userMiddleware, async (req, res) => {
    try {
        const { docId, codes } = req.body;
        const doc = await Doc.findById(docId);

        if (doc == null) {
            return res.status(400).send({error: 'Invalid docId'});
        }

        const codePromises: Promise<CodeType>[] = codes.map((code: CodeType) => {
            code.doc = doc._id;
            return Code.create(code);
        });
        await Promise.all(codePromises);
        return res.end();
    }
    catch (error) {
        return res.status(400).send({error})
    }
});

linksRouter.delete('/:codeId', userMiddleware, async (req, res) => {
    const { codeId } = req.params;
    const { org } = res.locals.user;
    
    try {
      await Code.findOneAndDelete({ _id: codeId, org });
      res.end();
    } catch (error) {
      res.status(500).send({error})
    }
  })

export default linksRouter;
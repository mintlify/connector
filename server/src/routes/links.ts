import express from 'express';
import Code, { CodeType } from '../models/Code';
import Doc from '../models/Doc';
import { track } from '../services/segment';
import { userMiddleware } from './user';

const linksRouter = express.Router();

linksRouter.put('/', userMiddleware, async (req, res) => {
    try {
        const { docId, codes } = req.body;
        const org = res.locals.user.org;

        const doc = await Doc.findById(docId);

        if (doc == null) {
            return res.status(400).send({error: 'Invalid docId'});
        }

        const codePromises: Promise<CodeType>[] = codes.map((code: CodeType) => {
            code.doc = doc._id;
            return Code.findOneAndUpdate(
              {
                org: org._id,
                doc: doc._id,
                url: code.url
              },
              code,
              {
                upsert: true
              }
            );
        });
        await Promise.all(codePromises);

        track(res.locals.user.userId, 'Add code link', {
          doc: docId.toString(),
        })

        return res.end();
    }
    catch (error) {
      console.log(error);
      return res.status(400).send({error})
    }
});

linksRouter.delete('/:codeId', userMiddleware, async (req, res) => {
    const { codeId } = req.params;
    const { org } = res.locals.user;
    
    try {
      await Code.findOneAndDelete({ _id: codeId, org: org._id });
      res.end();
    } catch (error) {
      res.status(500).send({error})
    }
  })

export default linksRouter;
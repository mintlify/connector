import express from 'express';
import Doc, { DocType } from '../models/Doc';
import Code, { CodeType } from '../models/Code';

const linksRouter = express.Router();

export type Link = {
    doc: DocType;
    codes: CodeType[];
}

linksRouter.post('/', async (req, res) => {
    const { doc, codes } = req.body;
    const docResponse = await Doc.create(doc);
    const codePromises: Promise<CodeType>[] = codes.map((code: CodeType) => {
        code.doc = docResponse.id;
        return Code.create(code);
    });
    await Promise.all(codePromises);
    return res.send({success: true});
});

export default linksRouter;
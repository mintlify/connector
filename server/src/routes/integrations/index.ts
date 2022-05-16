import { Router } from 'express';
import githubRouter from './github';
import notionRouter from './notion';
import slackRouter from './slack';

const integrationsRouter = Router();

integrationsRouter.use('/github', githubRouter);
integrationsRouter.use('/notion', notionRouter);
integrationsRouter.use('/slack', slackRouter);

export default integrationsRouter;

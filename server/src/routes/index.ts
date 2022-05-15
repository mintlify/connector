import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import scanRouter from './scan';
import integrationsRouter from './integrations';
import v01Router from './v01';
import docsRouter from './docs';
import alertsRouter from './alerts';
import eventsRouter from './events';
import linksRouter from './links';
import userRouter from './user';
import automationsRouter from './automations';

const headRouter = express.Router();

headRouter.use(cors());
headRouter.use(express.json({ limit: '5mb' }));
if (process.env.NODE_ENV !== 'production') {
  headRouter.use(morgan('dev'));
}

headRouter.get('/', (_, res) => {
  res.send('🌿 Welcome to the Mintlify Connect API')
});

// Primary app
headRouter.use('/user', userRouter);
headRouter.use('/docs', docsRouter);
headRouter.use('/automations', automationsRouter);
headRouter.use('/alerts', alertsRouter);
headRouter.use('/events', eventsRouter);
headRouter.use('/links', linksRouter);
// GitHub
headRouter.use('/v01', v01Router);
// Integrations
headRouter.use('/integrations', integrationsRouter);
// Cron job
headRouter.use('/scan', scanRouter);

export default headRouter;
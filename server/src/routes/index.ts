import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import scanRouter from './scan';
import notionRouter from './notion';
import v01Router from './v01';
import docsRouter from './docs';
import alertsRouter from './alerts';
import eventsRouter from './events';
import linksRouter from './links';

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
headRouter.use('/docs', docsRouter);
headRouter.use('/alerts', alertsRouter);
headRouter.use('/events', eventsRouter);
headRouter.use('/links', linksRouter);
// GitHub
headRouter.use('/v01', v01Router);
// Integrations
headRouter.use('/notion', notionRouter);
// Cron job
headRouter.use('/scan', scanRouter);

export default headRouter;
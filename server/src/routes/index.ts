import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import diffRouter from './diff';
import notionRouter from './notion';
import v01Router from './v01';
import connectRouter from './connect';

const headRouter = express.Router();

headRouter.use(cors());
headRouter.use(express.json({ limit: '5mb' }));
if (process.env.NODE_ENV !== 'production') {
  headRouter.use(morgan('dev'));
}

headRouter.get('/', (_, res) => {
  res.send('🌿 Welcome to the Mintlify Connect API')
});

// Connect
headRouter.use('/v01', v01Router);
headRouter.use('/notion', notionRouter);
headRouter.use('/diff', diffRouter);
headRouter.use('/connect', connectRouter);

export default headRouter;
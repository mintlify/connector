import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import 'services/mongoose';
import notionRouter from 'routes/notion';
import v01Router from 'routes/v01';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.set('trust proxy', 1);
app.get('/', (_, res) => {
  res.send('🌿 Welcome to the Mintlify API')
});

// Connect
app.use('/v01', v01Router);
app.use('/notion', notionRouter);

app.listen(PORT, () => {
  console.log(`Listening at PORT ${PORT}`);
});
import express from 'express';
import Org from '../models/Org';
import User from '../models/User';

const userRouter = express.Router();

export const userMiddleware = async (req: express.Request, res: express.Response, next: () => void) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).send({ error: 'userId not provided' });
  }

  const user = await User.findOne({ userId });

  if (user == null) {
    return res.status(400).send({ error: 'Invalid userId' });
  }

  res.locals.user = user;

  next();
  return;
}

userRouter.get('/', userMiddleware, async (_, res) => {
    return res.send({user: res.locals.user});
});

userRouter.post('/', async (req, res) => {
  const { userId, email, firstName, lastName, orgName } = req.body;

  const org = await Org.create({
    name: orgName
  })

  const user = await User.create({ 
      userId,
      email,
      firstName,
      lastName,
      org: org._id
   });
  return res.send({user});
})

export default userRouter;
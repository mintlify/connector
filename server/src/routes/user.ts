import express from 'express';
import Org from '../models/Org';
import User from '../models/User';

const userRouter = express.Router();

userRouter.get('/', async (req, res) => {
    const { userId } = req.query;

    const user = await User.findOne({ userId });
    return res.send({user});
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
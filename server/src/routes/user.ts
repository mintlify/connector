import express from 'express';
import User from '../models/User';

const userRouter = express.Router();

userRouter.get('/', async (req, res) => {
    const { userId } = req.query;

    const user = await User.findOne({ userId });
    return res.send({user});
});

export default userRouter;
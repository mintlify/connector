import express from "express";
import Org from "../models/Org";
import User from "../models/User";
// import mongoose from "mongoose";

const userRouter = express.Router();

export const userMiddleware = async (
  req: express.Request,
  res: express.Response,
  next: () => void
) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).send({ error: "userId not provided" });
  }

  const user = await User.findOne({ userId });

  if (user == null) {
    return res.status(400).send({ error: "Invalid userId" });
  }

  res.locals.user = user;

  next();
  return;
};

userRouter.get(
  "/by-email",
  async (req: express.Request, res: express.Response) => {
    const { email } = req.query;

    const users = await User.aggregate([
      {
        $match: {
          email,
        },
      },
      {
        $lookup: {
          from: "orgs",
          localField: "org",
          foreignField: "_id",
          as: "org",
        },
      },
      {
        $set: {
          org: { $first: "$org" },
        },
      },
    ]);

    const user = users[0];

    return res.status(200).json({ user });
  }
);

/**
 * Given emails as an array of strings & orgId as a string from the request body,
 * invite the users with the provided emails to the org through stytch.
 * Return the new array users through the response.
 */
userRouter.post(
  "/invite-to-org",
  async (req: express.Request, res: express.Response) => {
    const { emails, orgId } = req.body;

    let inviteUsers: any = [];

    // Create users as `pending: true` under the database
    emails.map((email: string) =>
      inviteUsers.push(User.create({ email, org: orgId, pending: true }))
    );

    let users: any[] = [];

    try {
      await Promise.allSettled(inviteUsers).then((results) => {
        results.forEach((result: any) => {
          if (result.status !== "fulfilled") throw new Error(result.reason);
          users.push(result.value);
        });
      });
    } catch (err) {
      return res.status(500).json({ err });
    }

    return res.status(200).json({ users });
  }
);

// verify the user who was invited to Mintlify
userRouter.put(
  "/verify",
  async (req: express.Request, res: express.Response) => {
    const { userId, email, firstName, lastName } = req.body;
    // check null values
    if (!(userId && email && firstName && lastName))
      return res.status(400).json({
        error:
          "Must fully provide 4 nonempty fields: userId, email, firstName, lastName",
      });

    try {
      const user = await User.findOneAndUpdate(
        { email },
        { userId, firstName, lastName, pending: false },
        { new: true }
      );
      return res.status(200).json({ user });
    } catch (error) {
      return res.status(500).json({ error });
    }
  }
);

userRouter.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).send({ error: "userId not provided" });
  }

  const users = await User.aggregate([
    {
      $match: {
        userId,
      },
    },
    {
      $lookup: {
        from: "orgs",
        localField: "org",
        foreignField: "_id",
        as: "org",
      },
    },
    {
      $set: {
        org: { $first: "$org" },
      },
    },
  ]);

  const user = users[0];

  return res.send({ user });
});

userRouter.post("/", async (req: express.Request, res: express.Response) => {
  const { userId, email, firstName, lastName, orgName } = req.body;

  const org = await Org.create({
    name: orgName,
  });

  const user = await User.create({
    userId,
    email,
    firstName,
    lastName,
    org: org._id,
    pending: false,
  });
  return res.send({ user });
});

userRouter.put("/:userId/firstname", async (req, res) => {
  const { userId } = req.params;
  const { firstName } = req.body;

  if (!firstName) {
    return res.status(400).send({ error: "First name not provided" });
  }

  try {
    await User.findOneAndUpdate({ userId }, { firstName });
    return res.end();
  } catch (error) {
    return res.status(500).send({ error });
  }
});

userRouter.put("/:userId/lastname", async (req, res) => {
  const { userId } = req.params;
  const { lastName } = req.body;

  if (!lastName) {
    return res.status(400).send({ error: "Last name not provided" });
  }

  try {
    await User.findOneAndUpdate({ userId }, { lastName });
    return res.end();
  } catch (error) {
    return res.status(500).send({ error });
  }
});

export default userRouter;

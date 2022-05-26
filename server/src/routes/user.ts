import express from "express";
import Org from "../models/Org";
import User from "../models/User";
import { identify } from "../services/segment";

export const removeUnneededDataFromOrg = (org?: any) => {
  if (org) {
    org.integrations = undefined;
  }

  return org;
}

const userRouter = express.Router();

export const userMiddleware = async (
  req: express.Request,
  res: express.Response,
  next: () => void
) => {
  const { userId, subdomain } = req.query;
  if (!userId) {
    return res.status(400).send({ error: "userId not provided" });
  }

  const user = await User.findOne({ userId });
  if (user == null) {
    return res.status(400).send({ error: "Invalid userId" });
  }

  const orgQuery: { users: string, subdomain?: string } = { users: user.userId };
  if (subdomain) {
    orgQuery.subdomain = subdomain as string;
  }
  const org = await Org.findOne(orgQuery);
  if (org == null) {
    return res.status(400).send({ error: "User does not have access to any organization" });
  }

  // Add org to user Id
  user.org = org._id;
  res.locals.user = user;

  next();
  return;
};

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
    {
      // Remove integrations data
      $unset: "org.integrations",
    },
  ]);

  const user = users[0];

  return res.send({ user });
});

userRouter.post("/:userId/join/:orgId", async (req: express.Request, res: express.Response) => {
  const { userId, orgId } = req.params;
  const { email, firstName, lastName } = req.body;

  // add users not already existing
  const org = await Org.findOneAndUpdate({ _id: orgId, users: { $ne: userId } }, {
    $push: { users: userId }
  }, { new: true })
  const user = await User.create({
    userId,
    email,
    firstName,
    lastName,
  });

  identify(userId, {
    email,
    firstName,
    lastName,
    org: orgId
  })

  return res.send({ user, org: removeUnneededDataFromOrg(org) });
});

userRouter.post("/:userId/join/existing/:subdomain", async (req: express.Request, res: express.Response) => {
  const { userId, subdomain } = req.params;

  const [user, org] = await Promise.all([User.findOne({userId}), Org.findOne({ subdomain })]);

  if (user == null || org == null || org.users.includes(userId)) {
    return res.send({ user, org: removeUnneededDataFromOrg(org) });
  }

  const newOrg = await Org.findOneAndUpdate({ subdomain }, { $push: { users: userId } }, { new: true })
  return res.send({ user, org: removeUnneededDataFromOrg(newOrg) });
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

export const checkIfUserHasVSCodeInstalled = async (userId: string) => {
  const user = await User.findOne({userId});
  return user?.isVSCodeInstalled === true;
}

userRouter.get('/:userId/install-vscode', async (req, res) => {
  const { userId } = req.params;

  try {
    const isVSCodeInstalled = checkIfUserHasVSCodeInstalled(userId);
    return res.send({isVSCodeInstalled});
  } catch (error) {
    return res.status(500).send({ error });
  }
})

userRouter.put('/:userId/install-vscode', async (req, res) => {
  const { userId } = req.params;

  try {
    await User.findOneAndUpdate({userId}, { isVSCodeInstalled: true });
    return res.end();
  } catch (error) {
    return res.status(500).send({ error });
  }
})

export default userRouter;

import express from "express";
import { ISDEV } from "../helpers/environment";
import { ENDPOINT } from "../helpers/github/octokit";
import Code from "../models/Code";
import Doc from "../models/Doc";
import Org from "../models/Org";
import User from "../models/User";
import { identify, track } from "../services/segment";
import { client, getGitHubRedirectUrl, getGoogleRedirectUrl } from "../services/stytch";

type UserMiddleWareQuery = {
  userId?: string,
  subdomain?: string,
  anonymousId?: string,
}

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
  const { userId, subdomain, anonymousId }: UserMiddleWareQuery = req.query;

  if (!userId && !anonymousId) {
    return res.status(400).send({ error: "userId and anonymousId not provided" });
  }

  let user, org;

  if (userId) {
    user = await User.findOne({ userId });

    const orgQuery: { users?: string, subdomain?: string } = { users: user?.userId };
    if (subdomain) {
      orgQuery.subdomain = subdomain as string;
    }
    org = await Org.findOne(orgQuery);
  }
  else if (anonymousId) {
    user = await User.findOneAndUpdate({ 'anonymousId.id': anonymousId }, {
      userId: `anon:${anonymousId}`,
    }, { upsert: true, new: true });

    org = await Org.findOneAndUpdate({ users: user.userId }, {
      name: '',
      users: [user.userId],
    }, { upsert: true, new: true });
  }

  if (user == null) {
    return res.status(400).send({ error: "Invalid userId or anonymousId" });
  }

  if (org == null) {
    return res.status(400).send({ error: "User does not have access to any organization" });
  }

  // Add org to user
  user.org = org;
  res.locals.user = user;

  next();
  return;
};

export const getSubdomain = (host: string) => {
  return host.split('.')[0];
}

userRouter.get('/login', async (req, res) => {
  const stateRaw = req.query.state as string;
  const token = req.query.token as string;

  if (!stateRaw || !token) {
    return res.status(400).send({error: 'No state or token provided'});
  }

  const state = JSON.parse(stateRaw);
  // For authentication from app
  if (state.host != null) {
    const subdomain = getSubdomain(state.host);

    const host = ISDEV ? `http://${subdomain}` : `https://${subdomain}.mintlify.com`
    const redirectUrl = `${host}/api/auth?state=${stateRaw}&token=${token}`;
    return res.redirect(redirectUrl);
  }

  // For authentication from landing page
  const tokenType = req.query.stytch_token_type;
  let authUser;
  if (tokenType === 'magic_links') {
    authUser = await client.magicLinks.authenticate(token, {
      session_duration_minutes: 5,
    });
  }

  else if (tokenType === 'oauth') {
    authUser = await client.oauth.authenticate(token, {
      session_duration_minutes: 5,
    });
  }

  if (authUser == null) {
    return res.status(400).send({error: 'Invalid token'})
  }

  const org = await Org.findOne({ users: authUser.user_id });
  if (org == null) {
    return res.redirect('https://mintlify.com/create');
  }

  const subdomain = org.subdomain;
  const host = ISDEV ? `http://${subdomain}` : `https://${subdomain}.mintlify.com`
  const redirectUrl = `${host}/api/auth/landing?sessionToken=${authUser.session_token}`;
  return res.redirect(redirectUrl);
});

userRouter.post("/invite", userMiddleware, async (req: express.Request, res: express.Response) => {
    const { emails, isVSCode } = req.body;
    const orgId = res.locals.user.org._id;

    try {
      const org = await Org.findOneAndUpdate({ _id: orgId, invitedEmails: { $ne: emails } }, { $push: { invitedEmails: { $each: emails } } });
      track(res.locals.user.userId, 'Invite member', {
        emails,
        org: orgId.toString()
      });

      const state = JSON.stringify({
        method: 'magiclink',
        host: org?.subdomain, // org will never be null,
        orgId: org?._id.toString()
      })
      const redirectUrl = isVSCode ? `${ENDPOINT}/routes/user/join/vscode?state=${state}` : `${ENDPOINT}/routes/user/login?state=${state}`;
      const invitePromises = emails.map((email: string) => {
        return client.magicLinks.email.invite({
          email,
          invite_magic_link_url: redirectUrl,
        })
      });

      await Promise.all(invitePromises);

      return res.status(200).end();
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

  try {
    const foundOrg = await Org.findById(orgId);

    if (foundOrg == null) {
      return res.status(400).send({error: 'Invalid Org ID'});
    }

    if (foundOrg.access?.mode === 'private' && !foundOrg.invitedEmails?.includes(email)) {
      return res.status(403).send({ error: 'You do not have access to this organization' });
    }

    const [org, user] = await Promise.all([
      Org.findOneAndUpdate({ _id: orgId, users: { $ne: userId } }, { $push: { users: userId }, $pull: { invitedEmails: email } }, { new: true }),
      User.create({
        userId,
        email,
        firstName,
        lastName,
      })]);

    identify(userId, {
      email,
      firstName,
      lastName,
      org: orgId
    })

    return res.send({ user, org: removeUnneededDataFromOrg(org) });
  } catch (error) {
    return res.status(500).send({error})
  }
});

userRouter.post("/:userId/join/existing/:subdomain", async (req: express.Request, res: express.Response) => {
  const { userId, subdomain } = req.params;

  const [user, org] = await Promise.all([User.findOne({userId}), Org.findOne({ subdomain })]);

  if (user == null || org == null || org.users.includes(userId)) {
    return res.send({ user, org: removeUnneededDataFromOrg(org) });
  }

  if (org?.access.mode === 'private' && user.email && !org.invitedEmails?.includes(user.email)) {
    return res.status(403).send({ error: 'You do not have access to join this organization' });
  }

  const newOrg = await Org.findOneAndUpdate({ subdomain }, { $push: { users: userId }, $pull: { invitedEmails: user.email } }, { new: true })
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
});

userRouter.put('/:userId/install-vscode', async (req, res) => {
  const { userId } = req.params;

  try {
    await User.findOneAndUpdate({userId}, { isVSCodeInstalled: true });
    return res.end();
  } catch (error) {
    return res.status(500).send({ error });
  }
});

userRouter.post('/onboarding', userMiddleware, async (req, res) => {
  const { role, teamSize } = req.body;

  if (!role || !teamSize) {
    return res.status(400).send({ error: 'No data provided' });
  }

  try {
    const userUpdateQuery = { onboarding: { role } };
    const orgUpdateQuery = { onboarding: { teamSize } }
    const updateUserPromise = User.findByIdAndUpdate(res.locals.user._id, userUpdateQuery);
    const updateOrgPromise = Org.findByIdAndUpdate(res.locals.user.org._id, orgUpdateQuery);
    await Promise.all([updateUserPromise, updateOrgPromise]);
    return res.end();
  } catch (error) {
    return res.status(500).send({ error: 'System error' });
  }
});

userRouter.put('/onboarding/complete', userMiddleware, async (_, res) => {
  try {
    await User.findByIdAndUpdate(res.locals.user._id, { 'onboarding.isCompleted': true });
    return res.end();
  } catch (error) {
    return res.status(500).send({ error: 'System error' });
  }
});

// Used for vscode auth
userRouter.get('/anonymous/google', userMiddleware, async (_, res) => {
  try {
    const { user } = res.locals;
    const url = getGoogleRedirectUrl(user);
    return res.redirect(url);
  } catch (error) {
    return res.status(500).send({ error: 'System error' });
  }
});

userRouter.get('/anonymous/github', userMiddleware, async (_, res) => {
  try {
    const { user } = res.locals;
    const url = getGitHubRedirectUrl(user);
    return res.redirect(url);
  } catch (error) {
    return res.status(500).send({ error: 'System error' });
  }
});

userRouter.get('/anonymous/login', async (req, res) => {
  const stateRaw = req.query.state as string;
  const token = req.query.token as string;

  if (!stateRaw || !token) {
    return res.status(400).send({error: 'No state or token provided'});
  }

  const state = JSON.parse(stateRaw);

  if (!state.userId) {
    return res.status(400).send({error: 'Invalid state'})
  }
  // For authentication from landing page
  const tokenType = req.query.stytch_token_type;
  let authUser;
  if (tokenType === 'magic_links') {
    authUser = await client.magicLinks.authenticate(token, {
      session_duration_minutes: 5,
    });
  }

  else if (tokenType === 'oauth') {
    authUser = await client.oauth.authenticate(token, {
      session_duration_minutes: 5,
    });
  }

  if (authUser == null) {
    return res.status(400).send({error: 'Invalid token'})
  }

  const email = authUser.user.emails[0].email

  // See if org with userId already exists
  const [existingOrg, currentOrg] = await Promise.all([
    Org.findOne({$or: [{users: authUser.user_id}, {invitedEmails: email}]}),
    Org.findOne({users: state.userId})
  ]);

  if (!currentOrg) {
    return res.status(400).send({error: 'Current org does not exist'});
  }

  if (existingOrg) {
    // Migrated user from invited to user if necessary
    if (existingOrg.invitedEmails?.includes(email)) {
      await Org.findOneAndUpdate({ _id: existingOrg._id, users: { $ne: authUser.user_id } }, { $push: { users: authUser.user_id }, $pull: { invitedEmails: email } });
    }
    // Add docs and code to new org
    await Promise.all([
      Doc.updateMany({ org: currentOrg._id }, { org: existingOrg._id }),
      Code.updateMany({ org: currentOrg._id }, { org: existingOrg._id })
    ]);
  } else {
    await Org.findOneAndUpdate({ users: state.userId }, { "$set": { "users.$": authUser.user_id } });
  }
  const user = await User.findOneAndUpdate({userId: state.userId}, {userId: authUser.user_id, email: authUser.user.emails[0].email}, { new: true })
  const userQuery = `user=${JSON.stringify(user)}`;
  return res.redirect(`vscode://mintlify.connector/auth?${userQuery}`);
});

userRouter.get('/join/vscode', async (req, res) => {
  const stateRaw = req.query.state as string;
  const token = req.query.token as string;

  if (!stateRaw || !token) {
    return res.status(400).send({error: 'No state or token provided'});
  }

  const state = JSON.parse(stateRaw);
  const { orgId } = state;

  // For authentication from landing page
  const tokenType = req.query.stytch_token_type;
  let authUser;

  try {
    if (tokenType === 'magic_links') {
      authUser = await client.magicLinks.authenticate(token, {
        session_duration_minutes: 5,
      });
    }
    else if (tokenType === 'oauth') {
      authUser = await client.oauth.authenticate(token, {
        session_duration_minutes: 5,
      });
    }
    if (authUser == null) {
      return res.status(400).send({error: 'Invalid token'})
    }
  
    const userId = authUser.user_id;
    const email = authUser.user.emails[0].email;
    const { first_name: firstName, last_name: lastName } = authUser.user.name
  
    const user = await User.findOneAndUpdate(
      {
        userId,
      },
      {
        userId,
        email,
        firstName,
        lastName,
      },
      { upsert: true, new: true }
    );
    await Org.findOneAndUpdate({ _id: orgId, users: { $ne: userId } }, { $push: { users: userId }, $pull: { invitedEmails: email } }, { new: true });
    const redirectUrl = `vscode://mintlify.connector/auth?user=${JSON.stringify(user)}`;
    return res.redirect(redirectUrl);
  } catch {
    res.send('Link has expired. Try asking your admin to send another invite or contact hi@mintlify.com for help.');
  }
})

export default userRouter;

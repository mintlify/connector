import express from "express";
import Org from "../models/Org";
import User from "../models/User";
import { userMiddleware } from "./user";
import mongoose from "mongoose";

const orgRouter = express.Router();

// Given an orgId from the request query, return the organization object that matches the id
orgRouter.get("/", userMiddleware, async (req: any, res: express.Response) => {
  const { orgId } = req.query;
  const userOrgId = res.locals.user.org.toString();

  if (!orgId) return res.status(400).json({ error: "orgId not provided" });
  if (userOrgId !== orgId) {
    return res.status(403).json({ error: "User does not have permission" });
  }

  try {
    const org = await Org.findById(new mongoose.Types.ObjectId(orgId.toString()))
      .exec()
      .catch((err) => {
        console.log(err);
        throw new Error(err);
      });

    return res.status(200).json({ org });
  } catch (error) {
    return res.status(500).json({ error });
  }
});

orgRouter.put("/:orgId/email-notifications", userMiddleware, async (req: express.Request, res: express.Response) => {
  const { orgId } = req.params;
  const userOrgId = res.locals.user.org.toString();
  const { monthlyDigest, newsletter } = req.body;

  if (userOrgId !== orgId) {
    return res.status(403).send({ error: "User does not have permission" });
  }

  if (monthlyDigest === null || newsletter === null)
    return res.status(400).json({ error: "Both the monthlyDigest and newsletter values must be provided" });

  try {
    await Org.findByIdAndUpdate(orgId, { notifications: { monthlyDigest, newsletter } });
    return res.status(200).end();
  } catch (error) {
    return res.status(500).send({ error });
  }
});

// Given an orgId from the request query, return all the user objects within that organization
orgRouter.get("/list-users", async (req: any, res: express.Response) => {
  const { orgId } = req.query;

  if (!orgId) return res.status(400).json({ error: "orgId not provided" });

  const users = await User.aggregate([
    {
      $match: {
        org: new mongoose.Types.ObjectId(orgId.toString()),
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

  return res.status(200).json({ users });
});

orgRouter.put("/:orgId/name", userMiddleware, async (req, res) => {
  const { orgId } = req.params;
  const userOrgId = res.locals.user.org.toString();
  const { name } = req.body;

  if (!name) {
    return res.status(400).send({ error: "Name not provided" });
  }

  if (userOrgId !== orgId) {
    return res.status(403).send({ error: "User does not have permission" });
  }

  try {
    await Org.findByIdAndUpdate(orgId, { name });
    return res.end();
  } catch (error) {
    return res.status(500).send({ error });
  }
});

orgRouter.get('/:orgId/integrations', userMiddleware, async (req, res) => {
  const { orgId } = req.params;
  const userOrgId = res.locals.user.org.toString();

  if (userOrgId !== orgId) {
    return res.status(403).send({ error: "User does not have permission" });
  }

  try {
    const org = await Org.findById(orgId);

    if (org?.integrations == null) {
      return res.send({integrations: { github: false, notion: false, vscode: false, slack: false }})
    }

    const integrations = {
      github: org.integrations.github?.installations != null,
      notion: org.integrations.notion?.accessToken != null,
      slack: org.integrations.slack?.accessToken != null,
      vscode: false,
    }
    return res.send({integrations});
  } catch (error) {
    return res.status(500).send({ error });
  }
})

orgRouter.get("/repos", userMiddleware, async (_, res) => {
  const orgId = res.locals.user.org.toString();

  try {
    const org = await Org.findById(orgId);
    if (org?.integrations?.github?.installations == null) {
      return res.send({ repos: [] });
    }

    const allRepos: string[] = [];
    org.integrations.github.installations.map((installation: any) => {
      installation.repositories.forEach((repo: { name: string }) => {
        allRepos.push(repo.name);
      });
    });

    return res.send({ repos: allRepos });
  } catch (error) {
    return res.status(500).send({ error });
  }
});

export default orgRouter;

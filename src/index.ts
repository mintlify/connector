// https://www.notion.so/mintlify/Installation-37aab83daa5e48b88cde8bd3891fa181
import { Context, Probot } from "probot";
import axios from 'axios';
import { Change, parsePatch } from "./patch";
import { getReviewComments, ENDPOINT, checkIfAllAlertsAreResolve } from "./helpers";

type File = {
  filename: string;
	content: string;
	changes: Change[]
}

type LineRange = {
  start: number;
  end: number;
}

type Alert = {
  url: string;
  message: string;
  filename: string;
  lineRange: LineRange
}

export = (app: Probot) => {
  app.on(["pull_request.opened", "pull_request.reopened", "pull_request.synchronize"], async (context) => {
    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;
    const pullNumber = context.payload.number;
    const headRef = context.payload.pull_request.head.ref;

    const pullRequestFiles = await context.octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: pullNumber,
      page: 0,
      per_page: 100
    });

    const filesContext = pullRequestFiles.data.map(file => {
      return {
        path: file.filename,
        patch: file.patch
      }
    });
    
    const getFilesContentPromises = filesContext.map((fileContext) => {
      return new Promise(async (resolve) => {
        try {
          const contentRequest = context.repo({ path: fileContext.path, ref: headRef });
          const content = await context.octokit.repos.getContent(contentRequest) as { data: { content: string } };
          const contentString = Buffer.from(content.data.content, 'base64').toString();
          const changes = parsePatch(fileContext.patch);
          resolve({
            filename: fileContext.path,
            content: contentString,
            changes: changes
          })
        } catch {
          resolve(null);
        }
      })
    });

    const files = await Promise.all(getFilesContentPromises) as File[];
    const connectPromise = axios.post(`${ENDPOINT}/connect/v01/`, {
      files,
      owner,
    });
    const previousAlertsPromise = getReviewComments(context);
    const [connectResponse, previousAlerts] = await Promise.all([connectPromise, previousAlertsPromise]);

    const incomingAlerts: Alert[] = connectResponse.data.alerts;
    if (incomingAlerts == null) {
      return;
    }

    // New alerts do not exist in previous alerts
    const previousAlertsContent = previousAlerts.map((previousAlert: any) => {
      return previousAlert.comments.edges[0].node.body;
    })
    const newAlerts = incomingAlerts.filter((incomingAlert) => {
      return previousAlertsContent.includes(incomingAlert.message) === false;
    });
    const isAllPreviousAlertsResolved = checkIfAllAlertsAreResolve(previousAlerts);

    if (newAlerts.length === 0 && isAllPreviousAlertsResolved) {
      await context.octokit.checks.create({
        owner,
        repo,
        head_sha: context.payload.pull_request.head.sha,
        name: 'Documentation Maintenance Check',
        status: 'completed',
        conclusion: 'success',
      });

      return;
    };

    const reviewCommentPromises: Promise<any>[] = newAlerts.map((newAlert) => {
      return context.octokit.pulls.createReviewComment({
        owner,
        repo,
        pull_number: pullNumber,
        commit_id: context.payload.pull_request.head.sha,
        body: newAlert.message,
        path: newAlert.filename,
        line: newAlert.lineRange.start,
        side: 'RIGHT'
      })
    });

    const checkPromise = context.octokit.checks.create({
      owner,
      repo,
      head_sha: context.payload.pull_request.head.sha,
      name: 'Documentation Maintenance Check',
      status: 'completed',
      conclusion: 'action_required',
      details_url: newAlerts[0].url,
    })
    reviewCommentPromises.push(checkPromise)
    await Promise.all(reviewCommentPromises);
    
    return;
  });

  app.on('pull_request_review_thread.resolved' as any, async (context: Context) => {
    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;
    const previousAlerts = await getReviewComments(context);
    const isAllPreviousAlertsResolved = checkIfAllAlertsAreResolve(previousAlerts);

    if (!isAllPreviousAlertsResolved) {
      return;
    }

    await context.octokit.checks.create({
      owner,
      repo,
      head_sha: context.payload.pull_request.head.sha,
      name: 'Documentation Maintenance Check',
      status: 'completed',
      conclusion: 'success',
    });
  });
};
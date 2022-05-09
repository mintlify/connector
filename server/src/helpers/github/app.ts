import axios from "axios";
import { Context } from "probot";
import { FileInfo, getEncompassingRangeAndSideForAlert, parsePatch, PatchLineRange } from "./patch";
import { AlertsRequest, Alert } from "./types";
import { ENDPOINT, getReviewComments } from "./octokit";

type FilesPatchLineRangesMap = Record<string, PatchLineRange[]>;

type AllFilesAndMap = {
  files: FileInfo[],
  filesPatchLineRangesMap: FilesPatchLineRangesMap
}

export const getAllFilesAndMap = async (context: Context): Promise<AllFilesAndMap> => {
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

  const filesPatchLineRangesMap: FilesPatchLineRangesMap = {};
  const getFilesContentPromises = filesContext.map((fileContext) => new Promise(async (resolve) => {
      try {
        const contentRequest = context.repo({ path: fileContext.path, ref: headRef });
        const content = await context.octokit.repos.getContent(contentRequest) as { data: { content: string } };
        const contentString = Buffer.from(content.data.content, 'base64').toString();
        const { changes, patchLineRanges } = parsePatch(fileContext.patch);
        // Add range to map
        filesPatchLineRangesMap[fileContext.path] = patchLineRanges;
        resolve({
          filename: fileContext.path,
          content: contentString,
          changes: changes
        })
      } catch {
        resolve(null);
      }
    })
  );

  const files = await Promise.all(getFilesContentPromises) as FileInfo[];
  return {
    files,
    filesPatchLineRangesMap
  }
}

type AlertsResponse = {
  incomingAlerts: Alert[],
  previousAlerts: Alert[],
  newLinksMessage: string,
}

export const getAlerts = async (context: Context, files: FileInfo[]): Promise<AlertsResponse> => {
  const owner = context.payload.repository.owner.login;
  const repo = context.payload.pull_request.head.repo.name;
  const alertsRequest: AlertsRequest = { files, owner, repo }
  const v01Promise = axios.post(`${ENDPOINT}/routes/v01/`, alertsRequest);
  const previousAlertsPromise = getReviewComments(context);
  const alertsPromise = axios.post(`${ENDPOINT}/routes/alerts/`, alertsRequest);
  const [v01Response, alertsResponse, previousAlerts] = await Promise.all([v01Promise, alertsPromise, previousAlertsPromise]);
  return {
    incomingAlerts: v01Response.data.alerts.concat(alertsResponse.data.alerts),
    previousAlerts,
    newLinksMessage: v01Response.data.newLinksMessage
  }
}

export const potentiallyCreateNewLinksComment = async (context: Context, newLinksMessage: string) => {
  if (newLinksMessage == null) {
    return;
  }
  const commentResponse = await context.octokit.rest.issues.listComments(context.issue());
  const comments = commentResponse.data.map((comment) => comment.body);
  if (!comments.includes(newLinksMessage)) {
    await context.octokit.issues.createComment(context.issue({body: newLinksMessage}))
  }
}

// Get only new alerts to show from previous and incoming alerts
export const filterNewAlerts = (previousAlerts: Alert[], incomingAlerts: Alert[]) => {
  const previousAlertsData = previousAlerts.map((previousAlert: any) => {
    return {
      path: previousAlert.path,
      content: previousAlert.comments.edges[0].node.body
    };
  });

  return incomingAlerts.filter((incomingAlert) => previousAlertsData.every((previousAlertData: any) => {
    return incomingAlert.message !== previousAlertData.content && incomingAlert.filename !== previousAlertData.path
  }));
}

export const createReviewCommentsFromAlerts = async (context: Context, alerts: Alert[], filesPatchLineRangesMap: FilesPatchLineRangesMap) => {
  const owner = context.payload.repository.owner.login;
  const repo = context.payload.repository.name;
  const pullNumber = context.payload.number;
  const commitId = context.payload.pull_request.head.sha;

  const reviewCommentPromises = alerts.map((alert) => {
    const patchLineRanges = filesPatchLineRangesMap[alert.filename];
    if (patchLineRanges == null) return null;
    const encompassedRangeAndSide = getEncompassingRangeAndSideForAlert(patchLineRanges, alert.lineRange);
    return context.octokit.pulls.createReviewComment({
      owner,
      repo,
      pull_number: pullNumber,
      commit_id: commitId,
      body: alert.message,
      path: alert.filename,
      start_line: encompassedRangeAndSide.start.line,
      start_side: encompassedRangeAndSide.start.side,
      line: encompassedRangeAndSide.end.line,
      side: encompassedRangeAndSide.end.side
    })
  });
  const reviewComments = await Promise.all(reviewCommentPromises);
  return reviewComments;
}
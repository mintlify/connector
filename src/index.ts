// https://www.notion.so/mintlify/Installation-37aab83daa5e48b88cde8bd3891fa181
import { Context, Probot } from "probot";
import axios from 'axios';
import { Alert, File, getEncompassingRangeAndSideForAlert, parsePatch, PatchLineRange } from "./patch";
import { getReviewComments, ENDPOINT, checkIfAllAlertsAreResolve, createSuccessCheck, createActionRequiredCheck, createInProgressCheck } from "./helpers";

export = (app: Probot) => {
  app.on(["pull_request.opened", "pull_request.reopened", "pull_request.synchronize"], async (context) => {
    await createInProgressCheck(context);
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

    const filesPatchLineRangesMap: Record<string, PatchLineRange[]> = {};
    
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
    const previousAlertsData = previousAlerts.map((previousAlert: any) => {
      return {
        path: previousAlert.path,
        content: previousAlert.comments.edges[0].node.body
      };
    });

    const newAlerts = incomingAlerts.filter((incomingAlert) => {
      return previousAlertsData.every((previousAlertData: any) => {
        return incomingAlert.message !== previousAlertData.content && incomingAlert.filename !== previousAlertData.path
      });
    });
    const isAllPreviousAlertsResolved = checkIfAllAlertsAreResolve(previousAlerts);

    if (newAlerts.length === 0 && isAllPreviousAlertsResolved) {
      await createSuccessCheck(context);
      return;
    };

    const reviewCommentPromises: any[] = newAlerts.map((newAlert) => {
      const patchLineRanges = filesPatchLineRangesMap[newAlert.filename];
      if (patchLineRanges == null) return null;
      
      const encompassedRangeAndSide = getEncompassingRangeAndSideForAlert(patchLineRanges, newAlert.lineRange);
      return context.octokit.pulls.createReviewComment({
        owner,
        repo,
        pull_number: pullNumber,
        commit_id: context.payload.pull_request.head.sha,
        body: newAlert.message,
        path: newAlert.filename,
        start_line: encompassedRangeAndSide.start.line,
        start_side: encompassedRangeAndSide.start.side,
        line: encompassedRangeAndSide.end.line,
        side: encompassedRangeAndSide.end.side
      })
    });
    await Promise.all(reviewCommentPromises);
    await createActionRequiredCheck(context, newAlerts[0].url);
    return;
  });

  app.on('pull_request_review_thread.resolved' as any, async (context: Context) => {
    await createInProgressCheck(context);
    const previousAlerts = await getReviewComments(context);
    const isAllPreviousAlertsResolved = checkIfAllAlertsAreResolve(previousAlerts);

    if (!isAllPreviousAlertsResolved) {
      await createActionRequiredCheck(context);
    }

    await createSuccessCheck(context);
  });

  app.on('pull_request_review_thread.unresolved' as any, async (context: Context) => {
    const previousAlerts = await getReviewComments(context);
    const isAllPreviousAlertsResolved = checkIfAllAlertsAreResolve(previousAlerts);

    if (!isAllPreviousAlertsResolved) {
      await createActionRequiredCheck(context);
    }
  });
};
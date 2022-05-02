// https://www.notion.so/mintlify/Installation-37aab83daa5e48b88cde8bd3891fa181
import { ApplicationFunctionOptions, Context, Probot } from "probot";
import axios from 'axios';
import './services/mongoose';
import { Alert, getEncompassingRangeAndSideForAlert } from "./helpers/routes/patch";
import { getReviewComments, ENDPOINT, checkIfAllAlertsAreResolve,
  createSuccessCheck, createActionRequiredCheck, createInProgressCheck } from "./helpers/routes/octokit";
import headRouter from "./routes";
import { AlertsRequest } from "./helpers/routes/types";
import { getAllFilesAndMap } from "./helpers/github/app";

export = (app: Probot, { getRouter }: ApplicationFunctionOptions) => {
  app.on(["pull_request.opened", "pull_request.reopened", "pull_request.synchronize"], async (context) => {
    await createInProgressCheck(context);
    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;
    const pullNumber = context.payload.number;
    const commitId = context.payload.pull_request.head.sha;

    const { files, filesPatchLineRangesMap } = await getAllFilesAndMap(context);
    const alertsRequest: AlertsRequest = { files, owner }
    const connectPromise = axios.post(`${ENDPOINT}/routes/v01/`, alertsRequest);
    const previousAlertsPromise = getReviewComments(context);
    const [connectResponse, previousAlerts] = await Promise.all([connectPromise, previousAlertsPromise]);

    const incomingAlerts: Alert[] = connectResponse.data.alerts;
    const { newLinksMessage }: { newLinksMessage: string } = connectResponse.data;
  
    if (newLinksMessage != null) {
      const commentResponse = await context.octokit.rest.issues.listComments(context.issue());
      const comments = commentResponse.data.map((comment) => comment.body);
      if (!comments.includes(newLinksMessage)) {
        await context.octokit.issues.createComment(context.issue({body: newLinksMessage}))
      }
    }

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
        commit_id: commitId,
        body: newAlert.message,
        path: newAlert.filename,
        start_line: encompassedRangeAndSide.start.line,
        start_side: encompassedRangeAndSide.start.side,
        line: encompassedRangeAndSide.end.line,
        side: encompassedRangeAndSide.end.side
      })
    });
    await Promise.all(reviewCommentPromises);

    // Create tasks using review comments
    // const taskRequests = reviewComments.map(())
    await createActionRequiredCheck(context, newAlerts[0]?.url);
    return;
  });

  app.on(['pull_request_review_thread.resolved', 'pull_request_review_thread.unresolved'] as any, async (context: Context) => {
    await createInProgressCheck(context);
    const previousAlerts = await getReviewComments(context);
    const isAllPreviousAlertsResolved = checkIfAllAlertsAreResolve(previousAlerts);

    if (isAllPreviousAlertsResolved) {
      await createSuccessCheck(context);
    } else {
      await createActionRequiredCheck(context);
    }
  });

  const router = getRouter!("/routes");
  router.use(headRouter);
};
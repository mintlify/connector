// https://www.notion.so/mintlify/Installation-37aab83daa5e48b88cde8bd3891fa181

import { Context, Probot } from "probot";
import '../../services/mongoose';
import { getReviewComments, checkIfAllAlertsAreResolve,
  createSuccessCheck, createActionRequiredCheck, createInProgressCheck } from "../helpers/octokit";
import { createReviewCommentsFromAlerts, filterNewAlerts, getAlerts, getAllFilesAndMap, potentiallCreateNewLinksComment } from "../helpers/app";

const alerts = (app: Probot) => {
  app.on(["pull_request.opened", "pull_request.reopened", "pull_request.synchronize"], async (context) => {
    await createInProgressCheck(context);

    const { files, filesPatchLineRangesMap } = await getAllFilesAndMap(context);
    const { incomingAlerts, previousAlerts, newLinksMessage } = await getAlerts(context, files);
    potentiallCreateNewLinksComment(context, newLinksMessage);

    if (incomingAlerts == null) {
      return;
    }

    const newAlerts = filterNewAlerts(previousAlerts, incomingAlerts);
    const isAllPreviousAlertsResolved = checkIfAllAlertsAreResolve(previousAlerts);
    if (newAlerts.length === 0 && isAllPreviousAlertsResolved) {
      await createSuccessCheck(context);
      return;
    };

    await createReviewCommentsFromAlerts(context, newAlerts, filesPatchLineRangesMap);
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
};

export default alerts;

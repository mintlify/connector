import { ApplicationFunctionOptions, Context, Probot } from "probot";
import axios from "axios";
import { getReviewComments, checkIfAllAlertsAreResolve, createSuccessCheck, createActionRequiredCheck, createInProgressCheck, ENDPOINT } from "./helpers/github/octokit";
import headRouter from "./routes";
import { createReviewCommentsFromAlerts, filterNewAlerts, getAlerts, getAllFilesAndMap } from "./helpers/github/app";

export = (app: Probot, { getRouter }: ApplicationFunctionOptions) => {
  app.on(["pull_request.opened", "pull_request.reopened", "pull_request.synchronize"], async (context) => {
    await createInProgressCheck(context);

    const { files, filesPatchLineRangesMap } = await getAllFilesAndMap(context);
    const owner = context.payload.repository.owner.login;
    const repo = context.payload.pull_request.head.repo.name;

    if (files == null || owner == null || repo == null) {
      await createSuccessCheck(context);
      return;
    }

    const orgResponse = await axios.get(`${ENDPOINT}/routes/org/gitOrg/${owner}/details`, {
      params: {
        repo
      }
    });

    const { org, codes } = orgResponse.data;

    console.log({org});
    console.log({codes});

    if (codes.length === 0 || org == null) {
      await createSuccessCheck(context);
      return;
    }

    const { incomingAlerts, previousAlerts } = await getAlerts(context, files, codes);

    if (incomingAlerts == null) {
      await createSuccessCheck(context);
      return;
    }

    const newAlerts = filterNewAlerts(previousAlerts, incomingAlerts);
    const isAllPreviousAlertsResolved = checkIfAllAlertsAreResolve(previousAlerts);
    if (newAlerts.length === 0 && isAllPreviousAlertsResolved) {
      await createSuccessCheck(context);
      return;
    };

    const eventPromise = axios.post(`${ENDPOINT}/routes/events/alerts`, {
      alerts: newAlerts,
      org
    });
    const reviewCommentsPromise =  createReviewCommentsFromAlerts(context, newAlerts, filesPatchLineRangesMap);
    const checkPromise = createActionRequiredCheck(context, newAlerts[0]?.url);
    await Promise.all([eventPromise, reviewCommentsPromise, checkPromise])

    // Create tasks using review comments
    // const taskRequests = reviewComments.map(())
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
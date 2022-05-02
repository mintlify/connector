// https://mintlify.readme.io/reference/start
import VersionTask from "../models/VersionTask";
import { getContentFromWebpage } from "../services/webscraper";
import { Alert } from "./patch";
import { AlertsRequest } from "./types";

export const createVersionTasks = async (alerts: Alert[], alertsRequest: AlertsRequest): Promise<void> => {
  const contentFromAlertPromises = alerts.map((alert) => {
    return getContentFromWebpage(alert.url);
  });

  const contentFromAlerts = await Promise.all(contentFromAlertPromises);
  const versionTasks = alerts.map((alert, i) => {
    const content = contentFromAlerts[i];
    return {
      github: alertsRequest,
      url: alert.url,
      content,
    }
  })

  await VersionTask.insertMany(versionTasks);
  return;
}
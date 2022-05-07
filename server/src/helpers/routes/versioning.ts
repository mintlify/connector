// https://mintlify.readme.io/reference/start
import { AuthConnectorType } from "../../models/AuthConnector";
import VersionTask from "../../models/VersionTask";
import { getContentFromWebpage } from "../../services/webscraper";
import { Alert } from "./patch";
import { AlertsRequest } from "./types";

export const createVersionTasks = async (alerts: Alert[], alertsRequest: AlertsRequest, authConnector?: AuthConnectorType): Promise<void> => {
  const contentFromAlertPromises = alerts.map((alert) => {
    return getContentFromWebpage(alert.url, authConnector);
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
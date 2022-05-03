// https://www.notion.so/mintlify/Installation-37aab83daa5e48b88cde8bd3891fa181
import { ApplicationFunctionOptions, Probot } from "probot";

import headRouter from "./routes";
import alerts from "./github/alerts";
import gitbook from "./github/gitbook";

export = (app: Probot, { getRouter }: ApplicationFunctionOptions) => {
  gitbook(app);
  alerts(app);
  const router = getRouter!("/routes");
  router.use(headRouter);
};
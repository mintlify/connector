// https://www.notion.so/mintlify/Installation-37aab83daa5e48b88cde8bd3891fa181
import { Probot } from "probot";

import { alerts } from "./alerts";
import gitbook from "./gitbook";

export = (app: Probot) => {
  gitbook(app);
  alerts(app);
};
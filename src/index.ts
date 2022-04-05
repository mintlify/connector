import { Probot } from "probot";

export = (app: Probot) => {
  app.on("pull_request.opened", async () => {
    console.log("Hey there");
  });
  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};

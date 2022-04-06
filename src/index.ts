import { Probot } from "probot";
import { parsePatch } from "./patch";

export = (app: Probot) => {
  app.on(["pull_request.opened", "pull_request.reopened"], async (context) => {
    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;
    const pullNumber = context.payload.number;
    const baseRef = context.payload.pull_request.base.ref;

    const files = await context.octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: pullNumber,
      page: 0,
      per_page: 100
    });

    const filesContext = files.data.map(file => {
      return {
        path: file.filename,
        patch: file.patch
      }
    });
    
    filesContext.forEach(async (fileContext) => {
      try {
        const contentRequest = context.repo({ path: fileContext.path, ref: baseRef });
        const content = await context.octokit.repos.getContent(contentRequest) as { data: { content: string } };
        const contentString = Buffer.from(content.data.content, 'base64').toString();

        const changes = parsePatch(fileContext.patch);

        context.log.info(contentString);
        context.log.info(changes);
      } catch {
        context.log.error(`File doesn't exist for ${fileContext.path}`);
      }
    })
  });
};
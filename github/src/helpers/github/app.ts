import { Context } from "probot";
import { FileInfo, parsePatch, PatchLineRange } from "../routes/patch";

type AllFilesAndMap = {
  files: FileInfo[],
  filesPatchLineRangesMap: Record<string, PatchLineRange[]>,
}

export const getAllFilesAndMap = async (context: Context): Promise<AllFilesAndMap> => {
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

  const files = await Promise.all(getFilesContentPromises) as FileInfo[];
  return {
    files,
    filesPatchLineRangesMap
  }
}
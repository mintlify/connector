import { Probot } from "probot";
import axios from 'axios';
import { Change, parsePatch } from "./patch";

type File = {
  filename: string;
	content: string;
	changes: Change[]
}

type LineRange = {
  start: number;
  end: number;
}

type Alert = {
  url: string;
  message: string;
  filename: string;
  lineRange: LineRange
}

export = (app: Probot) => {
  app.on(["pull_request.opened", "pull_request.reopened"], async (context) => {
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
    
    const getFilesContentPromises = filesContext.map((fileContext) => {
      return new Promise(async (resolve) => {
        try {
          const contentRequest = context.repo({ path: fileContext.path, ref: headRef });
          const content = await context.octokit.repos.getContent(contentRequest) as { data: { content: string } };
          const contentString = Buffer.from(content.data.content, 'base64').toString();
  
          const changes = parsePatch(fileContext.patch);
  
          resolve({
            filename: fileContext.path,
            content: contentString,
            changes: changes
          })
  
        } catch {
          resolve(null);
        }
      })
    });

    const files = await Promise.all(getFilesContentPromises) as File[];
    const response = await axios.post(`http://localhost:5000/connect/v01/`, {
      files,
      owner,
    });

    const alerts: Alert[] = response.data.alerts;
    if (alerts?.length === 0) {
      await context.octokit.pulls.createReview({
        owner,
        repo,
        pull_number: pullNumber,
        commit_id: context.payload.pull_request.head.sha,
        event: 'APPROVE',
      });

      return;
    };

    // https://github.com/mintlify/connect
    const comments = alerts.map((alert) => {
      return {
        body: alert.message,
        path: alert.filename,
        // start_line: alert.lineRange.start,
        // start_side: 'RIGHT',
        line: alert.lineRange.start,
        side: 'RIGHT'
      };
    });

    await context.octokit.pulls.createReview({
      owner,
      repo,
      pull_number: pullNumber,
      body: response.data.reviewAlert,
      commit_id: context.payload.pull_request.head.sha,
      event: 'REQUEST_CHANGES',
      comments,
    });
  });

  app.on('pull_request_review_thread.resolved' as any, async (context) => {
    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;
    const pullNumber = context.payload.pull_request.number;
    const reviewComments: any = await context.octokit.graphql(`query FetchReviewComments {
      repository(owner: "${owner}", name: "${repo}") {
        pullRequest(number: ${pullNumber}) {
          reviewDecision
          reviewThreads(first: 100) {
            edges {
              node {
                isResolved
                comments(first: 1) {
                  edges {
                    node {
                      body
                      author {
                        login
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }`);

    const ADMIN_LOGIN = 'mintlify-connect';

    const allAdminReviewComments = reviewComments.repository.pullRequest.reviewThreads.edges.filter((edge: any) => {
      return edge.node.comments.edges[0].node.author.login === ADMIN_LOGIN;
    });

    const isAllResolved = allAdminReviewComments.every((comment: any) => comment.node.isResolved);

    if (isAllResolved) {
      await context.octokit.pulls.createReview({
        owner,
        repo,
        pull_number: pullNumber,
        commit_id: context.payload.pull_request.head.sha,
        event: 'APPROVE'
      });
    }
  })
};
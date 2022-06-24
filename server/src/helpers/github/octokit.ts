import { Context } from "probot";
import { ISDEV } from "../environment";

export const ADMIN_LOGIN = ISDEV ? 'mintlify-dev' : 'mintlify';
export const ENDPOINT = ISDEV ? 'http://localhost:5000' : 'https://connect.mintlify.com'
const checkName = ISDEV ? 'Dev - Continuous Documentation Check' : 'Continuous Documentation Check';

export const getReviewComments = async (context: Context) => {
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
              path
              id
              comments(first: 1) {
                edges {
                  node {
                    body
                    id
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
  const allAdminReviewComments = reviewComments.repository.pullRequest.reviewThreads.edges.filter((edge: any) => {
    return edge.node.comments.edges[0].node.author.login === ADMIN_LOGIN;
  });
  return allAdminReviewComments.map((reviewComment: any) => reviewComment.node);
}

export const checkIfAllAlertsAreResolve = (allConnectReviewComments: any[]) => {
  return allConnectReviewComments.every((comment: any) => comment.isResolved);
}

export const createInProgressCheck = (context: Context) => {
  const owner = context.payload.repository.owner.login;
  const repo = context.payload.repository.name;

  return context.octokit.checks.create({
    owner,
    repo,
    head_sha: context.payload.pull_request.head.sha,
    name: checkName,
    status: 'in_progress'
  })
}

export const createSuccessCheck = (context: Context) => {
  const owner = context.payload.repository.owner.login;
  const repo = context.payload.repository.name;

  return context.octokit.checks.create({
    owner,
    repo,
    head_sha: context.payload.pull_request.head.sha,
    name: checkName,
    status: 'completed',
    conclusion: 'success',
  })
}

export const createActionRequiredCheck = (context: Context, detailsUrl?: string) => {
  const owner = context.payload.repository.owner.login;
  const repo = context.payload.repository.name;

  return context.octokit.checks.create({
    owner,
    repo,
    head_sha: context.payload.pull_request.head.sha,
    name: checkName,
    status: 'completed',
    conclusion: 'action_required',
    details_url: detailsUrl,
  })
}
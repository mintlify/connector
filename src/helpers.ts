import { Context } from "probot";

const ISDEV = process.env.NODE_ENV === 'development';
export const ADMIN_LOGIN = ISDEV ? 'mintlify-connect-dev' : 'mintlify-connect';
export const ENDPOINT = ISDEV ? 'http://localhost:5000' : 'https://api.mintlify.com'

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

  const allAdminReviewComments = reviewComments.repository.pullRequest.reviewThreads.edges.filter((edge: any) => {
    return edge.node.comments.edges[0].node.author.login === ADMIN_LOGIN;
  });

  return allAdminReviewComments.map((reviewComment: any) => reviewComment.node);
}

export const checkIfAllAlertsAreResolve = (allConnectReviewComments: any[]) => {
  return allConnectReviewComments.every((comment: any) => comment.isResolved);
}
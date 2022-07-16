import { ApplicationFunctionOptions, Context, Probot } from 'probot';
import headRouter from './routes';
import './services/mongoose';

export = (app: Probot, { getRouter }: ApplicationFunctionOptions) => {
  app.on(['pull_request.opened', 'pull_request.reopened', 'pull_request.synchronize'], async (_) => {
    return;
  });

  app.on(['pull_request_review_thread.resolved', 'pull_request_review_thread.unresolved'] as any, async (_: Context) => {
    return;
  });

  const router = getRouter!('/routes');
  router.use(headRouter);
};

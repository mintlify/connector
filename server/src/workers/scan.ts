import throng from 'throng';
import '../services/mongoose';
import { workers, workQueue, MAX_JOBS_PER_WORKER } from './';
import { scanDocsInOrg } from '../routes/scan';

const startScanWorker = () => {
  workQueue.process(MAX_JOBS_PER_WORKER, async (job) => {
    const { orgId } = job.data;
    const diffAlerts = await scanDocsInOrg(orgId);
    return {
      diffAlerts
    };
  });
}

throng({ workers, start: startScanWorker });
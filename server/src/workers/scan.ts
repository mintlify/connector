import throng from 'throng';
import '../services/mongoose';
import { workers, workQueue, MAX_JOBS_PER_WORKER } from './';
import { scanDocsInOrg } from '../routes/scan';

const startScanWorker = () => {
  workQueue.process(MAX_JOBS_PER_WORKER, async (job) => {
    try {
      const { orgId } = job.data;
      const diffAlerts = await scanDocsInOrg(orgId);
      return {
        diffAlerts
      };
    } catch (error) {
      console.log(error);
    }
    
  });
}

throng({ workers, start: startScanWorker });
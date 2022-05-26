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
      const { orgId } = job.data;
      console.log('Error detected for orgId', orgId)
      console.log(error);
      return;
    }
    
  });
}

throng({ workers, start: startScanWorker });
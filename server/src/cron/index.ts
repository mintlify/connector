// Used only for development. Cron jobs in production is hosted using EasyCron
import cron from 'node-cron';
import axios from 'axios';

cron.schedule('* * * * *', async () => {
  console.log('running scan');
  const { diffAlerts }: any = await axios.post('http://localhost:5000/routes/scan', {
    org: 'mintlify'
  });

  console.log('Changing cron stuffff');

  console.log(`scan completed. Found ${diffAlerts.length} alerts`);
});
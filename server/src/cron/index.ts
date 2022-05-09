// Used only for development. Cron jobs in production is hosted using EasyCron
import cron from 'node-cron';
import axios from 'axios';

cron.schedule('* * * * *', () => {
  console.log('running scan');
  axios.post('http://localhost:5000/routes/scan', {
    org: 'mintlify'
  });
});
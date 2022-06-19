import express from 'express';
import { ISDEV } from '../helpers/environment';
import Org from '../models/Org';
import { stripe } from '../services/stripe';

const stripeRouter = express.Router();

stripeRouter.get('/checkout', async (req, res) => {
  const { priceId, orgId, email } = req.query;

  if (!priceId || typeof priceId !== 'string') {
    return res.status(400).send({error: 'No price ID provided'});
  }

  if (!email || typeof email !== 'string') {
    return res.status(400).send({error: 'No email provided'});
  }

  const org = await Org.findById(orgId);
  if (org == null) {
    return res.status(400).send({error: 'No org found'});
  }

  const DOMAIN = ISDEV ? 'http://localhost:3000' : `https://${org.subdomain}.mintlify.com`;

  const checkoutSession = await stripe.checkout.sessions.create({
    billing_address_collection: 'auto',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer_email: email,
    mode: 'subscription',
    success_url: `${DOMAIN}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${DOMAIN}/settings/billing`,
    subscription_data: {
      metadata: {
        orgId: org._id.toString()
      },
      trial_period_days: 14
    },
  });

  return res.redirect(303, checkoutSession.url || DOMAIN);
})

stripeRouter.post('/webhook', async (req, res) => {
    let event = req.body;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (endpointSecret) {
      const signature = req.headers['stripe-signature'] as string;
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          endpointSecret
        );
      } catch (err: any) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return res.sendStatus(400);
      }
    }
    let subscription;
    // Handle the event
    switch (event.type) {
      case 'customer.subscription.trial_will_end':
        subscription = event.data.object;
        // Then define and call a method to handle the subscription trial ending.
        // handleSubscriptionTrialEnding(subscription);
        break;
      case 'customer.subscription.deleted':
        subscription = event.data.object;
        if (!subscription.metadata.orgId) {
          return res.end();
        }
        await Org.findByIdAndUpdate(subscription.metadata.orgId, { 'plan.name': 'free' });
        // Then define and call a method to handle the subscription deleted.
        // handleSubscriptionDeleted(subscriptionDeleted);
        break;
      case 'customer.subscription.created':
        subscription = event.data.object;
        if (!subscription.metadata.orgId) {
          return res.end();
        }
        await Org.findByIdAndUpdate(subscription.metadata.orgId, { plan: { name: 'pro', subscribedAt: new Date() } })
        break;
      case 'customer.subscription.updated':
        subscription = event.data.object;
        // Then define and call a method to handle the subscription update.
        // handleSubscriptionUpdated(subscription);
        break;
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }
    // Return a 200 response to acknowledge receipt of the event
    return res.send();
  }
);

export default stripeRouter;
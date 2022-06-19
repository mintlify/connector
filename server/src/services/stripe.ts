import Stripe from 'stripe';

const STRIPE_API_KEY = process.env.STRIPE_API_KEY as string;
export const stripe = new Stripe(STRIPE_API_KEY, {
  apiVersion: '2020-08-27'
});
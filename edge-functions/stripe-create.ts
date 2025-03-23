import { createEdgeRouter } from 'expo-router/server';
import Stripe from 'stripe';

const router = createEdgeRouter();

router.post(async (req, res) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });

    const body = await req.json();

    const { amount } = body;

    if (!amount) {
      return res.status(400).json({ error: 'Missing amount' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method_types: ['card'],
    });

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Stripe Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export const handler = router.handler();

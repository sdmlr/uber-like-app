import { createEdgeRouter } from 'expo-router/server';
import Stripe from 'stripe';

const router = createEdgeRouter();

router.post(async (req, res) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });

    const { payment_method, payment_intent_id, customer_id } = await req.json();

    if (!payment_method || !payment_intent_id || !customer_id) {
      return res.status(400).json({
        error: 'Missing required payment information',
      });
    }

    const paymentMethod = await stripe.paymentMethods.attach(payment_method, {
      customer: customer_id,
    });

    const result = await stripe.paymentIntents.confirm(payment_intent_id, {
      payment_method: paymentMethod.id,
      return_url: 'myapp://book-ride',
    });

    return res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully',
      result,
    });
  } catch (error) {
    console.error('Stripe Payment Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
    });
  }
});

export const handler = router.handler();

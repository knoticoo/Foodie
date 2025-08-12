import { Router } from 'express';
import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { requireAuth } from '../middleware/auth.js';
import { pgPool } from '../db/pool.js';
import { env } from '../config/env.js';

export const billingRouter = Router();

function getStripe(): Stripe {
  if (!env.stripe.secretKey) {
    throw new Error('Stripe not configured: STRIPE_SECRET_KEY missing');
  }
  return new Stripe(env.stripe.secretKey, { apiVersion: '2023-10-16' });
}

// Create a Checkout Session for subscription
billingRouter.post('/checkout', requireAuth, async (req, res) => {
  if (!env.stripe.secretKey || !env.stripe.priceId) {
    return res.status(500).json({ error: 'Stripe not configured. Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID' });
  }

  const user = (req as any).user as { id: string };

  // Optional success/cancel URLs can be passed by client
  const body = req.body as { successUrl?: string; cancelUrl?: string };
  const successUrl = body.successUrl || 'https://example.com/success';
  const cancelUrl = body.cancelUrl || 'https://example.com/cancel';

  // Lookup or create a Stripe customer and attach to user
  const { rows } = await pgPool.query('SELECT email, stripe_customer_id FROM users WHERE id=$1', [user.id]);
  const userRow = rows[0] || {};
  const email = userRow.email as string | undefined;
  let customerId: string | undefined = userRow.stripe_customer_id as string | undefined;

  const stripe = getStripe();
  if (!customerId) {
    const customer = await stripe.customers.create({ email, metadata: { user_id: user.id } });
    customerId = customer.id;
    await pgPool.query('UPDATE users SET stripe_customer_id=$1 WHERE id=$2', [customerId, user.id]);
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: env.stripe.priceId, quantity: 1 }],
    success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: cancelUrl,
    metadata: { user_id: user.id }
  });

  res.json({ url: session.url });
});

// Customer Portal to manage subscription
billingRouter.post('/portal', requireAuth, async (req, res) => {
  if (!env.stripe.secretKey) return res.status(500).json({ error: 'Stripe not configured' });
  const user = (req as any).user as { id: string };
  const { rows } = await pgPool.query('SELECT stripe_customer_id FROM users WHERE id=$1', [user.id]);
  const customerId = rows[0]?.stripe_customer_id as string | undefined;
  if (!customerId) return res.status(400).json({ error: 'No Stripe customer' });

  const stripe = getStripe();
  const body = req.body as { returnUrl?: string };
  const returnUrl = body.returnUrl || 'https://example.com/account';
  const portal = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });
  res.json({ url: portal.url });
});

// Separate webhook handler to allow raw body in app index
export async function billingWebhookHandler(req: Request, res: Response) {
  if (!env.stripe.secretKey || !env.stripe.webhookSecret) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  const stripe = getStripe();
  const sig = req.headers['stripe-signature'] as string | undefined;
  if (!sig) return res.status(400).send('Missing signature');

  let event: Stripe.Event;
  try {
    // @ts-ignore req.body is Buffer due to express.raw()
    event = stripe.webhooks.constructEvent(req.body, sig, env.stripe.webhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = (session.metadata?.user_id as string | undefined) || undefined;
        const customerId = session.customer as string | undefined;
        if (userId && customerId) {
          // Fetch subscription to get current period end
          let premiumExpiresAt: Date | null = null;
          if (session.subscription) {
            const subId = session.subscription as string;
            const subscription = await stripe.subscriptions.retrieve(subId);
            if (subscription.current_period_end) {
              premiumExpiresAt = new Date(subscription.current_period_end * 1000);
            }
          }
          await pgPool.query(
            'UPDATE users SET is_premium=TRUE, premium_expires_at=$1, stripe_customer_id=$2 WHERE id=$3',
            [premiumExpiresAt ? premiumExpiresAt.toISOString() : null, customerId, userId]
          );
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
        await pgPool.query('UPDATE users SET is_premium=TRUE, premium_expires_at=$1 WHERE stripe_customer_id=$2', [currentPeriodEnd, customerId]);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        await pgPool.query('UPDATE users SET is_premium=FALSE WHERE stripe_customer_id=$1', [customerId]);
        break;
      }
      default:
        // Ignore other events
        break;
    }
  } catch (e) {
    // Log and continue
    console.error('Webhook handling error', e);
  }

  res.json({ received: true });
}

// Status remains for clients
billingRouter.get('/status', requireAuth, async (req, res) => {
  const user = (req as any).user as { id: string };
  const { rows } = await pgPool.query('SELECT is_premium, premium_expires_at FROM users WHERE id = $1', [user.id]);
  const r = rows[0] || { is_premium: false, premium_expires_at: null };
  res.json({ isPremium: Boolean(r.is_premium) || (r.premium_expires_at && new Date(r.premium_expires_at) > new Date()), premiumExpiresAt: r.premium_expires_at });
});
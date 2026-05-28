/**
 * Stripe Billing Service
 * Handles subscription management, payments, and billing
 */

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-04-10",
});

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  features: string[];
  maxScans: number;
  maxTargets: number;
}

// Define subscription plans
export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  starter: {
    id: "starter",
    name: "Starter",
    price: 29,
    currency: "usd",
    interval: "month",
    features: [
      "Up to 50 scans/month",
      "Up to 5 targets",
      "Basic vulnerability scanning",
      "Email support",
    ],
    maxScans: 50,
    maxTargets: 5,
  },
  professional: {
    id: "professional",
    name: "Professional",
    price: 99,
    currency: "usd",
    interval: "month",
    features: [
      "Up to 500 scans/month",
      "Up to 50 targets",
      "Advanced vulnerability scanning",
      "API access",
      "Priority support",
      "Custom reports",
    ],
    maxScans: 500,
    maxTargets: 50,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: 499,
    currency: "usd",
    interval: "month",
    features: [
      "Unlimited scans",
      "Unlimited targets",
      "Advanced threat detection",
      "Full API access",
      "24/7 support",
      "Custom integrations",
      "Dedicated account manager",
    ],
    maxScans: -1,
    maxTargets: -1,
  },
};

/**
 * Create a Stripe customer
 */
export async function createCustomer(email: string, name: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        createdAt: new Date().toISOString(),
      },
    });
    return customer;
  } catch (error) {
    console.error("Error creating Stripe customer:", error);
    throw error;
  }
}

/**
 * Create a subscription
 */
export async function createSubscription(
  customerId: string,
  planId: string,
  paymentMethodId?: string
) {
  try {
    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan) {
      throw new Error(`Invalid plan: ${planId}`);
    }

    // Create price if it doesn't exist
    const priceData = {
      unit_amount: Math.round(plan.price * 100),
      currency: plan.currency,
      recurring: {
        interval: plan.interval,
      },
      product_data: {
        name: plan.name,
        description: plan.features.join(", "),
      },
    };

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price_data: priceData,
        },
      ],
      payment_method: paymentMethodId,
      default_payment_method: paymentMethodId,
      automatic_tax: { enabled: true },
    });

    return subscription;
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }
}

/**
 * Update subscription plan
 */
export async function updateSubscription(subscriptionId: string, newPlanId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const plan = SUBSCRIPTION_PLANS[newPlanId];

    if (!plan) {
      throw new Error(`Invalid plan: ${newPlanId}`);
    }

    const priceData = {
      unit_amount: Math.round(plan.price * 100),
      currency: plan.currency,
      recurring: {
        interval: plan.interval,
      },
      product_data: {
        name: plan.name,
      },
    };

    const updated = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0]!.id,
          price_data: priceData,
        },
      ],
      proration_behavior: "create_prorations",
    });

    return updated;
  } catch (error) {
    console.error("Error updating subscription:", error);
    throw error;
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string, immediate = false) {
  try {
    const subscription = await stripe.subscriptions.del(subscriptionId);
    return subscription;
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw error;
  }
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error("Error retrieving subscription:", error);
    throw error;
  }
}

/**
 * Create payment intent for one-time payment
 */
export async function createPaymentIntent(
  customerId: string,
  amount: number,
  currency = "usd",
  description?: string
) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      customer: customerId,
      amount: Math.round(amount * 100),
      currency,
      description,
      automatic_tax: { enabled: true },
    });

    return paymentIntent;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
}

/**
 * Handle webhook events
 */
export async function handleWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case "customer.subscription.updated":
      console.log("Subscription updated:", event.data.object);
      // TODO: Update subscription status in database
      break;

    case "customer.subscription.deleted":
      console.log("Subscription deleted:", event.data.object);
      // TODO: Handle subscription cancellation
      break;

    case "payment_intent.succeeded":
      console.log("Payment succeeded:", event.data.object);
      // TODO: Handle successful payment
      break;

    case "payment_intent.payment_failed":
      console.log("Payment failed:", event.data.object);
      // TODO: Handle payment failure
      break;

    case "invoice.payment_succeeded":
      console.log("Invoice paid:", event.data.object);
      // TODO: Handle invoice payment
      break;

    default:
      console.log("Unhandled event type:", event.type);
  }
}

/**
 * Get billing portal URL
 */
export async function getBillingPortalUrl(customerId: string, returnUrl: string) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session.url;
  } catch (error) {
    console.error("Error creating billing portal session:", error);
    throw error;
  }
}

/**
 * Create checkout session
 */
export async function createCheckoutSession(
  customerId: string,
  planId: string,
  successUrl: string,
  cancelUrl: string
) {
  try {
    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan) {
      throw new Error(`Invalid plan: ${planId}`);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: plan.currency,
            product_data: {
              name: plan.name,
              description: plan.features.join(", "),
            },
            unit_amount: Math.round(plan.price * 100),
            recurring: {
              interval: plan.interval,
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return session;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

// app/api/create-checkout-session/route.js

import Stripe from 'stripe';
import { NextResponse } from 'next/server';

// Initialize Stripe with your secret key
// Ensure STRIPE_SECRET_KEY is set in your .env.local file
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15', // Use a recent stable API version
});

export async function POST(req) {
  try {
    const { amount } = await req.json(); // Expecting amount in cents (e.g., 500 for $5.00)

    // Validate the amount
    if (!amount || typeof amount !== 'number' || amount < 50) { // Minimum $0.50 for Stripe
      return NextResponse.json({ error: 'Invalid amount provided.' }, { status: 400 });
    }

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], // Only card payments for simplicity
      line_items: [
        {
          price_data: {
            currency: 'usd', // Or your desired currency
            product_data: {
              name: 'Support for Developer Education',
              description: `One-time donation to support the developer's education.`,
            },
            unit_amount: amount, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment', // For one-time payments
      success_url: `${req.headers.get('origin')}/support?success=true`, // Redirect after successful payment
      cancel_url: `${req.headers.get('origin')}/support?canceled=true`,   // Redirect if user cancels
      metadata: {
        // Optional: Add any metadata you want to associate with the payment
        // For example, you could add a user ID if your app has authentication
        donation_amount_cents: amount,
      },
    });

    // Return the session URL to the frontend
    return NextResponse.json({ sessionId: session.id, url: session.url });

  } catch (error) {
    console.error('Error creating Stripe Checkout session:', error);
    return NextResponse.json({ error: error.message || 'Failed to create checkout session.' }, { status: 500 });
  }
}

// app/support/page.js
'use client'

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Separate component that uses useSearchParams
function SupportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Get Stripe Publishable Key from environment variable
  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  useEffect(() => {
    // Check for success or cancel query parameters from Stripe redirect
    if (searchParams.get('success')) {
      setMessage('Thank you for your generous support! Your contribution means a lot.');
      // Clear the query params after displaying message
      router.replace('/support', undefined, { shallow: true });
    } else if (searchParams.get('canceled')) {
      setMessage('Payment canceled. No worries, you can always support later!');
      router.replace('/support', undefined, { shallow: true });
    }
  }, [searchParams, router]);

  const handleSupport = async (amountCents) => {
    setLoading(true);
    setMessage('');

    if (!stripePublishableKey) {
      setMessage('Stripe Publishable Key is not configured. Please check .env.local');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: amountCents }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate payment.');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;

    } catch (error) {
      console.error('Frontend payment initiation error:', error);
      setMessage(`Error: ${error.message}`);
      setLoading(false);
    }
  };

  const donationOptions = [
    { label: '$5', value: 500 },
    { label: '$10', value: 1000 },
    { label: '$25', value: 2500 },
    { label: 'Custom', value: 'custom' },
  ];

  const [customAmount, setCustomAmount] = useState('');

  const handleCustomSupport = () => {
    const amountInCents = parseFloat(customAmount) * 100;
    if (isNaN(amountInCents) || amountInCents < 50) {
      setMessage('Please enter a valid amount (minimum $0.50).');
      return;
    }
    handleSupport(amountInCents);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6
                     bg-gradient-to-br from-amber-50 to-teal-100 font-inter">
      <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-xl w-full text-center
                      transform transition-transform duration-300 hover:scale-[1.01]
                      border border-gray-200">
        <h1 className="text-4xl font-extrabold mb-4 text-gray-800">
          Support the Developer 💘
        </h1>
        <p className="text-gray-600 mb-6 text-lg">
          Your generous contribution directly fuels my learning journey and helps me continue building useful tools like this AI image generator. Every bit helps!
        </p>

        {message && (
          <p className={`p-3 rounded-lg mb-4 ${message.includes('Thank you') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
            {message}
          </p>
        )}

        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {donationOptions.slice(0, 3).map((option) => (
            <button
              key={option.value}
              onClick={() => handleSupport(option.value)}
              className="bg-teal-600 text-white font-semibold px-6 py-3 rounded-xl
                         hover:bg-teal-700 transition-all duration-300 ease-in-out
                         shadow-md hover:shadow-lg focus:outline-none focus:ring-3 focus:ring-teal-400
                         disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
          <input
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Enter custom amount (USD)"
            className="flex-1 border border-gray-300 rounded-xl px-5 py-3 text-gray-700
                       focus:outline-none focus:ring-3 focus:ring-teal-400 focus:border-transparent
                       shadow-sm transition-all duration-200 placeholder-gray-400 min-w-0 sm:min-w-[200px]"
            disabled={loading}
            min="0.50"
            step="0.01"
          />
          <button
            onClick={handleCustomSupport}
            className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl
                       hover:bg-blue-700 transition-all duration-300 ease-in-out
                       shadow-md hover:shadow-lg focus:outline-none focus:ring-3 focus:ring-blue-400
                       disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            Donate Custom Amount
          </button>
        </div>

        <button
          onClick={() => router.push('/')}
          className="mt-6 text-teal-600 hover:text-teal-800 transition-colors duration-200
                     font-medium text-lg"
        >
          ← Back to AI Canvas
        </button>
      </div>
    </main>
  );
}

// Loading component for Suspense fallback
function SupportLoading() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6
                     bg-gradient-to-br from-amber-50 to-teal-100 font-inter">
      <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-xl w-full text-center
                      border border-gray-200">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-6"></div>
          <div className="flex justify-center gap-4 mb-6">
            <div className="h-12 w-20 bg-gray-200 rounded-xl"></div>
            <div className="h-12 w-20 bg-gray-200 rounded-xl"></div>
            <div className="h-12 w-20 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Main component that wraps SupportContent in Suspense
export default function SupportPage() {
  return (
    <Suspense fallback={<SupportLoading />}>
      <SupportContent />
    </Suspense>
  );
}
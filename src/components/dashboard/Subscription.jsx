import React, { useState, useEffect } from 'react';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const Subscription = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState({ symbol: '$', rate: 1 });
  
  useEffect(() => {
    const detectCurrency = () => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const currencyMap = {
        'Asia/Kolkata': { symbol: '₹', rate: 83 },
        'Asia/Calcutta': { symbol: '₹', rate: 83 },
        'America/New_York': { symbol: '$', rate: 1 },
        'America/Los_Angeles': { symbol: '$', rate: 1 },
        'America/Chicago': { symbol: '$', rate: 1 },
        'Europe/London': { symbol: '£', rate: 0.79 },
        'Europe/Paris': { symbol: '€', rate: 0.92 },
        'Europe/Berlin': { symbol: '€', rate: 0.92 },
        'Australia/Sydney': { symbol: 'A$', rate: 1.52 },
        'Asia/Dubai': { symbol: 'AED', rate: 3.67 },
        'Asia/Singapore': { symbol: 'S$', rate: 1.34 },
      };
      
      if (currencyMap[timezone]) {
        setCurrency(currencyMap[timezone]);
      } else if (timezone.startsWith('Asia/')) {
        setCurrency({ symbol: '₹', rate: 83 });
      } else if (timezone.startsWith('Europe/')) {
        setCurrency({ symbol: '€', rate: 0.92 });
      } else {
        setCurrency({ symbol: '$', rate: 1 });
      }
    };
    
    detectCurrency();
  }, []);

  useEffect(() => {
    fetchCurrentSubscription();
  }, []);

  const fetchCurrentSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      setCurrentPlan(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      name: 'STARTER',
      icon: Sparkles,
      price: { monthly: 2407, yearly: 24070 },
      description: 'Perfect for getting started',
      features: [
        'Up to 3 courses',
        '1 website builder',
        '100 students',
        'Basic video hosting',
        'Email support'
      ],
      color: 'from-blue-500 to-cyan-500',
      popular: false
    },
    {
      name: 'PROFESSIONAL',
      icon: Zap,
      price: { monthly: 6557, yearly: 65570 },
      description: 'For growing businesses',
      features: [
        'Unlimited courses',
        '5 website builders',
        'Unlimited students',
        'Advanced video hosting',
        'Priority support'
      ],
      color: 'from-purple-500 to-pink-500',
      popular: true
    },
    {
      name: 'ENTERPRISE',
      icon: Crown,
      price: { monthly: 16517, yearly: 165170 },
      description: 'For large organizations',
      features: [
        'Unlimited courses',
        'Unlimited website builders',
        'Unlimited students',
        'Enterprise video hosting',
        'Dedicated support'
      ],
      color: 'from-amber-500 to-orange-500',
      popular: false
    }
  ];

  const handleSubscribe = async (planName, price) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/signin';
        return;
      }

      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount: price,
          courseName: `${planName} Subscription - ${billingCycle}`,
          courseId: `subscription_${planName.toLowerCase()}_${billingCycle}`
        })
      });

      const data = await response.json();
      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast.error('Payment initiation failed');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  return (
    <div className="space-y-8">
      {currentPlan && (
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Current Plan: {currentPlan.plan_name}</h3>
          <p className="text-sm opacity-90">Billing: {currentPlan.plan_type} • Amount: ₹{currentPlan.amount}</p>
          <p className="text-sm opacity-90">Valid until: {new Date(currentPlan.end_date).toLocaleDateString()}</p>
        </div>
      )}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Choose Your Plan</h2>
        <p className="text-gray-600 mt-2">Select the perfect plan for your learning platform</p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center space-x-4">
        <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
          Monthly
        </span>
        <button
          onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
          className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
          Yearly
          <span className="ml-1.5 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
            Save 17%
          </span>
        </span>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly;
          
          return (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl shadow-sm border-2 transition-all hover:shadow-xl hover:-translate-y-1 ${
                plan.popular ? 'border-primary-500 shadow-lg' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-1 text-xs font-semibold text-white shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Icon */}
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${plan.color} mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>

                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-gray-900">{currency.symbol}{Math.round(price * currency.rate).toLocaleString()} /{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="text-sm text-gray-500 mt-1">
                      {currency.symbol}{Math.round((price * currency.rate) / 12).toLocaleString()} /month billed annually
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleSubscribe(plan.name, price)}
                  disabled={currentPlan?.plan_name === plan.name}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                    currentPlan?.plan_name === plan.name
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 shadow-md hover:shadow-lg'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {currentPlan?.plan_name === plan.name ? 'Current Plan' : 'Get Started'}
                </button>

                {/* Features */}
                <div className="mt-8 space-y-4">
                  <p className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    What's included
                  </p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto mt-16 bg-gray-50 rounded-xl p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Can I change plans later?</h4>
            <p className="text-gray-600 text-sm">Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h4>
            <p className="text-gray-600 text-sm">We accept all major credit cards, PayPal, and bank transfers for enterprise plans.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h4>
            <p className="text-gray-600 text-sm">Yes! All plans come with a 14-day free trial. No credit card required to start.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;

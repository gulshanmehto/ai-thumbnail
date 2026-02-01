import React from 'react';
import { Button } from '../components/ui/button';
import { Check, Sparkles, Zap, Crown, Rocket } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { BACKEND_URL } from '../lib/config';
import { useNavigate } from 'react-router-dom';

export default function Pricing() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isAnnual, setIsAnnual] = React.useState(true);
    const [couponCode, setCouponCode] = React.useState('');
    const [couponLoading, setCouponLoading] = React.useState(false);
    const [activeCoupon, setActiveCoupon] = React.useState(null);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        try {
            const { data } = await axios.post(`${BACKEND_URL}/api/apply-coupon`, { code: couponCode });
            setActiveCoupon(data);
            toast.success(`Coupon ${data.code} applied! ${data.discount_percent}% OFF`);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.detail || "Invalid coupon code");
            setActiveCoupon(null);
        } finally {
            setCouponLoading(false);
        }
    };

    const handleSubscribe = async (planKey) => {
        if (!user) {
            navigate('/login');
            return;
        }

        const billingCycle = isAnnual ? 'annual' : 'monthly';
        const packId = `pack_${planKey}_${billingCycle}`;

        try {
            const { data } = await axios.post(
                `${BACKEND_URL}/api/create-checkout-session`,
                {
                    pack_id: packId,
                    coupon_code: activeCoupon ? activeCoupon.code : null
                },
                { withCredentials: true }
            );

            if (data.payu_url) {
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = data.payu_url;

                Object.entries(data.params).forEach(([key, value]) => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = value;
                    form.appendChild(input);
                });

                document.body.appendChild(form);
                form.submit();
            } else if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to start checkout");
        }
    };

    const getDiscountedPrice = (originalPrice, planKey) => {
        if (!activeCoupon) return originalPrice;

        // Check Plan Restriction
        if (activeCoupon.valid_plans && activeCoupon.valid_plans.length > 0) {
            if (!activeCoupon.valid_plans.includes(planKey)) {
                return originalPrice;
            }
        }

        // Check Billing Restriction
        const currentBilling = isAnnual ? 'annual' : 'monthly';
        if (activeCoupon.valid_billing && activeCoupon.valid_billing.length > 0) {
            if (!activeCoupon.valid_billing.includes(currentBilling)) {
                return originalPrice;
            }
        }

        const num = parseInt(originalPrice.replace(/[^\d]/g, ''));
        const discounted = Math.round(num * (1 - activeCoupon.discount_percent / 100));
        return `₹${discounted.toLocaleString('en-IN')}`;
    };

    const plans = [
        {
            name: 'Free',
            key: 'free',
            description: 'For trying out the platform',
            price: { monthly: '₹0', annual: '₹0' },
            credits: '3 credits',
            validity: '7 days validity',
            features: [
                { text: 'Standard Generation', included: true },
                { text: 'Basic Aspect Ratios', included: true },
                { text: 'Watermark on images', included: false, negative: true },
                { text: 'Priority Support', included: false },
            ],
            cta: 'Get Started Free',
            ctaAction: () => window.location.href = '/signup',
            popular: false,
            gradient: false,
        },
        {
            name: 'Starter',
            key: 'starter',
            description: 'For individual creators',
            price: { monthly: '₹999', annual: '₹599' },
            credits: '50 credits',
            validity: '30 days validity',
            features: [
                { text: 'No Watermark', included: true },
                { text: 'All Aspect Ratios', included: true },
                { text: 'Commercial Usage', included: true },
                { text: 'Email Support', included: true },
            ],
            cta: 'Get Starter',
            ctaAction: () => handleSubscribe('starter'),
            popular: false,
            gradient: false,
        },
        {
            name: 'Creator',
            key: 'creator',
            description: 'Most popular for YouTubers',
            price: { monthly: '₹2,499', annual: '₹1,499' },
            credits: '150 credits',
            validity: '60 days validity',
            features: [
                { text: 'Everything in Starter', included: true },
                { text: 'Priority Rendering', included: true },
                { text: 'Faster Processing', included: true },
                { text: 'Bulk Generation', included: true },
            ],
            cta: 'Get Creator',
            ctaAction: () => handleSubscribe('creator'),
            popular: true,
            gradient: true,
        },
        {
            name: 'Pro',
            key: 'pro',
            description: 'For agencies & power users',
            price: { monthly: '₹4,999', annual: '₹2,999' },
            credits: '400 credits',
            validity: '90 days validity',
            features: [
                { text: 'Everything in Creator', included: true },
                { text: 'Unlimited Daily Limit', included: true },
                { text: 'Early Access Features', included: true },
                { text: 'Dedicated Support', included: true },
            ],
            cta: 'Get Pro',
            ctaAction: () => handleSubscribe('pro'),
            popular: false,
            gradient: false,
        },
    ];

    return (
        <div className="min-h-screen bg-[#F9FAFB] py-20 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-sm font-semibold mb-4">
                        <Sparkles className="w-4 h-4" />
                        Simple, transparent pricing
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-extrabold text-[#111827] mb-4 tracking-tight">
                        Choose the perfect plan
                    </h1>
                    <p className="text-lg text-[#6B7280] max-w-xl mx-auto">
                        Start free and upgrade as you grow. All plans include our core AI thumbnail generation.
                    </p>

                    {/* Toggle */}
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <span className={`text-sm font-semibold ${!isAnnual ? 'text-[#111827]' : 'text-[#9CA3AF]'}`}>Monthly</span>
                        <button
                            onClick={() => setIsAnnual(!isAnnual)}
                            className="w-14 h-8 bg-[#111827] rounded-full p-1 relative transition-all duration-300"
                        >
                            <div className={`w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-sm ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${isAnnual ? 'text-[#111827]' : 'text-[#9CA3AF]'}`}>Annual</span>
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                Save 40%
                            </span>
                        </div>
                    </div>

                    {/* Coupon Code Section */}
                    <div className="flex items-center justify-center gap-2 mt-8 max-w-sm mx-auto">
                        {!activeCoupon ? (
                            <>
                                <input
                                    type="text"
                                    placeholder="Have a coupon code?"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#111827] bg-white"
                                />
                                <Button
                                    onClick={handleApplyCoupon}
                                    disabled={couponLoading || !couponCode}
                                    className="bg-[#111827] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {couponLoading ? '...' : 'Apply'}
                                </Button>
                            </>
                        ) : (
                            <div className="flex items-center gap-3 bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200">
                                <span className="text-sm font-medium">Coupon <strong>{activeCoupon.code}</strong> applied! ({activeCoupon.discount_percent}% OFF)</span>
                                <button
                                    onClick={() => { setActiveCoupon(null); setCouponCode(''); }}
                                    className="text-xs hover:text-green-900 border-l border-green-200 pl-3 font-bold"
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative bg-white rounded-3xl p-6 lg:p-8 border transition-all duration-300 flex flex-col ${plan.popular
                                ? 'border-red-500 shadow-xl scale-[1.02] lg:scale-105 z-10'
                                : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                                }`}
                        >
                            {/* Popular Badge */}
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                                    MOST POPULAR
                                </div>
                            )}

                            {/* Header */}
                            <div className="mb-6">
                                <h3 className={`text-xl font-bold mb-1 ${plan.popular ? 'text-red-600' : 'text-[#111827]'}`}>
                                    {plan.name}
                                </h3>
                                <p className="text-sm text-[#6B7280]">{plan.description}</p>
                            </div>

                            {/* Price */}
                            <div className="mb-6">
                                <div className="flex items-baseline gap-1 flex-wrap">
                                    <span className={`text-4xl font-extrabold ${plan.popular ? 'text-gradient' : 'text-[#111827]'}`}>
                                        {activeCoupon && plan.name !== 'Free'
                                            ? getDiscountedPrice(isAnnual ? plan.price.annual : plan.price.monthly)
                                            : (isAnnual ? plan.price.annual : plan.price.monthly)
                                        }
                                    </span>
                                    {activeCoupon && plan.name !== 'Free' && (
                                        <span className="text-sm text-gray-400 line-through decoration-red-500">
                                            {isAnnual ? plan.price.annual : plan.price.monthly}
                                        </span>
                                    )}
                                    {plan.name !== 'Free' && (
                                        <span className="text-[#9CA3AF] text-sm">/{isAnnual ? 'year' : 'month'}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-sm font-semibold text-[#111827]">{plan.credits}</span>
                                    <span className="text-xs text-[#9CA3AF]">• {plan.validity}</span>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <Button
                                onClick={plan.ctaAction}
                                className={`w-full h-12 rounded-xl font-semibold mb-6 transition-all ${plan.popular
                                    ? 'btn-gradient text-white border-0 shadow-lg'
                                    : 'bg-white border-2 border-gray-200 text-[#111827] hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {plan.cta}
                            </Button>

                            {/* Features */}
                            <ul className="space-y-3 flex-1">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-sm">
                                        <Check className={`w-5 h-5 shrink-0 mt-0.5 ${feature.negative ? 'text-gray-300' : 'text-green-500'
                                            }`} />
                                        <span className={feature.negative ? 'text-[#9CA3AF] line-through' : 'text-[#4B5563]'}>
                                            {feature.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* FAQ / Trust */}
                <div className="mt-20 text-center">
                    <p className="text-[#9CA3AF] text-sm">
                        All transactions are secure and encrypted. Credits are added instantly after payment. <br />
                        Questions? <a href="mailto:support@quikthumb.ai" className="text-red-500 hover:underline">Contact Support</a>
                    </p>
                </div>
            </div>
        </div>
    );
}

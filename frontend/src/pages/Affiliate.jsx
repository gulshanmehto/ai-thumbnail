import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Check, ChevronDown, ChevronUp, IndianRupee, Users, TrendingUp, Wallet } from 'lucide-react';

const faqs = [
    {
        question: "How often are payouts made?",
        answer: "You'll receive your payment automatically on the 7th of each month via UPI or Bank Transfer. You need to earn a minimum of ₹2,000 in commissions to get paid. The payment process may take 3-5 business days."
    },
    {
        question: "How to track the referred signup?",
        answer: "You can check your referrals by logging into your affiliate account. If you've correctly used your unique referral URL, the information on your dashboard will be accurate."
    },
    {
        question: "Does the discount code track affiliates even if they don't use the affiliate link?",
        answer: "Yes, absolutely. If a customer purchases a subscription using your promo code without going through your affiliate link, the sale will be credited to your affiliate account."
    },
    {
        question: "Can I advertise using my affiliate link?",
        answer: "Paid ads are not allowed. If you use paid advertising, your commissions will not be paid. We conduct regular checks and may ask you to provide proof of the methods you used to generate sales."
    },
    {
        question: "Any other questions?",
        answer: "If you have any more questions, contact us by email at support@quikthumb.ai (we usually respond within 24 hours)."
    }
];

export default function Affiliate() {
    const [openFaq, setOpenFaq] = useState(null);

    return (
        <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
            <main className="flex-1">
                {/* Hero Section */}
                <section className="py-16 lg:py-24 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1
                            className="text-3xl sm:text-4xl lg:text-5xl text-black mb-6"
                            style={{ fontWeight: 400 }}
                        >
                            Earn money for life with QuikThumb
                        </h1>
                        <p className="text-lg text-[#6B7280] max-w-2xl mx-auto mb-8">
                            If somebody joins QuikThumb from your link, we'll automatically pay you <strong className="text-[#111827]">25% every month</strong>. There's no limit to how much you can earn.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/signup">
                                <button className="h-14 px-6 text-lg font-semibold rounded-xl bg-gradient-to-r from-[#FF4D4D] to-[#FF003C] text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 flex items-center gap-2">
                                    Become an affiliate
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </Link>
                            <Button variant="outline" className="h-14 px-6 rounded-xl border-gray-300">
                                Get affiliate resources
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Payout Info */}
                <section className="py-4 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-semibold">
                            <Wallet className="w-4 h-4" />
                            PAYOUT: 25% Recurring Commission
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="py-16 lg:py-24 px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center p-8 bg-white rounded-2xl border border-gray-200">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center mx-auto mb-6">
                                    <Users className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-xl font-semibold text-[#111827] mb-3">Join the program</h3>
                                <p className="text-[#6B7280]">
                                    Create your affiliate account on our platform, get your affiliate link and customize it.
                                </p>
                            </div>

                            <div className="text-center p-8 bg-white rounded-2xl border border-gray-200">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center mx-auto mb-6">
                                    <TrendingUp className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-xl font-semibold text-[#111827] mb-3">Share your affiliate link</h3>
                                <p className="text-[#6B7280]">
                                    Share your custom affiliate link with your audience, followers, friends, customers.
                                </p>
                            </div>

                            <div className="text-center p-8 bg-white rounded-2xl border border-gray-200">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center mx-auto mb-6">
                                    <IndianRupee className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-xl font-semibold text-[#111827] mb-3">Get paid for life</h3>
                                <p className="text-[#6B7280]">
                                    You'll earn a 25% recurring commission for every new customer you refer, for a lifetime.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Earnings Example */}
                <section className="py-16 lg:py-24 px-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-red-100/50 to-transparent rounded-full blur-3xl -z-10" />

                    <div className="max-w-4xl mx-auto text-center">
                        <h2
                            className="text-2xl sm:text-3xl lg:text-4xl text-[#111827] mb-4"
                            style={{ fontWeight: 400 }}
                        >
                            Start earning passive income in 2 minutes
                        </h2>
                        <p className="text-[#6B7280] max-w-2xl mx-auto mb-12">
                            QuikThumb is the #1 YouTube thumbnail AI creator, your audience will love it. Promote it and start earning recurring passive income today.
                        </p>

                        {/* Earnings Calculator */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-lg mx-auto">
                            <h3 className="font-semibold text-[#111827] mb-6">Your Potential Earnings</h3>
                            <div className="space-y-4 text-left">
                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                    <span className="text-[#6B7280]">Pro Plan Price</span>
                                    <span className="font-semibold text-[#111827]">₹499/month</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                    <span className="text-[#6B7280]">Your Commission (25%)</span>
                                    <span className="font-semibold text-green-600">₹125/month</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                    <span className="text-[#6B7280]">10 Referrals</span>
                                    <span className="font-semibold text-green-600">₹1,250/month</span>
                                </div>
                                <div className="flex justify-between items-center py-3 bg-green-50 rounded-lg px-4 -mx-4">
                                    <span className="font-semibold text-[#111827]">50 Referrals</span>
                                    <span className="font-bold text-green-600 text-xl">₹6,250/month</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-16 lg:py-24 px-4">
                    <div className="max-w-3xl mx-auto">
                        <h2
                            className="text-2xl sm:text-3xl text-center text-[#111827] mb-12"
                            style={{ fontWeight: 400 }}
                        >
                            Frequently asked questions
                        </h2>

                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                                >
                                    <button
                                        className="w-full px-6 py-5 text-left flex items-center justify-between"
                                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    >
                                        <span className="font-semibold text-[#111827]">{faq.question}</span>
                                        {openFaq === index ? (
                                            <ChevronUp className="w-5 h-5 text-[#6B7280]" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-[#6B7280]" />
                                        )}
                                    </button>
                                    {openFaq === index && (
                                        <div className="px-6 pb-5 text-[#6B7280]">
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 lg:py-20 px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-[#F5F5F5] rounded-3xl p-8 lg:p-12 text-center">
                            <h2
                                className="text-2xl sm:text-3xl lg:text-4xl text-black mb-4"
                                style={{ fontWeight: 400 }}
                            >
                                Ready to start earning?
                            </h2>
                            <p className="text-[#6B7280] mb-8 max-w-lg mx-auto">
                                Join our affiliate program today and start earning 25% recurring commission on every referral.
                            </p>

                            <Link to="/signup">
                                <button className="h-14 px-6 text-lg font-semibold rounded-xl bg-gradient-to-r from-[#FF4D4D] to-[#FF003C] text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 inline-flex items-center gap-2">
                                    Become an affiliate
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-12 border-t border-gray-200">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-md">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-xl text-[#111827]">QuikThumb</span>
                        </Link>

                        <p className="text-sm text-[#6B7280] max-w-md mx-auto mb-8">
                            AI-powered thumbnail generator for YouTube creators. Create stunning thumbnails in seconds, not hours.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#6B7280]">
                            <Link to="/pricing" className="hover:text-[#111827] transition-colors">Pricing</Link>
                            <Link to="/login" className="hover:text-[#111827] transition-colors">Login</Link>
                            <Link to="/terms" className="hover:text-[#111827] transition-colors">Terms</Link>
                            <Link to="/privacy" className="hover:text-[#111827] transition-colors">Privacy</Link>
                        </div>

                        <div className="mt-8 text-xs text-[#9CA3AF]">
                            © 2026 QuikThumb AI. All rights reserved.
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}

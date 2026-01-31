import React from 'react';
import { Button } from '../components/ui/button';
import { Check, Zap, Crown, Rocket } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { BACKEND_URL } from '../lib/config';

export default function Pricing() {
    const { user, login } = useAuth();

    const handleSubscribe = async (packId) => {
        if (!user) {
            login();
            return;
        }

        try {
            const { data } = await axios.post(
                `${BACKEND_URL}/api/create-checkout-session`,
                { pack_id: packId },
                { withCredentials: true }
            );

            if (data.payu_url) {
                // Create hidden form for PayU
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

    return (
        <div className="py-20 px-4 max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Choose Your Fuel</h1>
            <p className="text-muted-foreground mb-12">Flexible plans for every creator. Upgrade or cancel anytime.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
                {/* Free Plan */}
                <div className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Zap className="w-6 h-6 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-1">FREE</h3>
                    <p className="text-xs text-muted-foreground mb-4">Try Before You Pay</p>
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                        <span className="text-3xl font-bold">₹0</span>
                    </div>
                    <div className="bg-secondary/50 rounded-full py-1 px-3 text-[10px] font-medium mb-6 inline-block self-center">
                        3 Credits • 7 Days
                    </div>

                    <ul className="space-y-3 text-left mb-8 text-xs text-muted-foreground flex-1">
                        <li className="flex gap-2"><Check className="w-4 h-4 text-green-500 shrink-0" /> 1 Subject + Ref Image</li>
                        <li className="flex gap-2"><Check className="w-4 h-4 text-green-500 shrink-0" /> Description + Text Overlay</li>
                        <li className="flex gap-2 text-destructive font-medium"><Check className="w-4 h-4 opacity-50 shrink-0" /> Watermark ON</li>
                        <li className="flex gap-2 opacity-50"><Check className="w-4 h-4 shrink-0" /> Limited Aspect Ratios</li>
                    </ul>

                    <Button className="w-full rounded-full" variant="outline" onClick={() => window.location.href = '/signup'}>
                        Get Free Credits
                    </Button>
                </div>

                {/* Starter Plan */}
                <div className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Rocket className="w-6 h-6 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-1">STARTER</h3>
                    <p className="text-xs text-muted-foreground mb-4">For Serious Beginners</p>
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                        <span className="text-3xl font-bold">₹999</span>
                        <span className="text-sm text-muted-foreground">/mo</span>
                    </div>
                    <div className="bg-blue-50 text-blue-700 rounded-full py-1 px-3 text-[10px] font-medium mb-6 inline-block self-center">
                        50 Credits • 30 Days
                    </div>

                    <ul className="space-y-3 text-left mb-8 text-xs flex-1">
                        <li className="flex gap-2 font-bold"><Check className="w-4 h-4 text-green-500 shrink-0" /> No Watermark</li>
                        <li className="flex gap-2"><Check className="w-4 h-4 text-green-500 shrink-0" /> All Aspect Ratios</li>
                        <li className="flex gap-2"><Check className="w-4 h-4 text-green-500 shrink-0" /> All Studio Features</li>
                        <li className="flex gap-2 px-2 py-1 bg-blue-50 rounded text-blue-700 font-bold">₹20 / image</li>
                    </ul>

                    <Button className="w-full rounded-full border-blue-200 hover:bg-blue-50" variant="outline" onClick={() => handleSubscribe('pack_starter')}>
                        Get Starter
                    </Button>
                </div>

                {/* Creator Plan */}
                <div className="bg-white border-2 border-primary rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden flex flex-col transform hover:-translate-y-1">
                    <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                        BEST VALUE
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Crown className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-1">CREATOR</h3>
                    <p className="text-xs text-muted-foreground mb-4">Most Popular</p>
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                        <span className="text-3xl font-bold">₹2,499</span>
                        <span className="text-sm text-muted-foreground">/mo</span>
                    </div>
                    <div className="bg-primary text-white rounded-full py-1 px-3 text-[10px] font-bold mb-6 inline-block self-center">
                        150 Credits • 60 Days
                    </div>

                    <ul className="space-y-3 text-left mb-8 text-xs flex-1">
                        <li className="flex gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> <strong>Everything in Starter</strong></li>
                        <li className="flex gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> Faster Processing</li>
                        <li className="flex gap-2 font-bold text-primary"><Check className="w-4 h-4 shrink-0" /> Priority Rendering</li>
                        <li className="flex gap-2"><Check className="w-4 h-4 text-primary shrink-0" /> Bulk Generation Support</li>
                        <li className="flex gap-2 px-2 py-1 bg-primary/5 rounded text-primary font-bold mt-2">₹16.6 / image</li>
                    </ul>

                    <Button className="w-full rounded-full shadow-lg" onClick={() => handleSubscribe('pack_creator')}>
                        Get Creator
                    </Button>
                </div>

                {/* Pro / Agency Plan */}
                <div className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col">
                    <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Rocket className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-1">PRO / AGENCY</h3>
                    <p className="text-xs text-muted-foreground mb-4">Scale Without Thinking</p>
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                        <span className="text-3xl font-bold">₹4,999</span>
                        <span className="text-sm text-muted-foreground">/mo</span>
                    </div>
                    <div className="bg-purple-50 text-purple-700 rounded-full py-1 px-3 text-[10px] font-medium mb-6 inline-block self-center">
                        400 Credits • 90 Days
                    </div>

                    <ul className="space-y-3 text-left mb-8 text-xs flex-1">
                        <li className="flex gap-2"><Check className="w-4 h-4 text-purple-500 shrink-0" /> <strong>Everything in Creator</strong></li>
                        <li className="flex gap-2"><Check className="w-4 h-4 text-purple-500 shrink-0" /> Max Daily Limit Increased</li>
                        <li className="flex gap-2"><Check className="w-4 h-4 text-purple-500 shrink-0" /> Early Access Styles</li>
                        <li className="flex gap-2 font-bold"><Check className="w-4 h-4 text-purple-500 shrink-0" /> Dedicated Support</li>
                        <li className="flex gap-2 px-2 py-1 bg-purple-50 rounded text-purple-700 font-bold mt-2">₹12.5 / image</li>
                    </ul>

                    <Button className="w-full rounded-full border-purple-200 hover:bg-purple-50" variant="outline" onClick={() => handleSubscribe('pack_pro')}>
                        Get Pro
                    </Button>
                </div>
            </div>
        </div>
    );
}

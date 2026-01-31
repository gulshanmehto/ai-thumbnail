import React from 'react';
import { Button } from '../components/ui/button';
import { Check, Zap, Sparkles } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { BACKEND_URL } from '../lib/config';

export default function Pricing() {
    const { user, login } = useAuth();
    const [isAnnual, setIsAnnual] = React.useState(false);

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
        <div className="min-h-screen bg-[#0A0A0A] text-white py-20 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-bold mb-6 border border-primary/30">
                        ✨ 365 days of UNLIMITED Nano Banana Pro for Annual Pro
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black mb-8 tracking-tighter italic uppercase">
                        Choose Your <span className="text-primary italic">Fuel</span>
                    </h1>

                    {/* Toggle */}
                    <div className="flex items-center justify-center gap-4 mb-12">
                        <span className={`text-sm font-bold ${!isAnnual ? 'text-white' : 'text-muted-foreground'}`}>Monthly</span>
                        <button
                            onClick={() => setIsAnnual(!isAnnual)}
                            className="w-14 h-7 bg-white/10 rounded-full p-1 relative transition-all duration-300 border border-white/20"
                        >
                            <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 ${isAnnual ? 'translate-x-7 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.8)]' : 'translate-x-0'}`} />
                        </button>
                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${isAnnual ? 'text-white' : 'text-muted-foreground'}`}>Annual</span>
                            <span className="bg-[#FF007A] text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse uppercase tracking-widest whitespace-nowrap">
                                52% OFF
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
                    {/* Basic / Free Plan */}
                    <div className="bg-[#141414] border border-white/10 rounded-3xl p-6 flex flex-col hover:border-white/20 transition-all group overflow-hidden relative">
                        <div className="mb-8">
                            <h3 className="text-2xl font-black mb-1 italic uppercase leading-none tracking-tight">Free</h3>
                            <p className="text-xs text-muted-foreground font-medium">For beginners first exploring AI creation</p>
                        </div>

                        <div className="mb-8 p-1">
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black italic tracking-tighter">₹0</span>
                                <span className="text-xs font-bold text-muted-foreground">/mo</span>
                            </div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Billed as ₹0 once</p>
                        </div>

                        <Button
                            className="w-full h-11 bg-white text-black hover:bg-white/90 rounded-xl font-black italic uppercase tracking-wider mb-4 transition-transform active:scale-95"
                            onClick={() => window.location.href = '/signup'}
                        >
                            Select Plan
                        </Button>

                        <div className="flex items-center gap-2 py-2 px-3 bg-white/5 rounded-xl mb-8 border border-white/5">
                            <Zap className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-[8px]">No difference compared to annual</span>
                        </div>

                        <div className="space-y-6 flex-1">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-[11px] font-black text-primary uppercase tracking-widest bg-primary/5 p-2 rounded-lg border border-primary/10">
                                    <Zap className="w-4 h-4" /> 3 Credits per month
                                </div>

                                <ul className="space-y-3">
                                    <li className="flex items-center gap-3 text-xs font-bold">
                                        <Check className="w-4 h-4 text-green-500 shrink-0" />
                                        <span>Standard Generation</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-xs font-bold opacity-40">
                                        <span className="w-4 flex justify-center text-lg leading-none">×</span>
                                        <span>Bulk Generation</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-xs font-bold opacity-40">
                                        <span className="w-4 flex justify-center text-lg leading-none">×</span>
                                        <span className="text-destructive">Watermark ON</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Starter Plan */}
                    <div className="bg-[#141414] border border-white/10 rounded-3xl p-6 flex flex-col hover:border-white/20 transition-all group relative">
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-black mb-1 italic uppercase leading-none tracking-tight">Starter</h3>
                                <div className="bg-[#00F0FF]/10 text-[#00F0FF] text-[8px] font-black px-2 py-0.5 rounded border border-[#00F0FF]/20 tracking-tighter uppercase">50 THUMBS</div>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">For enthusiasts creating occasionally</p>
                        </div>

                        <div className="mb-8 p-1">
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-bold text-muted-foreground line-through italic opacity-50">₹1,999</span>
                                <span className="text-4xl font-black italic tracking-tighter">₹999</span>
                                <span className="text-xs font-bold text-muted-foreground">/mo</span>
                            </div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Billed for {isAnnual ? '12 months' : '1 month'}</p>
                        </div>

                        <Button
                            className="w-full h-11 bg-white text-black hover:bg-white/90 rounded-xl font-black italic uppercase tracking-wider mb-4 transition-transform active:scale-95"
                            onClick={() => handleSubscribe('pack_starter')}
                        >
                            Select Plan
                        </Button>

                        <div className="flex items-center gap-2 py-2 px-3 bg-[#FF007A]/5 rounded-xl mb-8 border border-[#FF007A]/10">
                            <Zap className="w-3 h-3 text-[#FF007A]" />
                            <span className="text-[10px] font-bold text-[#FF007A] uppercase tracking-widest text-[8px]">Save ₹500 compared to monthly</span>
                        </div>

                        <div className="space-y-6 flex-1">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-xl border border-white/10">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-primary" />
                                        <span className="text-[11px] font-black uppercase tracking-widest">50 Credits per month</span>
                                    </div>
                                    <div className="bg-primary/20 text-primary text-[8px] font-black px-1.5 py-0.5 rounded border border-primary/20">HOT</div>
                                </div>

                                <ul className="space-y-3">
                                    <li className="flex items-center gap-3 text-xs font-bold">
                                        <Check className="w-4 h-4 text-green-500 shrink-0" />
                                        <span>No Watermark</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-xs font-bold">
                                        <Check className="w-4 h-4 text-green-500 shrink-0" />
                                        <span>All Aspect Ratios</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-xs font-bold opacity-40">
                                        <span className="w-4 flex justify-center text-lg leading-none">×</span>
                                        <span>Priority Rendering</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Creator Plan (Popular) */}
                    <div className="bg-[#141414] border-2 border-[#D4FF33] rounded-3xl p-6 flex flex-col scale-105 shadow-[0_0_50px_rgba(212,255,51,0.15)] z-10 transition-all group relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#D4FF33] text-black text-[10px] font-black px-4 py-1 rounded-full uppercase italic tracking-widest flex items-center gap-2">
                            <Zap className="w-3 h-3 fill-black" /> MOST POPULAR
                        </div>

                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-black mb-1 italic uppercase leading-none tracking-tight text-[#D4FF33]">Creator</h3>
                                <div className="bg-[#FF007A] text-white text-[8px] font-black px-2 py-0.5 rounded tracking-tighter uppercase whitespace-nowrap">40% OFF</div>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">The smart choice for consistent pros</p>
                        </div>

                        <div className="mb-8 p-1">
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-muted-foreground line-through italic opacity-50">₹3,499</span>
                                <span className="text-4xl font-black italic tracking-tighter">₹2,499</span>
                                <span className="text-xs font-bold text-muted-foreground">/mo</span>
                            </div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 italic">Billed for {isAnnual ? '12 months' : '2 months'}</p>
                        </div>

                        <Button
                            className="w-full h-11 bg-[#D4FF33] text-black hover:bg-[#D4FF33]/90 rounded-xl font-black italic uppercase tracking-wider mb-4 transition-transform active:scale-95 shadow-[0_0_20px_rgba(212,255,51,0.3)]"
                            onClick={() => handleSubscribe('pack_creator')}
                        >
                            Select Plan
                        </Button>

                        <div className="flex items-center gap-2 py-2 px-3 bg-[#D4FF33]/10 rounded-xl mb-8 border border-[#D4FF33]/20">
                            <Zap className="w-3 h-3 text-[#D4FF33]" />
                            <span className="text-[10px] font-bold text-[#D4FF33] uppercase tracking-widest text-[8px]">Save ₹1000 compared to starter</span>
                        </div>

                        <div className="space-y-6 flex-1">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-2 px-3 bg-[#D4FF33]/5 rounded-xl border border-[#D4FF33]/10">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-[#D4FF33]" />
                                        <span className="text-[11px] font-black uppercase tracking-widest">150 Credits per month</span>
                                    </div>
                                    <div className="bg-[#D4FF33] text-black text-[8px] font-black px-2 py-0.5 rounded">ULTIMATE</div>
                                </div>

                                <ul className="space-y-4">
                                    <li className="flex items-center gap-3 text-xs font-bold">
                                        <Check className="w-4 h-4 text-[#D4FF33] shrink-0" />
                                        <span>Faster Processing</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-xs font-bold">
                                        <Check className="w-4 h-4 text-[#D4FF33] shrink-0" />
                                        <span>Priority Rendering</span>
                                    </li>
                                    <li className="flex items-center justify-between text-xs font-bold">
                                        <div className="flex items-center gap-3">
                                            <Check className="w-4 h-4 text-[#D4FF33] shrink-0" />
                                            <span>Bulk Gen Support</span>
                                        </div>
                                        <span className="bg-[#D4FF33]/10 text-[#D4FF33] text-[9px] px-2 py-0.5 rounded border border-[#D4FF33]/20">PRO</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Pro Plan (Best Value) */}
                    <div className="bg-[#141414] border-2 border-[#FF007A] rounded-3xl p-6 flex flex-col hover:border-white/20 transition-all group relative mt-4 md:mt-0">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FF007A] text-white text-[10px] font-black px-4 py-1 rounded-full uppercase italic tracking-widest flex items-center gap-2">
                            <Zap className="w-3 h-3 fill-white" /> BEST VALUE
                        </div>

                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-black mb-1 italic uppercase leading-none tracking-tight text-[#FF007A]">Pro</h3>
                                <div className="bg-[#FF007A]/10 text-[#FF007A] text-[8px] font-black px-2 py-0.5 rounded border border-[#FF007A]/20 tracking-tighter uppercase whitespace-nowrap">52% OFF</div>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">For scaling production to the max</p>
                        </div>

                        <div className="mb-8 p-1">
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-muted-foreground line-through italic opacity-50">₹8,999</span>
                                <span className="text-4xl font-black italic tracking-tighter">₹4,999</span>
                                <span className="text-xs font-bold text-muted-foreground">/mo</span>
                            </div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Billed for {isAnnual ? '12 months' : '3 months'}</p>
                        </div>

                        <Button
                            className="w-full h-11 bg-gradient-to-r from-[#FF007A] to-[#FF00C7] text-white hover:opacity-90 rounded-xl font-black italic uppercase tracking-wider mb-4 transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,0,122,0.3)] border-none"
                            onClick={() => handleSubscribe('pack_pro')}
                        >
                            Select Plan
                        </Button>

                        <div className="flex items-center gap-2 py-2 px-3 bg-[#FF007A]/10 rounded-xl mb-8 border border-[#FF007A]/20">
                            <Zap className="w-3 h-3 text-[#FF007A]" />
                            <span className="text-[10px] font-bold text-[#FF007A] uppercase tracking-widest text-[8px]">Save ₹4,000 compared to monthly</span>
                        </div>

                        <div className="space-y-6 flex-1">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-2 px-3 bg-[#FF007A]/5 rounded-xl border border-[#FF007A]/10">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-[#FF007A]" />
                                        <span className="text-[11px] font-black uppercase tracking-widest">400 Credits per month</span>
                                    </div>
                                    <div className="bg-[#FF007A]/10 text-[#FF007A] text-[9px] px-2 py-0.5 rounded border border-[#FF007A]/20 font-black tracking-tighter uppercase">90 DAYS VAL.</div>
                                </div>

                                <ul className="space-y-4">
                                    <li className="flex items-center justify-between text-xs font-bold">
                                        <div className="flex items-center gap-3">
                                            <Check className="w-4 h-4 text-[#FF007A] shrink-0" />
                                            <span>Max Daily Limit</span>
                                        </div>
                                        <span className="bg-[#FF007A]/10 text-[#FF007A] text-[9px] px-2 py-0.5 rounded">UNLIMITED</span>
                                    </li>
                                    <li className="flex items-center justify-between text-xs font-bold">
                                        <div className="flex items-center gap-3">
                                            <Check className="w-4 h-4 text-[#FF007A] shrink-0" />
                                            <span>Early Access Styles</span>
                                        </div>
                                        <span className="bg-yellow-500 text-black text-[9px] px-2 py-0.5 rounded font-black">SPECIAL</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-xs font-bold">
                                        <Check className="w-4 h-4 text-[#FF007A] shrink-0" />
                                        <span>Dedicated Support Channel</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-20 text-center text-muted-foreground/40 text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed">
                    All transactions are secure and encrypted. <br /> Credits are added instantly after payment confirmation.
                </div>
            </div>
        </div>
    );
}

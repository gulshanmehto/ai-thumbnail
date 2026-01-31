import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Loader2, Mail, Lock, User, ArrowRight, Gift, Check } from 'lucide-react';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await signup(email, password, name);
        setLoading(false);
        if (success) {
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-white p-8 sm:p-10 rounded-3xl border border-gray-200 shadow-xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 mb-6 shadow-lg">
                            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
                            Create your account
                        </h1>
                        <p className="text-[#6B7280] mt-2">
                            Start creating thumbnails in seconds
                        </p>

                        {/* Bonus Badge */}
                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-semibold border border-green-200">
                            <Gift className="w-4 h-4" />
                            Get 3 free credits on signup
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-[#374151] font-semibold">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="h-12 pl-12 rounded-xl border-gray-200 focus:border-red-500 focus:ring-red-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[#374151] font-semibold">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-12 pl-12 rounded-xl border-gray-200 focus:border-red-500 focus:ring-red-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-[#374151] font-semibold">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-12 pl-12 rounded-xl border-gray-200 focus:border-red-500 focus:ring-red-500"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 text-base font-semibold rounded-xl btn-gradient text-white border-0 shadow-lg mt-2"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Get Started Free
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Benefits */}
                    <div className="mt-6 space-y-2">
                        {['No credit card required', 'Cancel anytime', 'Join 5,000+ creators'].map((benefit, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-[#6B7280]">
                                <Check className="w-4 h-4 text-green-500" />
                                <span>{benefit}</span>
                            </div>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-[#9CA3AF]">or</span>
                        </div>
                    </div>

                    {/* Login Link */}
                    <div className="text-center">
                        <span className="text-[#6B7280]">Already have an account? </span>
                        <Link to="/login" className="text-red-500 font-semibold hover:text-red-600 transition-colors">
                            Log in here
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-[#9CA3AF] mt-8">
                    By signing up, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
}

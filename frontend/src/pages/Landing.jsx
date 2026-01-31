import React from 'react';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Zap, CheckCircle2, Star, TrendingUp, Sparkles, MousePointerClick } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
    const { user } = useAuth();

    return (
        <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative py-20 lg:py-32 px-4 overflow-hidden">
                    {/* Background gradient blobs */}
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-red-200/30 to-pink-200/30 rounded-full blur-3xl -z-10" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-orange-200/20 to-red-200/20 rounded-full blur-3xl -z-10" />

                    <div className="max-w-5xl mx-auto text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-semibold mb-8 animate-fade-in">
                            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-gray-700">The #1 AI Thumbnail Generator</span>
                        </div>

                        {/* Main Headline */}
                        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-[#111827] mb-6 leading-[1.1] tracking-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
                            Stop losing views to{' '}
                            <span className="text-gradient">mediocre thumbnails</span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-lg sm:text-xl text-[#4B5563] max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            Generate studio-quality thumbnails that stop scrolling and drive clicks. Trained on 50,000+ viral thumbnails. No design skills needed.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                            {user ? (
                                <Link to="/dashboard">
                                    <Button size="lg" className="h-14 px-8 text-lg rounded-full btn-gradient border-0 text-white shadow-xl">
                                        Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </Link>
                            ) : (
                                <Link to="/signup">
                                    <Button size="lg" className="h-14 px-8 text-lg rounded-full btn-gradient border-0 text-white shadow-xl">
                                        Generate Thumbnails — It's Free <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </Link>
                            )}
                        </div>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#6B7280] animate-fade-in" style={{ animationDelay: '0.4s' }}>
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-1">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    ))}
                                </div>
                                <span className="font-semibold text-[#111827]">4.9/5</span>
                                <span>from 2,000+ creators</span>
                            </div>
                            <div className="hidden sm:block w-px h-4 bg-gray-300" />
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span>No credit card required</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-16 border-y border-gray-200 bg-white">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            <div>
                                <div className="text-4xl lg:text-5xl font-extrabold text-gradient mb-2">+47%</div>
                                <div className="text-[#6B7280] font-medium">Average CTR Increase</div>
                            </div>
                            <div>
                                <div className="text-4xl lg:text-5xl font-extrabold text-[#111827] mb-2">50K+</div>
                                <div className="text-[#6B7280] font-medium">Thumbnails Created</div>
                            </div>
                            <div>
                                <div className="text-4xl lg:text-5xl font-extrabold text-[#111827] mb-2">2x</div>
                                <div className="text-[#6B7280] font-medium">Faster Workflow</div>
                            </div>
                            <div>
                                <div className="text-4xl lg:text-5xl font-extrabold text-[#111827] mb-2">5 sec</div>
                                <div className="text-[#6B7280] font-medium">Generation Time</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 lg:py-28">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-sm font-semibold mb-4">
                                <Sparkles className="w-4 h-4" />
                                Why Creators Love Us
                            </div>
                            <h2 className="text-3xl lg:text-5xl font-extrabold text-[#111827] mb-4">
                                Built for creators who want results
                            </h2>
                            <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
                                Our AI is trained on 50,000+ viral thumbnails to understand what makes viewers click.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-red-200 hover:shadow-lg transition-all duration-300 group">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Zap className="w-7 h-7 text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold text-[#111827] mb-3">Lightning Fast</h3>
                                <p className="text-[#6B7280] leading-relaxed">
                                    Generate professional thumbnails in under 5 seconds. Speed up your content pipeline by 10x.
                                </p>
                            </div>

                            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-red-200 hover:shadow-lg transition-all duration-300 group">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <TrendingUp className="w-7 h-7 text-orange-500" />
                                </div>
                                <h3 className="text-xl font-bold text-[#111827] mb-3">CTR Optimized</h3>
                                <p className="text-[#6B7280] leading-relaxed">
                                    AI trained on viral content patterns. Every thumbnail is designed to maximize click-through rates.
                                </p>
                            </div>

                            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-red-200 hover:shadow-lg transition-all duration-300 group">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <MousePointerClick className="w-7 h-7 text-pink-500" />
                                </div>
                                <h3 className="text-xl font-bold text-[#111827] mb-3">No Design Skills</h3>
                                <p className="text-[#6B7280] leading-relaxed">
                                    Just describe your video or upload a reference. Our AI handles the design, colors, and composition.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="py-20 lg:py-28 bg-white border-y border-gray-200">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-5xl font-extrabold text-[#111827] mb-4">
                                Create thumbnails in 3 simple steps
                            </h2>
                            <p className="text-lg text-[#6B7280]">
                                From idea to viral thumbnail in under 30 seconds
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-pink-500 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    1
                                </div>
                                <h3 className="text-xl font-bold text-[#111827] mb-3">Describe Your Video</h3>
                                <p className="text-[#6B7280]">
                                    Tell us what your video is about, or upload a reference image for style matching.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-pink-500 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    2
                                </div>
                                <h3 className="text-xl font-bold text-[#111827] mb-3">AI Generates Options</h3>
                                <p className="text-[#6B7280]">
                                    Our AI creates multiple thumbnail options optimized for maximum engagement.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-pink-500 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    3
                                </div>
                                <h3 className="text-xl font-bold text-[#111827] mb-3">Download & Upload</h3>
                                <p className="text-[#6B7280]">
                                    Pick your favorite, download in HD, and upload directly to YouTube.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-20 lg:py-28">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <h2 className="text-3xl lg:text-5xl font-extrabold text-[#111827] mb-6">
                            Ready to 10x your click-through rate?
                        </h2>
                        <p className="text-lg text-[#6B7280] mb-10 max-w-2xl mx-auto">
                            Join 5,000+ creators using our AI to generate thumbnails that get more views. Start free today.
                        </p>
                        <Link to="/signup">
                            <Button size="lg" className="h-14 px-10 text-lg rounded-full btn-gradient border-0 text-white shadow-xl">
                                Start Creating for Free <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <p className="mt-4 text-sm text-[#9CA3AF]">No credit card required • 3 free credits on signup</p>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-8 border-t border-gray-200 bg-white">
                    <div className="max-w-6xl mx-auto px-4 text-center text-sm text-[#9CA3AF]">
                        © 2026 QuikThumb AI. All rights reserved.
                    </div>
                </footer>
            </main>
        </div>
    );
}

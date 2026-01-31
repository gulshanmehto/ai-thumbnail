import React from 'react';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Zap, Star, TrendingUp, Sparkles, MousePointerClick } from 'lucide-react';
import { Link } from 'react-router-dom';
import ThumbnailCarousel from '../components/ThumbnailCarousel';

export default function Landing() {
    const { user } = useAuth();

    return (
        <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative py-8 lg:py-16 px-4 overflow-hidden">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Main Headline */}
                        <h1
                            className="text-[32px] sm:text-[40px] lg:text-[48px] text-black mb-5 animate-fade-in"
                            style={{
                                fontWeight: 400,
                                lineHeight: '55px',
                                fontFamily: "'Open Sauce Two', Arial, sans-serif"
                            }}
                        >
                            Create viral thumbnails<br />
                            instantly that boost your views
                        </h1>

                        {/* Subheadline */}
                        <p
                            className="text-[16px] sm:text-[17px] text-[#6B7280] max-w-xl mx-auto mb-8 animate-fade-in"
                            style={{
                                fontWeight: 400,
                                lineHeight: '26px',
                                fontFamily: "'Open Sauce Two', Arial, sans-serif",
                                animationDelay: '0.1s'
                            }}
                        >
                            Generate studio-quality YouTube & Shorts thumbnails that stop scrolling and drive clicks in seconds. No design skills needed.
                        </p>

                        {/* CTA Button */}
                        <div className="flex items-center justify-center mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            {user ? (
                                <Link to="/dashboard">
                                    <button className="group relative h-14 px-1 pr-1 pl-6 text-lg font-semibold rounded-full bg-gradient-to-r from-[#FF4D4D] to-[#FF003C] text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 flex items-center gap-3">
                                        <span>Go to Dashboard</span>
                                        <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                                            <ArrowRight className="w-5 h-5" />
                                        </span>
                                    </button>
                                </Link>
                            ) : (
                                <Link to="/signup">
                                    <button className="group relative h-14 px-1 pr-1 pl-6 text-lg font-semibold rounded-full bg-gradient-to-r from-[#FF4D4D] to-[#FF003C] text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 flex items-center gap-3">
                                        <span>Generate Thumbnails</span>
                                        <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                                            Try it for free
                                        </span>
                                    </button>
                                </Link>
                            )}
                        </div>

                        {/* Rating Section */}
                        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                            {/* Google Rating */}
                            <div className="flex items-center gap-3 px-4 py-2">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                        ))}
                                    </div>
                                    <div className="text-sm">
                                        <span className="font-bold text-[#111827]">4.8</span>
                                        <span className="text-[#9CA3AF]">/5 · +1200 reviews</span>
                                    </div>
                                </div>
                            </div>

                            <div className="hidden sm:block w-px h-10 bg-gray-200" />

                            {/* Trustpilot Rating */}
                            <div className="flex items-center gap-3 px-4 py-2">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#00B67A">
                                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                                    </svg>
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <Star key={i} className="w-3.5 h-3.5 text-[#00B67A] fill-[#00B67A]" />
                                        ))}
                                    </div>
                                    <div className="text-sm">
                                        <span className="font-bold text-[#111827]">4.6</span>
                                        <span className="text-[#9CA3AF]">/5 · +620 reviews</span>
                                    </div>
                                </div>
                            </div>

                            <div className="hidden sm:block w-px h-10 bg-gray-200" />

                            {/* G2 Rating */}
                            <div className="flex items-center gap-3 px-4 py-2">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                                        <path fill="#FF492C" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                                        <text x="9" y="16" fill="#FF492C" fontSize="8" fontWeight="bold">2</text>
                                    </svg>
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <Star key={i} className="w-3.5 h-3.5 text-[#FF492C] fill-[#FF492C]" />
                                        ))}
                                    </div>
                                    <div className="text-sm">
                                        <span className="font-bold text-[#111827]">4.7</span>
                                        <span className="text-[#9CA3AF]">/5 · +80 reviews</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Thumbnail Carousel */}
                <ThumbnailCarousel />

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

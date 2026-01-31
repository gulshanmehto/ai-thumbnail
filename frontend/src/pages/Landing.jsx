import React from 'react';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Zap, Star, TrendingUp, Sparkles, MousePointerClick, Youtube, Building2, Image, Film, Video, Users, CheckCircle } from 'lucide-react';
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
                                    <button className="group relative h-14 px-1 pr-1 pl-6 text-lg font-semibold rounded-xl bg-gradient-to-r from-[#FF4D4D] to-[#FF003C] text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 flex items-center gap-3">
                                        <span>Go to Dashboard</span>
                                        <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium">
                                            <ArrowRight className="w-5 h-5" />
                                        </span>
                                    </button>
                                </Link>
                            ) : (
                                <Link to="/signup">
                                    <button className="group relative h-14 px-1 pr-1 pl-6 text-lg font-semibold rounded-xl bg-gradient-to-r from-[#FF4D4D] to-[#FF003C] text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 flex items-center gap-3">
                                        <span>Generate Thumbnails</span>
                                        <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium">
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

                {/* USE CASES - Made for real creators */}
                <section className="py-16 lg:py-24">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-sm font-semibold mb-4">
                                <Sparkles className="w-4 h-4" />
                                Use Cases
                            </div>
                            <h2
                                className="text-3xl lg:text-4xl text-[#111827] mb-4"
                                style={{ fontWeight: 400 }}
                            >
                                Made for real creators<br />who need real results
                            </h2>
                            <p className="text-[#6B7280] max-w-xl mx-auto">
                                Built for anyone who wants faster production and higher CTR.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-red-200 hover:shadow-lg transition-all duration-300 group">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Youtube className="w-7 h-7 text-red-500" />
                                </div>
                                <h3 className="text-xl font-semibold text-[#111827] mb-3">Youtubers</h3>
                                <p className="text-[#6B7280] leading-relaxed">
                                    Create multiple thumbnails at once. Get more clicks without spending hours designing.
                                </p>
                            </div>

                            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-red-200 hover:shadow-lg transition-all duration-300 group">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Building2 className="w-7 h-7 text-red-500" />
                                </div>
                                <h3 className="text-xl font-semibold text-[#111827] mb-3">Agencies</h3>
                                <p className="text-[#6B7280] leading-relaxed">
                                    Produce 100+ thumbnails weekly with a consistent, premium look.
                                </p>
                            </div>

                            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-red-200 hover:shadow-lg transition-all duration-300 group">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Image className="w-7 h-7 text-red-500" />
                                </div>
                                <h3 className="text-xl font-semibold text-[#111827] mb-3">Brands</h3>
                                <p className="text-[#6B7280] leading-relaxed">
                                    Keep your visual identity sharp without hiring an in-house designer for every video.
                                </p>
                            </div>

                            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-red-200 hover:shadow-lg transition-all duration-300 group">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Film className="w-7 h-7 text-red-500" />
                                </div>
                                <h3 className="text-xl font-semibold text-[#111827] mb-3">Short-Form Creators</h3>
                                <p className="text-[#6B7280] leading-relaxed">
                                    Produce scroll stopping thumbnails for Shorts, TikTok, and Reels instantly.
                                </p>
                            </div>

                            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-red-200 hover:shadow-lg transition-all duration-300 group">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Video className="w-7 h-7 text-red-500" />
                                </div>
                                <h3 className="text-xl font-semibold text-[#111827] mb-3">Content Creators</h3>
                                <p className="text-[#6B7280] leading-relaxed">
                                    Create pro-level thumbnails without touching Photoshop or hiring designers.
                                </p>
                            </div>

                            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-red-200 hover:shadow-lg transition-all duration-300 group">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Users className="w-7 h-7 text-red-500" />
                                </div>
                                <h3 className="text-xl font-semibold text-[#111827] mb-3">Teams</h3>
                                <p className="text-[#6B7280] leading-relaxed">
                                    Move faster, publish more, and keep every thumbnail on-brand across channels.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section - Why Creators Love Us */}
                <section className="py-16 lg:py-24 relative overflow-hidden">
                    {/* Subtle red gradient bg */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-red-100/50 to-transparent rounded-full blur-3xl -z-10" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-pink-100/50 to-transparent rounded-full blur-3xl -z-10" />

                    <div className="max-w-6xl mx-auto px-4">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-sm font-semibold mb-4">
                                <Sparkles className="w-4 h-4" />
                                Why Creators Love Us
                            </div>
                            <h2
                                className="text-3xl lg:text-4xl text-[#111827] mb-4"
                                style={{ fontWeight: 400 }}
                            >
                                Built for creators who want results
                            </h2>
                            <p className="text-[#6B7280] max-w-2xl mx-auto">
                                Our AI is trained on 50,000+ viral thumbnails to understand what makes viewers click.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-red-200 hover:shadow-lg transition-all duration-300 group">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Zap className="w-7 h-7 text-red-500" />
                                </div>
                                <h3 className="text-xl font-semibold text-[#111827] mb-3">Lightning Fast</h3>
                                <p className="text-[#6B7280] leading-relaxed">
                                    Generate professional thumbnails in under 5 seconds. Speed up your content pipeline by 10x.
                                </p>
                            </div>

                            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-red-200 hover:shadow-lg transition-all duration-300 group">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <TrendingUp className="w-7 h-7 text-red-500" />
                                </div>
                                <h3 className="text-xl font-semibold text-[#111827] mb-3">CTR Optimized</h3>
                                <p className="text-[#6B7280] leading-relaxed">
                                    AI trained on viral content patterns. Every thumbnail is designed to maximize click-through rates.
                                </p>
                            </div>

                            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-red-200 hover:shadow-lg transition-all duration-300 group">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <MousePointerClick className="w-7 h-7 text-red-500" />
                                </div>
                                <h3 className="text-xl font-semibold text-[#111827] mb-3">No Design Skills</h3>
                                <p className="text-[#6B7280] leading-relaxed">
                                    Just describe your video or upload a reference. Our AI handles the design, colors, and composition.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="py-16 lg:py-24">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-sm font-semibold mb-4">
                                <Sparkles className="w-4 h-4" />
                                How It Works
                            </div>
                            <h2
                                className="text-3xl lg:text-4xl text-[#111827] mb-4"
                                style={{ fontWeight: 400 }}
                            >
                                Create thumbnails in 3 simple steps
                            </h2>
                            <p className="text-[#6B7280] max-w-2xl mx-auto">
                                No complex software or design skills required. Just describe and generate.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                            <div className="text-center">
                                <div className="text-5xl lg:text-6xl font-bold text-[#FF4D4D] mb-6">
                                    1
                                </div>
                                <h3 className="text-xl font-semibold text-[#111827] mb-3">Describe Your Video</h3>
                                <p className="text-[#6B7280]">
                                    Enter your video title or describe the thumbnail you want. Add any style preferences.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="text-5xl lg:text-6xl font-bold text-[#FF4D4D] mb-6">
                                    2
                                </div>
                                <h3 className="text-xl font-semibold text-[#111827] mb-3">AI Generates Options</h3>
                                <p className="text-[#6B7280]">
                                    Our AI creates multiple thumbnail options optimized for maximum engagement.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="text-5xl lg:text-6xl font-bold text-[#FF4D4D] mb-6">
                                    3
                                </div>
                                <h3 className="text-xl font-semibold text-[#111827] mb-3">Download & Upload</h3>
                                <p className="text-[#6B7280]">
                                    Pick your favorite, download in HD, and upload directly to YouTube.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* What They Say - Testimonials */}
                <section className="py-16 lg:py-24 relative overflow-hidden">
                    {/* Subtle red gradient bg */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-red-100/30 via-pink-100/30 to-red-100/30 rounded-full blur-3xl -z-10" />

                    <div className="max-w-6xl mx-auto px-4">
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-sm font-semibold mb-4">
                                <Sparkles className="w-4 h-4" />
                                What They Say
                            </div>
                            <h2
                                className="text-3xl lg:text-4xl text-[#111827] mb-4"
                                style={{ fontWeight: 400 }}
                            >
                                Results that creators actually see
                            </h2>
                            <p className="text-[#6B7280] max-w-xl mx-auto">
                                Proof from the people who use QuikThumb to grow every single day.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Testimonial 1 */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-200">
                                <div className="flex gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} className="w-4 h-4 text-[#FF4D4D] fill-[#FF4D4D]" />
                                    ))}
                                </div>
                                <h4 className="font-semibold text-[#111827] mb-2">This is an amazing product.</h4>
                                <p className="text-sm text-[#6B7280] mb-4">
                                    It is very versatile and easy to work and edit your thumbnails with. In my opinion it beats any other product out there.
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-sm">N</div>
                                    <span className="text-sm font-medium text-[#111827]">NewsBuddyLove</span>
                                </div>
                            </div>

                            {/* Testimonial 2 with image */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-200">
                                <div className="flex gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} className="w-4 h-4 text-[#FF4D4D] fill-[#FF4D4D]" />
                                    ))}
                                </div>
                                <div className="rounded-xl overflow-hidden mb-4">
                                    <img src="/thumbnails/693c0027643cc31826d49e2e_2.webp" alt="Testimonial" className="w-full h-32 object-cover" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">R</div>
                                    <span className="text-sm font-medium text-[#111827]">Ryan Barne</span>
                                </div>
                            </div>

                            {/* Testimonial 3 */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-200">
                                <div className="flex gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} className="w-4 h-4 text-[#FF4D4D] fill-[#FF4D4D]" />
                                    ))}
                                </div>
                                <h4 className="font-semibold text-[#111827] mb-2">QuikThumb is amazing.</h4>
                                <p className="text-sm text-[#6B7280] mb-4">
                                    I can generate dozens of thumbnails in seconds for A/B tests and new ideas. It saves me so much time and helps me find the best thumbnail for every video.
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-sm">B</div>
                                    <span className="text-sm font-medium text-[#111827]">Badis Design</span>
                                </div>
                            </div>

                            {/* Testimonial 4 with image */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-200">
                                <div className="flex gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} className="w-4 h-4 text-[#FF4D4D] fill-[#FF4D4D]" />
                                    ))}
                                </div>
                                <div className="rounded-xl overflow-hidden mb-4">
                                    <img src="/thumbnails/693c0027e566a7f155b72113_3.webp" alt="Testimonial" className="w-full h-32 object-cover" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm">N</div>
                                    <span className="text-sm font-medium text-[#111827]">Nicky Saunders</span>
                                </div>
                            </div>

                            {/* Testimonial 5 */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-200">
                                <div className="flex gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} className="w-4 h-4 text-[#FF4D4D] fill-[#FF4D4D]" />
                                    ))}
                                </div>
                                <h4 className="font-semibold text-[#111827] mb-2">Just gave this a spin and it nailed the vibe way faster than I expected.</h4>
                                <p className="text-sm text-[#6B7280] mb-4">
                                    I usually spend way too long tweaking thumbnails, so being able to try a few variations in minutes is a huge win.
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm">S</div>
                                    <span className="text-sm font-medium text-[#111827]">Sasha Aleksandrova</span>
                                </div>
                            </div>

                            {/* Testimonial 6 */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-200">
                                <div className="flex gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} className="w-4 h-4 text-[#FF4D4D] fill-[#FF4D4D]" />
                                    ))}
                                </div>
                                <h4 className="font-semibold text-[#111827] mb-2">Instant thumbnail in seconds!</h4>
                                <p className="text-sm text-[#6B7280] mb-4">
                                    I just paste a YouTube link and it instantly creates a thumbnail. It's honestly replacing thumbnail designers.
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white font-bold text-sm">N</div>
                                    <span className="text-sm font-medium text-[#111827]">Nick Lauer</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA - Stop losing views */}
                <section className="py-16 lg:py-20">
                    <div className="max-w-4xl mx-auto px-4">
                        <div className="bg-[#F5F5F5] rounded-3xl p-8 lg:p-12 text-center">
                            <h2
                                className="text-2xl sm:text-3xl lg:text-4xl text-black mb-4"
                                style={{ fontWeight: 400 }}
                            >
                                Stop losing views to<br />mediocre thumbnails
                            </h2>
                            <p className="text-[#6B7280] mb-8 max-w-lg mx-auto">
                                Generate studio-quality thumbnails that stop scrolling and drive clicks in seconds. No design skills needed.
                            </p>

                            <Link to="/signup">
                                <button className="h-14 px-1 pr-1 pl-6 text-lg font-semibold rounded-xl bg-gradient-to-r from-[#FF4D4D] to-[#FF003C] text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 inline-flex items-center gap-3 mb-6">
                                    <span>Generate Thumbnails</span>
                                    <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium">
                                        Try for free
                                    </span>
                                </button>
                            </Link>

                            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#6B7280]">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-[#FF4D4D]" />
                                    +50% average CTR increase
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-[#FF4D4D]" />
                                    2× faster production speed
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-[#FF4D4D]" />
                                    90% reduction in design cost
                                </div>
                            </div>

                            {/* Thumbnails preview */}
                            <div className="flex justify-center gap-3 mt-8 overflow-hidden">
                                <img src="/thumbnails/693c00276ba0f2a772954e2a_1.webp" alt="Thumb" className="w-24 sm:w-32 h-auto rounded-xl opacity-60" />
                                <img src="/thumbnails/693c0027b53031861c55f9f7_5.webp" alt="Thumb" className="w-24 sm:w-32 h-auto rounded-xl" />
                                <img src="/thumbnails/693c002766c2ad39f57a0b97_4.webp" alt="Thumb" className="w-24 sm:w-32 h-auto rounded-xl" />
                                <img src="/thumbnails/693c002745c0a13e948d5dbd_6.webp" alt="Thumb" className="w-24 sm:w-32 h-auto rounded-xl opacity-60" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-12 border-t border-gray-200">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        {/* Logo */}
                        <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-md">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-xl text-[#111827]">QuikThumb</span>
                        </Link>

                        {/* About text */}
                        <p className="text-sm text-[#6B7280] max-w-md mx-auto mb-8">
                            AI-powered thumbnail generator for YouTube creators. Create stunning thumbnails in seconds, not hours.
                        </p>

                        {/* Footer links */}
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

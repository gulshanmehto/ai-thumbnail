import React from 'react';

// Thumbnail images for the carousel
const row1Thumbnails = [
    '/thumbnails/693c00276ba0f2a772954e2a_1.webp',
    '/thumbnails/693c0027643cc31826d49e2e_2.webp',
    '/thumbnails/693c0027e566a7f155b72113_3.webp',
    '/thumbnails/693c002766c2ad39f57a0b97_4.webp',
    '/thumbnails/693c0027b53031861c55f9f7_5.webp',
    '/thumbnails/693c002745c0a13e948d5dbd_6.webp',
    '/thumbnails/693c0027be02504980c34329_7.webp',
];

const row2Thumbnails = [
    '/thumbnails/693c00271397a3a5576a9427_8.webp',
    '/thumbnails/693c002745c0a13e948d5dbd_6.webp',
    '/thumbnails/693c002772097338e265b1c10_10.webp',
    '/thumbnails/693817a0ffc0a4cf3372ee00_Step_3.webp',
    '/thumbnails/693817a1e189c3bc9167e61a_Step_2.webp',
    '/thumbnails/693a9f6bc92c7d98766b5b00_Rob-thumb.webp',
    '/thumbnails/693c02265d28f145d7b08ab0_Feature_4.webp',
];

export default function ThumbnailCarousel() {
    // Duplicate arrays for seamless infinite scroll
    const row1Double = [...row1Thumbnails, ...row1Thumbnails];
    const row2Double = [...row2Thumbnails, ...row2Thumbnails];

    return (
        <section className="relative py-12 overflow-hidden bg-gradient-to-b from-[#F9FAFB] to-white">
            {/* Gradient overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-32 bg-gradient-to-r from-[#F9FAFB] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-32 bg-gradient-to-l from-[#F9FAFB] to-transparent z-10 pointer-events-none" />

            {/* Row 1 - Scrolls Right */}
            <div className="mb-4 overflow-hidden">
                <div className="flex gap-4 animate-scroll-right">
                    {row1Double.map((thumb, i) => (
                        <div
                            key={`row1-${i}`}
                            className="flex-shrink-0 w-56 sm:w-72 h-32 sm:h-40 rounded-2xl overflow-hidden bg-gray-100 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                        >
                            <img
                                src={thumb}
                                alt={`YouTube Thumbnail ${i + 1}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Row 2 - Scrolls Left */}
            <div className="overflow-hidden">
                <div className="flex gap-4 animate-scroll-left">
                    {row2Double.map((thumb, i) => (
                        <div
                            key={`row2-${i}`}
                            className="flex-shrink-0 w-56 sm:w-72 h-32 sm:h-40 rounded-2xl overflow-hidden bg-gray-100 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                        >
                            <img
                                src={thumb}
                                alt={`YouTube Thumbnail ${i + 1}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

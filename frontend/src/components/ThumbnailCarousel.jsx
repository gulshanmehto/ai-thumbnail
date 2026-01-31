import React from 'react';

// Thumbnail images for the carousel
const row1Thumbnails = [
    '/thumbnails/693c00276ba0f2a772954e2a_1.webp',
    '/thumbnails/693c0027643cc31826d49e2e_2.webp',
    '/thumbnails/693c0027e566a7f155b72113_3.webp',
    '/thumbnails/693c002766c2ad39f57a0b97_4.webp',
];

const row2Thumbnails = [
    '/thumbnails/693c0027b53031861c55f9f7_5.webp',
    '/thumbnails/693c002745c0a13e948d5dbd_6.webp',
    '/thumbnails/693c0027be02504980c34329_7.webp',
    '/thumbnails/693c00271397a3a5576a9427_8.webp',
];

export default function ThumbnailCarousel() {
    return (
        <section className="relative py-12 overflow-hidden">
            {/* Strong gradient overlays for whitish fade */}
            <div className="absolute left-0 top-0 bottom-0 w-32 sm:w-48 lg:w-64 bg-gradient-to-r from-[#FAFAFA] via-[#FAFAFA]/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 sm:w-48 lg:w-64 bg-gradient-to-l from-[#FAFAFA] via-[#FAFAFA]/80 to-transparent z-10 pointer-events-none" />

            <div className="max-w-5xl mx-auto px-4">
                {/* Row 1 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {row1Thumbnails.map((thumb, i) => (
                        <div
                            key={`row1-${i}`}
                            className="aspect-video rounded-2xl overflow-hidden bg-gray-100 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
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

                {/* Row 2 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {row2Thumbnails.map((thumb, i) => (
                        <div
                            key={`row2-${i}`}
                            className="aspect-video rounded-2xl overflow-hidden bg-gray-100 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                        >
                            <img
                                src={thumb}
                                alt={`YouTube Thumbnail ${i + 5}`}
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

import React from 'react';

// Thumbnail images for the carousel
const row1Thumbnails = [
    '/thumbnails/693c00276ba0f2a772954e2a_1.webp',
    '/thumbnails/693c0027643cc31826d49e2e_2.webp',
    '/thumbnails/693c0027e566a7f155b72113_3.webp',
    '/thumbnails/693c002766c2ad39f57a0b97_4.webp',
    '/thumbnails/693c0027b53031861c55f9f7_5.webp',
    '/thumbnails/693c002745c0a13e948d5dbd_6.webp',
];

const row2Thumbnails = [
    '/thumbnails/693c0027be02504980c34329_7.webp',
    '/thumbnails/693c00271397a3a5576a9427_8.webp',
    '/thumbnails/693817a0ffc0a4cf3372ee00_Step_3.webp',
    '/thumbnails/693817a1e189c3bc9167e61a_Step_2.webp',
    '/thumbnails/693a9f6bc92c7d98766b5b00_Rob-thumb.webp',
    '/thumbnails/693c02265d28f145d7b08ab0_Feature_4.webp',
];

export default function ThumbnailCarousel() {
    // Double the arrays for seamless infinite scroll
    const row1Double = [...row1Thumbnails, ...row1Thumbnails];
    const row2Double = [...row2Thumbnails, ...row2Thumbnails];

    return (
        <section className="relative py-12 overflow-hidden">
            {/* Strong white gradient overlays */}
            <div
                className="absolute left-0 top-0 bottom-0 w-32 sm:w-48 lg:w-64 z-10 pointer-events-none"
                style={{
                    background: 'linear-gradient(to right, #FAFAFA 0%, #FAFAFA 30%, rgba(250,250,250,0) 100%)'
                }}
            />
            <div
                className="absolute right-0 top-0 bottom-0 w-32 sm:w-48 lg:w-64 z-10 pointer-events-none"
                style={{
                    background: 'linear-gradient(to left, #FAFAFA 0%, #FAFAFA 30%, rgba(250,250,250,0) 100%)'
                }}
            />

            {/* Row 1 - Scrolls Right */}
            <div className="mb-4 overflow-hidden group">
                <div
                    className="flex gap-4 group-hover:[animation-play-state:paused]"
                    style={{
                        animation: 'scrollRight 40s linear infinite',
                        width: 'max-content'
                    }}
                >
                    {row1Double.map((thumb, i) => (
                        <div
                            key={`row1-${i}`}
                            className="flex-shrink-0 w-64 sm:w-72 lg:w-80 aspect-video rounded-2xl overflow-hidden bg-gray-100 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
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
            <div className="overflow-hidden group">
                <div
                    className="flex gap-4 group-hover:[animation-play-state:paused]"
                    style={{
                        animation: 'scrollLeft 40s linear infinite',
                        width: 'max-content'
                    }}
                >
                    {row2Double.map((thumb, i) => (
                        <div
                            key={`row2-${i}`}
                            className="flex-shrink-0 w-64 sm:w-72 lg:w-80 aspect-video rounded-2xl overflow-hidden bg-gray-100 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                        >
                            <img
                                src={thumb}
                                alt={`YouTube Thumbnail ${i + 7}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Inline keyframes for animation */}
            <style>{`
        @keyframes scrollRight {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scrollLeft {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
        </section>
    );
}

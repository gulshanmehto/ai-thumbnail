import React from 'react';

// Update these arrays with your actual thumbnail images
// Place images in /public/thumbnails/ folder
const row1Thumbnails = [
    '/thumbnails/thumb1.jpg',
    '/thumbnails/thumb2.jpg',
    '/thumbnails/thumb3.jpg',
    '/thumbnails/thumb4.jpg',
    '/thumbnails/thumb5.jpg',
    '/thumbnails/thumb6.jpg',
];

const row2Thumbnails = [
    '/thumbnails/thumb7.jpg',
    '/thumbnails/thumb8.jpg',
    '/thumbnails/thumb9.jpg',
    '/thumbnails/thumb10.jpg',
    '/thumbnails/thumb11.jpg',
    '/thumbnails/thumb12.jpg',
];

export default function ThumbnailCarousel() {
    // Duplicate arrays for seamless infinite scroll
    const row1Double = [...row1Thumbnails, ...row1Thumbnails];
    const row2Double = [...row2Thumbnails, ...row2Thumbnails];

    return (
        <section className="relative py-12 overflow-hidden bg-gradient-to-b from-[#F9FAFB] to-white">
            {/* Gradient overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#F9FAFB] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#F9FAFB] to-transparent z-10 pointer-events-none" />

            {/* Row 1 - Scrolls Right */}
            <div className="mb-4 overflow-hidden">
                <div className="flex gap-4 animate-scroll-right">
                    {row1Double.map((thumb, i) => (
                        <div
                            key={`row1-${i}`}
                            className="flex-shrink-0 w-72 h-40 rounded-2xl overflow-hidden bg-gray-200 shadow-lg hover:shadow-xl transition-shadow"
                        >
                            <img
                                src={thumb}
                                alt={`Thumbnail ${i + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                                    e.target.parentElement.innerHTML = '<span class="text-gray-400 text-sm">Thumbnail</span>';
                                }}
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
                            className="flex-shrink-0 w-72 h-40 rounded-2xl overflow-hidden bg-gray-200 shadow-lg hover:shadow-xl transition-shadow"
                        >
                            <img
                                src={thumb}
                                alt={`Thumbnail ${i + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                                    e.target.parentElement.innerHTML = '<span class="text-gray-400 text-sm">Thumbnail</span>';
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

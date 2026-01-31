import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Sparkles, Download, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

export default function Showcase() {
    const [thumbnails, setThumbnails] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchShowcase = async () => {
            try {
                const { data } = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/showcase`);
                setThumbnails(data);
            } catch (error) {
                console.error("Failed to fetch showcase", error);
            } finally {
                setLoading(false);
            }
        };

        fetchShowcase();
    }, []);

    const getImageUrl = (thumb) => {
        if (!thumb.image_url) return null;
        if (thumb.image_url.startsWith('https://')) return thumb.image_url;
        return `${process.env.REACT_APP_BACKEND_URL}${thumb.image_url}`;
    };

    const handleDownload = async (imageUrl, filename) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success("Download started");
        } catch (error) {
            console.error("Download failed:", error);
            window.open(imageUrl, '_blank');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex flex-col items-center text-center mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
                    <Sparkles className="w-4 h-4" />
                    Community Gallery
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                    Discovery Viral <span className="text-primary">Inspiration</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                    See what top creators are building with QuickThumb.ai. Click any image to learn how it was made or download it.
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="aspect-video bg-gray-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : thumbnails.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {thumbnails.map((thumb) => (
                        <div key={thumb.id} className="group relative bg-white border rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                            <div className={`aspect-video bg-secondary relative overflow-hidden`}>
                                <img
                                    src={getImageUrl(thumb)}
                                    alt={thumb.description}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 text-center">
                                    <p className="text-white font-medium mb-4 line-clamp-2">{thumb.description}</p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="rounded-full"
                                            onClick={() => handleDownload(getImageUrl(thumb), `showcase-${thumb.id}.png`)}
                                        >
                                            <Download className="w-4 h-4 mr-2" /> Download
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                        AI
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground truncate max-w-[150px]">
                                        {thumb.thumbnail_text || 'AI Generated'}
                                    </span>
                                </div>
                                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                                    {thumb.aspect_ratio}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-secondary/30 rounded-3xl border-2 border-dashed">
                    <h3 className="text-xl font-bold mb-2">The gallery is empty</h3>
                    <p className="text-muted-foreground mb-6">Be the first to create and share a thumbnail!</p>
                    <Link to="/editor">
                        <Button className="rounded-full px-8">Start Creating</Button>
                    </Link>
                </div>
            )}

            <div className="mt-20 border-t pt-12 text-center">
                <h2 className="text-2xl font-bold mb-4">Ready to create your own?</h2>
                <Link to="/editor">
                    <Button size="lg" className="rounded-full h-14 px-10 text-lg shadow-xl hover:shadow-primary/20 transition-all">
                        Open Editor <ArrowLeft className="ml-2 w-5 h-5 rotate-180" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}

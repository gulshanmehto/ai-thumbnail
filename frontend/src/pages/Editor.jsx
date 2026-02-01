import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Slider } from '../components/ui/slider'; // You might need to check if this exists or use native
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import { Loader2, Download, RefreshCw, Upload, Image as ImageIcon, Type, Sparkles, Wand2, User, Zap, Palette, Smile } from 'lucide-react';
import { BACKEND_URL } from '../lib/config';

// Constants for UI
const STYLE_PRESETS = [
    { id: "MrBeast Style", label: "MrBeast", color: "bg-blue-100 border-blue-300" },
    { id: "Podcast Style", label: "Podcast", color: "bg-gray-100 border-gray-300" },
    { id: "Bollywood Reaction", label: "Reaction", color: "bg-red-100 border-red-300" },
    { id: "Education Clean", label: "Educational", color: "bg-green-100 border-green-300" },
    { id: "Meme Thumbnail", label: "Meme", color: "bg-yellow-100 border-yellow-300" },
    { id: "Brand Clean", label: "Brand", color: "bg-slate-100 border-slate-300" },
];

export default function Editor() {
    const { user, setUser } = useAuth();

    // Workflow State: Simple & Direct
    const [description, setDescription] = useState('');
    const [thumbnailText, setThumbnailText] = useState('');
    const [aspectRatio, setAspectRatio] = useState('16:9');

    // Images
    const [subjectImage, setSubjectImage] = useState(null);
    const [referenceImage, setReferenceImage] = useState(null);
    const [subjectPreview, setSubjectPreview] = useState(null);
    const [referencePreview, setReferencePreview] = useState(null);

    // UI State
    const [loading, setLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);

    const handleImageUpload = (e, setFile, setPreview) => {
        const file = e.target.files[0];
        if (file) {
            setFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!subjectImage || !referenceImage || !description) {
            toast.error("Please provide Subject, Style Reference, and Description.");
            return;
        }
        if (user.credits <= 0) {
            toast.error("Not enough credits!");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                description: description,
                thumbnail_text: thumbnailText,
                aspect_ratio: aspectRatio,
                subject_image: subjectPreview,
                reference_image: referencePreview,
                // Defaults for backend compat
                intent: 'custom',
                style_mode: 'upload',
                image_type: 'face',
                crop_type: 'close-up',
                expression_level: 'medium'
            };

            const { data } = await axios.post(
                `${BACKEND_URL}/api/generate`,
                payload,
                { withCredentials: true }
            );
            setGeneratedImage(data.image);
            setUser(prev => ({ ...prev, credits: data.credits }));
            toast.success("Thumbnail generated successfully!");
        } catch (error) {
            console.error("Generation Error:", error);
            // Safely parse error to avoid React #31 crash
            let errorMsg = "Generation failed";
            if (error.response?.data?.detail) {
                const detail = error.response.data.detail;
                if (typeof detail === 'string') {
                    errorMsg = detail;
                } else if (Array.isArray(detail)) {
                    // Pydantic validation array
                    errorMsg = detail.map(e => `${e.loc.join('.')}: ${e.msg}`).join(', ');
                } else {
                    errorMsg = JSON.stringify(detail);
                }
            }
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[480px_1fr] gap-8">
            {/* Sidebar Controls */}
            <div className="bg-white border rounded-2xl p-6 h-fit space-y-8 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                        <Wand2 className="w-5 h-5 text-purple-600" />
                        AI Designer
                    </h2>

                    <div className="space-y-6">
                        {/* 1. Images Section */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-700">1. Subject Image</Label>
                                <div
                                    className="border-2 border-dashed border-slate-200 rounded-xl p-2 h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all relative overflow-hidden"
                                    onClick={() => document.getElementById('subject-upload').click()}
                                >
                                    {subjectPreview ? (
                                        <img src={subjectPreview} alt="Subject" className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5 text-slate-400 mb-2" />
                                            <span className="text-[10px] text-slate-400 text-center">Upload Subject</span>
                                        </>
                                    )}
                                    <input id="subject-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, setSubjectImage, setSubjectPreview)} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-700">2. Style Reference</Label>
                                <div
                                    className="border-2 border-dashed border-slate-200 rounded-xl p-2 h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all relative overflow-hidden"
                                    onClick={() => document.getElementById('ref-upload').click()}
                                >
                                    {referencePreview ? (
                                        <img src={referencePreview} alt="Reference" className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <>
                                            <ImageIcon className="w-5 h-5 text-slate-400 mb-2" />
                                            <span className="text-[10px] text-slate-400 text-center">Upload Style</span>
                                        </>
                                    )}
                                    <input id="ref-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, setReferenceImage, setReferencePreview)} />
                                </div>
                            </div>
                        </div>

                        {/* 2. Text Controls */}
                        <div className="space-y-3">
                            <Label htmlFor="desc" className="text-sm font-semibold text-slate-700">3. Description / Concept</Label>
                            <Textarea
                                id="desc"
                                placeholder="e.g. A shocked face holding a stack of money in a futuristic city"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="h-24 resize-none bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="thumb-text" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <Type className="w-4 h-4" /> Text Overlay (Baked into Image)
                            </Label>
                            <Input
                                id="thumb-text"
                                placeholder="e.g. I MADE $1M!"
                                value={thumbnailText}
                                onChange={(e) => setThumbnailText(e.target.value)}
                                className="bg-slate-50 border-slate-200"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-sm font-semibold text-slate-700">Aspect Ratio</Label>
                            <Select value={aspectRatio} onValueChange={setAspectRatio}>
                                <SelectTrigger className="bg-slate-50 border-slate-200">
                                    <SelectValue placeholder="Select ratio" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="16:9">YouTube (16:9)</SelectItem>
                                    <SelectItem value="9:16">Shorts / Reels (9:16)</SelectItem>
                                    <SelectItem value="1:1">Square (1:1)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <Button
                        className="w-full h-12 text-lg font-medium shadow-lg hover:shadow-xl transition-all btn-gradient rounded-full"
                        onClick={handleGenerate}
                        disabled={loading}
                    >
                        {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Designing...</> : 'Generate Thumbnail'}
                    </Button>
                    <div className="text-center text-xs text-slate-400 mt-3 font-medium">
                        {user?.credits} credits remaining
                    </div>
                </div>
            </div>

            {/* Canvas / Preview */}
            <div className="bg-[#1e1e1e] rounded-2xl border-0 shadow-2xl flex items-center justify-center relative overflow-hidden group min-h-[400px] lg:min-h-[600px] lg:sticky lg:top-8">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]" />

                {!generatedImage ? (
                    <div className="text-center p-8 max-w-md relative z-10">
                        <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/10">
                            <Sparkles className="w-10 h-10 text-white/50" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Ready to Design</h3>
                        <p className="text-white/40 leading-relaxed text-sm">
                            Configure your intent, subject, and style on the left.<br />
                            Our AI will compose a professional thumbnail for you.
                        </p>
                    </div>
                ) : (
                    <div className="relative w-full h-full flex items-center justify-center p-6 z-10">
                        <img
                            src={generatedImage}
                            alt="Generated Thumbnail"
                            className={`max-w-full max-h-full rounded-lg shadow-2xl ring-1 ring-white/10 ${aspectRatio === '9:16' ? 'h-[90%]' : 'w-full max-w-4xl'}`}
                        />
                        <div className="absolute bottom-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                            <Button
                                size="lg"
                                className="rounded-full shadow-xl bg-white text-black hover:bg-gray-100 font-semibold"
                                onClick={() => {
                                    const a = document.createElement('a');
                                    a.href = generatedImage;
                                    a.download = `thumbnail-${Date.now()}.png`;
                                    a.click();
                                }}
                            >
                                <Download className="mr-2 w-4 h-4" /> Download
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="rounded-full shadow-xl border-white/20 bg-black/50 text-white hover:bg-black/70 backdrop-blur-md"
                                onClick={() => setGeneratedImage(null)}
                            >
                                <RefreshCw className="mr-2 w-4 h-4" /> New
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

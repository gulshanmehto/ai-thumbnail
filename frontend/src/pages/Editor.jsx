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

    // Core Inputs
    const [thumbnailText, setThumbnailText] = useState('');
    const [aspectRatio, setAspectRatio] = useState('16:9');

    // Advanced Prompt Engine Inputs
    const [intent, setIntent] = useState('viral');
    const [imageType, setImageType] = useState('face');
    const [cropType, setCropType] = useState('close-up');
    const [styleMode, setStyleMode] = useState('preset'); // 'upload' or 'preset'
    const [stylePreset, setStylePreset] = useState(STYLE_PRESETS[0].id);
    const [expressionLevel, setExpressionLevel] = useState('medium');

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
        if (!subjectImage) {
            toast.error("Please upload a Subject Image");
            return;
        }
        if (styleMode === 'upload' && !referenceImage) {
            toast.error("Please upload a Style Reference");
            return;
        }
        if (user.credits <= 0) {
            toast.error("Not enough credits!");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                description: intent, // Use intent as description since we removed the text field
                thumbnail_text: thumbnailText,
                aspect_ratio: aspectRatio,
                subject_image: subjectPreview,
                reference_image: (styleMode === 'upload' && referencePreview) ? referencePreview : "",
                // New Engine Fields
                intent,
                image_type: imageType,
                crop_type: cropType,
                style_mode: styleMode,
                style_preset: styleMode === 'preset' ? stylePreset : null,
                expression_level: expressionLevel
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

                    <div className="space-y-8">
                        {/* 1. INTENT (Mandatory) */}
                        <div className="space-y-3">
                            <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <Zap className="w-4 h-4 text-amber-500" /> 1. Thumbnail Intent
                            </Label>
                            <Select value={intent} onValueChange={setIntent}>
                                <SelectTrigger className="w-full h-11 border-slate-200 bg-slate-50/50">
                                    <SelectValue placeholder="Select outcome" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="viral">🔥 Viral / Clickbait (High CTR)</SelectItem>
                                    <SelectItem value="emotional">🥺 Emotional / Dramatic</SelectItem>
                                    <SelectItem value="educational">📚 Educational / Clean</SelectItem>
                                    <SelectItem value="podcast">🎙️ Podcast / Interview</SelectItem>
                                    <SelectItem value="faceless">🎭 Faceless / Mystery</SelectItem>
                                    <SelectItem value="brand">🏢 Brand Professional</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 2. SUBJECT */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <User className="w-4 h-4 text-blue-500" /> 2. Subject
                                </Label>
                                <div className="flex gap-2 text-xs">
                                    <button
                                        onClick={() => setImageType('face')}
                                        className={`px-2 py-1 rounded transition-colors ${imageType === 'face' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-slate-500 hover:bg-slate-100'}`}
                                    >
                                        Face
                                    </button>
                                    <button
                                        onClick={() => setImageType('faceless')}
                                        className={`px-2 py-1 rounded transition-colors ${imageType === 'faceless' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-slate-500 hover:bg-slate-100'}`}
                                    >
                                        Faceless
                                    </button>
                                </div>
                            </div>

                            <div
                                className="border-2 border-dashed border-slate-200 rounded-xl p-4 h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all relative overflow-hidden group"
                                onClick={() => document.getElementById('subject-upload').click()}
                            >
                                {subjectPreview ? (
                                    <>
                                        <img src={subjectPreview} alt="Subject" className="w-full h-full object-cover rounded-lg" />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                            <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100">Change Image</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="bg-blue-50 p-2 rounded-full mb-2">
                                            <Upload className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <span className="text-xs font-medium text-slate-500">Upload Person/Object</span>
                                    </>
                                )}
                                <input id="subject-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, setSubjectImage, setSubjectPreview)} />
                            </div>

                            {imageType === 'face' && (
                                <div className="space-y-3 pt-1">
                                    <div className="flex justify-between items-center text-xs text-slate-600">
                                        <span className="font-medium">Expression Intensity: {expressionLevel}</span>
                                    </div>
                                    <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
                                        {['subtle', 'medium', 'extreme'].map((level) => (
                                            <button
                                                key={level}
                                                onClick={() => setExpressionLevel(level)}
                                                className={`flex-1 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${expressionLevel === level ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 3. STYLE */}
                        <div className="space-y-3">
                            <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <Palette className="w-4 h-4 text-purple-500" /> 3. Style Reference
                            </Label>

                            <div className="flex bg-slate-100 p-1 rounded-lg mb-3">
                                <button
                                    onClick={() => setStyleMode('preset')}
                                    className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${styleMode === 'preset' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
                                >
                                    Use Preset
                                </button>
                                <button
                                    onClick={() => setStyleMode('upload')}
                                    className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${styleMode === 'upload' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
                                >
                                    Upload Reference
                                </button>
                            </div>

                            {styleMode === 'preset' ? (
                                <div className="grid grid-cols-2 gap-2">
                                    {STYLE_PRESETS.map((preset) => (
                                        <button
                                            key={preset.id}
                                            onClick={() => setStylePreset(preset.id)}
                                            className={`p-3 rounded-lg border text-left text-xs font-medium transition-all ${stylePreset === preset.id ? `ring-2 ring-offset-1 ring-purple-500 ${preset.color}` : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'}`}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div
                                    className="border-2 border-dashed border-slate-200 rounded-xl p-4 h-24 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all relative overflow-hidden"
                                    onClick={() => document.getElementById('ref-upload').click()}
                                >
                                    {referencePreview ? (
                                        <img src={referencePreview} alt="Ref" className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <ImageIcon className="w-5 h-5" />
                                            <span className="text-xs">Upload Style</span>
                                        </div>
                                    )}
                                    <input id="ref-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, setReferenceImage, setReferencePreview)} />
                                </div>
                            )}
                        </div>

                        {/* 4. DETAILS */}
                        <div className="space-y-4 pt-2 border-t border-slate-100">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-slate-700">Text Overlay</Label>
                                <Input
                                    placeholder="e.g. I SURVIVED!"
                                    value={thumbnailText}
                                    onChange={(e) => setThumbnailText(e.target.value)}
                                    className="bg-slate-50 border-slate-200"
                                />
                            </div>
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

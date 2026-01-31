import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Plus, Clock, Image as ImageIcon, Download, Coins, Trash2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { BACKEND_URL } from '../lib/config';

export default function Dashboard() {
  const { user } = useAuth();
  const [thumbnails, setThumbnails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchThumbnails = async () => {
      try {
        const { data } = await axios.get(`${BACKEND_URL}/api/thumbnails`, {
          withCredentials: true
        });
        setThumbnails(data);
      } catch (error) {
        console.error("Failed to fetch thumbnails", error);
      } finally {
        setLoading(false);
      }
    };

    fetchThumbnails();
  }, []);

  const getImageUrl = (thumb) => {
    if (!thumb.image_url) return null;
    if (thumb.image_url.startsWith('http')) return thumb.image_url;
    return `${BACKEND_URL}${thumb.image_url}`;
  };

  const handleDownload = async (imageUrl, filename) => {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Network response was not ok');
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
      toast.error("Failed to download image. Try opening in new tab.");
      window.open(imageUrl, '_blank');
    }
  };

  const handleDelete = async (thumbId) => {
    if (!window.confirm("Are you sure you want to delete this thumbnail?")) {
      return;
    }

    setDeletingId(thumbId);
    try {
      await axios.delete(`${BACKEND_URL}/api/thumbnails/${thumbId}`, {
        withCredentials: true
      });
      setThumbnails(thumbnails.filter(t => t.id !== thumbId));
      toast.success("Thumbnail deleted successfully");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete thumbnail");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#111827] mb-2">Welcome back, {user?.name}</h1>
            <div className="flex items-center gap-2 text-[#6B7280]">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span>You have <span className="font-semibold text-[#111827]">{user?.credits}</span> credits remaining.</span>
              <Link to="/pricing" className="text-red-500 hover:underline text-sm font-medium ml-2">
                Top up credits
              </Link>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/pricing">
              <Button variant="outline" className="rounded-full border-gray-300 text-[#374151] hover:bg-gray-100">
                Buy Credits
              </Button>
            </Link>
            <Link to="/editor">
              <Button size="lg" className="rounded-full btn-gradient text-white border-0 shadow-lg hover:shadow-xl transition-all gap-2">
                <Plus className="w-5 h-5" /> Create New
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#6B7280]">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            Loading your thumbnails...
          </div>
        ) : thumbnails.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {thumbnails.map((thumb) => (
              <div key={thumb.id} className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                <div className={`bg-gray-100 flex items-center justify-center relative overflow-hidden ${thumb.aspect_ratio === '9:16' ? 'aspect-[9/16]' : thumb.aspect_ratio === '1:1' ? 'aspect-square' : 'aspect-video'}`}>
                  {getImageUrl(thumb) ? (
                    <>
                      <img
                        src={getImageUrl(thumb)}
                        alt={thumb.description}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.parentElement.querySelector('.fallback-icon').style.display = 'flex';
                        }}
                      />
                      <div className="fallback-icon flex-col items-center gap-2 hidden absolute inset-0 justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-300" />
                        <span className="text-xs text-[#9CA3AF]">Load failed</span>
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="gap-2 bg-white text-[#111827] hover:bg-gray-100"
                          onClick={() => handleDownload(getImageUrl(thumb), `thumbnail-${thumb.id}.png`)}
                        >
                          <Download className="w-4 h-4" /> Download
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleDelete(thumb.id)}
                          disabled={deletingId === thumb.id}
                        >
                          {deletingId === thumb.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                      <span className="text-xs text-[#9CA3AF]">Image missing</span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <p className="font-semibold text-[#111827] truncate mb-1" title={thumb.description}>{thumb.description}</p>
                  <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
                    <span className="bg-gray-100 px-2 py-0.5 rounded">{thumb.aspect_ratio}</span>
                    <span>{format(new Date(thumb.created_at), 'MMM d')}</span>
                  </div>
                  {thumb.thumbnail_text && (
                    <div className="mt-2 text-xs bg-gray-50 p-2 rounded-lg truncate border border-gray-100" title={thumb.thumbnail_text}>
                      <span className="font-semibold text-[#374151]">Text:</span> <span className="text-[#6B7280]">{thumb.thumbnail_text}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-[#9CA3AF]" />
            </div>
            <h3 className="text-xl font-bold text-[#111827] mb-2">No thumbnails yet</h3>
            <p className="text-[#6B7280] mb-6 max-w-md mx-auto">Start creating viral thumbnails to see them here. Each generation uses 1 credit.</p>
            <Link to="/editor">
              <Button className="btn-gradient text-white border-0 rounded-full px-6">Create Your First Thumbnail</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

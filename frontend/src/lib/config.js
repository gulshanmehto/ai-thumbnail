// detect production vs development
const getBackendUrl = () => {
    const envUrl = process.env.REACT_APP_BACKEND_URL;
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // If we have an env var and it's not pointing to localhost, use it
    if (envUrl && !envUrl.includes('localhost')) return envUrl;

    // If we are on a real domain (like Vercel) but have no env var or it's misconfigured to localhost
    if (!isLocalhost) return 'https://ai-thumbnail-50sc.onrender.com';

    // Fallback for local dev
    return envUrl || 'http://localhost:8000';
};

export const BACKEND_URL = getBackendUrl();

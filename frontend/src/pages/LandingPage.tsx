import React, { useState } from 'react';
import Button from '../components/common/Button';
import { createShortUrl, type UrlResponse, type ApiErrorResponse } from '../api/urlApi';
import { 
  ClipboardDocumentIcon, 
  QrCodeIcon, 
  ArrowTopRightOnSquareIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { useToastStore } from '../store/useToastStore';

const LandingPage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shortenResult, setShortenResult] = useState<UrlResponse | null>(null);
  const { addToast } = useToastStore();

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setIsLoading(true);
    try {
      const response = await createShortUrl({ 
        originalUrl: url,
        customAlias: alias || undefined
      });
      setShortenResult(response.data);
      addToast(response.message || 'URL shortened successfully!', 'success');
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      console.error('Shortening failed:', apiError);
      
      const message = apiError.message || 'Failed to shorten URL';
      addToast(message, 'error');
      
      if (apiError.validationErrors) {
        Object.entries(apiError.validationErrors).forEach(([field, msg]) => {
          console.warn(`Validation error on ${field}: ${msg}`);
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (shortenResult) {
      navigator.clipboard.writeText(shortenResult.shortUrl);
      addToast('Copied to clipboard!', 'info');
    }
  };

  return (
    <div className="bg-gradient-to-b from-indigo-50 to-white py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
          🔗 Smart URL Shortener
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Shorten, track, and manage your links with powerful built-in analytics.
          O(1) redirection powered by Redis caching.
        </p>

        <form onSubmit={handleShorten} className="mt-10 max-w-2xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              required
              placeholder="https://paste-your-long-link-here"
              className="flex-1 px-5 py-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm bg-white"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button type="submit" isLoading={isLoading} className="px-8 py-4 text-base">
              Shorten →
            </Button>
          </div>

          <div className="flex flex-col items-start">
            <button 
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-indigo-600 text-sm font-medium flex items-center gap-1 hover:text-indigo-700 transition-colors"
            >
              {showAdvanced ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
              Advanced Options
            </button>
            
            {showAdvanced && (
              <div className="w-full mt-3 animate-fade-in">
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  Custom Alias (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. my-cool-link"
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm bg-white"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                />
              </div>
            )}
          </div>
        </form>

        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
          <span>✓ Free to use</span>
          <span>✓ High Performance</span>
          <span>✓ Custom aliases</span>
        </div>

        {shortenResult && (
          <div className="mt-12 max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-fade-in text-left">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-green-500">✅</span> Your shortened link is ready!
            </h3>
            
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-indigo-600 font-semibold truncate">
                  {shortenResult.shortUrl}
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-gray-200 rounded-md transition-colors title='Copy'"
                  >
                    <ClipboardDocumentIcon className="h-5 w-5 text-gray-600" />
                  </button>
                  <a 
                    href={shortenResult.shortUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    <ArrowTopRightOnSquareIcon className="h-5 w-5 text-gray-600" />
                  </a>
                </div>
              </div>
              
              <div className="text-xs text-gray-400 truncate">
                Original: {shortenResult.originalUrl}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <Button variant="ghost" onClick={() => setShortenResult(null)}>
                Shorten Another
              </Button>
              <Button variant="secondary" className="gap-2">
                <QrCodeIcon className="h-4 w-4" /> Get QR Code
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;

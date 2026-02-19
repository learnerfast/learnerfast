'use client';
import { useState, useEffect } from 'react';
import { Loader, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

export default function SecurePDFViewer({ contentId, token }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    fetchSecureUrl();
  }, [contentId]);

  const fetchSecureUrl = async () => {
    try {
      const response = await fetch(`/api/content/${contentId}?token=${token}`);
      if (!response.ok) throw new Error('Access denied');
      
      const data = await response.json();
      setPdfUrl(data.url);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <Loader className="h-8 w-8 text-gray-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-800 text-white p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm">Page {page}</span>
          <button 
            onClick={() => setPage(p => p + 1)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setZoom(z => Math.max(50, z - 10))}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <span className="text-sm">{zoom}%</span>
          <button 
            onClick={() => setZoom(z => Math.min(200, z + 10))}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
        </div>
      </div>
      <iframe
        src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&page=${page}&zoom=${zoom}`}
        className="w-full h-[600px]"
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}

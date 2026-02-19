'use client';
import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export default function ImageUploader({ onUploadComplete, currentImage, siteId }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || null);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);

      setUploadProgress(30);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${siteId}/${Date.now()}.${fileExt}`;
      
      setUploadProgress(50);
      
      const { data, error: uploadError } = await supabase.storage
        .from('site-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      setUploadProgress(80);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('site-images')
        .getPublicUrl(fileName);

      setUploadProgress(100);
      onUploadComplete?.(publicUrl);
      
      if (window.showToast) {
        window.showToast('Image uploaded successfully', 'success');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload image. Please try again.');
      if (window.showToast) {
        window.showToast('Failed to upload image', 'error');
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {preview && (
        <div className="relative w-full h-48 border rounded-lg overflow-hidden transition-smooth">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}

      {error && (
        <div className="text-red-600 text-sm p-2 bg-red-50 rounded-lg transition-smooth">
          {error}
        </div>
      )}

      {uploading && uploadProgress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-blue-600 h-2 transition-smooth"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth flex items-center justify-center space-x-2"
      >
        {uploading && <span className="loading-spinner inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>}
        <span>{uploading ? 'Uploading...' : preview ? 'Change Image' : 'Upload Image'}</span>
      </button>
    </div>
  );
}

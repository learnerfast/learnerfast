import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

const VideoPlayer = ({ courseId, userId }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingVideo, setPlayingVideo] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data, error } = await supabase
          .from('course_videos')
          .select('*')
          .eq('course_id', courseId)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) {
          toast.error('Failed to load videos');
        } else if (data) {
          setVideos(data);
        }
      } catch (err) {
        toast.error('Failed to load videos');
      } finally {
        setLoading(false);
      }
    };

    if (courseId && userId) {
      fetchVideos();
    }
  }, [courseId, userId]);

  const handleVideoError = (video) => {
    toast.error(`Failed to load video: ${video.title}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">Loading videos...</span>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-2">No videos available</div>
        <p className="text-sm text-gray-400">Upload some videos to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="video-list space-y-6">
        {videos.map(video => (
          <div key={video.id} className="video-item bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">{video.title}</h3>
              <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                {video.video_type === 'script' ? (
                  <div 
                    className="w-full h-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: video.embed_url }}
                  />
                ) : (
                  <iframe 
                    src={video.embed_url}
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    title={video.title}
                    onError={() => handleVideoError(video)}
                    onLoad={() => {}}
                  />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 cursor-pointer" 
                     onClick={() => setPlayingVideo(video)} />
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                <span className="capitalize bg-gray-100 px-2 py-1 rounded">{video.video_type}</span>
                <span>{new Date(video.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full Screen Video Modal */}
      {playingVideo && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-6xl w-full max-h-[95vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{playingVideo.title}</h3>
              <button
                onClick={() => setPlayingVideo(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                {playingVideo.video_type === 'script' ? (
                  <div 
                    className="w-full h-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: playingVideo.embed_url }}
                  />
                ) : (
                  <iframe
                    src={playingVideo.embed_url}
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    title={playingVideo.title}
                    onError={() => handleVideoError(playingVideo)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VideoPlayer;
// Video utility functions for handling different video platforms

export const validateVideoUrl = (url, type) => {
  if (!url || !url.trim()) {
    return { valid: false, error: 'URL is required' };
  }

  const trimmedUrl = url.trim();

  switch (type) {
    case 'vimeo':
      const vimeoMatch = trimmedUrl.match(/vimeo\.com\/(\d+)/);
      if (!vimeoMatch) {
        return { valid: false, error: 'Invalid Vimeo URL. Use format: https://vimeo.com/123456789' };
      }
      return { valid: true, videoId: vimeoMatch[1] };

    case 'youtube':
      let youtubeId = null;
      if (trimmedUrl.includes('youtube.com/watch')) {
        youtubeId = trimmedUrl.match(/[?&]v=([^&]+)/)?.[1];
      } else if (trimmedUrl.includes('youtu.be/')) {
        youtubeId = trimmedUrl.split('youtu.be/')[1]?.split('?')[0];
      }
      if (!youtubeId) {
        return { valid: false, error: 'Invalid YouTube URL' };
      }
      return { valid: true, videoId: youtubeId };

    case 'vdocipher':
    case 'gumlet':
    case 'iframe':
      try {
        new URL(trimmedUrl);
        return { valid: true };
      } catch {
        return { valid: false, error: 'Invalid URL format' };
      }

    case 'script':
      if (!trimmedUrl.includes('<') || !trimmedUrl.includes('>')) {
        return { valid: false, error: 'Invalid embed script format' };
      }
      return { valid: true };

    default:
      return { valid: false, error: 'Unsupported video type' };
  }
};

export const generateEmbedUrl = (url, type) => {
  const validation = validateVideoUrl(url, type);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const trimmedUrl = url.trim();

  switch (type) {
    case 'vimeo':
      return `https://player.vimeo.com/video/${validation.videoId}?title=0&byline=0&portrait=0`;

    case 'youtube':
      return `https://www.youtube.com/embed/${validation.videoId}?rel=0&modestbranding=1`;

    case 'vdocipher':
    case 'gumlet':
      return trimmedUrl;

    case 'iframe':
      // Extract URL from iframe code if pasted
      if (trimmedUrl.includes('<iframe')) {
        const srcMatch = trimmedUrl.match(/src=["']([^"']+)["']/);
        if (srcMatch) {
          return srcMatch[1];
        }
      }

      // Handle YouTube URLs
      if (trimmedUrl.includes('youtube.com/watch')) {
        const videoId = trimmedUrl.match(/[?&]v=([^&]+)/)?.[1];
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
        }
      } else if (trimmedUrl.includes('youtu.be/')) {
        const videoId = trimmedUrl.split('youtu.be/')[1]?.split('?')[0];
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
        }
      }

      // Handle Vimeo URLs
      if (trimmedUrl.includes('vimeo.com/') && !trimmedUrl.includes('player.vimeo.com')) {
        const videoId = trimmedUrl.match(/vimeo\.com\/(\d+)/)?.[1];
        if (videoId) {
          return `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`;
        }
      }

      return trimmedUrl;

    case 'script':
      return trimmedUrl;

    default:
      throw new Error('Unsupported video type');
  }
};

export const getVideoTypeFromUrl = (url) => {
  if (!url) return 'iframe';
  
  const trimmedUrl = url.toLowerCase().trim();
  
  if (trimmedUrl.includes('vimeo.com')) return 'vimeo';
  if (trimmedUrl.includes('youtube.com') || trimmedUrl.includes('youtu.be')) return 'youtube';
  if (trimmedUrl.includes('vdocipher')) return 'vdocipher';
  if (trimmedUrl.includes('gumlet')) return 'gumlet';
  if (trimmedUrl.includes('<iframe') || trimmedUrl.includes('<script')) return 'script';
  
  return 'iframe';
};

export const isValidVideoUrl = (url) => {
  if (!url || !url.trim()) return false;
  
  try {
    new URL(url.trim());
    return true;
  } catch {
    return url.trim().includes('<') && url.trim().includes('>'); // Allow script embeds
  }
};
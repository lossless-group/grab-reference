const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

// Simple check - will only log length to avoid exposing key
console.log('API key loaded:', YOUTUBE_API_KEY ? '✓' : '✗');

console.log('Environment:', {
  hasKey: !!YOUTUBE_API_KEY,
  keyLength: YOUTUBE_API_KEY?.length || 0,
  keyStart: YOUTUBE_API_KEY ? `${YOUTUBE_API_KEY.substring(0, 3)}...` : 'none'
});

if (!YOUTUBE_API_KEY) {
  throw new Error('YouTube API key is not configured');
}

console.log('API Key length:', YOUTUBE_API_KEY.length);

interface YouTubeData {
  title: string;
  publishedAt: string;
  channelTitle: string;
  description: string;
}

export const fetchYouTubeData = async (url: string): Promise<YouTubeData> => {
  try {
    const videoId = extractVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL - Could not extract video ID');
    }

    console.log('Attempting API call with video ID:', videoId);
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (!response.ok) {
      console.error('YouTube API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        errorResponse: data
      });
      throw new Error(`YouTube API error: ${response.status} - ${data.error?.message || response.statusText}`);
    }

    console.log('YouTube API Response:', data);

    if (!data.items || data.items.length === 0) {
      throw new Error('Video not found');
    }

    const videoInfo = data.items[0].snippet;
    return {
      title: videoInfo.title,
      publishedAt: videoInfo.publishedAt,
      channelTitle: videoInfo.channelTitle,
      description: videoInfo.description
    };
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    if (error instanceof Error) {
      throw new Error(`YouTube API Error: ${error.message}`);
    }
    throw error;
  }
};

const extractVideoId = (url: string): string => {
  try {
    // Try the URL object method first
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtu.be')) {
      return urlObj.pathname.slice(1);
    }
    const paramId = urlObj.searchParams.get('v');
    if (paramId) return paramId;

    // Fallback to regex method
    const regexMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
    if (regexMatch) return regexMatch;

    return '';
  } catch (error) {
    console.error('Error extracting video ID:', error);
    return '';
  }
};
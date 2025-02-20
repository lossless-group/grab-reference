const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

interface YouTubeData {
  title: string;
  publishedAt: string;
  channelTitle: string;
  description: string;
}

export const fetchYouTubeData = async (url: string): Promise<YouTubeData> => {
  const videoId = extractVideoId(url);
  // TODO: Implement actual YouTube API call
  return {
    title: "Sample YouTube Video",
    publishedAt: "2024-03-14",
    channelTitle: "Sample Channel",
    description: "Sample description"
  };
};

const extractVideoId = (url: string): string => {
  const urlObj = new URL(url);
  if (urlObj.hostname.includes('youtu.be')) {
    return urlObj.pathname.slice(1);
  }
  return urlObj.searchParams.get('v') || '';
};

async function getYouTubeVideoInfo(videoUrl: string) {
  // Extract video ID from URL
  const videoId = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
  
  if (!videoId) throw new Error('Invalid YouTube URL');

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`
  );
  
  const data = await response.json();
  const videoInfo = data.items[0].snippet;
  
  return {
    title: videoInfo.title,
    author: videoInfo.channelTitle,
    publishedDate: videoInfo.publishedAt,
    description: videoInfo.description
  };
}
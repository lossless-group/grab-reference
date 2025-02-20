import { isYouTubeUrl, isGoogleBooksUrl } from './url-handler';
import { fetchYouTubeData } from '../../backend/crawler-service/api-handlers/youtube-api-handler';
import { fetchGoogleBookData } from '../../backend/crawler-service/api-handlers/google-books-api-handler';

type SourceType = 'youtube' | 'google-books' | 'unsupported';

export const observeUrl = async (url: string): Promise<{ type: SourceType; data?: any }> => {
  let sourceType: SourceType;

  if (isYouTubeUrl(url)) {
    sourceType = 'youtube';
  } else if (isGoogleBooksUrl(url)) {
    sourceType = 'google-books';
  } else {
    sourceType = 'unsupported';
  }

  switch (sourceType) {
    case 'youtube':
      try {
        const data = await fetchYouTubeData(url);
        return { type: sourceType, data };
      } catch (error) {
        throw new Error(`YouTube fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

    case 'google-books':
      try {
        const data = await fetchGoogleBookData(url);
        return { type: sourceType, data };
      } catch (error) {
        throw new Error(`Google Books fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

    default:
      throw new Error('Please use a YouTube or Google Books URL');
  }
}; 
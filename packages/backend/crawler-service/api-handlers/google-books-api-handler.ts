const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

interface GoogleBookData {
  title: string;
  authors: string[];
  publishedDate: string;
  publisher: string;
  description: string;
  isbn: string[];
  pageCount: number;
}

export const fetchGoogleBookData = async (url: string): Promise<GoogleBookData> => {
  const volumeId = extractVolumeId(url);
  const apiUrl = `https://www.googleapis.com/books/v1/volumes/${volumeId}?key=${GOOGLE_BOOKS_API_KEY}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Book not found');
    
    const data = await response.json();
    const volumeInfo = data.volumeInfo;

    return {
      title: volumeInfo.title,
      authors: volumeInfo.authors || [],
      publishedDate: volumeInfo.publishedDate,
      publisher: volumeInfo.publisher,
      description: volumeInfo.description,
      isbn: volumeInfo.industryIdentifiers?.map((id: any) => id.identifier) || [],
      pageCount: volumeInfo.pageCount
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to fetch book data: ${message}`);
  }
};

const extractVolumeId = (url: string): string => {
  const match = url.match(/\/books\/([^\/\?]+)/);
  return match?.[1] || '';
};

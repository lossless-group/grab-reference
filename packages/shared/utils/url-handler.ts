export const isYouTubeUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const result = urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be');
    console.log(`isYouTubeUrl check for "${url}": ${result}`);
    return result;
  } catch {
    return false;
  }
};

export const isGoogleBooksUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('books.google.com');
  } catch {
    return false;
  }
};

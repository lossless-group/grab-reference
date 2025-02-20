export const fetchCitation = async (url: string) => {
  try {
    const response = await fetch('/api/citations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    return await response.json();
  } catch (error) {
    throw new Error('Failed to fetch citation');
  }
}; 
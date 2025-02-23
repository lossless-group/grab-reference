interface ResponseViewerProps {
  type: 'youtube' | 'google-books' | 'unsupported';
  data: any;
  error?: string;
}

export const ResponseViewer = ({ type, data, error }: ResponseViewerProps) => {
  if (error) {
    return (
      <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded-md">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
      <h2 className="text-lg font-semibold mb-2 capitalize">{type} Data:</h2>
      <pre className="whitespace-pre-wrap break-words bg-white p-3 rounded-md border border-gray-300">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

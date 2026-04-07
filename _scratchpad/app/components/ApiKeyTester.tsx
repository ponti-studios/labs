import { useEffect, useState } from 'react';
import { GOOGLE_MAPS_API_KEY } from '~/lib/constants';

export default function ApiKeyTester() {
  const [testResult, setTestResult] = useState<{
    status: 'testing' | 'success' | 'error';
    message: string;
  }>({ status: 'testing', message: 'Testing API key...' });

  useEffect(() => {
    async function testApiKey() {
      if (!GOOGLE_MAPS_API_KEY) {
        setTestResult({
          status: 'error',
          message: 'No API key found in environment variables',
        });
        return;
      }

      try {
        // Test the API key by making a simple request
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=maps`
        );

        if (response.ok) {
          setTestResult({
            status: 'success',
            message: 'API key is valid and accessible',
          });
        } else {
          setTestResult({
            status: 'error',
            message: `API request failed: ${response.status} ${response.statusText}`,
          });
        }
      } catch (error) {
        setTestResult({
          status: 'error',
          message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }

    testApiKey();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg border">
      <h3 className="font-semibold mb-2">API Key Test</h3>
      <div
        className={`p-2 rounded text-sm ${
          testResult.status === 'testing'
            ? 'bg-blue-50 text-blue-700'
            : testResult.status === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
        }`}
      >
        {testResult.message}
      </div>
      {GOOGLE_MAPS_API_KEY && (
        <div className="mt-2 text-xs text-gray-500">
          API Key: {GOOGLE_MAPS_API_KEY.substring(0, 20)}...
        </div>
      )}
    </div>
  );
}

// src/app/test/page.js
'use client';

import { useState } from 'react';

export default function TestAPI() {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const testPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Name: "Test Student",
          UID: "TEST001",
          Time: new Date().toISOString()
        })
      });
      
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testGet = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/attendance');
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold">API Test Page</h1>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <button
              onClick={testPost}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Test POST
            </button>
            
            <button
              onClick={testGet}
              disabled={loading}
              className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Test GET
            </button>
          </div>

          {loading && (
            <div className="text-blue-400">Loading...</div>
          )}

          {error && (
            <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg">
              <h3 className="font-bold text-red-400">Error:</h3>
              <pre className="text-red-300 mt-2">{error}</pre>
            </div>
          )}

          {response && (
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
              <h3 className="font-bold text-zinc-300">Response:</h3>
              <pre className="text-zinc-400 mt-2 overflow-auto">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Test with cURL</h2>
          <div className="bg-zinc-900 p-4 rounded-lg">
            <pre className="text-sm text-zinc-400 overflow-x-auto">
{`# Test POST
curl -X POST ${typeof window !== 'undefined' ? window.location.origin : 'your-domain'}/api/attendance \\
  -H "Content-Type: application/json" \\
  -d '{
    "Name": "Test Student",
    "UID": "TEST001",
    "Time": "${new Date().toISOString()}"
  }'

# Test GET
curl ${typeof window !== 'undefined' ? window.location.origin : 'your-domain'}/api/attendance`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
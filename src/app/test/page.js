// src/app/test/page.js
'use client';

import { generateTestData } from './generateData';
import { useState } from 'react';

export default function TestPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateData = async () => {
    try {
      setLoading(true);
      setError(null);
      await generateTestData();
      alert('Test data generated successfully!');
    } catch (error) {
      console.error('Error generating test data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Attendance Data Generator</h1>
        
        <div className="bg-zinc-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Generate Test Data</h2>
          <p className="text-zinc-400 mb-6">
            This will generate 7 days of sample attendance data with the following characteristics:
            <ul className="list-disc list-inside mt-2 space-y-2">
              <li>Varying number of students each day (5-8 on weekdays, 3-5 on weekends)</li>
              <li>Random check-in times between 8 AM and 11 AM</li>
              <li>Consistent student IDs but randomized daily attendance</li>
              <li>Data spans the last 7 days</li>
            </ul>
          </p>
          
          <button
            onClick={handleGenerateData}
            disabled={loading}
            className={`px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors 
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Generating Data...' : 'Generate Test Data'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
              Error: {error}
            </div>
          )}
        </div>

        <div className="bg-zinc-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Sample Data Format</h2>
          <pre className="bg-zinc-950 p-4 rounded-lg overflow-x-auto">
            {JSON.stringify({
              "Name": "John Doe",
              "UID": "STU001",
              "Time": "2024-11-10T09:30:00Z"
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
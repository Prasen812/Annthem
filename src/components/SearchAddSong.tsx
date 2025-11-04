"use client";
import React, { useState } from 'react';

export default function SearchAddSong() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e?: React.KeyboardEvent<HTMLInputElement>) {
    if (e && e.key !== 'Enter') return;
    if (!query.trim()) return setStatus('Please enter a song name');
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/add-song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || JSON.stringify(data));
      } else {
        setStatus(data.message || 'Added');
        // refresh to pick up updated server-side songs listing
        setTimeout(() => window.location.reload(), 800);
      }
    } catch (err) {
      setStatus(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="mb-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSubmit}
          placeholder="Search & add song (press Enter)"
          className="w-full bg-neutral-800/30 border border-neutral-700 rounded-md px-3 py-2 text-sm focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleSubmit()}
          disabled={loading}
          className="text-sm px-3 py-1 bg-neutral-700 hover:bg-neutral-600 rounded-md"
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
        {status && <p className="text-xs text-neutral-300">{status}</p>}
      </div>
    </div>
  );
}

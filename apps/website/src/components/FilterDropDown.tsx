'use client'
import React, { useState } from 'react';

const INDUSTRIES = [
  'Bloggers',
  'Coaches',
  'Copywriters',
  'Event Planners',
  'Graphic + Web Designers',
  'Influencers',
];

const VIBES = [
  'All',
  'Minimal',
  'Bold',
  'Elegant',
  'Playful',
];

export default function FilterDropDown() {
  const [industryOpen, setIndustryOpen] = useState(false);
  const [vibeOpen, setVibeOpen] = useState(false);
  const [selectedVibe, setSelectedVibe] = useState('All');
  const [checkedIndustries, setCheckedIndustries] = useState<string[]>([]);

  const handleIndustryCheck = (industry: string) => {
    setCheckedIndustries(prev =>
      prev.includes(industry)
        ? prev.filter(i => i !== industry)
        : [...prev, industry]
    );
  };

  return (
    <div className="w-80 max-w-full p-4 bg-[#fdfbf6]" style={{ fontFamily: 'inherit' }}>
      {/* Industry Dropdown */}
      <div className="mb-6">
        <button
          className="w-full flex items-center justify-between border border-black/60 rounded px-4 py-3 text-lg font-medium tracking-wide bg-transparent focus:outline-none"
          onClick={() => setIndustryOpen(open => !open)}
          type="button"
        >
          <span>INDUSTRY : {(checkedIndustries.length === 0 ? 'All' : checkedIndustries.join(', ')).toUpperCase()}</span>
          <span className={`transition-transform ${industryOpen ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {industryOpen && (
          <div className="mt-2 border border-black/30 rounded bg-[#fdfbf6] shadow-md max-h-56 overflow-y-auto custom-scrollbar">
            {['All', ...INDUSTRIES].map(industry => (
              <div key={industry} className="flex items-center px-4 py-2">
                <input
                  type="checkbox"
                  id={industry}
                  checked={checkedIndustries.includes(industry) || (industry === 'All' && checkedIndustries.length === 0)}
                  onChange={() => handleIndustryCheck(industry)}
                  className="w-4 h-4 mr-3 accent-sunrise"
                />
                <label htmlFor={industry} className="text-base font-semibold tracking-wide select-none">
                  {industry.toUpperCase()}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vibe Dropdown */}
      <div>
        <button
          className="w-full flex items-center justify-between border border-black/60 rounded px-4 py-3 text-lg font-medium tracking-wide bg-transparent focus:outline-none"
          onClick={() => setVibeOpen(open => !open)}
          type="button"
        >
          <span>VIBE : {selectedVibe.toUpperCase()}</span>
          <span className={`transition-transform ${vibeOpen ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {vibeOpen && (
          <div className="mt-2 border border-black/30 rounded bg-[#fdfbf6] shadow-md max-h-56 overflow-y-auto custom-scrollbar">
            {VIBES.map(vibe => (
              <div key={vibe} className="flex items-center px-4 py-2">
                <input
                  type="radio"
                  id={vibe}
                  name="vibe"
                  checked={selectedVibe === vibe}
                  onChange={() => setSelectedVibe(vibe)}
                  className="w-4 h-4 mr-3 accent-sunrise"
                />
                <label htmlFor={vibe} className="text-base font-semibold tracking-wide select-none">
                  {vibe.toUpperCase()}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom scrollbar style */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #FFB347;
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3eee6;
        }
      `}</style>
    </div>
  );
}

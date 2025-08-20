"use client"
import React, { useMemo, useState, useEffect } from 'react';

type FilterValue = { id: string; value: string; isDefault?: boolean };
type Filter = { id: string; name: string; values: FilterValue[] };

interface Props {
  filters?: Filter[];
  onChange?: (selected: Record<string, string[]>) => void;
}

export default function FilterDropDown({ filters = [], onChange }: Props) {
  const [openFilterId, setOpenFilterId] = useState<string | null>(null);
  const initialSelected = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const f of filters) {
      const defaults = f.values.filter(v => v.isDefault).map(v => v.value);
      if (defaults.length > 0) map[f.id] = defaults;
    }
    return map;
  }, [filters]);
  const [selected, setSelected] = useState<Record<string, string[]>>(initialSelected);

  // Call onChange when selected filters change
  useEffect(() => {
    onChange?.(selected);
  }, [selected, onChange]);

  // Update selected when filters change (e.g., when switching between items)
  useEffect(() => {
    const newInitialSelected: Record<string, string[]> = {};
    for (const f of filters) {
      const defaults = f.values.filter(v => v.isDefault).map(v => v.value);
      if (defaults.length > 0) newInitialSelected[f.id] = defaults;
    }
    setSelected(newInitialSelected);
  }, [filters]);

  const toggleValue = (filterId: string, valueToken: string) => {
    setSelected(prev => {
      const current = prev[filterId] || [];
      const next = current.includes(valueToken)
        ? current.filter(v => v !== valueToken)
        : [...current, valueToken];
      return { ...prev, [filterId]: next };
    });
  };

  // Fallback to previous static UI when no dynamic filters provided
  if (!filters || filters.length === 0) {
    return (
      <div className="bg-[#fdfbf6]" style={{ fontFamily: 'inherit' }}>
        <div className="mb-6">
          <div className="w-full flex items-center justify-between border border-black/60 rounded px-4 py-3 text-lg font-medium tracking-wide bg-transparent">
            <span>FILTERS</span>
          </div>
          <div className="mt-2 text-sm text-black/60">No filters available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fdfbf6]" style={{ fontFamily: 'inherit' }}>
      {filters.map((filter) => {
        const isOpen = openFilterId === filter.id;
        const selectedValues = selected[filter.id] || [];
        const displayText = selectedValues.length === 0
          ? 'All'
          : filter.values.filter(v => selectedValues.includes(v.value)).map(v => v.value).join(', ');
        
        return (
          <div className="mb-6" key={filter.id}>
            {/* Filter Name Label */}
            <div className="mb-2">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                {filter.name}
              </label>
            </div>
            
            {/* Dropdown Box */}
            <div className="relative">
              <button
                className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-4 py-3 text-base font-medium bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sunrise focus:border-transparent transition-all duration-200 shadow-sm"
                onClick={() => setOpenFilterId(isOpen ? null : filter.id)}
                type="button"
              >
                <span className="text-gray-900 truncate">{displayText}</span>
                <span className={`transition-transform duration-200 text-gray-500 ${isOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              
              {/* Dropdown Options */}
              {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 border border-gray-200 rounded-lg bg-white shadow-lg max-h-56 overflow-y-auto custom-scrollbar z-10">
                  {filter.values.map(v => (
                    <div key={v.id} className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors duration-150">
                      <input
                        type="checkbox"
                        id={`${filter.id}-${v.id}`}
                        checked={selectedValues.includes(v.value)}
                        onChange={() => toggleValue(filter.id, v.value)}
                        className="w-4 h-4 mr-3 accent-sunrise rounded border-gray-300 focus:ring-sunrise"
                      />
                      <label 
                        htmlFor={`${filter.id}-${v.id}`} 
                        className="text-sm font-medium text-gray-900 select-none cursor-pointer flex-1"
                      >
                        {v.value}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #FCA17A;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #FCA17A;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}


import { useState } from 'react';

interface FilterTabsProps {
  filters: {
    roomType: string;
    area: string;
    priceRange: string;
  };
  onFilterChange: (filters: {
    roomType: string;
    area: string;
    priceRange: string;
  }) => void;
}

const FilterTabs = ({ filters, onFilterChange }: FilterTabsProps) => {

  const roomTypes = ['All', 'Bedsitter', 'Single', 'Apartment'];
  const areas = ['All', 'Jogoo', 'Mwembe', 'Town', 'Campus'];
  const priceRanges = ['All', '2K-4K', '4K-6K', '6K-8K', '8K+'];

  const updateFilter = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value.toLowerCase() };
    onFilterChange(newFilters);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3 text-gray-700">Room Type</h3>
        <div className="flex flex-wrap gap-2">
          {roomTypes.map((type) => (
            <button
              key={type}
              onClick={() => updateFilter('roomType', type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filters.roomType === type.toLowerCase() || (type === 'All' && filters.roomType === 'all')
                  ? 'bg-kisu-green text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-semibold mb-3 text-gray-700">Area</h3>
        <div className="flex flex-wrap gap-2">
          {areas.map((area) => (
            <button
              key={area}
              onClick={() => updateFilter('area', area)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filters.area === area.toLowerCase() || (area === 'All' && filters.area === 'all')
                  ? 'bg-kisu-green text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-semibold mb-3 text-gray-700">Price Range</h3>
        <div className="flex flex-wrap gap-2">
          {priceRanges.map((range) => (
            <button
              key={range}
              onClick={() => updateFilter('priceRange', range)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filters.priceRange === range.toLowerCase() || (range === 'All' && filters.priceRange === 'all')
                  ? 'bg-kisu-green text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterTabs;


import { useState } from 'react';
import { Slider } from '@/components/ui/slider';

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

// Bounds of the price bar (KES)
const MIN_PRICE = 0;
const MAX_PRICE = 50000;
const PRICE_STEP = 500;
const DEFAULT_RANGE: [number, number] = [2000, 10000];

const FilterTabs = ({ filters, onFilterChange }: FilterTabsProps) => {

  const roomTypes = ['All', 'Bedsitter', 'Single', 'Apartment'];
  const areas = ['All', 'Jogoo', 'Mwembe', 'Town', 'Campus'];

  const priceMode: 'all' | 'range' = filters.priceRange !== 'all' ? 'range' : 'all';

  // Current bar position, derived from the shared filter state
  const parseRange = (): [number, number] => {
    const match = filters.priceRange.match(/^(\d+)-(\d+)$/);
    if (match) return [parseInt(match[1], 10), parseInt(match[2], 10)];
    return DEFAULT_RANGE;
  };
  const [barValue, setBarValue] = useState<[number, number]>(parseRange);
  const [key, setKey] = useState(filters.priceRange);

  // Re-sync the bar when the filter is reset from outside (e.g. "All" tapped)
  if (key !== filters.priceRange) {
    setKey(filters.priceRange);
    setBarValue(parseRange());
  }

  const updateFilter = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value.toLowerCase() };
    onFilterChange(newFilters);
  };

  const handlePriceMode = (mode: 'all' | 'range') => {
    if (mode === 'all') {
      onFilterChange({ ...filters, priceRange: 'all' });
    } else {
      onFilterChange({ ...filters, priceRange: `${barValue[0]}-${barValue[1]}` });
    }
  };

  // Commit the price to the filters when the user releases a thumb,
  // so we don't fire a database query on every pixel of the drag
  const handleBarCommit = (values: number[]) => {
    const [min, max] = values;
    onFilterChange({ ...filters, priceRange: `${min}-${max}` });
  };

  const formatKES = (n: number) => `KES ${n.toLocaleString()}`;

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
        {/* Two options: All, or a draggable price bar */}
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => handlePriceMode('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              priceMode === 'all'
                ? 'bg-kisu-green text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => handlePriceMode('range')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              priceMode === 'range'
                ? 'bg-kisu-green text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Price Bar
          </button>
        </div>
        
        {priceMode === 'range' && (
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-kisu-green-dark">
                {formatKES(barValue[0])}
              </span>
              <span className="text-xs text-gray-400">drag to adjust</span>
              <span className="text-sm font-semibold text-kisu-green-dark">
                {formatKES(barValue[1])}{barValue[1] >= MAX_PRICE ? '+' : ''}
              </span>
            </div>
            <Slider
              min={MIN_PRICE}
              max={MAX_PRICE}
              step={PRICE_STEP}
              value={barValue}
              onValueChange={(values) => setBarValue([values[0], values[1]])}
              onValueCommit={handleBarCommit}
              minStepsBetweenThumbs={1}
              aria-label="Minimum and maximum price"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterTabs;

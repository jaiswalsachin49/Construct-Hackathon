import React from 'react';
import PropTypes from 'prop-types';
import { Search } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';

const FilterBar = ({ filters, onFilterChange, view, onViewChange }) => {
    const handleRadiusChange = (e) => {
        onFilterChange({ radius: parseInt(e.target.value) });
    };

    const handleAvailabilityChange = (e) => {
        onFilterChange({ availability: e.target.value || null });
    };

    const handleSearchChange = (e) => {
        onFilterChange({ search: e.target.value });
    };

    return (
        <div className="sticky top-16 lg:top-0 z-10 bg-white/5 border-b border-white/10 shadow-sm backdrop-blur-xl rounded-xl">
            <div className="max-w-7xl mx-auto p-4 space-y-4">
                {/* Search and View Toggle */}
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <Input
                            name="search"
                            placeholder="Search by skill..."
                            icon={Search}
                            value={filters.search}
                            onChange={handleSearchChange}
                        />
                    </div>

                    {/* View Toggle */}
                    <div className="flex gap-2">
                        <Button
                            variant={view === 'nearby' ? 'warm' : 'ghost'}
                            onClick={() => onViewChange('nearby')}
                            size="md"
                        >
                            Nearby
                        </Button>
                        <Button
                            variant={view === 'matches' ? 'warm' : 'ghost'}
                            onClick={() => onViewChange('matches')}
                            size="md"
                        >
                            Best Matches
                        </Button>
                    </div>
                </div>

                {/* Radius and Availability */}
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Radius Slider */}
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-[#E6E9EF] mb-2">
                            Radius: {filters.radius} km
                        </label>
                        <input
                            type="range"
                            min={1}
                            max={20}
                            value={filters.radius}
                            onChange={handleRadiusChange}
                            className="w-full h-2 bg-[#101726] rounded-lg appearance-none cursor-pointer accent-[#00C4FF]"
                        />
                        <div className="flex justify-between text-xs text-[#8A90A2] mt-1">
                            <span>1 km</span>
                            <span>20 km</span>
                        </div>
                    </div>

                    {/* Availability Filter */}
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-[#E6E9EF] mb-2">
                            Availability
                        </label>
                        <select
                            value={filters.availability || ''}
                            onChange={handleAvailabilityChange}
                            className="w-full px-3 py-2 bg-[#101726] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00C4FF]"
                        >
                            <option value="">All</option>
                            <option value="morning">Morning</option>
                            <option value="evening">Evening</option>
                            <option value="weekends">Weekends</option>
                            <option value="flexible">Flexible</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

FilterBar.propTypes = {
    filters: PropTypes.shape({
        radius: PropTypes.number.isRequired,
        availability: PropTypes.string,
        search: PropTypes.string,
    }).isRequired,
    onFilterChange: PropTypes.func.isRequired,
    view: PropTypes.string.isRequired,
    onViewChange: PropTypes.func.isRequired,
};

export default FilterBar;
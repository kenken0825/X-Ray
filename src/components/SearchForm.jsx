import React from 'react';
import { Search, Save, Calendar, Heart, Repeat, Image, Video, Link as LinkIcon } from 'lucide-react';
import { buildQuery } from '../utils/queryBuilder';

export default function SearchForm({ formData, onChange, onSavePreset }) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange({ ...formData, [name]: value });
    };

    const handleFilterChange = (filterName) => {
        onChange({
            ...formData,
            filters: {
                ...formData.filters,
                [filterName]: !formData.filters[filterName]
            }
        });
    };

    const handleSearch = () => {
        const query = buildQuery(formData);
        if (!query) return;

        const encodedQuery = encodeURIComponent(query);
        const url = `https://x.com/search?q=${encodedQuery}&src=typed_query`;

        if (typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.update({ url });
        } else {
            window.open(url, '_blank');
        }
    };

    const handleSave = () => {
        const name = prompt('Enter a name for this preset:');
        if (name) {
            onSavePreset(name, formData);
        }
    };

    // Expose setFormData to parent via ref or just pass it down if needed, 
    // but for now we might need to lift state up if we want PresetList to affect this.
    // Actually, let's export a method or accept a prop to update it.
    // Better yet, let's make this a controlled component or handle it in App.
    // For simplicity, I'll export this component and assume the parent manages the state 
    // OR I'll add a useEffect to update state if a prop changes. 
    // Let's stick to internal state for now and add a prop `initialData` or `externalData`.

    // Wait, the requirement says "Load preset to populate form".
    // So I should probably accept `data` as a prop.
    // Let's refactor slightly to accept `value` and `onChange`.

    return (
        <div className="space-y-4">
            {/* Keyword */}
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Keywords</label>
                <div className="relative">
                    <input
                        type="text"
                        name="keyword"
                        value={formData.keyword}
                        onChange={handleChange}
                        placeholder="Search X..."
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 pl-9"
                    />
                    <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                </div>
            </div>

            {/* Engagement */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                        <Heart size={12} /> Min Faves
                    </label>
                    <input
                        type="number"
                        name="minFaves"
                        value={formData.minFaves}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                        <Repeat size={12} /> Min RTs
                    </label>
                    <input
                        type="number"
                        name="minRetweets"
                        value={formData.minRetweets}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                        <Calendar size={12} /> Since
                    </label>
                    <input
                        type="date"
                        name="since"
                        value={formData.since}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                        <Calendar size={12} /> Until
                    </label>
                    <input
                        type="date"
                        name="until"
                        value={formData.until}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Filters */}
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Filters</label>
                <div className="flex gap-2">
                    <FilterButton
                        active={formData.filters.images}
                        onClick={() => handleFilterChange('images')}
                        icon={<Image size={14} />}
                        label="Images"
                    />
                    <FilterButton
                        active={formData.filters.videos}
                        onClick={() => handleFilterChange('videos')}
                        icon={<Video size={14} />}
                        label="Videos"
                    />
                    <FilterButton
                        active={formData.filters.noLinks}
                        onClick={() => handleFilterChange('noLinks')}
                        icon={<LinkIcon size={14} />}
                        label="No Links"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
                <button
                    onClick={handleSearch}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors"
                >
                    <Search size={16} />
                    Search
                </button>
                <button
                    onClick={handleSave}
                    className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded flex items-center justify-center transition-colors"
                    title="Save Preset"
                >
                    <Save size={18} />
                </button>
            </div>
        </div>
    );
}

function FilterButton({ active, onClick, icon, label }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors border ${active
                ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
        >
            {icon}
            {label}
        </button>
    );
}

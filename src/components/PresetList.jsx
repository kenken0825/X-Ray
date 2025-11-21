import React from 'react';
import { Trash2, Play } from 'lucide-react';

export default function PresetList({ presets, onLoad, onDelete }) {
    if (presets.length === 0) {
        return (
            <div className="text-slate-500 text-sm text-center py-4">
                No saved presets.
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Saved Presets</h3>
            <ul className="space-y-2">
                {presets.map((preset) => (
                    <li key={preset.id} className="flex items-center justify-between bg-slate-800 p-2 rounded border border-slate-700">
                        <span className="text-sm text-slate-200 truncate flex-1 mr-2">{preset.name}</span>
                        <div className="flex space-x-1">
                            <button
                                onClick={() => onLoad(preset.data)}
                                className="p-1 hover:bg-blue-900/50 text-blue-400 rounded transition-colors"
                                title="Load Preset"
                            >
                                <Play size={14} />
                            </button>
                            <button
                                onClick={() => onDelete(preset.id)}
                                className="p-1 hover:bg-red-900/50 text-red-400 rounded transition-colors"
                                title="Delete Preset"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

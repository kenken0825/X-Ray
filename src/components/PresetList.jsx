import React from 'react';
import { Trash2, Play } from 'lucide-react';

export default function PresetList({ presets, onLoad, onDelete }) {
    if (presets.length === 0) {
        return (
            <div className="text-slate-400 dark:text-slate-600 text-[10px] text-center py-4 italic">
                保存されたプリセットはありません
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">保存されたプリセット</h3>
            <ul className="space-y-1.5">
                {presets.map((preset) => (
                    <li key={preset.id} className="group flex items-center justify-between bg-white/50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-200">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate flex-1 mr-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{preset.name}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                                onClick={() => onLoad(preset.data)}
                                className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded transition-colors"
                                title="読み込む"
                            >
                                <Play size={12} fill="currentColor" />
                            </button>
                            <button
                                onClick={() => onDelete(preset.id)}
                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 rounded transition-colors"
                                title="削除"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

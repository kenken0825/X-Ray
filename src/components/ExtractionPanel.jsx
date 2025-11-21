import React from 'react';
import { Download, Database, Trash, RefreshCw } from 'lucide-react';

export default function ExtractionPanel({ onExtract, onDownload, onClear, count }) {
    return (
        <div className="space-y-4">
            <div className="bg-slate-800 rounded p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Collected Data</span>
                    <span className="bg-blue-900 text-blue-200 text-xs font-bold px-2 py-1 rounded-full">
                        {count} Tweets
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={onExtract}
                        className="col-span-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors"
                    >
                        <Database size={16} />
                        Extract from Page
                    </button>

                    <button
                        onClick={onDownload}
                        disabled={count === 0}
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded text-sm font-medium transition-colors ${count > 0
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        <Download size={16} />
                        CSV
                    </button>

                    <button
                        onClick={onClear}
                        disabled={count === 0}
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded text-sm font-medium transition-colors ${count > 0
                                ? 'bg-slate-700 hover:bg-red-900/50 hover:text-red-400 text-slate-300'
                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        <Trash size={16} />
                        Clear
                    </button>
                </div>
            </div>

            <div className="text-[10px] text-slate-500 text-center">
                Scroll down on X to load more tweets, then click "Extract" again.
            </div>
        </div>
    );
}

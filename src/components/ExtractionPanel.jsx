import React from 'react';
import { Download, Database, Trash, FileText } from 'lucide-react';

export default function ExtractionPanel({ onExtract, onDownload, onSaveMarkdown, onClear, count }) {
    return (
        <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">収集データ</span>
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-bold px-2 py-1 rounded-full">
                        {count} ツイート
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={onExtract}
                        className="col-span-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                        <Database size={16} />
                        ページから抽出
                    </button>

                    <button
                        onClick={onDownload}
                        disabled={count === 0}
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded text-sm font-medium transition-colors shadow-sm ${count > 0
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        <Download size={16} />
                        CSV保存
                    </button>

                    <button
                        onClick={onSaveMarkdown}
                        disabled={count === 0}
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded text-sm font-medium transition-colors shadow-sm ${count > 0
                                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                            }`}
                        title="Obsidianフォルダに保存"
                    >
                        <FileText size={16} />
                        Obsidian
                    </button>

                    <button
                        onClick={onClear}
                        disabled={count === 0}
                        className={`col-span-2 flex items-center justify-center gap-2 py-2 px-3 rounded text-sm font-medium transition-colors shadow-sm ${count > 0
                                ? 'bg-slate-200 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900/50 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        <Trash size={16} />
                        クリア
                    </button>
                </div>
            </div>

            <div className="text-[10px] text-slate-500 dark:text-slate-500 text-center">
                X上でスクロールしてツイートを表示させてから、再度「抽出」を押してください。
            </div>
        </div>
    );
}

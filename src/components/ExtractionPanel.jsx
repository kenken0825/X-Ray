import React from 'react';
import { Download, Database, Trash, FileText, Folder } from 'lucide-react';

export default function ExtractionPanel({ onExtract, onDownload, onSaveMarkdown, onSelectFolder, onClear, count }) {
    return (
        <div className="space-y-2">
            <div className="glass-card rounded-lg p-3 border border-white/50 dark:border-white/10 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">収集データ</span>
                    <div className="flex items-center gap-1.5">
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                            {count}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-1">tweets</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={onExtract}
                        className="col-span-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    >
                        <Database size={14} />
                        ページから抽出
                    </button>

                    <button
                        onClick={onDownload}
                        disabled={count === 0}
                        className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all duration-200 shadow-sm ${count > 0
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:shadow-md hover:-translate-y-0.5'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                            }`}
                    >
                        <Download size={14} />
                        CSV保存
                    </button>

                    <button
                        onClick={onSaveMarkdown}
                        disabled={count === 0}
                        className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all duration-200 shadow-sm ${count > 0
                            ? 'bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white hover:shadow-md hover:-translate-y-0.5'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                            }`}
                        title="Obsidianフォルダに保存"
                    >
                        <FileText size={14} />
                        Obsidian
                    </button>

                    <button
                        onClick={onSelectFolder}
                        className="col-span-2 bg-slate-100 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-medium py-1.5 px-2 rounded-md flex items-center justify-center gap-1.5 transition-all duration-200 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                        title="Obsidian保存先フォルダを設定"
                    >
                        <Folder size={12} />
                        保存先フォルダ設定
                    </button>

                    <button
                        onClick={onClear}
                        disabled={count === 0}
                        className={`col-span-2 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[10px] font-medium transition-colors ${count > 0
                            ? 'text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                            : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                            }`}
                    >
                        <Trash size={12} />
                        データをクリア
                    </button>
                </div>
            </div>

            <div className="text-[10px] text-slate-400 dark:text-slate-500 text-center px-2 leading-tight">
                X上でスクロールしてツイートを表示させてから、<br />再度「抽出」を押してください。
            </div>
        </div>
    );
}

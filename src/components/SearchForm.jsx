import { Search, Save, Calendar, Heart, Repeat, Image, Video, Link as LinkIcon, MessageCircle, User } from 'lucide-react';
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

    const handleGetCurrentUser = async () => {
        const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        if (!tab || !tab.url) return;

        try {
            const url = new URL(tab.url);
            if (url.hostname === 'x.com' || url.hostname === 'twitter.com') {
                const pathParts = url.pathname.split('/').filter(Boolean);
                if (pathParts.length > 0) {
                    // The first part of the path is usually the username (e.g., x.com/username)
                    // Exclude reserved paths if necessary, but simple extraction is usually enough
                    const username = pathParts[0];
                    if (!['home', 'explore', 'notifications', 'messages', 'search'].includes(username)) {
                        onChange({ ...formData, fromUser: username });
                    } else {
                        alert('ユーザープロフィールページを開いてください');
                    }
                }
            } else {
                alert('X (Twitter) のページを開いてください');
            }
        } catch (e) {
            console.error('Failed to parse URL', e);
        }
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

    return (
        <div className="space-y-5">
            {/* Keyword */}
            <div className="group">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-300 mb-1.5 uppercase tracking-wide">キーワード</label>
                <div className="relative transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500/20 rounded-xl">
                    <input
                        type="text"
                        name="keyword"
                        value={formData.keyword}
                        onChange={handleChange}
                        placeholder="検索ワードを入力..."
                        className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 pl-10 transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                    <Search className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                </div>
            </div>

            {/* From User */}
            <div className="group">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-300 mb-1.5 uppercase tracking-wide">ユーザー指定 (From)</label>
                <div className="flex gap-2">
                    <div className="relative flex-1 transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500/20 rounded-xl">
                        <input
                            type="text"
                            name="fromUser"
                            value={formData.fromUser}
                            onChange={handleChange}
                            placeholder="ユーザー名 (@なし)"
                            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 pl-10 transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        />
                        <User className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                    </div>
                    <button
                        onClick={handleGetCurrentUser}
                        className="bg-slate-100 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-sm transition-all duration-200"
                        title="現在のタブからユーザー名を取得"
                    >
                        <User size={18} />
                    </button>
                </div>
            </div>

            {/* Engagement */}
            <div className="grid grid-cols-2 gap-4">
                <div className="group">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-300 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                        <Heart size={12} className="text-pink-500" /> 最小いいね数
                    </label>
                    <input
                        type="number"
                        name="minFaves"
                        value={formData.minFaves}
                        onChange={handleChange}
                        step="100"
                        placeholder="0"
                        className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                </div>
                <div className="group">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-300 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                        <Repeat size={12} className="text-green-500" /> 最小リツイート数
                    </label>
                    <input
                        type="number"
                        name="minRetweets"
                        value={formData.minRetweets}
                        onChange={handleChange}
                        step="100"
                        placeholder="0"
                        className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                </div>
                <div className="col-span-2 group">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-300 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                        <MessageCircle size={12} className="text-blue-500" /> 最小返信数
                    </label>
                    <input
                        type="number"
                        name="minReplies"
                        value={formData.minReplies}
                        onChange={handleChange}
                        step="100"
                        placeholder="0"
                        className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
                <div className="group">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-300 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                        <Calendar size={12} /> 開始日 (Since)
                    </label>
                    <input
                        type="date"
                        name="since"
                        value={formData.since}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    />
                </div>
                <div className="group">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-300 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                        <Calendar size={12} /> 終了日 (Until)
                    </label>
                    <input
                        type="date"
                        name="until"
                        value={formData.until}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    />
                </div>
            </div>

            {/* Filters */}
            <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-300 mb-2 uppercase tracking-wide">フィルタ</label>
                <div className="flex flex-wrap gap-2">
                    <FilterButton
                        active={formData.filters.images}
                        onClick={() => handleFilterChange('images')}
                        icon={<Image size={14} />}
                        label="画像のみ"
                    />
                    <FilterButton
                        active={formData.filters.videos}
                        onClick={() => handleFilterChange('videos')}
                        icon={<Video size={14} />}
                        label="動画のみ"
                    />
                    <FilterButton
                        active={formData.filters.noLinks}
                        onClick={() => handleFilterChange('noLinks')}
                        icon={<LinkIcon size={14} />}
                        label="リンク除外"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
                <button
                    onClick={handleSearch}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                    <Search size={18} />
                    検索実行
                </button>
                <button
                    onClick={handleSave}
                    className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm hover:shadow transition-all duration-200"
                    title="プリセット保存"
                >
                    <Save size={20} />
                </button>
            </div>
        </div>
    );
}

function FilterButton({ active, onClick, icon, label }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${active
                ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
        >
            {icon}
            {label}
        </button>
    );
}



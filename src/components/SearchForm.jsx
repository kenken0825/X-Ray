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
        <div className="space-y-4">
            {/* Keyword */}
            <div>
                <label className="block text-xs font-medium text-slate-400 dark:text-slate-400 text-slate-600 mb-1">キーワード</label>
                <div className="relative">
                    <input
                        type="text"
                        name="keyword"
                        value={formData.keyword}
                        onChange={handleChange}
                        placeholder="検索ワードを入力..."
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 pl-9 transition-colors"
                    />
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                </div>
            </div>

            {/* From User */}
            <div>
                <label className="block text-xs font-medium text-slate-400 dark:text-slate-400 text-slate-600 mb-1">ユーザー指定 (From)</label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            name="fromUser"
                            value={formData.fromUser}
                            onChange={handleChange}
                            placeholder="ユーザー名 (@なし)"
                            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 pl-9 transition-colors"
                        />
                        <User className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    </div>
                    <button
                        onClick={handleGetCurrentUser}
                        className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 p-2 rounded border border-slate-300 dark:border-slate-600 transition-colors"
                        title="現在のタブからユーザー名を取得"
                    >
                        <User size={18} />
                    </button>
                </div>
            </div>

            {/* Engagement */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-slate-400 dark:text-slate-400 text-slate-600 mb-1 flex items-center gap-1">
                        <Heart size={12} /> 最小いいね数
                    </label>
                    <input
                        type="number"
                        name="minFaves"
                        value={formData.minFaves}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 dark:text-slate-400 text-slate-600 mb-1 flex items-center gap-1">
                        <Repeat size={12} /> 最小リツイート数
                    </label>
                    <input
                        type="number"
                        name="minRetweets"
                        value={formData.minRetweets}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
                <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-400 dark:text-slate-400 text-slate-600 mb-1 flex items-center gap-1">
                        <MessageCircle size={12} /> 最小返信数
                    </label>
                    <input
                        type="number"
                        name="minReplies"
                        value={formData.minReplies}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-slate-400 dark:text-slate-400 text-slate-600 mb-1 flex items-center gap-1">
                        <Calendar size={12} /> 開始日 (Since)
                    </label>
                    <input
                        type="date"
                        name="since"
                        value={formData.since}
                        onChange={handleChange}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 dark:text-slate-400 text-slate-600 mb-1 flex items-center gap-1">
                        <Calendar size={12} /> 終了日 (Until)
                    </label>
                    <input
                        type="date"
                        name="until"
                        value={formData.until}
                        onChange={handleChange}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
            </div>

            {/* Filters */}
            <div>
                <label className="block text-xs font-medium text-slate-400 dark:text-slate-400 text-slate-600 mb-2">フィルタ</label>
                <div className="flex gap-2">
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
            <div className="flex gap-2 pt-2">
                <button
                    onClick={handleSearch}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                    <Search size={16} />
                    検索実行
                </button>
                <button
                    onClick={handleSave}
                    className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white p-2 rounded flex items-center justify-center transition-colors"
                    title="プリセット保存"
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
                ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600'
                }`}
        >
            {icon}
            {label}
        </button>
    );
}

import { Search, Save, Calendar, Heart, Repeat, Image, Video, Link as LinkIcon, MessageCircle, User, Bookmark } from 'lucide-react';
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
        try {
            if (typeof chrome !== 'undefined' && chrome.tabs) {
                // Helper to get active tab with fallbacks
                const getActiveTab = async () => {
                    // Try 1: Standard query for active tab in last focused window
                    let tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
                    if (tabs && tabs.length > 0 && (tabs[0].url.includes('x.com') || tabs[0].url.includes('twitter.com'))) return tabs[0];

                    // Try 2: Active tab in current window
                    tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                    if (tabs && tabs.length > 0 && (tabs[0].url.includes('x.com') || tabs[0].url.includes('twitter.com'))) return tabs[0];

                    // Try 3: Specific query for active X/Twitter tabs (requires 'tabs' permission)
                    // This is the most robust way if focus is ambiguous
                    tabs = await chrome.tabs.query({ url: ['*://x.com/*', '*://twitter.com/*'], active: true });
                    if (tabs && tabs.length > 0) return tabs[0];

                    return null;
                };

                const tab = await getActiveTab();

                if (tab && tab.url) {
                    const url = new URL(tab.url);
                    if (url.hostname === 'x.com' || url.hostname === 'twitter.com') {
                        const pathParts = url.pathname.split('/').filter(Boolean);
                        // Handle /username and /username/status/123...
                        if (pathParts.length > 0 && !['home', 'explore', 'notifications', 'messages', 'search', 'settings'].includes(pathParts[0])) {
                            handleChange({ target: { name: 'fromUser', value: pathParts[0] } });
                        } else {
                            alert('ユーザープロフィールまたはツイートページを開いてください');
                        }
                    } else {
                        alert('X (Twitter) のページを開いてください');
                    }
                } else {
                    console.warn('No active tab found');
                    alert('有効なタブが見つかりませんでした。X (Twitter) のページをアクティブにしてください。');
                }
            } else {
                alert('X (Twitter) のページを開いてください');
            }
        } catch (e) {
            console.error('Failed to get current user', e);
            alert('エラーが発生しました: ' + e.message);
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

    const handleOpenBookmarks = () => {
        const url = 'https://x.com/i/bookmarks';
        if (typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.update({ url });
        } else {
            window.open(url, '_blank');
        }
    };

    return (
        <div className="space-y-3">
            {/* Keyword */}
            <div className="group">
                <label className="block text-[10px] font-bold text-slate-500 dark:text-white mb-1 uppercase tracking-wider">キーワード</label>
                <div className="relative transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500/20 rounded-lg">
                    <input
                        type="text"
                        name="keyword"
                        data-testid="search-keyword-input"
                        value={formData.keyword}
                        onChange={handleChange}
                        placeholder="検索ワードを入力..."
                        className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 pl-9 transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                    <Search className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" size={14} />
                </div>
            </div>

            {/* From User */}
            <div className="group">
                <label className="block text-[10px] font-bold text-slate-500 dark:text-white mb-1 uppercase tracking-wider">ユーザー指定 (From)</label>
                <div className="flex gap-2">
                    <div className="relative flex-1 transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500/20 rounded-lg">
                        <input
                            type="text"
                            name="fromUser"
                            data-testid="search-from-user-input"
                            value={formData.fromUser}
                            onChange={handleChange}
                            placeholder="ユーザー名 (@なし)"
                            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 pl-9 transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        />
                        <User className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" size={14} />
                    </div>
                    <button
                        onClick={handleGetCurrentUser}
                        data-testid="get-current-user-button"
                        className="bg-slate-100 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 p-2 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-sm transition-all duration-200"
                        title="現在のタブからユーザー名を取得"
                    >
                        <User size={16} />
                    </button>
                </div>
            </div>

            {/* Engagement */}
            <div className="grid grid-cols-2 gap-3">
                <div className="group">
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-white mb-1 flex items-center gap-1 uppercase tracking-wider">
                        <Heart size={10} className="text-pink-500" /> 最小いいね数
                    </label>
                    <input
                        type="number"
                        name="minFaves"
                        data-testid="search-min-faves-input"
                        value={formData.minFaves}
                        onChange={handleChange}
                        step="100"
                        placeholder="0"
                        className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                </div>
                <div className="group">
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-white mb-1 flex items-center gap-1 uppercase tracking-wider">
                        <Repeat size={10} className="text-green-500" /> 最小リツイート数
                    </label>
                    <input
                        type="number"
                        name="minRetweets"
                        data-testid="search-min-retweets-input"
                        value={formData.minRetweets}
                        onChange={handleChange}
                        step="100"
                        placeholder="0"
                        className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                </div>
                <div className="col-span-2 group">
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-white mb-1 flex items-center gap-1 uppercase tracking-wider">
                        <MessageCircle size={10} className="text-blue-500" /> 最小返信数
                    </label>
                    <input
                        type="number"
                        name="minReplies"
                        data-testid="search-min-replies-input"
                        value={formData.minReplies}
                        onChange={handleChange}
                        step="100"
                        placeholder="0"
                        className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
                <div className="group">
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-white mb-1 flex items-center gap-1 uppercase tracking-wider">
                        <Calendar size={10} /> 開始日 (Since)
                    </label>
                    <input
                        type="date"
                        name="since"
                        data-testid="search-since-date-input"
                        value={formData.since}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    />
                </div>
                <div className="group">
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-white mb-1 flex items-center gap-1 uppercase tracking-wider">
                        <Calendar size={10} /> 終了日 (Until)
                    </label>
                    <input
                        type="date"
                        name="until"
                        data-testid="search-until-date-input"
                        value={formData.until}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    />
                </div>
            </div>

            {/* Language Filter */}
            <div className="group">
                <label className="block text-[10px] font-bold text-slate-500 dark:text-white mb-1 uppercase tracking-wider">言語</label>
                <select
                    name="language"
                    data-testid="search-language-select"
                    value={formData.language || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                >
                    <option value="">すべての言語</option>
                    <option value="en">英語のみ</option>
                    <option value="ja">日本語のみ</option>
                </select>
            </div>

            {/* Filters */}
            <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-white mb-1.5 uppercase tracking-wider">フィルタ</label>
                <div className="flex flex-wrap gap-2">
                    <FilterButton
                        active={formData.filters.images}
                        onClick={() => handleFilterChange('images')}
                        icon={<Image size={12} />}
                        label="画像のみ"
                    />
                    <FilterButton
                        active={formData.filters.videos}
                        onClick={() => handleFilterChange('videos')}
                        icon={<Video size={12} />}
                        label="動画のみ"
                    />
                    <FilterButton
                        active={formData.filters.noLinks}
                        onClick={() => handleFilterChange('noLinks')}
                        icon={<LinkIcon size={12} />}
                        label="リンク除外"
                    />
                </div>
            </div>

            {/* Quick Links */}
            <div>
                <button
                    onClick={handleOpenBookmarks}
                    data-testid="open-bookmarks-button"
                    className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                >
                    <Bookmark size={14} />
                    ブックマークを開く
                </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
                <button
                    onClick={handleSearch}
                    data-testid="search-execute-button"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm"
                >
                    <Search size={16} />
                    検索実行
                </button>
                <button
                    onClick={handleSave}
                    data-testid="search-save-preset-button"
                    className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 p-2 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm hover:shadow transition-all duration-200"
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



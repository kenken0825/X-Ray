import { useState, useEffect } from 'react';
import './index.css';
import SearchForm from './components/SearchForm';
import PresetList from './components/PresetList';
import ExtractionPanel from './components/ExtractionPanel';
import { getPresets, savePreset, deletePreset } from './utils/storage';
import { exportToCSV } from './utils/csvExporter';
import { saveToMarkdown, selectObsidianFolder } from './utils/markdownExporter';
import { Moon, Sun } from 'lucide-react';

function App() {
  const [formData, setFormData] = useState({
    keyword: '',
    minFaves: '',
    minRetweets: '',
    minReplies: '',
    since: '',
    until: '',
    filters: {
      images: false,
      videos: false,
      noLinks: false,
    },
  });

  const [presets, setPresets] = useState([]);
  const [extractedTweets, setExtractedTweets] = useState([]);
  const [theme, setTheme] = useState(() => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
      return localStorage.getItem('theme');
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    loadPresets();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const loadPresets = async () => {
    const loaded = await getPresets();
    setPresets(loaded);
  };

  const handleSavePreset = async (name, data) => {
    const updated = await savePreset({ name, data });
    if (updated) setPresets(updated);
  };

  const handleDeletePreset = async (id) => {
    if (confirm('Are you sure you want to delete this preset?')) {
      const updated = await deletePreset(id);
      if (updated) setPresets(updated);
    }
  };

  const handleLoadPreset = (data) => {
    setFormData(data);
  };

  const handleExtract = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'EXTRACT_TWEETS' });
      if (response && response.tweets) {
        setExtractedTweets(prev => {
          const newTweets = response.tweets;
          // Deduplicate based on ID
          const existingIds = new Set(prev.map(t => t.id));
          const uniqueNew = newTweets.filter(t => !existingIds.has(t.id));
          return [...prev, ...uniqueNew];
        });
      }
    } catch (error) {
      console.error('Extraction failed:', error);
      alert('Failed to extract. Make sure you are on X (Twitter) and the page is loaded.');
    }
  };

  const handleDownload = () => {
    exportToCSV(extractedTweets, `x-ray-export-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleSaveMarkdown = async () => {
    try {
      const count = await saveToMarkdown(extractedTweets);
      if (count > 0) {
        alert(`${count} files saved to Obsidian folder!`);
      }
    } catch (error) {
      console.error('Markdown save failed:', error);
      // Alert handled in utility or just log
    }
  };

  const handleSelectFolder = async () => {
    try {
      const folderName = await selectObsidianFolder();
      if (folderName) {
        alert(`保存先フォルダを設定しました: ${folderName}`);
      }
    } catch (error) {
      console.error('Folder selection failed:', error);
      alert('フォルダ選択に失敗しました: ' + error.message);
    }
  };

  const handleClear = () => {
    if (confirm('Clear all collected data?')) {
      setExtractedTweets([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white p-4 transition-colors duration-300">
      <header className="mb-6 border-b border-slate-200 dark:border-slate-800 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">X-Ray</h1>
          <p className="text-xs text-slate-500 font-medium">Research Cockpit</p>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <main className="space-y-8">
        <section>
          <SearchForm
            formData={formData}
            onChange={setFormData}
            onSavePreset={handleSavePreset}
          />
        </section>

        <section className="border-t border-slate-200 dark:border-slate-800 pt-4">
          <ExtractionPanel
            count={extractedTweets.length}
            onExtract={handleExtract}
            onDownload={handleDownload}
            onSaveMarkdown={handleSaveMarkdown}
            onSelectFolder={handleSelectFolder}
            onClear={handleClear}
          />
        </section>

        <section className="border-t border-slate-200 dark:border-slate-800 pt-4">
          <PresetList
            presets={presets}
            onLoad={handleLoadPreset}
            onDelete={handleDeletePreset}
          />
        </section>
      </main>
    </div>
  );
}

export default App;

import { useState, useEffect } from 'react';
import './index.css';
import SearchForm from './components/SearchForm';
import PresetList from './components/PresetList';
import ExtractionPanel from './components/ExtractionPanel';
import { getPresets, savePreset, deletePreset } from './utils/storage';
import { exportToCSV } from './utils/csvExporter';

function App() {
  const [formData, setFormData] = useState({
    keyword: '',
    minFaves: '',
    minRetweets: '',
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

  useEffect(() => {
    loadPresets();
  }, []);

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

  const handleClear = () => {
    if (confirm('Clear all collected data?')) {
      setExtractedTweets([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <header className="mb-6 border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-blue-400 tracking-tight">X-Ray</h1>
        <p className="text-xs text-slate-500 font-medium">Research Cockpit</p>
      </header>

      <main className="space-y-8">
        <section>
          <SearchForm
            formData={formData}
            onChange={setFormData}
            onSavePreset={handleSavePreset}
          />
        </section>

        <section className="border-t border-slate-800 pt-4">
          <ExtractionPanel
            count={extractedTweets.length}
            onExtract={handleExtract}
            onDownload={handleDownload}
            onClear={handleClear}
          />
        </section>

        <section className="border-t border-slate-800 pt-4">
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

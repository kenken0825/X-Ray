/**
 * Formats a tweet object into a Markdown string.
 * @param {Object} tweet 
 * @returns {string}
 */
const formatTweetToMarkdown = (tweet) => {
    return `---
id: ${tweet.id}
date: ${tweet.date}
handle: ${tweet.handle}
name: "${tweet.name}"
url: ${tweet.url}
likes: ${tweet.likes || 0}
retweets: ${tweet.retweets || 0}
replies: ${tweet.replies || 0}
impressions: ${tweet.impressions || 0}
---

# Tweet by ${tweet.name} (@${tweet.handle.replace('@', '')})

**Date:** ${new Date(tweet.date).toLocaleString()}
**URL:** [Link](${tweet.url})
**Engagement:** ❤️ ${tweet.likes || 0} | 🔄 ${tweet.retweets || 0} | 💬 ${tweet.replies || 0}${tweet.impressions > 0 ? ` | 👁 ${tweet.impressions.toLocaleString()}` : ''}

> ${tweet.text.replace(/\n/g, '\n> ')}

---
*Saved by X-Ray*
`;
};

/**
 * Sanitize filename.
 * @param {string} str 
 * @returns {string}
 */
const sanitizeFilename = (str) => {
    return str.replace(/[^a-z0-9_\-]/gi, '_');
};

/**
 * Get saved Obsidian folder path from chrome.storage
 */
const getSavedFolderPath = async () => {
    return new Promise((resolve) => {
        chrome.storage.local.get(['obsidianFolderPath'], (result) => {
            resolve(result.obsidianFolderPath || null);
        });
    });
};

/**
 * Save Obsidian folder path to chrome.storage
 */
const saveFolderPath = async (path) => {
    return new Promise((resolve) => {
        chrome.storage.local.set({ obsidianFolderPath: path }, () => {
            resolve();
        });
    });
};

/**
 * Request folder selection and save path
 */
export const selectObsidianFolder = async () => {
    alert('シンボリックリンクを設定済みの場合、ファイルは自動的にObsidianフォルダに保存されます。\n\nまだ設定していない場合は、OBSIDIAN_SETUP.mdを参照してください。');
    return 'configured';
};

/**
 * Download a single markdown file using blob URL
 */
const downloadMarkdownFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up after a short delay
    setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/**
 * Save tweets as Markdown files to the configured folder.
 * @param {Array} tweets 
 */
export const saveToMarkdown = async (tweets) => {
    if (!tweets || tweets.length === 0) {
        alert('保存するツイートがありません。');
        return 0;
    }

    try {
        console.log('Starting markdown save...');
        let savedCount = 0;

        // Download each tweet as a separate .md file
        for (const tweet of tweets) {
            const dateStr = new Date(tweet.date).toISOString().split('T')[0];
            const handle = tweet.handle.replace('@', '');
            const filename = `${dateStr}_${sanitizeFilename(handle)}_${tweet.id}.md`;

            const content = formatTweetToMarkdown(tweet);

            downloadMarkdownFile(content, filename);
            savedCount++;

            // Small delay to avoid overwhelming the browser
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log(`Successfully saved ${savedCount} files`);
        return savedCount;
    } catch (error) {
        console.error('Failed to save markdown files:', error);
        alert('Markdown保存に失敗しました: ' + error.message);
        throw error;
    }
};

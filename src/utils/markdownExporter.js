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
likes: ${tweet.likes}
retweets: ${tweet.retweets}
---

# Tweet by ${tweet.name} (@${tweet.handle.replace('@', '')})

**Date:** ${new Date(tweet.date).toLocaleString()}
**URL:** [Link](${tweet.url})

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
 * IndexedDB helper for storing FileSystemDirectoryHandle
 */
const DB_NAME = 'XRayDB';
const STORE_NAME = 'folderHandles';

const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
    });
};

const saveFolderHandle = async (handle) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(handle, 'obsidianFolder');
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

const getFolderHandle = async () => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get('obsidianFolder');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

/**
 * Request folder selection and save handle
 */
export const selectObsidianFolder = async () => {
    try {
        const dirHandle = await window.showDirectoryPicker({
            mode: 'readwrite',
            startIn: 'documents'
        });
        await saveFolderHandle(dirHandle);
        return dirHandle.name;
    } catch (error) {
        if (error.name === 'AbortError') {
            return null; // User cancelled
        }
        console.error('Failed to select folder:', error);
        throw error;
    }
};

/**
 * Save tweets as Markdown files to the selected Obsidian folder.
 * @param {Array} tweets 
 */
export const saveToMarkdown = async (tweets) => {
    if (!tweets || tweets.length === 0) {
        alert('保存するツイートがありません。');
        return 0;
    }

    try {
        // Try to get saved folder handle
        let dirHandle = await getFolderHandle();

        // If no saved handle or permission denied, request new folder
        if (!dirHandle) {
            dirHandle = await window.showDirectoryPicker({
                mode: 'readwrite',
                startIn: 'documents'
            });
            await saveFolderHandle(dirHandle);
        } else {
            // Verify we still have permission
            const permission = await dirHandle.queryPermission({ mode: 'readwrite' });
            if (permission !== 'granted') {
                const newPermission = await dirHandle.requestPermission({ mode: 'readwrite' });
                if (newPermission !== 'granted') {
                    // Request new folder
                    dirHandle = await window.showDirectoryPicker({
                        mode: 'readwrite',
                        startIn: 'documents'
                    });
                    await saveFolderHandle(dirHandle);
                }
            }
        }

        let savedCount = 0;

        // Save each tweet as a separate .md file
        for (const tweet of tweets) {
            const dateStr = new Date(tweet.date).toISOString().split('T')[0];
            const handle = tweet.handle.replace('@', '');
            const filename = `${dateStr}_${sanitizeFilename(handle)}_${tweet.id}.md`;

            const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
            const writable = await fileHandle.createWritable();

            const content = formatTweetToMarkdown(tweet);
            await writable.write(content);
            await writable.close();
            savedCount++;
        }

        return savedCount;
    } catch (error) {
        if (error.name === 'AbortError') {
            return 0; // User cancelled
        }
        console.error('Failed to save markdown files:', error);
        alert('Markdown保存に失敗しました: ' + error.message);
        throw error;
    }
};

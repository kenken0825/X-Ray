/**
 * Converts an array of objects to a CSV string and triggers a download.
 * 
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file to save
 */
export const exportToCSV = (data, filename = 'tweets.csv') => {
    if (!data || !data.length) return;

    // Define columns
    const columns = [
        { label: 'ID', key: 'id' },
        { label: 'Date', key: 'date' },
        { label: 'Handle', key: 'handle' },
        { label: 'Name', key: 'name' },
        { label: 'Text', key: 'text' },
        { label: 'URL', key: 'url' },
        { label: 'Likes', key: 'likes' },
        { label: 'Retweets', key: 'retweets' },
        { label: 'Replies', key: 'replies' },
        { label: 'Impressions', key: 'impressions' },
    ];

    // Header row
    const header = columns.map(c => `"${c.label}"`).join(',');

    // Data rows
    const rows = data.map(row => {
        return columns.map(c => {
            let val = row[c.key] || '';
            // Escape quotes and wrap in quotes
            val = String(val).replace(/"/g, '""');
            return `"${val}"`;
        }).join(',');
    });

    const csvContent = [header, ...rows].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

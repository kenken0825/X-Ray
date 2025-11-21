/**
 * Builds a Twitter/X search query string from parameters.
 * 
 * @param {Object} params
 * @param {string} params.keyword - Main search term
 * @param {number|string} [params.minFaves] - Minimum likes
 * @param {number|string} [params.minRetweets] - Minimum retweets
 * @param {string} [params.since] - Start date (YYYY-MM-DD)
 * @param {string} [params.until] - End date (YYYY-MM-DD)
 * @param {Object} [params.filters] - Boolean flags for filters
 * @param {boolean} [params.filters.images] - filter:images
 * @param {boolean} [params.filters.videos] - filter:videos
 * @param {boolean} [params.filters.noLinks] - -filter:links
 * @returns {string} The constructed query string
 */
export const buildQuery = ({ keyword, minFaves, minRetweets, since, until, filters = {} }) => {
    const parts = [];

    if (keyword) {
        parts.push(keyword.trim());
    }

    if (minFaves) {
        parts.push(`min_faves:${minFaves}`);
    }

    if (minRetweets) {
        parts.push(`min_retweets:${minRetweets}`);
    }

    if (since) {
        parts.push(`since:${since}`);
    }

    if (until) {
        parts.push(`until:${until}`);
    }

    if (filters.images) {
        parts.push('filter:images');
    }

    if (filters.videos) {
        parts.push('filter:videos');
    }

    if (filters.noLinks) {
        parts.push('-filter:links');
    }

    return parts.join(' ');
};

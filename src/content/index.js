console.log('X-Ray content script loaded');

const extractTweets = () => {
    const articles = document.querySelectorAll('article[data-testid="tweet"]');
    const tweets = [];

    articles.forEach(article => {
        try {
            // Check for Promoted/Ad indicator
            // Usually contains text "Ad" or "Promoted" in a specific span, or an SVG with specific path.
            // A robust way is checking for the absence of a time element (ads often don't have a timestamp linking to a status)
            // OR checking for the "Ad" text which is usually in the top right.

            const timeElement = article.querySelector('time');
            if (!timeElement) {
                // Most promoted tweets do not have a standard timestamp link in the same way, 
                // or we can use this as a heuristic. If no time, it's likely an ad or invalid.
                return;
            }

            // User Info
            const userElement = article.querySelector('div[data-testid="User-Name"]');
            const nameElement = userElement?.querySelector('span span'); // Often the first span span
            const handleElement = userElement?.querySelector('a[href^="/"] span'); // The @handle

            // Text
            const textElement = article.querySelector('div[data-testid="tweetText"]');

            // Date & URL
            const date = timeElement?.getAttribute('datetime');
            const statusLink = timeElement?.closest('a')?.getAttribute('href');

            // Double check for ad text just in case
            const adIndicator = Array.from(article.querySelectorAll('span')).find(el => el.innerText === 'Ad' || el.innerText === 'Promoted');
            if (adIndicator) return;

            // Metrics (Likes, RTs, Replies) - This is tricky as selectors change often. 
            // We look for aria-labels like "100 likes" or specific testids if available.
            // data-testid="reply", "retweet", "like"
            const likeElement = article.querySelector('div[data-testid="like"]');
            const retweetElement = article.querySelector('div[data-testid="retweet"]');
            const replyElement = article.querySelector('div[data-testid="reply"]');

            const parseMetric = (el) => {
                if (!el) return 0;
                const label = el.getAttribute('aria-label'); // "100 likes"
                if (label) {
                    const match = label.match(/(\d+(?:,\d+)*)/);
                    return match ? parseInt(match[1].replace(/,/g, ''), 10) : 0;
                }
                // Fallback to text content if visible
                const text = el.innerText || el.textContent;
                return text ? text.trim() : 0; // Might be "1.2K"
            };

            // Construct Tweet Object
            const tweet = {
                name: nameElement?.innerText || 'Unknown',
                handle: handleElement?.innerText || 'Unknown',
                text: textElement?.innerText || '',
                date: date || new Date().toISOString(),
                url: statusLink ? `https://x.com${statusLink}` : '',
                likes: parseMetric(likeElement),
                retweets: parseMetric(retweetElement),
                replies: parseMetric(replyElement),
                id: statusLink ? statusLink.split('/').pop() : Date.now().toString() + Math.random()
            };

            tweets.push(tweet);
        } catch (e) {
            console.error('X-Ray: Failed to parse tweet', e);
        }
    });

    return tweets;
};

// Listen for messages from the side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'EXTRACT_TWEETS') {
        const data = extractTweets();
        sendResponse({ count: data.length, tweets: data });
    }
    return true; // Keep channel open for async response if needed
});

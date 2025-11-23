console.log('X-Ray content script loaded');

const extractTweets = () => {
    console.log('=== X-Ray: Starting tweet extraction ===');
    const articles = document.querySelectorAll('article[data-testid="tweet"]');
    console.log(`X-Ray: Found ${articles.length} tweet articles`);
    const tweets = [];

    articles.forEach((article, index) => {
        try {
            console.log(`\n--- Processing tweet ${index + 1} ---`);

            // Check for Promoted/Ad indicator
            const timeElement = article.querySelector('time');
            if (!timeElement) {
                console.log('  ✗ Skipped: No time element (likely promoted)');
                return;
            }

            // User Info
            const userElement = article.querySelector('div[data-testid="User-Name"]');
            const nameElement = userElement?.querySelector('span span');
            const handleElement = userElement?.querySelector('a[href^="/"] span');

            // Text
            const textElement = article.querySelector('div[data-testid="tweetText"]');

            // Date & URL
            const date = timeElement?.getAttribute('datetime');
            const statusLink = timeElement?.closest('a')?.getAttribute('href');

            // Double check for ad text
            const adIndicator = Array.from(article.querySelectorAll('span')).find(el => el.innerText === 'Ad' || el.innerText === 'Promoted');
            if (adIndicator) {
                console.log('  ✗ Skipped: Ad indicator found');
                return;
            }

            console.log(`  User: ${nameElement?.innerText || 'Unknown'}`);
            console.log(`  Handle: ${handleElement?.innerText || 'Unknown'}`);

            // === METRICS EXTRACTION WITH EXTENSIVE LOGGING ===

            const parseMetric = (element, metricName) => {
                if (!element) {
                    console.log(`    ${metricName}: No element found`);
                    return 0;
                }

                console.log(`    ${metricName}: Element found`);

                // Try aria-label first
                const ariaLabel = element.getAttribute('aria-label');
                console.log(`      aria-label: "${ariaLabel}"`);

                if (ariaLabel) {
                    const match = ariaLabel.match(/(\d+(?:,\d+)*)/);
                    if (match) {
                        const value = parseInt(match[1].replace(/,/g, ''), 10);
                        console.log(`      ✓ Parsed from aria-label: ${value}`);
                        return value;
                    }
                }

                // Try to find span with actual number
                const spans = element.querySelectorAll('span');
                console.log(`      Found ${spans.length} span elements`);

                for (const span of spans) {
                    const text = span.textContent.trim();
                    if (/^\d+(\.\d+)?[KMB]?$/.test(text)) {
                        let value = text;
                        let multiplier = 1;
                        if (value.endsWith('K')) {
                            multiplier = 1000;
                            value = value.slice(0, -1);
                        } else if (value.endsWith('M')) {
                            multiplier = 1000000;
                            value = value.slice(0, -1);
                        } else if (value.endsWith('B')) {
                            multiplier = 1000000000;
                            value = value.slice(0, -1);
                        }
                        const result = Math.round(parseFloat(value) * multiplier);
                        console.log(`      ✓ Parsed from span text "${text}": ${result}`);
                        return result;
                    }
                }

                console.log(`      ✗ Could not parse metric`);
                return 0;
            };

            let likes = 0, retweets = 0, replies = 0;

            console.log('  Attempting Strategy 1: data-testid selectors');

            // Strategy 1: data-testid
            const likeBtn = article.querySelector('div[data-testid="like"]');
            const retweetBtn = article.querySelector('div[data-testid="retweet"]');
            const replyBtn = article.querySelector('div[data-testid="reply"]');

            console.log(`    Found likeBtn: ${!!likeBtn}`);
            console.log(`    Found retweetBtn: ${!!retweetBtn}`);
            console.log(`    Found replyBtn: ${!!replyBtn}`);

            if (likeBtn) likes = parseMetric(likeBtn, 'Likes');
            if (retweetBtn) retweets = parseMetric(retweetBtn, 'Retweets');
            if (replyBtn) replies = parseMetric(replyBtn, 'Replies');

            // Strategy 2: If still 0, try role="group"
            if (likes === 0 || retweets === 0 || replies === 0) {
                console.log('  Attempting Strategy 2: role="group" selectors');
                const actionGroups = article.querySelectorAll('[role="group"]');
                console.log(`    Found ${actionGroups.length} action groups`);

                for (const group of actionGroups) {
                    const buttons = group.querySelectorAll('button, [role="button"]');
                    console.log(`    Group has ${buttons.length} buttons`);

                    // Log ALL aria-labels to see what we're working with
                    buttons.forEach((btn, idx) => {
                        const ariaLabel = btn.getAttribute('aria-label') || '';
                        console.log(`      Button ${idx + 1} aria-label: "${ariaLabel}"`);
                    });

                    for (const btn of buttons) {
                        const ariaLabel = btn.getAttribute('aria-label') || '';
                        const lowerLabel = ariaLabel.toLowerCase();

                        // Support both English and Japanese keywords
                        const isLike = lowerLabel.includes('like') || ariaLabel.includes('いいね');
                        const isRetweet = lowerLabel.includes('repost') || lowerLabel.includes('retweet') || ariaLabel.includes('リポスト');
                        const isReply = lowerLabel.includes('repl') || ariaLabel.includes('返信');

                        if (isLike && likes === 0) {
                            console.log(`      → Matched LIKE button: "${ariaLabel}"`);
                            likes = parseMetric(btn, 'Likes (fallback)');
                        } else if (isRetweet && retweets === 0) {
                            console.log(`      → Matched RETWEET button: "${ariaLabel}"`);
                            retweets = parseMetric(btn, 'Retweets (fallback)');
                        } else if (isReply && replies === 0) {
                            console.log(`      → Matched REPLY button: "${ariaLabel}"`);
                            replies = parseMetric(btn, 'Replies (fallback)');
                        }
                    }
                }
            }

            console.log(`  Final metrics - Likes: ${likes}, Retweets: ${retweets}, Replies: ${replies}`);

            // Construct Tweet Object
            const tweet = {
                name: nameElement?.innerText || 'Unknown',
                handle: handleElement?.innerText || 'Unknown',
                text: textElement?.innerText || '',
                date: date || new Date().toISOString(),
                url: statusLink ? `https://x.com${statusLink}` : '',
                likes: likes,
                retweets: retweets,
                replies: replies,
                id: statusLink ? statusLink.split('/').pop() : Date.now().toString() + Math.random()
            };

            tweets.push(tweet);
            console.log(`  ✓ Tweet added to collection`);
        } catch (e) {
            console.error(`X-Ray: Failed to parse tweet ${index + 1}:`, e);
        }
    });

    console.log(`\n=== X-Ray: Extraction complete. Collected ${tweets.length} tweets ===`);
    return tweets;
};

// Listen for messages from the side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'EXTRACT_TWEETS') {
        console.log('X-Ray: Received EXTRACT_TWEETS message');
        const data = extractTweets();
        sendResponse({ count: data.length, tweets: data });
    }
    return true;
});

console.log('X-Ray content script loaded');

const extractTweetData = (article) => {
    try {

        // Check for Promoted/Ad indicator
        const timeElement = article.querySelector('time');
        if (!timeElement) {
            console.log('  ✗ Skipped: No time element (likely promoted)');
            return null;
        }

        // User Info
        const userElement = article.querySelector('div[data-testid="User-Name"]');
        const nameElement = userElement?.querySelector('span span'); // Display Name (e.g. "KenKen")

        // Handle extraction: Best to get it from the profile link href to avoid display name confusion
        // The profile link usually starts with / and doesn't have /status/
        const profileLink = Array.from(userElement?.querySelectorAll('a') || []).find(a => {
            const href = a.getAttribute('href');
            return href && href.startsWith('/') && !href.includes('/status/');
        });

        const handleText = profileLink ? profileLink.getAttribute('href').substring(1) : 'Unknown'; // Remove leading /
        const handle = `@${handleText}`; // Add @ prefix for consistency

        // Text
        const textElement = article.querySelector('div[data-testid="tweetText"]');

        // Date & URL
        const date = timeElement?.getAttribute('datetime');
        const statusLink = timeElement?.closest('a')?.getAttribute('href');

        // Double check for ad text
        const adIndicator = Array.from(article.querySelectorAll('span')).find(el => el.innerText === 'Ad' || el.innerText === 'Promoted');
        if (adIndicator) {
            console.log('  ✗ Skipped: Ad indicator found');
            return null;
        }

        console.log(`  User: ${nameElement?.innerText || 'Unknown'}`);
        console.log(`  Handle: ${handle}`);

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

        // === IMPRESSIONS EXTRACTION ===
        // Impressions (views) are only visible on own tweets
        // Try to extract from analytics link or view count element
        let impressions = 0;

        // Strategy 1: Look for analytics/views link or element
        // Common patterns: "○○ views", "○○ 回表示", aria-label with "view"
        const allLinks = article.querySelectorAll('a[href*="analytics"], span');
        for (const el of allLinks) {
            const ariaLabel = el.getAttribute('aria-label') || '';
            const text = el.textContent || '';

            // Check for view/impression indicators (English & Japanese)
            if (ariaLabel.toLowerCase().includes('view') || ariaLabel.includes('表示') ||
                text.includes('views') || text.includes('回表示')) {

                console.log(`  Found potential impressions element: "${ariaLabel || text}"`);

                // Extract number
                const match = (ariaLabel + text).match(/(\d+(?:,\d+)*(?:\.\d+)?[KMB]?)/);
                if (match) {
                    let value = match[1].replace(/,/g, '');
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

                    impressions = Math.round(parseFloat(value) * multiplier);
                    console.log(`  ✓ Extracted impressions: ${impressions}`);
                    break;
                }
            }
        }

        if (impressions === 0) {
            console.log('  Impressions not found (likely not own tweet or not visible)');
        }

        // Construct Tweet Object
        const tweet = {
            name: nameElement?.innerText || 'Unknown',
            handle: handle,
            text: textElement?.innerText || '',
            date: date || new Date().toISOString(),
            url: statusLink ? `https://x.com${statusLink}` : '',
            likes: likes,
            retweets: retweets,
            replies: replies,
            impressions: impressions, // Will be 0 if not available
            id: statusLink ? statusLink.split('/').pop() : Date.now().toString() + Math.random()
        };

        return tweet;
    } catch (e) {
        console.error(`X-Ray: Failed to parse tweet:`, e);
        return null;
    }
};

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'EXTRACT_TWEETS') {
        const { autoScroll, targetCount } = request;

        const extract = async () => {
            const collectedTweets = new Map();
            let retries = 0;
            const maxRetries = 3;

            // Helper to extract current view
            const extractCurrentView = () => {
                const articles = document.querySelectorAll('article[data-testid="tweet"]');
                console.log(`Found ${articles.length} tweets in current view`);

                articles.forEach(article => {
                    const tweet = extractTweetData(article);
                    if (tweet && tweet.id) {
                        collectedTweets.set(tweet.id, tweet);
                    }
                });
            };

            // Initial extraction
            extractCurrentView();

            if (autoScroll) {
                console.log(`Starting auto-scroll. Target: ${targetCount}`);

                while (collectedTweets.size < targetCount) {
                    const previousHeight = document.body.scrollHeight;
                    window.scrollTo(0, document.body.scrollHeight);

                    // Wait for content to load
                    await new Promise(resolve => setTimeout(resolve, 1500));

                    extractCurrentView();
                    console.log(`Collected so far: ${collectedTweets.size}`);

                    // Check if we reached bottom
                    const newHeight = document.body.scrollHeight;
                    if (newHeight === previousHeight) {
                        retries++;
                        console.log(`Page height didn't change. Retry ${retries}/${maxRetries}`);
                        if (retries >= maxRetries) {
                            console.log('Reached end of page or no new content.');
                            break;
                        }
                    } else {
                        retries = 0; // Reset retries if we successfully scrolled
                    }
                }
            }

            return Array.from(collectedTweets.values());
        };

        extract().then(tweets => {
            console.log(`Extraction complete. Total unique tweets: ${tweets.length}`);
            sendResponse({ tweets });
        });

        return true; // Keep channel open for async response
    }
});

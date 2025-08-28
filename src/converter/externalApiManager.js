class ExternalAPIManager {
    constructor() {
        this.semanticScholarBase = 'https://api.semanticscholar.org/graph/v1';
        this.crossrefBase = 'https://api.crossref.org/works';
        this.rateLimitDelay = 1000; // milliseconds between API calls
        this.lastApiCall = 0;
        this.timeout = 10000; // 10 seconds timeout
        this.maxRetries = 3;
    }

    async rateLimit() {
        const now = Date.now();
        const timeSinceLastCall = now - this.lastApiCall;

        if (timeSinceLastCall < this.rateLimitDelay) {
            const waitTime = this.rateLimitDelay - timeSinceLastCall;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        this.lastApiCall = Date.now();
    }

    async makeRequest(url, options = {}) {
        await this.rateLimit();

        const defaultOptions = {
            method: 'GET',
            headers: {
                'User-Agent': 'Reference-Converter/1.0 (contact@example.com)',
                'Content-Type': 'application/json'
            },
            timeout: this.timeout
        };

        const requestOptions = { ...defaultOptions, ...options };

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        requestOptions.signal = controller.signal;

        try {
            const response = await fetch(url, requestOptions);
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }

    async searchSemanticScholar(title, authors = null, year = null) {
        try {
            // Construct search query
            let query = `"${title}"`;
            if (authors) {
                // Use first author for search
                const firstAuthor = authors.split(' and ')[0] || authors;
                query += ` author:"${firstAuthor}"`;
            }

            const params = new URLSearchParams({
                query: query,
                fields: 'title,authors,year,journal,venue,doi,url,abstract,citationCount,paperId',
                limit: '5'
            });

            const url = `${this.semanticScholarBase}/paper/search?${params}`;
            const data = await this.makeRequest(url);

            if (data && data.data && data.data.length > 0) {
                // Find best match
                const bestMatch = this.findBestMatch(data.data, title, authors, year);
                if (bestMatch) {
                    return this.formatSemanticScholarResult(bestMatch);
                }
            }

            return null;
        } catch (error) {
            logger.warning(`Semantic Scholar search failed: ${error.message}`);
            return null;
        }
    }

    async searchCrossref(title, authors = null, year = null) {
        try {
            // Construct search query
            let query = title;
            if (authors) {
                const firstAuthor = authors.split(' and ')[0] || authors;
                query += ` author:"${firstAuthor}"`;
            }

            const params = new URLSearchParams({
                query: query,
                rows: '5',
                select: 'title,author,published-print,published-online,container-title,volume,issue,page,DOI,URL,abstract,type'
            });

            if (year) {
                params.append('filter', `from-pub-date:${year},until-pub-date:${year}`);
            }

            const url = `${this.crossrefBase}?${params}`;
            const data = await this.makeRequest(url);

            if (data && data.message && data.message.items && data.message.items.length > 0) {
                // Find best match
                const bestMatch = this.findBestCrossrefMatch(data.message.items, title, authors, year);
                if (bestMatch) {
                    return this.formatCrossrefResult(bestMatch);
                }
            }

            return null;
        } catch (error) {
            logger.warning(`Crossref search failed: ${error.message}`);
            return null;
        }
    }

    findBestMatch(results, targetTitle, targetAuthors, targetYear) {
        let bestMatch = null;
        let bestScore = 0;

        for (const result of results) {
            const score = this.calculateMatchScore(result, targetTitle, targetAuthors, targetYear);
            if (score > bestScore) {
                bestScore = score;
                bestMatch = result;
            }
        }

        // Only return matches with a reasonable score
        return bestScore > 0.7 ? bestMatch : null;
    }

    findBestCrossrefMatch(results, targetTitle, targetAuthors, targetYear) {
        let bestMatch = null;
        let bestScore = 0;

        for (const result of results) {
            const score = this.calculateCrossrefMatchScore(result, targetTitle, targetAuthors, targetYear);
            if (score > bestScore) {
                bestScore = score;
                bestMatch = result;
            }
        }

        return bestScore > 0.7 ? bestMatch : null;
    }

    calculateMatchScore(result, targetTitle, targetAuthors, targetYear) {
        let score = 0;
        let factors = 0;

        // Title similarity (most important)
        if (result.title && targetTitle) {
            const titleSim = this.calculateStringSimilarity(result.title.toLowerCase(), targetTitle.toLowerCase());
            score += titleSim * 0.6;
            factors += 0.6;
        }

        // Author similarity
        if (result.authors && targetAuthors) {
            const resultAuthors = result.authors.map(a => a.name).join(' ');
            const authorSim = this.calculateStringSimilarity(resultAuthors.toLowerCase(), targetAuthors.toLowerCase());
            score += authorSim * 0.3;
            factors += 0.3;
        }

        // Year match
        if (result.year && targetYear) {
            const yearMatch = Math.abs(result.year - parseInt(targetYear)) <= 1 ? 1 : 0;
            score += yearMatch * 0.1;
            factors += 0.1;
        }

        return factors > 0 ? score / factors : 0;
    }

    calculateCrossrefMatchScore(result, targetTitle, targetAuthors, targetYear) {
        let score = 0;
        let factors = 0;

        // Title similarity
        if (result.title && result.title.length > 0 && targetTitle) {
            const resultTitle = result.title[0];
            const titleSim = this.calculateStringSimilarity(resultTitle.toLowerCase(), targetTitle.toLowerCase());
            score += titleSim * 0.6;
            factors += 0.6;
        }

        // Author similarity
        if (result.author && targetAuthors) {
            const resultAuthors = result.author.map(a => `${a.given} ${a.family}`).join(' ');
            const authorSim = this.calculateStringSimilarity(resultAuthors.toLowerCase(), targetAuthors.toLowerCase());
            score += authorSim * 0.3;
            factors += 0.3;
        }

        // Year match
        if (result['published-print'] && targetYear) {
            const pubYear = result['published-print']['date-parts'][0][0];
            const yearMatch = Math.abs(pubYear - parseInt(targetYear)) <= 1 ? 1 : 0;
            score += yearMatch * 0.1;
            factors += 0.1;
        }

        return factors > 0 ? score / factors : 0;
    }

    calculateStringSimilarity(str1, str2) {
        // Simple Jaccard similarity for now
        // In a production app, you might want to use a more sophisticated algorithm
        const set1 = new Set(str1.split(/\s+/));
        const set2 = new Set(str2.split(/\s+/));

        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);

        return intersection.size / union.size;
    }

    formatSemanticScholarResult(result) {
        const enhanced = {};

        if (result.title) {
            enhanced.title = result.title;
        }

        if (result.authors && result.authors.length > 0) {
            enhanced.author = result.authors.map(a => a.name).join(' and ');
        }

        if (result.year) {
            enhanced.year = result.year.toString();
        }

        if (result.journal) {
            enhanced.journal = result.journal.name;
        } else if (result.venue) {
            enhanced.journal = result.venue;
        }

        if (result.doi) {
            enhanced.doi = result.doi;
        }

        if (result.url) {
            enhanced.url = result.url;
        }

        if (result.abstract) {
            enhanced.abstract = result.abstract;
        }

        // Add citation count as a note if available
        if (result.citationCount !== undefined) {
            enhanced.note = `Cited by ${result.citationCount} (Semantic Scholar)`;
        }

        return enhanced;
    }

    formatCrossrefResult(result) {
        const enhanced = {};

        if (result.title && result.title.length > 0) {
            enhanced.title = result.title[0];
        }

        if (result.author && result.author.length > 0) {
            enhanced.author = result.author.map(a => `${a.given} ${a.family}`).join(' and ');
        }

        if (result['published-print'] && result['published-print']['date-parts']) {
            enhanced.year = result['published-print']['date-parts'][0][0].toString();
        } else if (result['published-online'] && result['published-online']['date-parts']) {
            enhanced.year = result['published-online']['date-parts'][0][0].toString();
        }

        if (result['container-title'] && result['container-title'].length > 0) {
            enhanced.journal = result['container-title'][0];
        }

        if (result.volume) {
            enhanced.volume = result.volume;
        }

        if (result.issue) {
            enhanced.number = result.issue;
        }

        if (result.page) {
            enhanced.pages = result.page.replace('-', '--');
        }

        if (result.DOI) {
            enhanced.doi = result.DOI;
        }

        if (result.URL) {
            enhanced.url = result.URL;
        }

        if (result.abstract) {
            enhanced.abstract = result.abstract;
        }

        return enhanced;
    }

    async enhanceReference(fields) {
        const enhanced = {};

        try {
            // Try Semantic Scholar first
            let result = await this.searchSemanticScholar(
                fields.title,
                fields.author,
                fields.year
            );

            // If no good match from Semantic Scholar, try Crossref
            if (!result) {
                result = await this.searchCrossref(
                    fields.title,
                    fields.author,
                    fields.year
                );
            }

            if (result) {
                // Only override empty fields or enhance existing ones
                for (const [key, value] of Object.entries(result)) {
                    if (!fields[key] || fields[key].trim() === '') {
                        enhanced[key] = value;
                    } else if (key === 'doi' && !fields.doi) {
                        enhanced[key] = value;
                    } else if (key === 'abstract' && !fields.abstract) {
                        enhanced[key] = value;
                    } else if (key === 'note') {
                        // Append notes
                        enhanced[key] = fields.note ? `${fields.note}; ${value}` : value;
                    }
                }

                logger.info(`Enhanced reference using external API: ${fields.title}`);
            }

        } catch (error) {
            logger.warning(`Reference enhancement failed: ${error.message}`);
        }

        return enhanced;
    }

    async testConnectivity() {
        const tests = [
            { name: 'Semantic Scholar', test: () => this.makeRequest(this.semanticScholarBase + '/paper/search?query=test&limit=1') },
            { name: 'Crossref', test: () => this.makeRequest(this.crossrefBase + '?query=test&rows=1') }
        ];

        const results = {};

        for (const { name, test } of tests) {
            try {
                await test();
                results[name] = { status: 'success', message: 'API accessible' };
            } catch (error) {
                results[name] = { status: 'error', message: error.message };
            }
        }

        return results;
    }

    updateConfig(config) {
        if (config.rateLimitDelay !== undefined) {
            this.rateLimitDelay = config.rateLimitDelay * 1000; // Convert to milliseconds
        }
        if (config.timeout !== undefined) {
            this.timeout = config.timeout * 1000; // Convert to milliseconds
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExternalAPIManager;
}

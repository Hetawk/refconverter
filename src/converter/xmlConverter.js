class XMLConverter {
    constructor() {
        this.entryTypeMap = {
            'Journal Article': 'article',
            'Book': 'book',
            'Book Section': 'incollection',
            'Conference Paper': 'inproceedings',
            'Conference Proceedings': 'proceedings',
            'Conference Proceeding': 'proceedings',
            'Thesis': 'phdthesis',
            'Report': 'techreport',
            'Web Page': 'online',
            'Patent': 'patent',
            'Unpublished Work': 'unpublished',
            'Manuscript': 'unpublished',
            'Magazine Article': 'article',
            'Newspaper Article': 'article',
            'Electronic Article': 'article',
            'Generic': 'misc'
        };

        // Configuration options
        this.config = {
            suppressWarnings: true,
            extractStyledText: true,
            useAcmStyle: false,
            useStringDefinitions: true,
            useBiblatexFields: false,
            escapeLatexChars: true,
            debugMode: true,
            enableApiEnhancement: true
        };

        // LaTeX special characters that need escaping
        this.latexSpecialChars = {
            '&': '\\&',
            '%': '\\%',
            '$': '\\$',
            '#': '\\#',
            '_': '\\_',
            '{': '\\{',
            '}': '\\}',
            '~': '\\textasciitilde{}',
            '^': '\\textasciicircum{}',
            '\\': '\\textbackslash{}',
            '<': '\\textless{}',
            '>': '\\textgreater{}'
        };

        // BibTeX to BibLaTeX field name mapping
        this.biblatexFieldMap = {
            'journal': 'journaltitle',
            'address': 'location',
            'school': 'institution',
            'articleno': 'number'
        };

        // Track journals and publishers for string definitions
        this.journals = {};
        this.publishers = {};
        this.journalNameToKey = {};

        // Enhanced categories for grouping
        this.journalCategories = {
            'ACM': ['ACM', 'Association for Computing Machinery', 'CACM', 'Communications of the ACM', 'Commun. ACM',
                'Trans. ACM', 'Transactions on', 'SIGPLAN', 'SIGCHI', 'SIGGRAPH', 'SIGSOFT', 'SIGIR', 'SIGKDD', 'SIGMOD'],
            'IEEE': ['IEEE', 'Institute of Electrical and Electronics Engineers', 'Transactions on', 'Journal of',
                'Proceedings of the IEEE', 'Computer Society'],
            'SIAM': ['SIAM', 'Society for Industrial and Applied Mathematics', 'Journal on', 'Review'],
            'AMS': ['AMS', 'American Mathematical Society', 'Mathematical'],
            'Springer': ['Springer', 'Lecture Notes in Computer Science', 'LNCS', 'Lecture Notes in'],
            'Elsevier': ['Elsevier', 'Science Direct', 'Information Sciences', 'Computer Science'],
            'Conference': ['Proceedings of', 'Conference on', 'Symposium on', 'Workshop on']
        };

        this.publisherCategories = {
            'Academic': ['Academic', 'Academic Press', 'University'],
            'ACM': ['ACM', 'Association for Computing Machinery'],
            'IEEE': ['IEEE', 'Institute of Electrical and Electronics Engineers'],
            'Commercial': ['Wiley', 'Springer', 'Elsevier', 'McGraw', 'Addison', 'Wesley']
        };

        // Pattern matchers for intelligent categorization
        this.journalPatterns = {
            'Conference': [/proc\.?\s+of/i, /proceedings/i, /conference/i, /symposium/i, /workshop/i],
            'Journal': [/journal/i, /transactions/i, /quarterly/i, /review/i, /letters/i],
            'Magazine': [/magazine/i, /bulletin/i, /forum/i, /digest/i]
        };

        this.conversionErrors = [];
        this.progressCallback = null;
        this.apiManager = null;
    }

    setProgressCallback(callback) {
        this.progressCallback = callback;
    }

    setApiManager(apiManager) {
        this.apiManager = apiManager;
    }

    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    callProgressCallback(current, total, message = '') {
        if (this.progressCallback) {
            return this.progressCallback(current, total, message);
        }
        return true; // Continue processing if no callback
    }

    escapeLatex(text) {
        if (!this.config.escapeLatexChars || !text) {
            return text;
        }

        for (const [char, replacement] of Object.entries(this.latexSpecialChars)) {
            text = text.replace(new RegExp('\\' + char, 'g'), replacement);
        }
        return text;
    }

    async convertToBibtex(xmlData) {
        // Reset collections and errors list
        this.conversionErrors = [];
        this.journals = {};
        this.publishers = {};
        this.journalNameToKey = {};

        logger.info('Starting conversion process...');
        logger.info(`String definitions enabled: ${this.config.useStringDefinitions}`);
        logger.info(`BibLaTeX fields enabled: ${this.config.useBiblatexFields}`);
        logger.info(`ACM style enabled: ${this.config.useAcmStyle}`);

        let xmlDoc;
        try {
            // Parse XML
            const parser = new DOMParser();
            xmlDoc = parser.parseFromString(xmlData, 'text/xml');

            // Check for parsing errors
            const parseError = xmlDoc.querySelector('parsererror');
            if (parseError) {
                throw new Error(`XML parsing error: ${parseError.textContent}`);
            }

            logger.info(`XML root tag: ${xmlDoc.documentElement.tagName}`);
        } catch (error) {
            const errorMsg = `Error parsing XML: ${error.message}`;
            logger.error(errorMsg);
            this.conversionErrors.push(errorMsg);
            return '';
        }

        // Find records with flexible path handling
        let records = [];
        const possiblePaths = [
            'record',
            'records record',
            'xml records record',
            'EndNote records record',
            'xml database record'
        ];

        for (const path of possiblePaths) {
            const foundRecords = xmlDoc.querySelectorAll(path);
            if (foundRecords.length > 0) {
                records = Array.from(foundRecords);
                logger.info(`Found ${records.length} records using path: ${path}`);
                break;
            }
        }

        if (records.length === 0) {
            const xmlStructure = this.describeXmlStructure(xmlDoc.documentElement);
            const errorMsg = `No records found in XML data. XML structure: ${xmlStructure}`;
            logger.error(errorMsg);
            this.conversionErrors.push(errorMsg);
            return '';
        }

        // Only collect journal and publisher info if string definitions are enabled
        if (this.config.useStringDefinitions) {
            try {
                this.callProgressCallback(
                    0, records.length,
                    'Collecting journal and publisher information for string definitions...'
                );

                await this.collectJournalAndPublisherInfo(records);
            } catch (error) {
                logger.error(`Error collecting journal/publisher info: ${error.message}`);
            }
        }

        // Process records
        let bibtexEntries = [];
        logger.info(`Processing ${records.length} records...`);

        for (let i = 0; i < records.length; i++) {
            const record = records[i];

            // Update progress with detailed message
            const progressMessage = `Processing record ${i + 1}/${records.length}: Extracting ${this.getRecordTitle(record) || 'reference'}...`;
            if (!this.callProgressCallback(i + 1, records.length, progressMessage)) {
                logger.info('Conversion cancelled by user');
                break;
            }

            try {
                const entry = await this.processRecord(record, i);
                if (entry) {
                    bibtexEntries.push(entry);
                    logger.info(`✓ Processed record ${i + 1}: ${this.getRecordTitle(record) || `Entry ${i + 1}`}`);
                } else {
                    logger.warning(`⚠ Skipped record ${i + 1}: Unable to process`);
                }
            } catch (error) {
                const errorMsg = `Error processing record ${i + 1}: ${error.message}`;
                logger.error(errorMsg);
                this.conversionErrors.push(errorMsg);
            }
        }        // Build final BibTeX output
        logger.info('Generating final BibTeX output...');
        this.callProgressCallback(records.length, records.length, 'Generating final output...');

        let bibtexOutput = '';

        // Add string definitions if enabled
        if (this.config.useStringDefinitions) {
            logger.info('Generating string definitions...');
            const stringDefs = this.generateStringDefinitions();
            if (stringDefs) {
                bibtexOutput += stringDefs + '\n\n';
                logger.info(`Generated string definitions for ${Object.keys(this.journals).length} journals and ${Object.keys(this.publishers).length} publishers`);
            }
        }

        // Add entries
        bibtexOutput += bibtexEntries.join('\n\n');

        // Add statistics comment
        const stats = this.generateStatistics(records.length, bibtexEntries.length);
        bibtexOutput = stats + '\n\n' + bibtexOutput;

        logger.success(`Conversion completed! Generated ${bibtexEntries.length} BibTeX entries from ${records.length} XML records.`);
        return bibtexOutput;
    }

    async collectJournalAndPublisherInfo(records) {
        for (const record of records) {
            try {
                // Extract journal information
                const journalElements = [
                    'secondary-title',
                    'journal',
                    'periodical'
                ];

                for (const elementName of journalElements) {
                    const elements = record.querySelectorAll(elementName);
                    for (const element of elements) {
                        const journalName = this.extractTextContent(element);
                        if (journalName && journalName.trim()) {
                            this.addJournal(journalName.trim());
                        }
                    }
                }

                // Extract publisher information
                const publisherElements = [
                    'publisher',
                    'pub-location'
                ];

                for (const elementName of publisherElements) {
                    const elements = record.querySelectorAll(elementName);
                    for (const element of elements) {
                        const publisherName = this.extractTextContent(element);
                        if (publisherName && publisherName.trim()) {
                            this.addPublisher(publisherName.trim());
                        }
                    }
                }
            } catch (error) {
                logger.error(`Error collecting info from record: ${error.message}`);
            }
        }
    }

    async processRecord(record, index) {
        try {
            // Extract reference type
            const refType = this.extractReferenceType(record);
            const bibtexType = this.entryTypeMap[refType] || 'misc';

            // Generate citation key
            const citationKey = await this.generateCitationKey(record, index);

            // Extract all fields
            const fields = await this.extractFields(record);

            // Apply API enhancement if enabled
            if (this.config.enableApiEnhancement && this.apiManager) {
                try {
                    const enhancedFields = await this.apiManager.enhanceReference(fields);
                    Object.assign(fields, enhancedFields);
                } catch (error) {
                    logger.warning(`API enhancement failed for record ${index + 1}: ${error.message}`);
                }
            }

            // Format fields for BibTeX
            const formattedFields = this.formatFields(fields, bibtexType);

            // Generate BibTeX entry
            const entry = this.generateBibtexEntry(bibtexType, citationKey, formattedFields);
            return entry;

        } catch (error) {
            logger.error(`Error processing record ${index + 1}: ${error.message}`);
            throw error;
        }
    }

    extractReferenceType(record) {
        const refTypeElements = record.querySelectorAll('ref-type');
        if (refTypeElements.length > 0) {
            const refTypeAttr = refTypeElements[0].getAttribute('name');
            if (refTypeAttr) {
                return refTypeAttr;
            }
            return this.extractTextContent(refTypeElements[0]);
        }
        return 'Generic';
    }

    async generateCitationKey(record, index) {
        try {
            // Extract author information
            const authors = this.extractAuthors(record);
            const firstAuthor = authors.length > 0 ? authors[0] : 'Unknown';

            // Get last name from first author
            const authorParts = firstAuthor.split(/\s+/);
            const lastName = authorParts[authorParts.length - 1].replace(/[^a-zA-Z]/g, '');

            // Extract year
            const year = this.extractYear(record) || '0000';

            // Extract title words
            const title = this.extractTitle(record);
            const titleWords = title ? title.split(/\s+/).filter(word =>
                word.length > 3 && !/^(the|and|of|in|on|at|to|for|with|by)$/i.test(word)
            ).slice(0, 2) : [];

            // Build citation key
            let citationKey = lastName + year;
            if (titleWords.length > 0) {
                citationKey += titleWords.map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                ).join('');
            }

            // Ensure uniqueness by adding suffix if needed
            const baseCitationKey = citationKey;
            let suffix = '';
            let counter = 1;

            // This would need to be implemented with a global key tracker in a real application
            // For now, we'll just add the index as a suffix
            citationKey = baseCitationKey + (index > 0 ? `_${index}` : '');

            return citationKey.replace(/[^a-zA-Z0-9_]/g, '');
        } catch (error) {
            logger.error(`Error generating citation key: ${error.message}`);
            return `ref${index + 1}`;
        }
    }

    async extractFields(record) {
        const fields = {};

        try {
            // Title
            fields.title = this.extractTitle(record);

            // Authors
            const authors = this.extractAuthors(record);
            if (authors.length > 0) {
                fields.author = authors.join(' and ');
            }

            // Year
            fields.year = this.extractYear(record);

            // Journal/Publisher
            fields.journal = this.extractJournal(record);
            fields.publisher = this.extractPublisher(record);

            // Volume, Number, Pages
            fields.volume = this.extractVolume(record);
            fields.number = this.extractNumber(record);
            fields.pages = this.extractPages(record);

            // DOI and URL
            fields.doi = this.extractDoi(record);
            fields.url = this.extractUrl(record);

            // Abstract
            fields.abstract = this.extractAbstract(record);

            // Keywords
            fields.keywords = this.extractKeywords(record);

            // Additional fields based on reference type
            fields.booktitle = this.extractBookTitle(record);
            fields.chapter = this.extractChapter(record);
            fields.edition = this.extractEdition(record);
            fields.series = this.extractSeries(record);
            fields.address = this.extractAddress(record);
            fields.organization = this.extractOrganization(record);
            fields.institution = this.extractInstitution(record);
            fields.school = this.extractSchool(record);
            fields.note = this.extractNote(record);

        } catch (error) {
            logger.error(`Error extracting fields: ${error.message}`);
        }

        return fields;
    }

    extractTextContent(element) {
        if (!element) return '';

        if (this.config.extractStyledText) {
            // Handle styled text elements
            const styledElements = element.querySelectorAll('style');
            for (const styled of styledElements) {
                const face = styled.getAttribute('face');
                const text = styled.textContent;

                if (face && text) {
                    if (face.includes('italic')) {
                        styled.textContent = `\\textit{${text}}`;
                    } else if (face.includes('bold')) {
                        styled.textContent = `\\textbf{${text}}`;
                    }
                }
            }
        }

        let text = element.textContent || '';

        // Clean up whitespace
        text = text.replace(/\s+/g, ' ').trim();

        // Escape LaTeX characters if enabled
        if (this.config.escapeLatexChars) {
            text = this.escapeLatex(text);
        }

        return text;
    }

    extractTitle(record) {
        const titleElements = record.querySelectorAll('title, titles title');
        return titleElements.length > 0 ? this.extractTextContent(titleElements[0]) : '';
    }

    extractAuthors(record) {
        const authors = [];
        const authorElements = record.querySelectorAll('author, authors author, contributors author');

        for (const authorElement of authorElements) {
            const author = this.extractTextContent(authorElement);
            if (author) {
                authors.push(author);
            }
        }

        return authors;
    }

    extractYear(record) {
        const yearElements = record.querySelectorAll('year, dates year, pub-dates year');
        if (yearElements.length > 0) {
            const yearText = this.extractTextContent(yearElements[0]);
            const yearMatch = yearText.match(/\d{4}/);
            return yearMatch ? yearMatch[0] : '';
        }
        return '';
    }

    extractJournal(record) {
        const journalElements = record.querySelectorAll('secondary-title, journal, periodical');
        return journalElements.length > 0 ? this.extractTextContent(journalElements[0]) : '';
    }

    extractPublisher(record) {
        const publisherElements = record.querySelectorAll('publisher, pub-location');
        return publisherElements.length > 0 ? this.extractTextContent(publisherElements[0]) : '';
    }

    extractVolume(record) {
        const volumeElements = record.querySelectorAll('volume');
        return volumeElements.length > 0 ? this.extractTextContent(volumeElements[0]) : '';
    }

    extractNumber(record) {
        const numberElements = record.querySelectorAll('number, issue');
        return numberElements.length > 0 ? this.extractTextContent(numberElements[0]) : '';
    }

    extractPages(record) {
        const pagesElements = record.querySelectorAll('pages');
        if (pagesElements.length > 0) {
            let pages = this.extractTextContent(pagesElements[0]);
            // Convert page ranges to BibTeX format (e.g., "123-456" stays as "123-456")
            pages = pages.replace(/(\d+)\s*[-–—]\s*(\d+)/, '$1--$2');
            return pages;
        }
        return '';
    }

    extractDoi(record) {
        const doiElements = record.querySelectorAll('doi, electronic-resource-num[source="DOI"]');
        return doiElements.length > 0 ? this.extractTextContent(doiElements[0]) : '';
    }

    extractUrl(record) {
        const urlElements = record.querySelectorAll('url, urls url, remote-source url');
        return urlElements.length > 0 ? this.extractTextContent(urlElements[0]) : '';
    }

    extractAbstract(record) {
        const abstractElements = record.querySelectorAll('abstract');
        return abstractElements.length > 0 ? this.extractTextContent(abstractElements[0]) : '';
    }

    extractKeywords(record) {
        const keywordElements = record.querySelectorAll('keyword, keywords keyword');
        const keywords = [];
        for (const element of keywordElements) {
            const keyword = this.extractTextContent(element);
            if (keyword) {
                keywords.push(keyword);
            }
        }
        return keywords.join(', ');
    }

    extractBookTitle(record) {
        const bookTitleElements = record.querySelectorAll('secondary-title, book-title');
        return bookTitleElements.length > 0 ? this.extractTextContent(bookTitleElements[0]) : '';
    }

    extractChapter(record) {
        const chapterElements = record.querySelectorAll('chapter, section');
        return chapterElements.length > 0 ? this.extractTextContent(chapterElements[0]) : '';
    }

    extractEdition(record) {
        const editionElements = record.querySelectorAll('edition');
        return editionElements.length > 0 ? this.extractTextContent(editionElements[0]) : '';
    }

    extractSeries(record) {
        const seriesElements = record.querySelectorAll('series, collection-title');
        return seriesElements.length > 0 ? this.extractTextContent(seriesElements[0]) : '';
    }

    extractAddress(record) {
        const addressElements = record.querySelectorAll('pub-location, address');
        return addressElements.length > 0 ? this.extractTextContent(addressElements[0]) : '';
    }

    extractOrganization(record) {
        const orgElements = record.querySelectorAll('organization, sponsor');
        return orgElements.length > 0 ? this.extractTextContent(orgElements[0]) : '';
    }

    extractInstitution(record) {
        const instElements = record.querySelectorAll('institution, university');
        return instElements.length > 0 ? this.extractTextContent(instElements[0]) : '';
    }

    extractSchool(record) {
        const schoolElements = record.querySelectorAll('school, university, academic-department');
        return schoolElements.length > 0 ? this.extractTextContent(schoolElements[0]) : '';
    }

    extractNote(record) {
        const noteElements = record.querySelectorAll('note, notes, research-notes');
        return noteElements.length > 0 ? this.extractTextContent(noteElements[0]) : '';
    }

    formatFields(fields, bibtexType) {
        const formattedFields = {};

        for (const [key, value] of Object.entries(fields)) {
            if (!value || value.trim() === '') continue;

            let fieldName = key;

            // Apply BibLaTeX field mapping if enabled
            if (this.config.useBiblatexFields && this.biblatexFieldMap[key]) {
                fieldName = this.biblatexFieldMap[key];
            }

            // Handle string definitions for journals and publishers
            if (this.config.useStringDefinitions) {
                if (fieldName === 'journal' || fieldName === 'journaltitle') {
                    const journalKey = this.getJournalKey(value);
                    if (journalKey) {
                        formattedFields[fieldName] = journalKey;
                        continue;
                    }
                } else if (fieldName === 'publisher') {
                    const publisherKey = this.getPublisherKey(value);
                    if (publisherKey) {
                        formattedFields[fieldName] = publisherKey;
                        continue;
                    }
                }
            }

            // Format field value
            formattedFields[fieldName] = this.formatFieldValue(value, fieldName);
        }

        return formattedFields;
    }

    formatFieldValue(value, fieldName) {
        if (!value) return '';

        // Trim whitespace
        value = value.trim();

        // Special formatting for certain fields
        if (fieldName === 'pages') {
            // Ensure proper page range format
            value = value.replace(/(\d+)\s*[-–—]\s*(\d+)/, '$1--$2');
        } else if (fieldName === 'title') {
            // Protect capitalization in titles
            if (!value.startsWith('{') && !value.endsWith('}')) {
                value = `{${value}}`;
            }
        }

        return value;
    }

    generateBibtexEntry(type, key, fields) {
        let entry = `@${type}{${key}`;

        for (const [fieldName, fieldValue] of Object.entries(fields)) {
            if (fieldValue && fieldValue.trim()) {
                entry += `,\n  ${fieldName} = {${fieldValue}}`;
            }
        }

        entry += '\n}';
        return entry;
    }

    addJournal(journalName) {
        if (this.journalNameToKey[journalName]) {
            return; // Already exists
        }

        const key = this.generateJournalKey(journalName);
        this.journals[key] = {
            fullName: journalName,
            abbreviated: this.generateAbbreviation(journalName),
            category: this.categorizeJournal(journalName)
        };
        this.journalNameToKey[journalName] = key;
    }

    addPublisher(publisherName) {
        const key = this.generatePublisherKey(publisherName);
        if (!this.publishers[key]) {
            this.publishers[key] = {
                name: publisherName,
                category: this.categorizePublisher(publisherName)
            };
        }
    }

    generateJournalKey(journalName) {
        // Create a key from the journal name
        return journalName
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .split(/\s+/)
            .map(word => word.toLowerCase())
            .join('')
            .substring(0, 20);
    }

    generatePublisherKey(publisherName) {
        return publisherName
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .split(/\s+/)
            .map(word => word.toLowerCase())
            .join('')
            .substring(0, 15);
    }

    generateAbbreviation(journalName) {
        // Simple abbreviation logic
        return journalName
            .split(/\s+/)
            .map(word => word.charAt(0).toUpperCase())
            .join('');
    }

    categorizeJournal(journalName) {
        for (const [category, patterns] of Object.entries(this.journalCategories)) {
            for (const pattern of patterns) {
                if (journalName.toLowerCase().includes(pattern.toLowerCase())) {
                    return category;
                }
            }
        }
        return 'Other';
    }

    categorizePublisher(publisherName) {
        for (const [category, patterns] of Object.entries(this.publisherCategories)) {
            for (const pattern of patterns) {
                if (publisherName.toLowerCase().includes(pattern.toLowerCase())) {
                    return category;
                }
            }
        }
        return 'Other';
    }

    getJournalKey(journalName) {
        return this.journalNameToKey[journalName] || null;
    }

    getPublisherKey(publisherName) {
        const key = this.generatePublisherKey(publisherName);
        return this.publishers[key] ? key : null;
    }

    generateStringDefinitions() {
        if (Object.keys(this.journals).length === 0 && Object.keys(this.publishers).length === 0) {
            return '';
        }

        let stringDefs = '% String definitions for journals and publishers\n';

        // Group journals by category
        const journalsByCategory = {};
        for (const [key, journal] of Object.entries(this.journals)) {
            const category = journal.category;
            if (!journalsByCategory[category]) {
                journalsByCategory[category] = [];
            }
            journalsByCategory[category].push({ key, ...journal });
        }

        // Generate journal string definitions
        for (const [category, journals] of Object.entries(journalsByCategory)) {
            if (journals.length > 0) {
                stringDefs += `\n% ${category} Journals\n`;
                for (const journal of journals) {
                    stringDefs += `@string{${journal.key} = "${journal.fullName}"}\n`;
                }
            }
        }

        // Group publishers by category
        const publishersByCategory = {};
        for (const [key, publisher] of Object.entries(this.publishers)) {
            const category = publisher.category;
            if (!publishersByCategory[category]) {
                publishersByCategory[category] = [];
            }
            publishersByCategory[category].push({ key, ...publisher });
        }

        // Generate publisher string definitions
        for (const [category, publishers] of Object.entries(publishersByCategory)) {
            if (publishers.length > 0) {
                stringDefs += `\n% ${category} Publishers\n`;
                for (const publisher of publishers) {
                    stringDefs += `@string{${publisher.key} = "${publisher.name}"}\n`;
                }
            }
        }

        return stringDefs;
    }

    generateStatistics(totalRecords, convertedRecords) {
        const timestamp = new Date().toISOString();
        const errorCount = this.conversionErrors.length;

        return `% BibTeX file generated by Reference Converter
% Generation time: ${timestamp}
% Total records processed: ${totalRecords}
% Successfully converted: ${convertedRecords}
% Conversion errors: ${errorCount}
% Configuration: String definitions=${this.config.useStringDefinitions}, BibLaTeX=${this.config.useBiblatexFields}, ACM style=${this.config.useAcmStyle}`;
    }

    describeXmlStructure(element, maxDepth = 3, currentDepth = 0) {
        if (currentDepth >= maxDepth) return '...';

        const children = Array.from(element.children);
        if (children.length === 0) {
            return element.tagName;
        }

        const childTags = children.slice(0, 5).map(child =>
            this.describeXmlStructure(child, maxDepth, currentDepth + 1)
        );

        if (children.length > 5) {
            childTags.push('...');
        }

        return `${element.tagName}[${childTags.join(', ')}]`;
    }

    getConversionErrors() {
        return [...this.conversionErrors];
    }

    clearErrors() {
        this.conversionErrors = [];
    }

    getRecordTitle(record) {
        try {
            const titleElements = record.querySelectorAll('title, titles title');
            if (titleElements.length > 0) {
                const title = this.extractTextContent(titleElements[0]);
                return title ? title.substring(0, 50) + (title.length > 50 ? '...' : '') : null;
            }
        } catch (error) {
            // Ignore errors when extracting title for progress display
        }
        return null;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = XMLConverter;
}

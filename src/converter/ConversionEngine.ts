export interface ConversionOptions {
  includeAbstract: boolean;
  includeKeywords: boolean;
  includeNotes: boolean;
  preserveFormatting: boolean;
  customFields: string[];
  citationStyle: string;
  escapeLatex: boolean;
  suppressWarnings: boolean;
}

export interface ConversionResult {
  bibtex: string;
  entryCount: number;
  warnings: string[];
  processingTime: number;
}

/**
 * Core XML to BibTeX conversion engine
 * Handles the parsing and transformation logic
 */
export class ConversionEngine {
  private readonly supportedFormats = ["xml", "ris", "endnote"];

  constructor() {
    console.log("🔧 ConversionEngine initialized");
  }

  /**
   * Convert XML content to BibTeX format
   */
  async convertXMLToBibTeX(
    xmlContent: string,
    options: ConversionOptions
  ): Promise<ConversionResult> {
    const startTime = Date.now();
    const warnings: string[] = [];

    try {
      // Parse XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

      // Check for parsing errors
      const parseError = xmlDoc.querySelector("parsererror");
      if (parseError) {
        throw new Error("Invalid XML format: " + parseError.textContent);
      }

      // Extract references
      const references = this.extractReferences(xmlDoc, options, warnings);

      // Convert to BibTeX
      const bibtex = this.convertToBibTeX(references, options);

      const processingTime = Date.now() - startTime;

      return {
        bibtex,
        entryCount: references.length,
        warnings,
        processingTime,
      };
    } catch (error) {
      console.error("Conversion error:", error);
      throw new Error(
        `Conversion failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private extractReferences(
    xmlDoc: Document,
    options: ConversionOptions,
    warnings: string[]
  ): any[] {
    const references: any[] = [];

    // Try different XML schemas
    let entries = xmlDoc.querySelectorAll("record, reference, citation, item");

    if (entries.length === 0) {
      // Try alternative selectors
      entries = xmlDoc.querySelectorAll("*[title], *[author], *[journal]");
      if (entries.length === 0) {
        warnings.push("No recognizable reference entries found in XML");
        return references;
      }
    }

    entries.forEach((entry, index) => {
      try {
        const ref = this.parseReference(entry, options, index + 1);
        if (ref) {
          references.push(ref);
        }
      } catch (error) {
        warnings.push(
          `Error parsing reference ${index + 1}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    });

    return references;
  }

  private parseReference(
    element: Element,
    options: ConversionOptions,
    refNumber: number
  ): any | null {
    const reference: any = {
      id: this.generateBibTeXKey(element, refNumber),
      type: this.determineBibTeXType(element),
    };

    // Core fields
    reference.title = this.extractText(element, "title, Title, TITLE");
    reference.author = this.extractAuthors(element);
    reference.year = this.extractYear(element);

    // Publication details
    reference.journal = this.extractText(
      element,
      "journal, Journal, publication, source"
    );
    reference.volume = this.extractText(element, "volume, Volume");
    reference.number = this.extractText(
      element,
      "number, Number, issue, Issue"
    );
    reference.pages = this.extractPages(element);
    reference.publisher = this.extractText(element, "publisher, Publisher");
    reference.address = this.extractText(element, "address, Address, location");

    // DOI and URLs
    reference.doi = this.extractText(element, "doi, DOI, identifier[type=doi]");
    reference.url = this.extractText(element, "url, URL, link, href");
    reference.isbn = this.extractText(element, "isbn, ISBN");
    reference.issn = this.extractText(element, "issn, ISSN");

    // Optional fields based on user preferences
    if (options.includeAbstract) {
      reference.abstract = this.extractText(
        element,
        "abstract, Abstract, summary"
      );
    }

    if (options.includeKeywords) {
      reference.keywords = this.extractKeywords(element);
    }

    if (options.includeNotes) {
      reference.note = this.extractText(element, "note, Note, notes, comment");
    }

    // Custom fields
    if (options.customFields && Array.isArray(options.customFields)) {
      options.customFields.forEach((fieldName) => {
        const value = this.extractText(element, fieldName);
        if (value) {
          reference[fieldName.toLowerCase()] = value;
        }
      });
    }

    // Validate that we have minimum required fields
    if (!reference.title && !reference.author) {
      return null;
    }

    return reference;
  }

  private extractText(element: Element, selectors: string): string {
    const selectorList = selectors.split(",").map((s) => s.trim());

    for (const selector of selectorList) {
      // Try direct selector first
      let found = element.querySelector(selector);

      // If not found, try with attribute selectors
      if (!found) {
        found =
          element.querySelector(`*[name="${selector}"]`) ||
          element.querySelector(`*[field="${selector}"]`);
      }

      if (found) {
        // For EndNote XML, text is often wrapped in <style> tags
        const styleContent = found.querySelector("style");
        if (styleContent) {
          return styleContent.textContent?.trim() || "";
        }
        return found.textContent?.trim() || "";
      }
    }

    return "";
  }

  private extractAuthors(element: Element): string {
    // Try EndNote format first - authors in contributors/authors/author structure
    const authorsContainer =
      element.querySelector("contributors authors") ||
      element.querySelector("authors");
    if (authorsContainer) {
      const authorElements = authorsContainer.querySelectorAll("author");
      if (authorElements.length > 0) {
        const authorNames = Array.from(authorElements)
          .map((author) => {
            // EndNote wraps text in <style> tags
            const styleContent = author.querySelector("style");
            return styleContent
              ? styleContent.textContent?.trim()
              : author.textContent?.trim();
          })
          .filter((name) => name);

        if (authorNames.length > 0) {
          return authorNames.join(" and ");
        }
      }
    }

    // Fallback to general selectors
    const authorSelectors = [
      "author, Author, authors, Authors",
      "creator, Creator",
      'contributor[type="author"]',
      '*[name="author"], *[field="author"]',
    ];

    for (const selector of authorSelectors) {
      const authors = element.querySelectorAll(selector);
      if (authors.length > 0) {
        const authorNames = Array.from(authors)
          .map((author) => {
            const styleContent = author.querySelector("style");
            return styleContent
              ? styleContent.textContent?.trim()
              : author.textContent?.trim();
          })
          .filter((name) => name);

        if (authorNames.length > 0) {
          return authorNames.join(" and ");
        }
      }
    }

    // Try single author field
    const singleAuthor = this.extractText(
      element,
      "author, Author, creator, Creator"
    );
    if (singleAuthor) {
      // Split on common delimiters and rejoin with ' and '
      return singleAuthor
        .split(/[,;]|\band\b/)
        .map((name) => name.trim())
        .filter((name) => name)
        .join(" and ");
    }

    return "";
  }

  private extractYear(element: Element): string {
    const yearText = this.extractText(
      element,
      "year, Year, date, Date, published, publication-date"
    );

    if (yearText) {
      // Extract 4-digit year from date string
      const yearMatch = yearText.match(/\b(19|20)\d{2}\b/);
      if (yearMatch) {
        return yearMatch[0];
      }
    }

    return "";
  }

  private extractPages(element: Element): string {
    const pages = this.extractText(
      element,
      "pages, Pages, page, Page, page-range"
    );

    if (pages) {
      // Normalize page ranges (e.g., "123-134" or "123--134")
      return pages.replace(/(\d+)-(\d+)/, "$1--$2");
    }

    return "";
  }

  private extractKeywords(element: Element): string {
    const keywords = this.extractText(
      element,
      "keywords, Keywords, keyword, subject, tags"
    );

    if (keywords) {
      // Clean and format keywords
      return keywords
        .split(/[,;]/)
        .map((kw) => kw.trim())
        .filter((kw) => kw)
        .join(", ");
    }

    return "";
  }

  private determineBibTeXType(element: Element): string {
    const typeField = this.extractText(
      element,
      "type, Type, publication-type, genre"
    );

    if (typeField) {
      const type = typeField.toLowerCase();
      if (type.includes("article") || type.includes("journal"))
        return "article";
      if (type.includes("book")) return "book";
      if (type.includes("chapter") || type.includes("inbook")) return "inbook";
      if (type.includes("conference") || type.includes("proceeding"))
        return "inproceedings";
      if (type.includes("thesis") || type.includes("dissertation"))
        return "phdthesis";
      if (type.includes("report") || type.includes("tech")) return "techreport";
      if (type.includes("manual")) return "manual";
      if (type.includes("web") || type.includes("online")) return "misc";
    }

    // Heuristic based on available fields
    const hasJournal = this.extractText(element, "journal, Journal");
    const hasBooktitle = this.extractText(
      element,
      "booktitle, book-title, container-title"
    );
    const hasPublisher = this.extractText(element, "publisher, Publisher");

    if (hasJournal) return "article";
    if (hasBooktitle) return "inproceedings";
    if (hasPublisher) return "book";

    return "misc";
  }

  private generateBibTeXKey(element: Element, refNumber: number): string {
    const author = this.extractAuthors(element);
    const year = this.extractYear(element);
    const title = this.extractText(element, "title, Title");

    let key = "";

    if (author) {
      // Extract first author's last name
      const firstAuthor = author.split(" and ")[0].trim();
      const nameParts = firstAuthor.split(/\s+/);
      key += nameParts[nameParts.length - 1]
        .toLowerCase()
        .replace(/[^a-z]/g, "");
    }

    if (year) {
      key += year;
    }

    if (title && key.length < 10) {
      // Add first significant word from title
      const titleWords = title
        .split(/\s+/)
        .filter(
          (word) =>
            word.length > 3 &&
            !/^(the|and|or|of|in|on|at|to|for|with|by)$/i.test(word)
        );
      if (titleWords.length > 0) {
        key += titleWords[0]
          .toLowerCase()
          .replace(/[^a-z]/g, "")
          .substring(0, 6);
      }
    }

    // Fallback to reference number if key is too short
    if (key.length < 3) {
      key = `ref${refNumber}`;
    }

    return key;
  }

  private convertToBibTeX(
    references: any[],
    options: ConversionOptions
  ): string {
    if (references.length === 0) {
      return "% No references found to convert";
    }

    const bibtexEntries = references.map((ref) => {
      let entry = `@${ref.type}{${ref.id}`;

      // Apply citation style specific formatting
      const formattedRef = this.applyCitationStyle(ref, options);

      // Core fields in preferred order (varies by style)
      const fieldOrder = this.getFieldOrder(options.citationStyle);

      fieldOrder.forEach((field) => {
        if (formattedRef[field]) {
          const fieldValue = options.escapeLatex
            ? this.escapeLatexCharacters(formattedRef[field])
            : formattedRef[field];
          entry += `,\n  ${field} = {${fieldValue}}`;
        }
      });

      // Add optional fields based on options
      if (options.includeAbstract && formattedRef.abstract) {
        const abstractValue = options.escapeLatex
          ? this.escapeLatexCharacters(formattedRef.abstract)
          : formattedRef.abstract;
        entry += `,\n  abstract = {${abstractValue}}`;
      }

      if (options.includeKeywords && formattedRef.keywords) {
        const keywordsValue = options.escapeLatex
          ? this.escapeLatexCharacters(formattedRef.keywords)
          : formattedRef.keywords;
        entry += `,\n  keywords = {${keywordsValue}}`;
      }

      if (options.includeNotes && formattedRef.note) {
        const noteValue = options.escapeLatex
          ? this.escapeLatexCharacters(formattedRef.note)
          : formattedRef.note;
        entry += `,\n  note = {${noteValue}}`;
      }

      // Add custom fields
      if (options.customFields && Array.isArray(options.customFields)) {
        options.customFields.forEach((field) => {
          const fieldName = field.toLowerCase();
          if (formattedRef[fieldName]) {
            const fieldValue = options.escapeLatex
              ? this.escapeLatexCharacters(formattedRef[fieldName])
              : formattedRef[fieldName];
            entry += `,\n  ${fieldName} = {${fieldValue}}`;
          }
        });
      }

      entry += "\n}";
      return entry;
    });

    const header = this.generateStyleHeader(
      options.citationStyle,
      references.length
    );
    return header + bibtexEntries.join("\n\n") + "\n";
  }

  /**
   * Apply citation style specific formatting
   */
  private applyCitationStyle(ref: any, options: ConversionOptions): any {
    const styledRef = { ...ref };

    switch (options.citationStyle) {
      case "acm":
        // ACM style specific formatting
        if (styledRef.journal) {
          styledRef.journal = `ACM ${styledRef.journal}`;
        }
        if (styledRef.booktitle) {
          styledRef.booktitle = `Proceedings of ${styledRef.booktitle}`;
        }
        break;

      case "ieee":
        // IEEE style specific formatting
        if (styledRef.journal && !styledRef.journal.includes("IEEE")) {
          styledRef.journal = `IEEE ${styledRef.journal}`;
        }
        break;

      case "biblatex":
        // BibLaTeX uses different field names
        if (styledRef.journal) {
          styledRef.journaltitle = styledRef.journal;
          delete styledRef.journal;
        }
        if (styledRef.pages && styledRef.pages.includes("--")) {
          const [start, end] = styledRef.pages.split("--");
          styledRef.pages = start.trim();
          styledRef.endpages = end.trim();
        }
        break;

      case "apa":
      case "harvard":
      case "chicago":
        // These styles mainly differ in citation format, not BibTeX fields
        // The actual formatting is handled by the LaTeX style files
        break;

      default:
        // Standard BibTeX format - no changes needed
        break;
    }

    return styledRef;
  }

  /**
   * Get field order based on citation style
   */
  private getFieldOrder(citationStyle: string): string[] {
    const baseOrder = [
      "title",
      "author",
      "journal",
      "journaltitle", // For BibLaTeX
      "booktitle",
      "year",
      "volume",
      "number",
      "pages",
      "endpages", // For BibLaTeX
      "publisher",
      "address",
      "doi",
      "url",
      "isbn",
      "issn",
    ];

    switch (citationStyle) {
      case "acm":
        return [
          "author",
          "title",
          "journal",
          "booktitle",
          "year",
          "volume",
          "number",
          "pages",
          "publisher",
          "doi",
          "url",
        ];

      case "ieee":
        return [
          "author",
          "title",
          "journal",
          "booktitle",
          "year",
          "volume",
          "number",
          "pages",
          "publisher",
          "doi",
        ];

      case "biblatex":
        return [
          "author",
          "title",
          "journaltitle",
          "booktitle",
          "year",
          "volume",
          "number",
          "pages",
          "endpages",
          "publisher",
          "address",
          "doi",
          "url",
          "isbn",
          "issn",
        ];

      default:
        return baseOrder;
    }
  }

  /**
   * Generate style-specific header
   */
  private generateStyleHeader(
    citationStyle: string,
    entryCount: number
  ): string {
    const timestamp = new Date().toISOString();
    const styleInfo = this.getStyleInfo(citationStyle);

    return `% BibTeX file generated by EKD Digital Reference Converter
% Generated on ${timestamp}
% Citation Style: ${styleInfo}
% ${entryCount} references converted

`;
  }

  /**
   * Get style description
   */
  private getStyleInfo(citationStyle: string): string {
    const styles: { [key: string]: string } = {
      standard: "Standard BibTeX",
      acm: "ACM Style (Association for Computing Machinery)",
      ieee: "IEEE Style (Institute of Electrical and Electronics Engineers)",
      biblatex: "BibLaTeX Format",
      apa: "APA Style (American Psychological Association)",
      harvard: "Harvard Style",
      chicago: "Chicago Style",
    };

    return styles[citationStyle] || "Standard BibTeX";
  }

  /**
   * Escape LaTeX special characters
   */
  private escapeLatexCharacters(text: string): string {
    if (!text) return text;

    const escapeMap: { [key: string]: string } = {
      "&": "\\&",
      "%": "\\%",
      $: "\\$",
      "#": "\\#",
      _: "\\_",
      "{": "\\{",
      "}": "\\}",
      "~": "\\textasciitilde{}",
      "^": "\\textasciicircum{}",
      "\\": "\\textbackslash{}",
    };

    return text.replace(/[&%$#_{}~^\\]/g, (char) => escapeMap[char] || char);
  }
}

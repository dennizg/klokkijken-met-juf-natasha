/**
 * Parses a simple CSV string into an array of objects or arrays.
 * Assumes a header row exists.
 * Handles quoted fields with commas.
 * 
 * @param {string} csvText The raw CSV string.
 * @returns {Array<{text: string, imageId: string}>} Array of parsed data objects.
 */
export const parseFeedbackCSV = (csvText) => {
    const lines = csvText.trim().split('\n');
    const result = [];

    // Skip header (start at i = 1)
    for (let i = 1; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;

        // Simple regex to split by comma, respecting quotes
        // Matches: "quoted string" OR non-comma-sequence
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);

        // Fallback for simpler split if regex fails or complicates - but we have quoted strings in the file.
        // Let's use a robust manual parse for just 2 columns to be safe.

        const row = [];
        let inQuote = false;
        let start = 0;

        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
                inQuote = !inQuote;
            } else if (char === ',' && !inQuote) {
                row.push(line.substring(start, j).trim().replace(/^"|"$/g, ''));
                start = j + 1;
            }
        }
        // Last field
        row.push(line.substring(start).trim().replace(/^"|"$/g, ''));

        if (row.length >= 2) {
            result.push({
                text: row[0],
                imageId: row[1]
            });
        }
    }
    return result;
};

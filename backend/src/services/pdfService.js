const PDFParser = require("pdf2json");

/**
 * Cleanly extracts raw text from a PDF buffer using pdf2json.
 * @param {Buffer} buffer - The PDF file buffer
 * @returns {Promise<string>} - The extracted text
*/

async function parsePDF(buffer) {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(this, 1); // 1 = Text content only

        pdfParser.on("pdfParser_dataError", (errData) => {
            console.error("PDF2JSON Error:", errData.parserError);
            reject(errData.parserError);
        });

        pdfParser.on("pdfParser_dataReady", (pdfData) => {
            try {
                // pdf2json returns a huge JSON object. We need to crawl it to get the text.
                // It breaks content into "Pages" -> "Texts" -> "R" (runs) -> "T" (text).
                // The text is URI encoded (e.g., "Hello%20World"), so we decode it.
                
                const rawText = pdfData.Pages.map(page => {
                    return page.Texts.map(textItem => {
                        return decodeURIComponent(textItem.R[0].T);
                    }).join(" ");
                }).join("\n\n");

                resolve(rawText);
            } catch (err) {
                reject(err);
            }
        });

        // Execute the parse
        pdfParser.parseBuffer(buffer);
    });
}

module.exports = { parsePDF };
const fs = require('fs');
const { extractData } = require('../services/aiServices'); 
const { evaluateClaim } = require('../services/ruleEngine');
const { parsePDF } = require('../services/pdfService');

exports.processClaim = async (req, res) => {
    // 1. Validation
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    try {
        let rawText = "";
        console.log(`Processing File: ${req.file.originalname}`);

        // 2. Ingestion Strategy
        if (req.file.mimetype === 'application/pdf') {
            console.log("📄 Detected PDF. Using pdf2json parser...");
            const buffer = fs.readFileSync(req.file.path);
            
            // Clean, awaitable call. No hacks. No version checks.
            rawText = await parsePDF(buffer);
            
            console.log("✅ PDF Parsed Successfully");
        
        } else {
            console.log("📄 Detected Text File.");
            rawText = fs.readFileSync(req.file.path, 'utf8');
        }

        // 3. Extraction (AI Service)
        const extractedFields = await extractData(rawText, req.file.originalname);

        // 4. Logic (Rule Engine)
        const decision = evaluateClaim(extractedFields);

        // 5. Cleanup
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        // 6. Response
        res.json({ extractedFields, ...decision });

    } catch (error) {
        console.error("Controller Error:", error);
        
        // Cleanup on error
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        
        res.status(500).json({ 
            error: "Processing failed.", 
            details: error.message 
        });
    }
};
const Groq = require("groq-sdk");
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function extractData(rawText, filename = "Unknown File") {
    console.log(`AI Service: Analyzing ${filename}...`);

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are an expert insurance assistant. Extract data into valid JSON.
                    
                    CRITICAL EXTRACTION RULES:
                    1. 'incidentDescription': DO NOT SUMMARIZE. Extract the full narrative verbatim. 
                       - YOU MUST include any sentences mentioning: fraud, staged, inconsistent, suspicious, injury, pain, medical, hospital, police, ambulance.
                    2. 'claimType': MANDATORY. If not explicitly stated, INFER it. 
                       - If text mentions "neck pain", "back pain", "hospital", set to "Bodily Injury".
                       - If text mentions "staged", "fraud", set to "Suspicious".
                       - If unsure, set to "Collision".
                    3. 'estimatedDamage': Extract ONLY the number (e.g., 25000). Remove '$' and commas.
                    4. 'incidentDate': Look for "Date of Loss", "Incident Date".
                    5. 'policyNumber': Look for "Policy Number".

                    STRICT VALIDATION:
                    - If the document is NOT an insurance claim (e.g., random code, marketing), return all fields as null.

                    REQUIRED JSON STRUCTURE:
                    {
                        "policyNumber": "string or null",
                        "policyHolderName": "string or null",
                        "incidentDate": "string or null",
                        "incidentDescription": "string or null", // Include RED FLAGS here
                        "claimType": "string", 
                        "estimatedDamage": number or null,
                        "incidentLocation": "string or null",
                        "claimantName": "string or null",
                        "assetId": "string or null"
                    }`
                },
                {
                    role: "user",
                    content: `DOCUMENT CONTENT:\n${rawText.substring(0, 15000)}`
                }
            ],
            model: "llama-3.3-70b-versatile", 
            temperature: 0.0, // Zero temperature for maximum precision
            response_format: { type: "json_object" }
        });

        const aiText = completion.choices[0]?.message?.content || "{}";
        const parsedData = JSON.parse(aiText);

        console.log("AI Extracted - Type:", parsedData.claimType, "| Damage:", parsedData.estimatedDamage);
        return parsedData;

    } catch (error) {
        console.warn("AI Service Failed:", error.message);
        return getEmptyFields();
    }
}

function getEmptyFields() {
    return {
        policyNumber: null, policyHolderName: null, incidentDate: null,
        incidentDescription: null, claimType: null, estimatedDamage: null,
        incidentLocation: null, claimantName: null, assetId: null
    };
}

module.exports = { extractData };
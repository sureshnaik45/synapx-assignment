# Synapx Autonomous FNOL Agent

> **A full-stack autonomous AI agent designed to streamline the First Notice of Loss (FNOL) process for insurance claims.**

The system intelligently extracts data from PDF/txt files, validates mandatory fields, checks for fraud indicators, and routes claims to the appropriate workflow queue using a deterministic Rule Engine.

## System Architecture, Workflow & Features

The application follows a linear, deterministic flow to ensure security and accuracy:

1.  **Ingestion:** User uploads a document (PDF/TXT) via the React Frontend.
2.  **Secure Transmission:** File is sent to the Node.js/Express backend via a secure API endpoint.
3.  **Gatekeeper Check:** The system instantly validates the file type and rejects non-insurance documents.
4.  **Extraction:**
    * **Text Analysis:** Raw text is extracted using `pdf2json` or native `fs`.
    * **AI-Powered Extraction:** The text is sent to **Llama 3.3 (Groq)** with a strict system prompt to extract 15+ fields verbatim.
5.  **Logic Engine:** The **Rule Engine** evaluates the extracted data against business rules (Fraud limits, Injury checks, Damage thresholds).
6.  **Response:** The final decision (Route + Reasoning) is returned to the Frontend for display.

[User Upload] 
      ⬇
[React Frontend] --(API Request)--> [Express Backend]
                                          ⬇
                                  [Gatekeeper Validation]
                                          ⬇
                                  [AI Service (Llama 3)]
                                          ⬇
                                  [Rule Engine Logic]
                                          ⬇
                            [Final Decision JSON] --> [Frontend Display]


7. * **Intelligent Routing Engine**
    * **Fast-Track :** Auto-approves clean claims under $25,000.
    * **Investigation :** Flags claims with suspicious keywords ("staged", "fraud", "inconsistent").
    * **Specialist :** Routes bodily injury claims to medical specialists.
    * **Standard Processing :** Handles high-value claims (>$25k) for senior adjusters.
    * **Manual Review :** Catches claims with missing mandatory data.

8. * **Robust Fault Tolerance**
    Implements a **"Smart Fallback"** strategy. If the primary PDF parser (`pdf2json`) encounters a corrupted file (e.g., non-standard XRef headers from web converters) or if the AI API is unreachable, the system automatically switches to a backup logic flow to ensure zero downtime during demonstrations.

9. * **Responsive Frontend**
    A modern, mobile-friendly React interface with real-time status feedback and visual cues for claim recommendations.

10. * **Deployment Ready**
    Configured for serverless deployment (Vercel) with cross-platform file handling.
* **Sample files**
    Download the sample files present in samplefiles folder and test them.
* **Live Link**
    https://synapx-assignment1.vercel.app

## Tech Stack


| Component | Technology |
| :--- | :--- |
| **Frontend** | React (Vite), CSS3 (Responsive Grid), Axios |
| **Backend** | Node.js, Express.js |
| **AI Model** | Llama-3.3-70b-versatile (via Groq SDK) |
| **Parsing** | `pdf2json` (Primary), Native Node `fs` (Text), Custom Fallback Logic |
| **Tools** | Multer (File Uploads), Vercel |

## Project Structure

```bash
synapx-assignment/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── claimController.js  # Orchestrates parsing, AI, and rules
│   │   ├── services/
│   │   │   ├── aiServices.js       # Groq API integration
│   │   │   ├── pdfService.js       # pdf2json implementation
│   │   │   └── ruleEngine.js       # Business logic for routing claims
│   │   └── server.js               # Entry point & Route definitions
│   ├── package.json
│   └── vercel.json                 # Deployment configuration
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ResultCard.jsx      # Displays extraction results & decision
│   │   │   └── UploadForm.jsx      # Handles file selection & submission
│   │   ├── App.jsx                 # Main layout & state management
│   │   ├── App.css                 # Component styling
│   │   ├── index.css               # Global resets & typography
│   │   └── main.jsx                # React DOM entry
│   ├── package.json
│   └── vite.config.js              # Proxy configuration for development
│
└── README.md
````

## Getting Started

### Prerequisites

  * **Node.js** (v18 or higher recommended)
  * A **Groq API Key** (Free tier works)

### 1\. Backend Setup

1.  Navigate to the backend folder:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `backend` folder:
    ```env
    PORT=5000
    GROQ_API_KEY=gsk_your_actual_api_key_here
    ```
4.  Start the server:
    ```bash
    node src/server.js
    ```
    > *Terminal should show:* `Server running on port 5000`

### 2\. Frontend Setup

1.  Open a new terminal and navigate to the frontend folder:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open the link provided (usually `http://localhost:5173`) in your browser.

-----

## Business Logic (The Rule Engine)

The `ruleEngine.js` service evaluates extracted data based on the following hierarchy (**Highest Priority first**):

1.  **Priority 1:** **Investigation Flag**
      * *Trigger:* Description contains "fraud", "staged", "suspicious".
2.  **Priority 2:** **Manual Review**
      * *Trigger:* Any mandatory field (Policy \#, Name, Date, Description, Damage) is null/missing.
3.  **Priority 3:** **Specialist Queue**
      * *Trigger:* `claimType` is "Bodily Injury" or description mentions medical terms.
4.  **Priority 4:** **Standard Processing**
      * *Trigger:* `estimatedDamage` \>= $25,000.
5.  **Priority 5:** **Fast-Track**
      * *Trigger:* `estimatedDamage` \< $25,000 AND no other flags are present.

-----

## API Documentation

### `POST /api/claims/upload`

  * **Description:** Uploads a file for FNOL processing.
  * **Body:** `multipart/form-data` with a key `file`.
  * **Supported Formats:** `.pdf`, `.txt`

** Sample Response: **

```text
RecommendedRoute
Reasoning
Mandatory fields are missing: estimatedDamage
⚠️ Missing: estimatedDamage
```json
{
  "extractedFields": {
    "policyNumber": "AUTO-2024-123",
    "policyHolderName": "John Doe",
    "incidentDate": "2024-12-01",
    "incidentDescription": "Rear-ended at a stop light.",
    "claimType": "Collision",
    "estimatedDamage": 1500
  }
}
```

-----

## Known Limitations

  * **PDF Parsing:** The current `pdf2json` implementation is optimized for standard ACORD forms and text-based PDFs. Some PDF files generated via web converters may contain non-standard XRef stream headers. The system handles these gracefully via the fallback mechanism, but for production, integration with enterprise OCR (AWS Textract/Google Document AI) is recommended.

-----

## Contribution

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.
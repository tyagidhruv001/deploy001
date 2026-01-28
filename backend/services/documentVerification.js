const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Sleep utility for retry delays
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry wrapper with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            const isRetryable = error.message?.includes('503') ||
                error.message?.includes('overloaded') ||
                error.message?.includes('Service Unavailable');

            if (isRetryable && attempt < maxRetries) {
                const delay = baseDelay * Math.pow(2, attempt - 1); // 1s, 2s, 4s
                console.log(`Gemini API overloaded, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})...`);
                await sleep(delay);
            } else {
                throw error;
            }
        }
    }
}

/**
 * Verify document using Gemini AI Vision
 * @param {string} imageBase64 - Base64 encoded image
 * @param {string} documentType - Type of document (aadhaar, pan, driving_license, etc.)
 * @returns {Promise<Object>} Verification result
 */
async function verifyDocument(imageBase64, documentType) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are an expert document verification AI. Analyze this ${documentType} document carefully and provide a detailed verification report.

IMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, just raw JSON.

Analyze the document for:
1. **Authenticity**: Is this a genuine ${documentType}? Check for signs of tampering, forgery, or digital manipulation.
2. **Data Extraction**: Extract all visible text and key information fields.
3. **Quality Assessment**: Evaluate image quality, clarity, completeness (all corners visible, not cropped).
4. **Compliance**: Check if the document meets standard format requirements.

Provide your response in this EXACT JSON format:
{
  "isValid": boolean,
  "confidenceScore": number (0-100),
  "documentType": "${documentType}",
  "extractedData": {
    "name": "extracted name or null",
    "idNumber": "extracted ID number or null",
    "dateOfBirth": "extracted DOB or null",
    "address": "extracted address or null",
    "issueDate": "extracted issue date or null",
    "expiryDate": "extracted expiry date or null",
    "otherFields": {}
  },
  "qualityAssessment": {
    "imageClarity": "excellent/good/fair/poor",
    "completeness": "complete/partial/incomplete",
    "lighting": "good/acceptable/poor",
    "resolution": "high/medium/low"
  },
  "securityChecks": {
    "tamperingDetected": boolean,
    "digitalManipulation": boolean,
    "suspiciousPatterns": boolean,
    "hologramsVisible": boolean or null
  },
  "issues": ["array of issues found, empty if none"],
  "recommendations": ["array of recommendations"],
  "verificationTimestamp": "${new Date().toISOString()}"
}`;

        // Use retry wrapper for the API call
        const result = await retryWithBackoff(async () => {
            return await model.generateContent([
                prompt,
                {
                    inlineData: {
                        mimeType: imageBase64.startsWith('/9j') ? "image/jpeg" : "image/png",
                        data: imageBase64
                    }
                }
            ]);
        }, 3, 2000); // 3 retries with 2s base delay

        const responseText = result.response.text();

        // Clean up response - remove markdown code blocks if present
        let cleanedResponse = responseText.trim();
        if (cleanedResponse.startsWith('```json')) {
            cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (cleanedResponse.startsWith('```')) {
            cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
        }

        const verificationResult = JSON.parse(cleanedResponse);

        return {
            success: true,
            data: verificationResult
        };

    } catch (error) {
        console.error('Document verification error:', error);

        // Provide a more helpful error message for 503 errors
        const errorMessage = error.message?.includes('503') || error.message?.includes('overloaded')
            ? 'AI service is temporarily overloaded. Please try again in a few minutes.'
            : error.message;

        return {
            success: false,
            error: errorMessage,
            data: {
                isValid: false,
                confidenceScore: 0,
                issues: ['Verification failed: ' + errorMessage]
            }
        };
    }
}

/**
 * Verify multiple documents in batch
 * @param {Array} documents - Array of {imageBase64, documentType}
 * @returns {Promise<Array>} Array of verification results
 */
async function verifyDocumentsBatch(documents) {
    const results = await Promise.all(
        documents.map(doc => verifyDocument(doc.imageBase64, doc.documentType))
    );
    return results;
}

/**
 * Compare extracted data with user-provided data
 * @param {Object} extractedData - Data extracted from document
 * @param {Object} userProvidedData - Data provided by user
 * @returns {Object} Comparison result
 */
function compareDocumentData(extractedData, userProvidedData) {
    const mismatches = [];
    const matches = [];

    const fieldsToCompare = ['name', 'idNumber', 'dateOfBirth', 'address'];

    fieldsToCompare.forEach(field => {
        if (extractedData[field] && userProvidedData[field]) {
            const extracted = extractedData[field].toLowerCase().trim();
            const provided = userProvidedData[field].toLowerCase().trim();

            if (extracted === provided) {
                matches.push(field);
            } else {
                // Check for partial match (useful for names and addresses)
                const similarity = calculateSimilarity(extracted, provided);
                if (similarity > 0.8) {
                    matches.push(field);
                } else {
                    mismatches.push({
                        field,
                        extracted: extractedData[field],
                        provided: userProvidedData[field],
                        similarity
                    });
                }
            }
        }
    });

    return {
        isMatch: mismatches.length === 0,
        matchedFields: matches,
        mismatches,
        matchPercentage: (matches.length / fieldsToCompare.length) * 100
    };
}

/**
 * Calculate similarity between two strings (simple Levenshtein-based)
 */
function calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[str2.length][str1.length];
}

module.exports = {
    verifyDocument,
    verifyDocumentsBatch,
    compareDocumentData
};

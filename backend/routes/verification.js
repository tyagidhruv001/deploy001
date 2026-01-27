const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { verifyDocument, verifyDocumentsBatch, compareDocumentData } = require('../services/documentVerification');

/**
 * POST /api/verification/verify
 * Verify a single document with AUTOMATIC approval/denial
 * Body: { imageBase64, documentType, userId, userProvidedData? }
 */
router.post('/verify', async (req, res) => {
    try {
        const { imageBase64, documentType, userId, userProvidedData } = req.body;

        if (!imageBase64 || !documentType || !userId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: imageBase64, documentType, userId'
            });
        }

        // Verify the document using AI
        const verificationResult = await verifyDocument(imageBase64, documentType);

        if (!verificationResult.success) {
            return res.status(500).json(verificationResult);
        }

        // If user provided data, compare it with extracted data
        let comparisonResult = null;
        if (userProvidedData && verificationResult.data.extractedData) {
            comparisonResult = compareDocumentData(
                verificationResult.data.extractedData,
                userProvidedData
            );
        }

        // AUTOMATIC DECISION LOGIC
        const { isValid, confidenceScore, securityChecks, issues } = verificationResult.data;

        // Determine automatic approval/rejection
        let finalStatus = 'rejected';
        let rejectionReason = null;
        let canProceed = false;

        // Approval criteria:
        // 1. Document must be valid according to AI
        // 2. Confidence score must be >= 70%
        // 3. No tampering or manipulation detected
        // 4. No critical security issues
        if (isValid && confidenceScore >= 70) {
            if (!securityChecks?.tamperingDetected && !securityChecks?.digitalManipulation) {
                finalStatus = 'verified';
                canProceed = true;
            } else {
                rejectionReason = 'Security issues detected: Document appears to be tampered or digitally manipulated';
            }
        } else if (!isValid) {
            rejectionReason = 'Document validation failed: ' + (issues?.join(', ') || 'Invalid document');
        } else if (confidenceScore < 70) {
            rejectionReason = `Low confidence score (${confidenceScore}%). Please upload a clearer image`;
        }

        // Store verification result in Firestore
        const verificationDoc = {
            userId,
            documentType,
            verificationResult: verificationResult.data,
            comparisonResult,
            timestamp: new Date().toISOString(),
            status: finalStatus,
            rejectionReason,
            autoApproved: finalStatus === 'verified',
            autoRejected: finalStatus === 'rejected'
        };

        const docRef = await db.collection('documentVerifications').add(verificationDoc);

        // Update user's verification status (use set with merge to handle test users)
        await db.collection('users').doc(userId).set({
            verifications: {
                [documentType]: {
                    verified: finalStatus === 'verified',
                    verificationId: docRef.id,
                    timestamp: new Date().toISOString(),
                    confidenceScore: verificationResult.data.confidenceScore,
                    status: finalStatus,
                    canProceed
                }
            }
        }, { merge: true });

        res.json({
            success: true,
            verificationId: docRef.id,
            result: verificationResult.data,
            comparison: comparisonResult,
            finalStatus,
            canProceed,
            rejectionReason
        });

    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/verification/verify-batch
 * Verify multiple documents at once
 * Body: { documents: [{imageBase64, documentType}], userId }
 */
router.post('/verify-batch', async (req, res) => {
    try {
        const { documents, userId } = req.body;

        if (!documents || !Array.isArray(documents) || !userId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: documents (array), userId'
            });
        }

        const results = await verifyDocumentsBatch(documents);

        // Store all results
        const verificationDocs = results.map((result, index) => ({
            userId,
            documentType: documents[index].documentType,
            verificationResult: result.data,
            timestamp: new Date().toISOString(),
            status: result.data.isValid ? 'verified' : 'rejected'
        }));

        const batch = db.batch();
        const verificationIds = [];

        for (const doc of verificationDocs) {
            const docRef = db.collection('documentVerifications').doc();
            batch.set(docRef, doc);
            verificationIds.push(docRef.id);
        }

        await batch.commit();

        res.json({
            success: true,
            verificationIds,
            results: results.map(r => r.data)
        });

    } catch (error) {
        console.error('Batch verification error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/verification/status/:userId
 * Get verification status for a user
 */
router.get('/status/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const userData = userDoc.data();
        const verifications = userData.verifications || {};

        res.json({
            success: true,
            verifications
        });

    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/verification/history/:userId
 * Get verification history for a user
 */
router.get('/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 10 } = req.query;

        const snapshot = await db.collection('documentVerifications')
            .where('userId', '==', userId)
            .orderBy('timestamp', 'desc')
            .limit(parseInt(limit))
            .get();

        const history = [];
        snapshot.forEach(doc => {
            history.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.json({
            success: true,
            history
        });

    } catch (error) {
        console.error('History fetch error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/verification/resubmit
 * Resubmit a document for verification
 */
router.post('/resubmit', async (req, res) => {
    try {
        const { verificationId, imageBase64, documentType, userId } = req.body;

        if (!verificationId || !imageBase64 || !documentType || !userId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Mark old verification as superseded
        await db.collection('documentVerifications').doc(verificationId).update({
            status: 'superseded',
            supersededAt: new Date().toISOString()
        });

        // Verify new document
        const verificationResult = await verifyDocument(imageBase64, documentType);

        if (!verificationResult.success) {
            return res.status(500).json(verificationResult);
        }

        // Store new verification
        const verificationDoc = {
            userId,
            documentType,
            verificationResult: verificationResult.data,
            timestamp: new Date().toISOString(),
            status: verificationResult.data.isValid ? 'verified' : 'rejected',
            previousVerificationId: verificationId
        };

        const docRef = await db.collection('documentVerifications').add(verificationDoc);

        res.json({
            success: true,
            verificationId: docRef.id,
            result: verificationResult.data
        });

    } catch (error) {
        console.error('Resubmit error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/verification/pending
 * Get all pending verifications (for admin review)
 */
router.get('/pending', async (req, res) => {
    try {
        const snapshot = await db.collection('documentVerifications')
            .where('status', '==', 'pending')
            .orderBy('timestamp', 'desc')
            .get();

        const pending = [];
        snapshot.forEach(doc => {
            pending.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.json({
            success: true,
            pending
        });

    } catch (error) {
        console.error('Pending fetch error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;

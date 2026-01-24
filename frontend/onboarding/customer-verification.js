import { auth, db } from '../config.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const API_BASE_URL = 'http://localhost:5000/api';

class CustomerVerificationFlow {
    constructor() {
        this.customerData = {};
        this.verificationResult = null;
        this.imageBase64 = null;
        this.isVerified = false;

        this.initializeElements();
        this.initializeEventListeners();
    }

    initializeElements() {
        this.basicInfoForm = document.getElementById('customerBasicInfoForm');
        this.verificationSection = document.getElementById('verificationSection');
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.documentTypeSelect = document.getElementById('documentType');
        this.previewArea = document.getElementById('previewArea');
        this.previewImage = document.getElementById('previewImage');
        this.removeImageBtn = document.getElementById('removeImageBtn');
        this.verifyBtn = document.getElementById('verifyBtn');
        this.resultsArea = document.getElementById('resultsArea');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.skipVerificationBtn = document.getElementById('skipVerification');
    }

    initializeEventListeners() {
        // Basic info form
        this.basicInfoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleBasicInfoSubmit();
        });

        // Document upload
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files[0]));

        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('drag-over');
        });
        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('drag-over');
        });
        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('drag-over');
            this.handleFileSelect(e.dataTransfer.files[0]);
        });

        this.removeImageBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.resetUpload();
        });

        this.verifyBtn.addEventListener('click', () => this.verifyDocument());
        this.skipVerificationBtn.addEventListener('click', () => this.completeOnboarding());
    }

    handleBasicInfoSubmit() {
        this.customerData = {
            location: document.getElementById('location').value,
            address: document.getElementById('address').value,
            pincode: document.getElementById('pincode').value,
            role: 'customer'
        };

        // Show verification section
        this.basicInfoForm.style.display = 'none';
        this.verificationSection.style.display = 'block';
    }

    handleFileSelect(file) {
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            alert('Please upload a valid image file (JPG, PNG)');
            return;
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('File size must be less than 5MB');
            return;
        }

        this.convertToBase64(file);
    }

    convertToBase64(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.imageBase64 = e.target.result.split(',')[1];
            this.previewImage.src = e.target.result;
            this.previewArea.classList.add('active');
            this.resultsArea.classList.remove('active');
        };
        reader.readAsDataURL(file);
    }

    resetUpload() {
        this.imageBase64 = null;
        this.fileInput.value = '';
        this.previewArea.classList.remove('active');
        this.resultsArea.classList.remove('active');
    }

    async verifyDocument() {
        const documentType = this.documentTypeSelect.value;

        if (!documentType) {
            alert('Please select a document type');
            return;
        }

        if (!this.imageBase64) {
            alert('Please upload a document first');
            return;
        }

        // ULTIMATE SESSION FALLBACK
        let userId = auth.currentUser ? auth.currentUser.uid : null;
        let storageUser = null;

        if (!userId) {
            // 1. Check known keys
            const storageUserStr = sessionStorage.getItem('karyasetu_user') || localStorage.getItem('karyasetu_user');
            if (storageUserStr) {
                try {
                    storageUser = JSON.parse(storageUserStr);
                    userId = storageUser.uid || storageUser.id || storageUser.userId;
                } catch (e) { console.error('Parse error', e); }
            }
        }

        if (!userId) {
            // 2. Exhaustive Search
            const allStorage = { ...sessionStorage, ...localStorage };
            for (const key in allStorage) {
                try {
                    const val = JSON.parse(allStorage[key]);
                    if (val && (val.uid || val.id || val.userId)) {
                        userId = val.uid || val.id || val.userId;
                        storageUser = val;
                        console.log(`Found session in key: ${key}`);
                        break;
                    }
                } catch (e) { }
            }
        }

        if (!userId) {
            // 3. Guest Fallback (Prevent blocking the user)
            console.warn('No session found. Using Guest ID.');
            userId = 'guest_' + Math.random().toString(36).substr(2, 9);
            storageUser = { name: 'Guest User', email: 'guest@example.com' };
        }

        try {
            this.loadingOverlay.classList.add('active');
            this.verifyBtn.classList.add('loading');
            this.verifyBtn.disabled = true;

            const response = await fetch(`${API_BASE_URL}/verification/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageBase64: this.imageBase64,
                    documentType: documentType,
                    userId: userId,
                    userProvidedData: {
                        name: auth.currentUser ? auth.currentUser.displayName : (storageUser ? storageUser.name : ''),
                        address: this.customerData ? this.customerData.address : ''
                    }
                })
            });

            const result = await response.json();

            this.loadingOverlay.classList.remove('active');
            this.verifyBtn.classList.remove('loading');
            this.verifyBtn.disabled = false;

            if (result.success) {
                this.verificationResult = result.result;
                this.isVerified = result.canProceed;
                this.canProceed = result.canProceed;
                this.rejectionReason = result.rejectionReason;
                this.displayResults(result);
            } else {
                alert('Verification failed: ' + result.error);
            }

        } catch (error) {
            console.error('Verification error:', error);
            this.loadingOverlay.classList.remove('active');
            this.verifyBtn.classList.remove('loading');
            this.verifyBtn.disabled = false;
            alert('An error occurred during verification. Please try again.');
        }
    }

    displayResults(apiResult) {
        const { result, canProceed, rejectionReason } = apiResult;
        const { isValid, confidenceScore, extractedData, issues } = result;

        let resultClass = canProceed ? 'success' : 'error';
        let statusIcon = canProceed ? 'fa-check-circle' : 'fa-times-circle';
        let statusText = canProceed ? '✅ Verified - Priority Booking Enabled' : '❌ Verification Failed';

        const html = `
            <div class="result-card ${resultClass}">
                <div class="result-header">
                    <div class="result-status">
                        <i class="fas ${statusIcon}"></i>
                        <span>${statusText}</span>
                    </div>
                    <div class="confidence-score">
                        AI Confidence: ${confidenceScore}%
                    </div>
                </div>

                ${canProceed ? `
                <div class="result-section">
                    <h4 style="color: #38a169;"><i class="fas fa-star"></i> Verification Benefits</h4>
                    <div style="background: rgba(198, 246, 213, 0.5); padding: 1rem; border-radius: 8px; color: #22543d;">
                        ✓ Priority booking access<br>
                        ✓ Verified badge on profile<br>
                        ✓ Faster service matching<br>
                        ✓ Enhanced trust from workers
                    </div>
                </div>` : ''}

                ${!canProceed && rejectionReason ? `
                <div class="result-section">
                    <h4 style="color: #e53e3e;"><i class="fas fa-info-circle"></i> Why Verification Failed</h4>
                    <div style="background: rgba(254, 215, 215, 0.5); padding: 1rem; border-radius: 8px; color: #742a2a;">
                        ${rejectionReason}
                    </div>
                    <p style="margin-top: 0.5rem; font-size: 0.9rem; color: #718096;">
                        Don't worry! You can still register and use the platform. Verification is optional for customers.
                    </p>
                </div>` : ''}

                ${extractedData && Object.keys(extractedData).some(key => extractedData[key]) ? `
                <div class="result-section">
                    <h4><i class="fas fa-database"></i> Extracted Information</h4>
                    <div class="data-grid">
                        ${extractedData.name ? `<div class="data-item"><label>Name</label><div class="value">${extractedData.name}</div></div>` : ''}
                        ${extractedData.idNumber ? `<div class="data-item"><label>ID Number</label><div class="value">${extractedData.idNumber}</div></div>` : ''}
                    </div>
                </div>` : ''}

                ${issues && issues.length > 0 ? `
                <div class="result-section">
                    <h4><i class="fas fa-exclamation-circle"></i> Issues Found</h4>
                    <ul class="issues-list">
                        ${issues.map(issue => `<li><i class="fas fa-times-circle"></i> ${issue}</li>`).join('')}
                    </ul>
                </div>` : ''}

                <div class="action-buttons">
                    ${!isValid ? `
                    <button class="btn-resubmit" onclick="customerVerification.resetUpload()">
                        <i class="fas fa-redo"></i> Upload New Document
                    </button>` : ''}
                    <button class="btn-continue" onclick="customerVerification.completeOnboarding()">
                        <i class="fas fa-arrow-right"></i> ${isValid ? 'Complete Setup' : 'Skip & Continue'}
                    </button>
                </div>
            </div>
        `;

        this.resultsArea.innerHTML = html;
        this.resultsArea.classList.add('active');
        this.skipVerificationBtn.style.display = 'none';
    }

    async completeOnboarding() {
        const storageUserStr = sessionStorage.getItem('karyasetu_user');
        const storageUser = storageUserStr ? JSON.parse(storageUserStr) : null;
        const userId = auth.currentUser ? auth.currentUser.uid : (storageUser ? storageUser.uid : null);

        if (!userId) {
            alert('Session expired. Please login again.');
            window.location.href = '../auth/login.html';
            return;
        }

        try {
            // Save customer profile to Firestore
            await setDoc(doc(db, 'customers', userId), {
                ...this.customerData,
                userId: userId,
                email: (auth.currentUser ? auth.currentUser.email : (storageUser ? storageUser.email : '')) || '',
                displayName: (auth.currentUser ? auth.currentUser.displayName : (storageUser ? storageUser.name : '')) || 'Customer',
                verified: this.isVerified,
                verificationData: this.verificationResult,
                createdAt: new Date().toISOString(),
                status: 'active'
            });

            // SYNC SESSION: Update local storage so dashboard recognizes the user
            const finalProfile = {
                ...this.customerData,
                userId: userId,
                email: (auth.currentUser ? auth.currentUser.email : (storageUser ? storageUser.email : '')) || '',
                displayName: (auth.currentUser ? auth.currentUser.displayName : (storageUser ? storageUser.name : '')) || 'Customer',
                verified: this.isVerified
            };

            sessionStorage.setItem('karyasetu_user_profile', JSON.stringify(finalProfile));
            sessionStorage.setItem('karyasetu_user_role', 'customer');

            // Ensure karyasetu_user exists and marked as loggedIn
            const currentAuth = sessionStorage.getItem('karyasetu_user');
            if (!currentAuth) {
                sessionStorage.setItem('karyasetu_user', JSON.stringify({
                    uid: userId,
                    email: finalProfile.email,
                    name: finalProfile.displayName,
                    role: 'customer',
                    loggedIn: true
                }));
            } else {
                const authObj = JSON.parse(currentAuth);
                authObj.loggedIn = true;
                sessionStorage.setItem('karyasetu_user', JSON.stringify(authObj));
            }

            alert('Profile created successfully!');
            window.location.href = '../dashboard/customer-dashboard.html';

        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Error completing onboarding. Please try again.');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.customerVerification = new CustomerVerificationFlow();
});

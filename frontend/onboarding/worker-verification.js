import { auth, db } from '../config.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isLocal ? 'http://localhost:5000/api' : window.location.origin + '/api';

class WorkerVerificationFlow {
    constructor() {
        this.currentStep = 1;
        this.workerData = {};
        this.verificationResult = null;
        this.imageBase64 = null;

        this.initializeElements();
        this.initializeEventListeners();
    }

    initializeElements() {
        // Step content
        this.stepContent1 = document.getElementById('stepContent1');
        this.stepContent2 = document.getElementById('stepContent2');
        this.stepContent3 = document.getElementById('stepContent3');

        // Step indicators
        this.step1 = document.getElementById('step1');
        this.step2 = document.getElementById('step2');
        this.step3 = document.getElementById('step3');

        // Forms and buttons
        this.basicInfoForm = document.getElementById('workerBasicInfoForm');
        this.backToStep1Btn = document.getElementById('backToStep1');
        this.completeOnboardingBtn = document.getElementById('completeOnboarding');

        // Verification elements
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.documentTypeSelect = document.getElementById('documentType');
        this.previewArea = document.getElementById('previewArea');
        this.previewImage = document.getElementById('previewImage');
        this.removeImageBtn = document.getElementById('removeImageBtn');
        this.verifyBtn = document.getElementById('verifyBtn');
        this.resultsArea = document.getElementById('resultsArea');
        this.loadingOverlay = document.getElementById('loadingOverlay');
    }

    initializeEventListeners() {
        // Step 1: Basic Info Form
        this.basicInfoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleBasicInfoSubmit();
        });

        // Step 2: Document Upload
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

        // Navigation
        this.backToStep1Btn.addEventListener('click', () => this.goToStep(1));
        this.completeOnboardingBtn.addEventListener('click', () => this.completeOnboarding());
    }

    handleBasicInfoSubmit() {
        this.workerData = {
            serviceCategory: document.getElementById('serviceCategory').value,
            experience: document.getElementById('experience').value,
            location: document.getElementById('location').value,
            address: document.getElementById('address').value,
            pincode: document.getElementById('pincode').value,
            role: 'worker'
        };

        this.goToStep(2);
    }

    goToStep(stepNumber) {
        // Hide all steps
        this.stepContent1.style.display = 'none';
        this.stepContent2.style.display = 'none';
        this.stepContent3.style.display = 'none';

        // Update step indicators
        this.step1.classList.remove('active');
        this.step2.classList.remove('active');
        this.step3.classList.remove('active');

        // Show current step
        this.currentStep = stepNumber;

        if (stepNumber === 1) {
            this.stepContent1.style.display = 'block';
            this.step1.classList.add('active');
        } else if (stepNumber === 2) {
            this.stepContent2.style.display = 'block';
            this.step2.classList.add('active');
            this.step1.classList.add('completed');
        } else if (stepNumber === 3) {
            this.stepContent3.style.display = 'block';
            this.step3.classList.add('active');
            this.step1.classList.add('completed');
            this.step2.classList.add('completed');
            this.displayProfileSummary();
        }
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
                        address: this.workerData ? this.workerData.address : ''
                    }
                })
            });

            const result = await response.json();

            this.loadingOverlay.classList.remove('active');
            this.verifyBtn.classList.remove('loading');
            this.verifyBtn.disabled = false;

            if (result.success) {
                this.verificationResult = result.result;
                this.canProceed = result.canProceed;
                this.finalStatus = result.finalStatus;
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
        const { result, canProceed, finalStatus, rejectionReason } = apiResult;
        const { isValid, confidenceScore, extractedData, issues, recommendations } = result;

        let resultClass = canProceed ? 'success' : 'error';
        let statusIcon = canProceed ? 'fa-check-circle' : 'fa-times-circle';
        let statusText = canProceed ? '✅ Verification Approved - Registration Allowed' : '❌ Verification Denied - Registration Blocked';

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

                ${!canProceed && rejectionReason ? `
                <div class="result-section">
                    <h4 style="color: #e53e3e;"><i class="fas fa-ban"></i> Rejection Reason</h4>
                    <div style="background: rgba(254, 215, 215, 0.5); padding: 1rem; border-radius: 8px; color: #742a2a; font-weight: 500;">
                        ${rejectionReason}
                    </div>
                </div>` : ''}

                ${canProceed ? `
                <div class="result-section">
                    <h4 style="color: #38a169;"><i class="fas fa-check-double"></i> Automatic Approval</h4>
                    <div style="background: rgba(198, 246, 213, 0.5); padding: 1rem; border-radius: 8px; color: #22543d; font-weight: 500;">
                        ✓ Document verified successfully by AI<br>
                        ✓ No security issues detected<br>
                        ✓ Confidence score meets requirements<br>
                        ✓ You can proceed with registration
                    </div>
                </div>` : ''}

                ${extractedData && Object.keys(extractedData).some(key => extractedData[key]) ? `
                <div class="result-section">
                    <h4><i class="fas fa-database"></i> Extracted Information</h4>
                    <div class="data-grid">
                        ${extractedData.name ? `<div class="data-item"><label>Name</label><div class="value">${extractedData.name}</div></div>` : ''}
                        ${extractedData.idNumber ? `<div class="data-item"><label>ID Number</label><div class="value">${extractedData.idNumber}</div></div>` : ''}
                        ${extractedData.dateOfBirth ? `<div class="data-item"><label>DOB</label><div class="value">${extractedData.dateOfBirth}</div></div>` : ''}
                        ${extractedData.address ? `<div class="data-item"><label>Address</label><div class="value">${extractedData.address}</div></div>` : ''}
                    </div>
                </div>` : ''}

                ${issues && issues.length > 0 ? `
                <div class="result-section">
                    <h4><i class="fas fa-exclamation-circle"></i> Issues Detected</h4>
                    <ul class="issues-list">
                        ${issues.map(issue => `<li><i class="fas fa-times-circle"></i> ${issue}</li>`).join('')}
                    </ul>
                </div>` : ''}

                ${recommendations && recommendations.length > 0 ? `
                <div class="result-section">
                    <h4><i class="fas fa-lightbulb"></i> Recommendations</h4>
                    <ul class="recommendations-list">
                        ${recommendations.map(rec => `<li><i class="fas fa-info-circle"></i> ${rec}</li>`).join('')}
                    </ul>
                </div>` : ''}

                <div class="action-buttons">
                    ${!canProceed ? `
                    <button class="btn-resubmit" onclick="workerVerification.resetUpload()">
                        <i class="fas fa-redo"></i> Try Again with Better Image
                    </button>` : `
                    <button class="btn-continue" onclick="workerVerification.goToStep(3)">
                        <i class="fas fa-arrow-right"></i> Continue Registration
                    </button>`}
                </div>
            </div>
        `;

        this.resultsArea.innerHTML = html;
        this.resultsArea.classList.add('active');
        this.resultsArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    displayProfileSummary() {
        const summary = `
            <h4 style="margin-bottom: 1rem; color: #2d3748;"><i class="fas fa-user"></i> Profile Summary</h4>
            <div style="display: grid; gap: 0.75rem;">
                <div><strong>Service:</strong> ${this.workerData.serviceCategory}</div>
                <div><strong>Experience:</strong> ${this.workerData.experience} years</div>
                <div><strong>Location:</strong> ${this.workerData.location}</div>
                <div><strong>Address:</strong> ${this.workerData.address}</div>
                <div><strong>Pincode:</strong> ${this.workerData.pincode}</div>
                <div><strong>Verification Status:</strong> <span style="color: #48bb78;">✓ Verified</span></div>
            </div>
        `;
        document.getElementById('profileSummary').innerHTML = summary;
    }

    async completeOnboarding() {
        // Direct sessionStorage check as fallback
        const storageUserStr = sessionStorage.getItem('karyasetu_user');
        const storageUser = storageUserStr ? JSON.parse(storageUserStr) : null;
        const userId = auth.currentUser ? auth.currentUser.uid : (storageUser ? storageUser.uid : null);

        if (!userId) {
            alert('Session expired. Please login again.');
            window.location.href = '../auth/login.html';
            return;
        }

        // BLOCK if verification was denied
        if (!this.canProceed) {
            alert('❌ Registration Denied\n\nYour document verification failed. Please upload a valid, clear document to proceed.');
            this.goToStep(2); // Go back to verification step
            return;
        }

        try {
            // Save worker profile to Firestore
            await setDoc(doc(db, 'workers', userId), {
                ...this.workerData,
                userId: userId,
                email: (auth.currentUser ? auth.currentUser.email : (storageUser ? storageUser.email : '')) || '',
                displayName: (auth.currentUser ? auth.currentUser.displayName : (storageUser ? storageUser.name : '')) || 'Worker',
                verified: true,
                verificationStatus: this.finalStatus,
                verificationData: this.verificationResult,
                createdAt: new Date().toISOString(),
                status: 'active'
            });

            // SYNC SESSION: Update local storage so dashboard recognizes the user
            const finalProfile = {
                ...this.workerData,
                userId: userId,
                email: (auth.currentUser ? auth.currentUser.email : (storageUser ? storageUser.email : '')) || '',
                displayName: (auth.currentUser ? auth.currentUser.displayName : (storageUser ? storageUser.name : '')) || 'Worker',
                verified: true
            };

            sessionStorage.setItem('karyasetu_user_profile', JSON.stringify(finalProfile));
            sessionStorage.setItem('karyasetu_user_role', 'worker');

            // Ensure karyasetu_user exists and marked as loggedIn
            const currentAuth = sessionStorage.getItem('karyasetu_user');
            if (!currentAuth) {
                sessionStorage.setItem('karyasetu_user', JSON.stringify({
                    uid: userId,
                    email: finalProfile.email,
                    name: finalProfile.displayName,
                    role: 'worker',
                    loggedIn: true
                }));
            } else {
                const authObj = JSON.parse(currentAuth);
                authObj.loggedIn = true;
                sessionStorage.setItem('karyasetu_user', JSON.stringify(authObj));
            }

            alert('✅ Registration Approved!\n\nYour document has been verified successfully. Welcome aboard!');
            window.location.href = '../dashboard/worker-dashboard.html';

        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Error completing onboarding. Please try again.');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.workerVerification = new WorkerVerificationFlow();
});

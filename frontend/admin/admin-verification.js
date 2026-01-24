import { auth, db } from '../config.js';
import { collection, query, orderBy, limit, getDocs, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const API_BASE_URL = window.location.origin + '/api';

class AdminVerificationDashboard {
    constructor() {
        this.verifications = [];
        this.filteredVerifications = [];

        this.initializeElements();
        this.initializeEventListeners();
        this.loadVerifications();
    }

    initializeElements() {
        this.verificationList = document.getElementById('verificationList');
        this.statusFilter = document.getElementById('statusFilter');
        this.documentTypeFilter = document.getElementById('documentTypeFilter');
        this.searchInput = document.getElementById('searchInput');
        this.refreshBtn = document.getElementById('refreshBtn');

        // Stats
        this.totalCount = document.getElementById('totalCount');
        this.pendingCount = document.getElementById('pendingCount');
        this.verifiedCount = document.getElementById('verifiedCount');
        this.rejectedCount = document.getElementById('rejectedCount');
    }

    initializeEventListeners() {
        this.statusFilter.addEventListener('change', () => this.applyFilters());
        this.documentTypeFilter.addEventListener('change', () => this.applyFilters());
        this.searchInput.addEventListener('input', () => this.applyFilters());
        this.refreshBtn.addEventListener('click', () => this.loadVerifications());
    }

    async loadVerifications() {
        try {
            // Load all verifications from Firestore
            const q = query(
                collection(db, 'documentVerifications'),
                orderBy('timestamp', 'desc'),
                limit(100)
            );
            const snapshot = await getDocs(q);

            this.verifications = [];
            snapshot.forEach(doc => {
                this.verifications.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            this.updateStatistics();
            this.applyFilters();

        } catch (error) {
            console.error('Error loading verifications:', error);
            alert('Error loading verifications. Please try again.');
        }
    }

    updateStatistics() {
        this.totalCount.textContent = this.verifications.length;
        this.pendingCount.textContent = this.verifications.filter(v => v.status === 'pending').length;
        this.verifiedCount.textContent = this.verifications.filter(v => v.status === 'verified').length;
        this.rejectedCount.textContent = this.verifications.filter(v => v.status === 'rejected').length;
    }

    applyFilters() {
        const statusFilter = this.statusFilter.value;
        const documentTypeFilter = this.documentTypeFilter.value;
        const searchQuery = this.searchInput.value.toLowerCase();

        this.filteredVerifications = this.verifications.filter(v => {
            const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
            const matchesDocType = documentTypeFilter === 'all' || v.documentType === documentTypeFilter;
            const matchesSearch = !searchQuery || v.userId.toLowerCase().includes(searchQuery);

            return matchesStatus && matchesDocType && matchesSearch;
        });

        this.renderVerifications();
    }

    renderVerifications() {
        if (this.filteredVerifications.length === 0) {
            this.verificationList.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #718096;">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>No verifications found</p>
                </div>
            `;
            return;
        }

        this.verificationList.innerHTML = this.filteredVerifications.map(v => this.renderVerificationItem(v)).join('');
    }

    renderVerificationItem(verification) {
        const { id, userId, documentType, verificationResult, status, timestamp } = verification;
        const { isValid, confidenceScore, extractedData } = verificationResult || {};

        const statusBadge = status === 'verified' ? 'verified' : status === 'rejected' ? 'rejected' : 'pending';
        const date = new Date(timestamp).toLocaleDateString();
        const time = new Date(timestamp).toLocaleTimeString();

        return `
            <div class="verification-item" data-id="${id}">
                <div>
                    <div class="document-preview" onclick="adminDashboard.viewDocument('${id}')" style="background: #edf2f7; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-file-image" style="font-size: 3rem; color: #a0aec0;"></i>
                    </div>
                </div>
                
                <div class="verification-details">
                    <h4>
                        ${documentType.toUpperCase()} Verification
                        <span class="badge ${statusBadge}">${status}</span>
                    </h4>
                    <div class="detail-row">
                        <strong>User ID:</strong>
                        <span>${userId}</span>
                    </div>
                    <div class="detail-row">
                        <strong>Date:</strong>
                        <span>${date} ${time}</span>
                    </div>
                    ${extractedData?.name ? `
                    <div class="detail-row">
                        <strong>Name:</strong>
                        <span>${extractedData.name}</span>
                    </div>` : ''}
                    ${extractedData?.idNumber ? `
                    <div class="detail-row">
                        <strong>ID Number:</strong>
                        <span>${extractedData.idNumber}</span>
                    </div>` : ''}
                    <div class="detail-row">
                        <strong>AI Confidence:</strong>
                        <span>${confidenceScore}%</span>
                    </div>
                    <div class="detail-row">
                        <strong>AI Result:</strong>
                        <span style="color: ${isValid ? '#48bb78' : '#f56565'}">
                            ${isValid ? '✓ Valid' : '✗ Invalid'}
                        </span>
                    </div>
                </div>

                <div class="action-buttons">
                    <button class="btn-view" onclick="adminDashboard.viewDetails('${id}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    ${status === 'pending' || status === 'rejected' ? `
                    <button class="btn-approve" onclick="adminDashboard.approveVerification('${id}')">
                        <i class="fas fa-check"></i> Approve
                    </button>` : ''}
                    ${status === 'pending' || status === 'verified' ? `
                    <button class="btn-reject" onclick="adminDashboard.rejectVerification('${id}')">
                        <i class="fas fa-times"></i> Reject
                    </button>` : ''}
                </div>
            </div>
        `;
    }

    viewDocument(verificationId) {
        alert('Document image viewing would require storing the image. For now, showing placeholder.');
        // In production, you would fetch and display the actual document image
    }

    viewDetails(verificationId) {
        const verification = this.verifications.find(v => v.id === verificationId);
        if (!verification) return;

        const details = JSON.stringify(verification.verificationResult, null, 2);
        alert(`Verification Details:\n\n${details}`);
    }

    async approveVerification(verificationId) {
        if (!confirm('Are you sure you want to approve this verification?')) return;

        try {
            await updateDoc(doc(db, 'documentVerifications', verificationId), {
                status: 'verified',
                adminApprovedAt: new Date().toISOString(),
                adminApprovedBy: auth.currentUser?.uid
            });

            alert('Verification approved successfully!');
            this.loadVerifications();

        } catch (error) {
            console.error('Error approving verification:', error);
            alert('Error approving verification. Please try again.');
        }
    }

    async rejectVerification(verificationId) {
        const reason = prompt('Please provide a reason for rejection:');
        if (!reason) return;

        try {
            await updateDoc(doc(db, 'documentVerifications', verificationId), {
                status: 'rejected',
                rejectionReason: reason,
                adminRejectedAt: new Date().toISOString(),
                adminRejectedBy: auth.currentUser?.uid
            });

            alert('Verification rejected successfully!');
            this.loadVerifications();

        } catch (error) {
            console.error('Error rejecting verification:', error);
            alert('Error rejecting verification. Please try again.');
        }
    }
}

// Global functions for onclick handlers
window.closeModal = function () {
    document.getElementById('imageModal').classList.remove('active');
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminVerificationDashboard();
});

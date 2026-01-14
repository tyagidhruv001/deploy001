const API_BASE_URL = 'http://localhost:5000/api';

const API = {
    // Auth endpoints
    auth: {
        async signup(userData) {
            const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Signup failed');
            }
            return response.json();
        },

        async login(credentials) {
            // Note: In real Firebase Client SDK, we would signInWithEmailAndPassword, get token, then maybe send to backend.
            // For now, mirroring the backend placeholder which accepts a body.
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials) // expects { idToken } usually, but putting placeholder
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Login failed');
            }
            return response.json();
        },

        async updateProfile(uid, data) {
            const response = await fetch(`${API_BASE_URL}/auth/profile/${uid}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update profile');
            }
            return response.json();
        }
    },

    // Worker endpoints
    workers: {
        async getAll(filters = {}) {
            const query = new URLSearchParams(filters).toString();
            const response = await fetch(`${API_BASE_URL}/workers?${query}`);
            if (!response.ok) throw new Error('Failed to fetch workers');
            return response.json();
        },

        async updateProfile(uid, profileData) {
            const response = await fetch(`${API_BASE_URL}/workers/onboarding`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid, ...profileData })
            });
            if (!response.ok) throw new Error('Failed to update profile');
            return response.json();
        }
    },

    // Job endpoints
    jobs: {
        async create(jobData) {
            const response = await fetch(`${API_BASE_URL}/jobs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jobData)
            });
            if (!response.ok) throw new Error('Failed to create job');
            return response.json();
        },

        async getMyJobs(userId, role) {
            const response = await fetch(`${API_BASE_URL}/jobs?userId=${userId}&role=${role}`);
            if (!response.ok) throw new Error('Failed to fetch jobs');
            return response.json();
        },

        async getAvailable() {
            const response = await fetch(`${API_BASE_URL}/jobs?type=available`);
            if (!response.ok) throw new Error('Failed to fetch available jobs');
            return response.json();
        },

        async update(jobId, updates) {
            const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (!response.ok) throw new Error('Failed to update job');
            return response.json();
        }
    },

    // Chat endpoints
    chat: {
        async send(data) {
            // data = { message, previousHistory, workerContext }
            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.details || errData.error || 'Failed to send message');
            }
            return response.json();
        },

        // P2P Methods
        async sendP2P(data) {
            // data = { bookingId, senderId, text, type }
            const response = await fetch(`${API_BASE_URL}/chat/p2p`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to send P2P message');
            return response.json();
        },

        async getHistory(bookingId) {
            const response = await fetch(`${API_BASE_URL}/chat/p2p/${bookingId}`);
            if (!response.ok) throw new Error('Failed to fetch history');
            return response.json();
        }
    }
};

// Expose to window
window.API = API;

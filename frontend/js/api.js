const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isLocal ? 'http://localhost:5000/api' : window.location.origin + '/api';

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
        },
        async getProfile(uid) {
            const response = await fetch(`${API_BASE_URL}/users/${uid}`);
            if (!response.ok) throw new Error('Failed to fetch profile');
            return response.json();
        }
    },

    // Worker endpoints
    workers: {
        async getAll(filters = {}) {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await fetch(`${API_BASE_URL}/workers?${queryParams}`);
            if (!response.ok) throw new Error('Failed to fetch workers');
            return response.json();
        },
        async getById(uid) {
            const response = await fetch(`${API_BASE_URL}/users/${uid}`); // Backend uses users collection for profile
            if (!response.ok) throw new Error('Failed to fetch worker profile');
            return response.json();
        },
        async updateProfile(uid, data) {
            const response = await fetch(`${API_BASE_URL}/auth/profile/${uid}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to update profile');
            return response.json();
        },
        async updateLocation(uid, locationData) {
            const response = await fetch(`${API_BASE_URL}/workers/${uid}/location`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(locationData)
            });
            if (!response.ok) throw new Error('Failed to update location');
            return response.json();
        },
        async getLocationHistory(uid, limit = 50) {
            const response = await fetch(`${API_BASE_URL}/workers/${uid}/history?limit=${limit}`);
            if (!response.ok) throw new Error('Failed to fetch location history');
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
    },

    // Wallet/Transactions
    transactions: {
        async create(data) {
            const response = await fetch(`${API_BASE_URL}/transactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to create transaction');
            return response.json();
        },
        async getByUser(userId) {
            const response = await fetch(`${API_BASE_URL}/transactions/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch transactions');
            return response.json();
        }
    },

    // Notifications
    notifications: {
        async send(data) {
            const response = await fetch(`${API_BASE_URL}/notifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to send notification');
            return response.json();
        },
        async getByUser(userId) {
            const response = await fetch(`${API_BASE_URL}/notifications/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch notifications');
            return response.json();
        },
        async markRead(id) {
            const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, { method: 'PUT' });
            if (!response.ok) throw new Error('Failed to mark read');
            return response.json();
        }
    },

    // Support
    support: {
        async createTicket(data) {
            const response = await fetch(`${API_BASE_URL}/support`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to create ticket');
            return response.json();
        },
        async getUserTickets(userId) {
            const response = await fetch(`${API_BASE_URL}/support/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch tickets');
            return response.json();
        },
        async addMessage(ticketId, data) {
            const response = await fetch(`${API_BASE_URL}/support/${ticketId}/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to send message');
            return response.json();
        }
    },

    // Referrals
    referrals: {
        async create(data) {
            const response = await fetch(`${API_BASE_URL}/referrals`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to submit referral');
            return response.json();
        },
        async getHistory(userId) {
            const response = await fetch(`${API_BASE_URL}/referrals/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch referrals');
            return response.json();
        }
    },

    // Favorites
    favorites: {
        async add(data) {
            const response = await fetch(`${API_BASE_URL}/favorites`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Failed to add favorite');
            }
            return response.json();
        },
        async getList(customerId) {
            const response = await fetch(`${API_BASE_URL}/favorites/${customerId}`);
            if (!response.ok) throw new Error('Failed to fetch favorites');
            return response.json();
        },
        async remove(data) {
            const response = await fetch(`${API_BASE_URL}/favorites`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to remove favorite');
            return response.json();
        }
    },
    // Reviews
    reviews: {
        async getByWorker(workerId) {
            const response = await fetch(`${API_BASE_URL}/reviews/${workerId}`);
            if (!response.ok) throw new Error('Failed to fetch reviews');
            return response.json();
        },
        async submit(reviewData) {
            const response = await fetch(`${API_BASE_URL}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData)
            });
            if (!response.ok) throw new Error('Failed to submit review');
            return response.json();
        }
    },
    // Payments
    payments: {
        async getBalance(userId) {
            const response = await fetch(`${API_BASE_URL}/payments/balance/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch balance');
            return response.json();
        }
    }
};

// Expose to window
window.API = API;

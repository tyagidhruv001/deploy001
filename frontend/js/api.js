const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
// If deployed on Cloudflare, replace VERCEL_BACKEND_URL with your Vercel deployment URL
const VERCEL_BACKEND_URL = ''; // e.g. 'https://your-app.vercel.app'
const API_BASE_URL = isLocal ? 'http://localhost:5000/api' : (VERCEL_BACKEND_URL ? VERCEL_BACKEND_URL + '/api' : window.location.origin + '/api');

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

    // Bookings endpoints (Real customer jobs from Firestore)
    bookings: {
        async create(bookingData) {
            const response = await fetch(`${API_BASE_URL}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });
            if (!response.ok) throw new Error('Failed to create booking');
            return response.json();
        },

        async getByUser(userId, role) {
            const response = await fetch(`${API_BASE_URL}/bookings?user_id=${userId}&role=${role}`);
            if (!response.ok) throw new Error('Failed to fetch bookings');
            return response.json();
        },

        async getAvailable(limit = 50) {
            // Get pending bookings that workers can accept
            const response = await fetch(`${API_BASE_URL}/bookings?status=pending&limit=${limit}`);
            if (!response.ok) throw new Error('Failed to fetch available bookings');
            return response.json();
        },

        async update(bookingId, updates) {
            const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (!response.ok) throw new Error('Failed to update booking');
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


API.transactions = {
    async getByUser(userId) {
        try {
            const { collection, query, where, orderBy, limit, getDocs } = window.fbFunctions;
            const q = query(
                collection(window.db, 'transactions'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc'),
                limit(100)
            );

            const snap = await getDocs(q);
            return snap.docs.map(d => {
                const data = d.data();
                return {
                    id: d.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt || Date.now())
                };
            });
        } catch (error) {
            console.error("Error fetching transactions:", error);
            return [];
        }
    }
};

API.payments = {
    async getBalance(userId) {
        try {
            const { doc, getDoc } = window.fbFunctions;
            const snap = await getDoc(doc(window.db, 'wallets', userId));
            return {
                success: true,
                balance: snap.exists() ? (parseFloat(snap.data().balance) || 0) : 0
            };
        } catch (err) {
            console.error('Balance fetch error:', err);
            return { success: false, balance: 0, error: err.message };
        }
    },

    async withdraw(data) {
        const { userId, amount } = data;
        const { collection, addDoc, doc, updateDoc, increment } = window.fbFunctions;

        try {
            // Create withdrawal request
            const withdrawalRef = await addDoc(collection(window.db, 'withdrawals'), {
                userId,
                amount: parseFloat(amount),
                status: 'pending',
                requestedAt: new Date()
            });

            // Deduct from wallet
            await updateDoc(doc(window.db, 'wallets', userId), {
                balance: increment(-parseFloat(amount))
            });

            return { success: true, withdrawalId: withdrawalRef.id };
        } catch (error) {
            console.error("Withdrawal error:", error);
            return { success: false, error: error.message };
        }
    }
};

API.referrals = {
    async create(data) {
        const { collection, addDoc } = window.fbFunctions;
        try {
            return await addDoc(collection(window.db, 'referrals'), {
                ...data,
                createdAt: new Date()
            });
        } catch (error) {
            console.error("Referral creation error:", error);
            throw error;
        }
    },

    async getHistory(userId) {
        try {
            const { collection, query, where, orderBy, getDocs } = window.fbFunctions;
            const q = query(
                collection(window.db, 'referrals'),
                where('referrerId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const snap = await getDocs(q);
            return snap.docs.map(d => {
                const data = d.data();
                return {
                    id: d.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt || Date.now()))
                };
            });
        } catch (error) {
            console.error("Error fetching referral history:", error);
            return [];
        }
    }
};

API.support = {
    async createTicket(data) {
        const { collection, addDoc } = window.fbFunctions;
        try {
            return await addDoc(collection(window.db, 'support_tickets'), {
                ...data,
                status: 'open',
                createdAt: new Date()
            });
        } catch (error) {
            console.error("Support ticket error:", error);
            throw error;
        }
    },

    async getUserTickets(userId) {
        try {
            const { collection, query, where, orderBy, getDocs } = window.fbFunctions;
            const q = query(
                collection(window.db, 'support_tickets'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const snap = await getDocs(q);
            return snap.docs.map(d => {
                const data = d.data();
                return {
                    id: d.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt || Date.now()))
                };
            });
        } catch (error) {
            console.error("Error fetching tickets:", error);
            return [];
        }
    }
};
<<<<<<< HEAD
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
// If deployed on Cloudflare, replace VERCEL_BACKEND_URL with your Vercel deployment URL
const VERCEL_BACKEND_URL = ''; // e.g. 'https://your-app.vercel.app'
const API_BASE_URL = isLocal ? 'http://localhost:5000/api' : (VERCEL_BACKEND_URL ? VERCEL_BACKEND_URL + '/api' : window.location.origin + '/api');
=======
const isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1";
>>>>>>> vengeance2.0

// If deployed on Cloudflare, replace VERCEL_BACKEND_URL with your Vercel deployment URL
const VERCEL_BACKEND_URL = 'https://deploy001-cyan.vercel.app'; // e.g. 'https://your-app.vercel.app'

export const API_BASE = isLocal
    ? "http://localhost:5000/api"
    : (VERCEL_BACKEND_URL ? VERCEL_BACKEND_URL + "/api" : "/api");

export async function apiFetch(path, options = {}) {
    const res = await fetch(API_BASE + path, {
        headers: { "Content-Type": "application/json" },
        ...options
    });

    if (!res.ok) {
        let errorMessage = "API Error";
        try {
            const data = await res.json();
            errorMessage = data.error || data.message || JSON.stringify(data);
        } catch (e) {
            // If JSON parsing fails, try to get text
            try {
                const text = await res.text();
                errorMessage = text || res.statusText;
            } catch (textError) {
                errorMessage = res.statusText;
            }
        }
        throw new Error(errorMessage);
    }

    return res.json();
}

<<<<<<< HEAD
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
=======
// API object with organized endpoints
export const API = {
>>>>>>> vengeance2.0
    jobs: {
        getMyJobs: async (userId, role) => {
            return apiFetch(`/jobs?userId=${userId}&role=${role}`);
        },
        getAvailable: async () => {
            return apiFetch(`/jobs?type=available`);
        },
        getJobById: async (jobId) => {
            return apiFetch(`/jobs/${jobId}`);
        },
        create: async (jobData) => {
            return apiFetch('/jobs', {
                method: 'POST',
                body: JSON.stringify(jobData)
            });
        },
        update: async (jobId, updates) => {
            return apiFetch(`/jobs/${jobId}`, {
                method: 'PUT',
                body: JSON.stringify(updates)
            });
        },
        updateStatus: async (jobId, status, updates = {}) => {
            return apiFetch(`/jobs/${jobId}`, {
                method: 'PUT',
                body: JSON.stringify({ status, ...updates })
            });
        },
        cancel: async (jobId) => {
            return apiFetch(`/jobs/${jobId}`, {
                method: 'PUT',
                body: JSON.stringify({ status: 'cancelled' })
            });
        }
    },
    reviews: {
        getByWorker: async (workerId) => {
            // If backend has reviews endpoint
            // return apiFetch(`/reviews/worker/${workerId}`);
            // Fallback for now returning empty array as we manage reviews in Firestore
            return [];
        }
    },
    payments: {
        getBalance: async (userId) => {
            return apiFetch(`/payments/balance/${userId}`);
        },
        createPayment: async (paymentData) => {
            return apiFetch('/payments', {
                method: 'POST',
                body: JSON.stringify(paymentData)
            });
        }
    },
    transactions: {
        getByUser: async (userId) => {
            return apiFetch(`/transactions/${userId}`);
        }
    },
    workers: {
        getNearby: async (lat, lng, radius = 5000) => {
            return apiFetch(`/workers/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
        },
        getAll: async (filters = {}) => {
            const query = new URLSearchParams(filters).toString();
            return apiFetch(`/workers${query ? '?' + query : ''}`);
        },
        getById: async (workerId) => {
            return apiFetch(`/workers/${workerId}`);
        },
        getWorkerById: async (workerId) => {
            return apiFetch(`/workers/${workerId}`);
        },
        getProfile: async (workerId) => {
            return apiFetch(`/workers/${workerId}`);
        }
    },
    auth: {
        getProfile: async (userId) => {
            // Try workers first, then customers
            try {
                return await apiFetch(`/workers/${userId}`);
            } catch (e) {
                return await apiFetch(`/customers/${userId}`);
            }
        }
    },
    chat: {
        send: async (payload) => {
            return apiFetch('/chat', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        }
    }
};

// Global exposure for non-module scripts during transition
window.apiFetch = apiFetch;
window.API_BASE = API_BASE;
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
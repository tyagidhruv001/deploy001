const isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1";

// If deployed on Cloudflare, replace VERCEL_BACKEND_URL with your Vercel deployment URL
const VERCEL_BACKEND_URL = ''; // e.g. 'https://your-app.vercel.app'

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

// API object with organized endpoints
export const API = {
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

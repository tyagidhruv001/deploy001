// ============================================
// REAL-TIME WORKER LOCATION UPDATES
// Firestore listeners for live worker tracking
// ============================================

// Store active listeners
let workerLocationListeners = {};
let isSubscribedToWorkers = false;

// Subscribe to real-time worker location updates
function subscribeToWorkerUpdates(workerIds) {
    if (!workerIds || workerIds.length === 0) {
        console.log('No workers to subscribe to');
        return;
    }

    console.log(`📡 Subscribing to ${workerIds.length} workers for live updates...`);
    const useRealtime = localStorage.getItem('use_firestore_realtime') === 'true';
    if (useRealtime && window.firebase && firebase.apps.length) {
        enableFirestoreRealtime(workerIds);
    } else {
        // Fallback to polling
        // Unsubscribe from workers no longer on map
        Object.keys(workerLocationListeners).forEach(uid => {
            if (!workerIds.includes(uid)) {
                unsubscribeFromWorker(uid);
            }
        });
        // Subscribe to new workers
        workerIds.forEach(uid => {
            if (!workerLocationListeners[uid]) {
                subscribeToWorker(uid);
            }
        });
        isSubscribedToWorkers = true;
    }
}

// Firestore real‑time listener
function enableFirestoreRealtime(workerIds) {
    const isModular = !!window.fbFunctions && !!window.db;
    const isNamespaced = !!window.firebase && !!firebase.apps?.length;

    if (!isModular && !isNamespaced) {
        console.warn('Firebase SDK not found – falling back to polling');
        return;
    }

    // Unsubscribe previous listeners
    unsubscribeFromAllWorkers();

    if (isModular) {
        console.log('📡 Using Firebase Modular SDK for real‑time updates');
        const { doc, onSnapshot } = window.fbFunctions;
        const db = window.db;

        workerIds.forEach(uid => {
            const unsub = onSnapshot(doc(db, 'workers', uid), snapshot => {
                const data = snapshot.data();
                if (data && data.location && data.location.lat && data.location.lng) {
                    updateWorkerMarkerPosition(uid, data.location.lat, data.location.lng);
                }
            }, err => {
                console.error('Modular Firestore listener error for', uid, err);
            });
            workerLocationListeners[uid] = unsub;
        });
    } else {
        console.log('📡 Using Firebase Namespaced SDK for real‑time updates');
        const db = firebase.firestore();
        workerIds.forEach(uid => {
            const unsub = db.collection('workers').doc(uid)
                .onSnapshot(doc => {
                    const data = doc.data();
                    if (data && data.location && data.location.lat && data.location.lng) {
                        updateWorkerMarkerPosition(uid, data.location.lat, data.location.lng);
                    }
                }, err => {
                    console.error('Namespaced Firestore listener error for', uid, err);
                });
            workerLocationListeners[uid] = unsub;
        });
    }

    isSubscribedToWorkers = true;
    console.log('✅ Firestore real‑time listeners attached for', workerIds.length, 'workers');
}

// Subscribe to single worker
function subscribeToWorker(uid) {
    // Note: This uses polling since we're using REST API
    // For true real-time, you'd need Firestore SDK with onSnapshot

    const pollInterval = setInterval(async () => {
        try {
            const worker = await API.workers.getById(uid);
            if (worker && worker.location && worker.location.lat && worker.location.lng) {
                updateWorkerMarkerPosition(uid, worker.location.lat, worker.location.lng);
            }
        } catch (error) {
            console.warn(`Failed to poll worker ${uid}:`, error);
        }
    }, 10000); // Poll every 10 seconds

    workerLocationListeners[uid] = pollInterval;
    console.log(`✅ Subscribed to worker: ${uid}`);
}

// Unsubscribe from single worker
function unsubscribeFromWorker(uid) {
    if (workerLocationListeners[uid]) {
        clearInterval(workerLocationListeners[uid]);
        delete workerLocationListeners[uid];
        console.log(`❌ Unsubscribed from worker: ${uid}`);
    }
}

// Unsubscribe from all workers
function unsubscribeFromAllWorkers() {
    Object.keys(workerLocationListeners).forEach(uid => {
        unsubscribeFromWorker(uid);
    });
    isSubscribedToWorkers = false;
    console.log('🛑 Unsubscribed from all workers');
}

// Update worker marker position with animation
function updateWorkerMarkerPosition(workerId, newLat, newLng) {
    const marker = mapMarkers.find(m => m.workerId === workerId);

    if (!marker) {
        console.warn(`Marker not found for worker: ${workerId}`);
        return;
    }

    const currentLatLng = marker.getLatLng();
    const newLatLng = L.latLng(newLat, newLng);

    // Check if position actually changed
    const distance = currentLatLng.distanceTo(newLatLng);
    if (distance < 5) {
        // Less than 5 meters, don't update
        return;
    }

    console.log(`🚶 Worker ${workerId} moved ${distance.toFixed(0)}m`);

    // Animate marker movement
    animateMarker(marker, currentLatLng, newLatLng, 1000); // 1 second animation
}

// Animate marker from old position to new position
function animateMarker(marker, startLatLng, endLatLng, duration) {
    const startTime = Date.now();
    const startLat = startLatLng.lat;
    const startLng = startLatLng.lng;
    const endLat = endLatLng.lat;
    const endLng = endLatLng.lng;

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-in-out)
        const eased = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        const currentLat = startLat + (endLat - startLat) * eased;
        const currentLng = startLng + (endLng - startLng) * eased;

        marker.setLatLng([currentLat, currentLng]);

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }

    animate();
}

// Cleanup listeners when leaving page
window.addEventListener('beforeunload', () => {
    unsubscribeFromAllWorkers();
});

// Pause updates when page is hidden (battery optimization)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('⏸️ Page hidden, pausing worker updates');
        unsubscribeFromAllWorkers();
    } else if (isSubscribedToWorkers) {
        console.log('▶️ Page visible, resuming worker updates');
        // Re-subscribe will happen on next map render
    }
});

console.log('📡 Real-time worker tracking initialized');

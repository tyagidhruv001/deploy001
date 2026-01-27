// ============================================
// WORKER LOCATION TRACKING SERVICE
// Real-time GPS tracking for live worker location updates
// ============================================

class WorkerLocationTracker {
    constructor() {
        this.isTracking = false;
        this.watchId = null;
        this.updateInterval = null;
        this.lastUpdate = null;
        this.currentPosition = null;
        this.UPDATE_FREQUENCY = 30000; // 30 seconds default
        this.MIN_DISTANCE_METERS = 10; // 10 meters default
    }

    // Start tracking worker location
    async start() {
        if (this.isTracking) return;

        const user = Storage.get('karyasetu_user');
        if (!user || !user.uid) return;

        // Check if tracking is enabled in settings
        const trackingEnabled = localStorage.getItem(`tracking_enabled_${user.uid}`) !== 'false';
        if (!trackingEnabled) {
            console.log('Live tracking disabled by user');
            return;
        }

        // Apply battery saver settings
        const batterySaver = localStorage.getItem('karyasetu_battery_saver') === 'true';
        this.UPDATE_FREQUENCY = batterySaver ? 120000 : 30000; // 2 min vs 30s
        this.MIN_DISTANCE_METERS = batterySaver ? 30 : 10;     // 30m vs 10m

        if (!navigator.geolocation) {
            console.error('Geolocation not supported');
            return;
        }

        console.log(`🎯 Starting live tracking (Battery Saver: ${batterySaver ? 'ON' : 'OFF'})...`);
        this.isTracking = true;

        // Attempt to clear queue first
        await clearQueuedLocationUpdates();

        // Start watching position
        this.watchId = navigator.geolocation.watchPosition(
            (position) => this.handlePositionUpdate(position),
            (error) => this.handlePositionError(error),
            {
                enableHighAccuracy: !batterySaver, // Save power
                timeout: 10000,
                maximumAge: batterySaver ? 60000 : 25000
            }
        );

        // Also set interval as backup
        this.updateInterval = setInterval(() => {
            this.getCurrentPosition();
        }, this.UPDATE_FREQUENCY);

        // Update UI
        this.updateTrackingIndicator(true);
    }

    // Stop tracking
    stop() {
        if (!this.isTracking) return;

        console.log('🛑 Stopping live location tracking...');

        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }

        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }

        this.isTracking = false;
        this.updateTrackingIndicator(false);
        showToast('Live tracking stopped', 'info');
    }

    // Get current position once
    getCurrentPosition() {
        navigator.geolocation.getCurrentPosition(
            (position) => this.handlePositionUpdate(position),
            (error) => console.warn('Position update failed:', error),
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 25000
            }
        );
    }

    // Handle position update
    async handlePositionUpdate(position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        console.log(`📍 Position update: ${lat.toFixed(6)}, ${lng.toFixed(6)} (±${accuracy.toFixed(0)}m)`);

        // Check if we should update (moved enough distance or enough time passed)
        if (this.shouldUpdate(lat, lng)) {
            this.currentPosition = { lat, lng, accuracy, timestamp: Date.now() };
            await this.sendLocationUpdate(lat, lng);
        }
    }

    // Determine if we should send update
    shouldUpdate(lat, lng) {
        // Always update if no previous position
        if (!this.currentPosition) return true;

        // Always update if enough time has passed
        const timeSinceLastUpdate = Date.now() - (this.lastUpdate || 0);
        if (timeSinceLastUpdate >= this.UPDATE_FREQUENCY) return true;

        // Check if moved significant distance
        const distance = this.calculateDistance(
            this.currentPosition.lat,
            this.currentPosition.lng,
            lat,
            lng
        );

        return distance >= this.MIN_DISTANCE_METERS;
    }

    // Calculate distance between two points in meters
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Earth radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    }

    // Send location update to backend
    async sendLocationUpdate(lat, lng) {
        const user = Storage.get('karyasetu_user');
        if (!user || !user.uid) return;

        const locationData = {
            lat,
            lng,
            timestamp: new Date().toISOString(),
            accuracy: this.currentPosition?.accuracy || 0
        };

        try {
            // Update via API
            await API.workers.updateLocation(user.uid, locationData);
            // Clear any queued updates on success
            clearQueuedLocationUpdates();
            this.lastUpdate = Date.now();
            console.log('✅ Location updated successfully');
        } catch (error) {
            console.error('❌ Failed to update location, queuing for retry:', error);
            queueLocationUpdate(locationData);
        }

        try {
            // Update local storage
            const profile = Storage.get('karyasetu_user_profile') || {};
            profile.location = { lat, lng };
            Storage.set('karyasetu_user_profile', profile);

        } catch (error) {
            console.error('❌ Failed to update location:', error);
        }
    }

    // Handle position errors
    handlePositionError(error) {
        console.error('Geolocation error:', error);

        let message = 'Location update failed';
        if (error.code === 1) {
            message = 'Location permission denied';
            this.stop(); // Stop tracking if permission denied
        } else if (error.code === 2) {
            message = 'Location unavailable';
        } else if (error.code === 3) {
            message = 'Location request timeout';
        }

        console.warn(message);
    }

    // Update UI indicator
    updateTrackingIndicator(isActive) {
        const indicator = document.getElementById('liveTrackingIndicator');
        if (indicator) {
            indicator.style.display = isActive ? 'flex' : 'none';
        }

        // Update status in sidebar if exists
        const statusText = document.getElementById('trackingStatus');
        if (statusText) {
            statusText.textContent = isActive ? 'Live Tracking Active' : 'Tracking Inactive';
            statusText.style.color = isActive ? 'var(--neon-green)' : 'var(--text-muted)';
        }
    }

    // Get tracking status
    getStatus() {
        return {
            isTracking: this.isTracking,
            lastUpdate: this.lastUpdate,
            currentPosition: this.currentPosition
        };
    }
}

// Create global instance
window.locationTracker = new WorkerLocationTracker();

// Auto-start tracking when worker goes online
// This will be called from worker dashboard when availability changes
window.startLiveTracking = function () {
    window.locationTracker.start();
};

window.stopLiveTracking = function () {
    window.locationTracker.stop();
};

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.locationTracker) {
        window.locationTracker.stop();
    }
});

// --- Offline Queue Helpers ---

function queueLocationUpdate(data) {
    try {
        const queue = JSON.parse(localStorage.getItem('karyasetu_location_queue') || '[]');
        queue.push(data);
        // Limit queue size to 50 updates
        if (queue.length > 50) queue.shift();
        localStorage.setItem('karyasetu_location_queue', JSON.stringify(queue));
        console.log(`📦 Update queued locally (${queue.length} in queue)`);
    } catch (e) {
        console.error('Queue error:', e);
    }
}

async function clearQueuedLocationUpdates() {
    const queue = JSON.parse(localStorage.getItem('karyasetu_location_queue') || '[]');
    if (queue.length === 0) return;

    console.log(`📤 Processing ${queue.length} queued updates...`);
    const user = Storage.get('karyasetu_user');

    // Process in reverse (optional) or just send the latest
    // For simplicity, we'll try to send them all but realistically we just need current
    for (const data of queue) {
        try {
            await API.workers.updateLocation(user.uid, data);
        } catch (e) {
            console.warn('Failed to send queued update, stopping processing');
            return;
        }
    }

    localStorage.removeItem('karyasetu_location_queue');
    console.log('✅ Queue cleared');
}

console.log('📡 Worker Location Tracker initialized');

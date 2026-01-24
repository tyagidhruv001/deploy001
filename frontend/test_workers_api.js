// Quick test to verify API is working
// Run this in browser console on customer dashboard page

(async function testNearbyWorkersAPI() {
    try {
        console.log('🧪 Testing Nearby Workers API...\n');

        // Test 1: Fetch all workers
        console.log('Test 1: Fetching ALL workers...');
        const response1 = await fetch('http://localhost:5000/api/workers');
        const workers1 = await response1.json();
        console.log(`✅ Got ${workers1.length} workers`);
        console.log('Sample worker:', workers1[0]);

        // Test 2: Check which workers have location
        const workersWithLocation = workers1.filter(w => w.location && w.location.lat && w.location.lng);
        console.log(`\n📍 Workers with location: ${workersWithLocation.length}/${workers1.length}`);

        // Test 3: Check which workers have category
        const workersWithCategory = workers1.filter(w => w.category);
        console.log(`🏷️ Workers with category: ${workersWithCategory.length}/${workers1.length}`);

        // Show sample worker data
        console.log('\n📊 Sample Worker Data:');
        console.table(workers1.slice(0, 5).map(w => ({
            name: w.name,
            category: w.category || 'MISSING',
            hasLocation: !!(w.location?.lat && w.location?.lng),
            lat: w.location?.lat,
            lng: w.location?.lng
        })));

        console.log('\n✅ API is working! Check data above.');

    } catch (error) {
        console.error('❌ API Error:', error);
    }
})();

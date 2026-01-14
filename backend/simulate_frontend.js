const fetch = require('node-fetch'); // Assuming node-fetch or native fetch in Node 18+

async function testFetch() {
    const serviceType = 'Carpentry';
    let skillQuery = serviceType;
    if (serviceType === 'Carpentry') skillQuery = 'Carpenter';

    const url = `http://localhost:5000/api/workers?skill=${skillQuery}`;
    console.log(`Fetching: ${url}`);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Error: ${response.status} ${response.statusText}`);
            return;
        }
        const data = await response.json();
        console.log('--- Fetched Workers ---');
        console.log(JSON.stringify(data, null, 2));

        // Find "White" (or whatever user created) in list
        // Note: We don't know exact name user gave, but we look for any carpenter
        const found = data.some(w => (w.profile && w.profile.skills && w.profile.skills.includes('Carpenter')));
        console.log(`\nFound any Carpenter? ${found}`);
    } catch (e) {
        console.error('Fetch failed:', e);
    }
}

testFetch();

const fetch = require('node-fetch');

async function testBooking() {
    const url = 'http://localhost:5000/api/jobs';
    const bookingData = {
        customerId: 'simulated_customer_123',
        workerId: 'eKUMuMibtLaao76Cq0lErNH0Vwf2', // White's ID
        serviceType: 'Carpentry',
        address: '123 Debug Lane',
        date: '2026-01-15',
        time: '14:30'
        // Missing scheduledTime intentionally to test backend logic
    };

    console.log('Sending Booking:', bookingData);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`Error ${response.status}: ${errText}`);
            return;
        }

        const data = await response.json();
        console.log('--- Booking Success ---');
        console.log(JSON.stringify(data, null, 2));

    } catch (e) {
        console.error('Network/Fetch Error:', e);
    }
}

testBooking();

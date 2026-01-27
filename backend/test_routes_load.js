try {
    console.log('Loading users route...');
    require('./routes/users');
    console.log('Users route loaded.');

    console.log('Loading workers route...');
    require('./routes/workers');
    console.log('Workers route loaded.');

    console.log('Loading bookings route...');
    require('./routes/bookings');
    console.log('Bookings route loaded.');

    console.log('Loading reviews route...');
    require('./routes/reviews');
    console.log('Reviews route loaded.');

    console.log('ALL ROUTES LOADED OK');
} catch (error) {
    console.error('Route loading failed:', error);
}

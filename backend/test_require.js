try {
    console.log('Requiring ngeohash...');
    require('ngeohash');
    console.log('ngeohash ok');

    console.log('Requiring firebase-admin...');
    require('firebase-admin');
    console.log('firebase-admin ok');

    console.log('Requiring ./config/firebase...');
    const { db } = require('./config/firebase');
    console.log('firebase config ok, db:', !!db);

} catch (e) {
    console.error('Require failed:', e);
}

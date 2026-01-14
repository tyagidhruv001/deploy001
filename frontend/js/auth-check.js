// Authentication guard - Include this in pages that require login

(function () {
    'use strict';

    // Check if user is logged in
    const userData = Storage.get('karyasetu_user');

    if (!userData || !userData.loggedIn) {
        // Redirect to login if not authenticated
        window.location.href = '/auth/login.html';
    }
})();

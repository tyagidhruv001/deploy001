// Role-based access guard

(function () {
    'use strict';

    const userRole = localStorage.getItem('karyasetu_user_role');
    const userProfile = Storage.get('karyasetu_user_profile');

    // Check if user has completed onboarding
    if (!userProfile) {
        // Redirect to appropriate onboarding page
        if (userRole === 'customer') {
            window.location.href = '/onboarding/customer-about.html';
        } else if (userRole === 'worker') {
            window.location.href = '/onboarding/worker-about.html';
        } else {
            window.location.href = '/auth/role-select.html';
        }
    }

    // Export role checking function
    window.checkUserRole = function (requiredRole) {
        return userProfile && userProfile.role === requiredRole;
    };

    window.isCustomer = function () {
        return checkUserRole('customer');
    };

    window.isWorker = function () {
        return checkUserRole('worker');
    };
})();

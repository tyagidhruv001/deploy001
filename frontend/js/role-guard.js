// Role-based access guard

(function () {
    'use strict';

    const userRole = Storage.get('karyasetu_user_role');
    const userProfile = Storage.get('karyasetu_user_profile');

    // Check if user has completed onboarding
    if (!userProfile) {
        // Redirect to appropriate onboarding page
        if (userRole === 'customer') {
            window.location.href = '/pages/onboarding/customer-verification.html';
        } else if (userRole === 'worker') {
            window.location.href = '/pages/onboarding/worker-verification.html';
        } else {
            // If No role found at all, they shouldn't be here
            console.warn('[ROLE-GUARD] No role found, redirecting to role select');
            window.location.href = '/pages/auth/role-select.html';
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

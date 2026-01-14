// Authentication utilities

// Check if user is logged in
function isLoggedIn() {
    const userData = JSON.parse(localStorage.getItem('karyasetu_user') || '{}');
    return userData.loggedIn === true;
}

// Get user data
function getUserData() {
    return JSON.parse(localStorage.getItem('karyasetu_user') || '{}');
}

// Get user role
function getUserRole() {
    return localStorage.getItem('karyasetu_user_role');
}

// Logout user
function logout() {
    localStorage.removeItem('karyasetu_user');
    localStorage.removeItem('karyasetu_user_role');
    localStorage.removeItem('karyasetu_user_profile');
    window.location.href = '../index.html';
}

// Phone number formatting
function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return phone;
}

// Validate phone number
function isValidPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10;
}

// Validate email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: var(--bg-elevated);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
    z-index: 10000;
    animation: slideInRight 0.3s ease-out;
  `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

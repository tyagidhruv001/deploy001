// Dashboard JavaScript - Main Controller

// Check authentication
const userData = Storage.get('karyasetu_user');
const userProfile = Storage.get('karyasetu_user_profile');
const userRole = localStorage.getItem('karyasetu_user_role');

if (!userData || !userData.loggedIn) {
  window.location.href = '../auth/login.html';
}

if (!userProfile) {
  // Redirect to onboarding if profile not complete
  if (userRole === 'customer') {
    window.location.href = '../onboarding/customer-verification.html';
  } else if (userRole === 'worker') {
    window.location.href = '../onboarding/worker-verification.html';
  } else {
    window.location.href = '../auth/role-select.html';
  }
}

// Update user info in sidebar
document.getElementById('userName').textContent = userData.name || 'User';
document.getElementById('userRole').textContent = userProfile?.role || userRole || 'User';

// Update dashboard welcome if element exists
const dashboardUserName = document.getElementById('dashboardUserName');
if (dashboardUserName) {
  dashboardUserName.textContent = userData.name || 'User';
}


// Sidebar functionality
const sidebar = document.getElementById('sidebar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebarToggle = document.getElementById('sidebarToggle');

mobileMenuBtn?.addEventListener('click', () => {
  sidebar.classList.toggle('active');
});

sidebarToggle?.addEventListener('click', () => {
  sidebar.classList.remove('active');
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
  if (window.innerWidth <= 1024) {
    if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
      sidebar.classList.remove('active');
    }
  }
});

// Navigation
const navLinks = document.querySelectorAll('.nav-link[data-page]');
const contentArea = document.getElementById('contentArea');

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const page = link.dataset.page;
    loadPage(page);

    // Update active state
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    // Close sidebar on mobile
    if (window.innerWidth <= 1024) {
      sidebar.classList.remove('active');
    }
  });
});

// Quick action cards
document.querySelectorAll('.quick-action-card[data-page]').forEach(card => {
  card.addEventListener('click', () => {
    const page = card.dataset.page;
    loadPage(page);

    // Update active nav link
    navLinks.forEach(l => l.classList.remove('active'));
    const navLink = document.querySelector(`.nav-link[data-page="${page}"]`);
    if (navLink) navLink.classList.add('active');
  });
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', (e) => {
  e.preventDefault();
  showConfirm('Are you sure you want to logout?', () => {
    Storage.clear();
    window.location.href = '../index.html';
  });
});

// Page loader function
async function loadPage(pageName) {
  showLoading('Loading...');

  try {
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const pageContent = getPageContent(pageName);
    contentArea.innerHTML = pageContent;

    // Initialize page-specific functionality
    initializePage(pageName);

    hideLoading();
  } catch (error) {
    console.error('Error loading page:', error);
    contentArea.innerHTML = `
      <div class="error-state">
        <h2>Error Loading Page</h2>
        <p>Something went wrong. Please try again.</p>
        <button class="btn btn-primary" onclick="location.reload()">Reload</button>
      </div>
    `;
    hideLoading();
  }
}

// Get page content
function getPageContent(pageName) {
  const pages = {
    'profile': getProfilePage(),
    'mechanic': getServicePage('Mechanic', '🔧'),
    'plumber': getServicePage('Plumber', '🚰'),
    'electrician': getServicePage('Electrician', '⚡'),
    'carpenter': getServicePage('Carpenter', '🪚'),
    'painter': getServicePage('Painter', '🎨'),
    'tailor': getServicePage('Tailor', '🧵'),
    'driver': getServicePage('Driver', '🚗'),
    'cleaner': getServicePage('Cleaner', '🧹'),
    'home-appliances': getHomeAppliancesPage(),
    'radar': getRadarPage(),
    'my-jobs': getMyJobsPage(),
    'wallet': getWalletPage(),
    'support': getSupportPage(),
    'settings': getSettingsPage(),
    'job-requests': typeof getJobRequestsPage === 'function' ? getJobRequestsPage() : '<h2>Job Requests</h2>',
    'active-jobs': typeof getActiveJobsPage === 'function' ? getActiveJobsPage() : '<h2>Active Jobs</h2>',
    'job-history': typeof getJobHistoryPage === 'function' ? getJobHistoryPage() : '<h2>Job History</h2>'
  };

  return pages[pageName] || '<div class="error-state"><h2>Page not found</h2></div>';
}

// Profile page
function getProfilePage() {
  const profile = userProfile || {};
  const user = userData || {};

  return `
    <div class="page-header">
      <h1 class="page-title">My Profile</h1>
      <p class="page-subtitle">Manage your account information</p>
    </div>
    
    <div class="profile-container">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Personal Information</h2>
        </div>
        <div class="profile-info">
          <div class="info-item">
            <label>Name</label>
            <p>${user.name || 'Not set'}</p>
          </div>
          <div class="info-item">
            <label>Phone</label>
            <p>${user.phone || 'Not set'}</p>
          </div>
          <div class="info-item">
            <label>Email</label>
            <p>${user.email || 'Not set'}</p>
          </div>
          <div class="info-item">
            <label>Role</label>
            <p style="text-transform: capitalize;">${profile.role || 'Not set'}</p>
          </div>
          ${profile.role === 'worker' ? `
            <div class="info-item">
              <label>Skills</label>
              <div class="skills-tags">
                ${(profile.skills || []).map(skill => `
                  <span class="badge badge-primary">${skill}</span>
                `).join('')}
              </div>
            </div>
            <div class="info-item">
              <label>Experience</label>
              <p style="text-transform: capitalize;">${profile.experience || 'Not set'}</p>
            </div>
            <div class="info-item">
              <label>Hourly Rate</label>
              <p>₹${profile.hourlyRate || '0'}/hour</p>
            </div>
          ` : ''}
          <div class="info-item">
            <label>Location</label>
            <p>${profile.location || 'Not set'}</p>
          </div>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary" onclick="showToast('Edit feature coming soon!', 'info')">Edit Profile</button>
        </div>
      </div>
    </div>
  `;
}

// Service page template
function getServicePage(serviceName, icon) {
  // Generate mock workers
  const workers = generateMockWorkers(serviceName);

  return `
    <div class="page-header">
      <h1 class="page-title">${icon} ${serviceName} Services</h1>
      <p class="page-subtitle">Find verified ${serviceName.toLowerCase()}s near you</p>
      <div class="page-actions">
        <button class="btn btn-primary" onclick="showBookingModal('${serviceName}')">
          <span>Book ${serviceName}</span>
        </button>
        <button class="btn btn-secondary" onclick="showToast('Filter feature coming soon!', 'info')">
          <span>Filters</span>
        </button>
      </div>
    </div>
    
    <div class="workers-grid">
      ${workers.map(worker => `
        <div class="worker-card">
          <div class="worker-header">
            <div class="worker-avatar">${icon}</div>
            <div class="worker-info">
              <h3>${worker.name}</h3>
              <div class="worker-rating">
                <span>⭐ ${worker.rating}</span>
                <span>(${worker.reviews} reviews)</span>
              </div>
            </div>
          </div>
          
          <div class="worker-details">
            <div class="worker-detail-item">
              <span>📍</span>
              <span>${worker.location} • ${worker.distance}</span>
            </div>
            <div class="worker-detail-item">
              <span>💼</span>
              <span>${worker.experience} experience</span>
            </div>
            <div class="worker-detail-item">
              <span>💰</span>
              <span>₹${worker.rate}/hour</span>
            </div>
            <div class="worker-detail-item">
              <span>✓</span>
              <span>${worker.jobsCompleted} jobs completed</span>
            </div>
          </div>
          
          <div class="worker-actions">
            <button class="btn btn-primary" onclick="bookWorker('${worker.id}', '${worker.name}')">Book Now</button>
            <button class="btn btn-secondary" onclick="viewWorkerProfile('${worker.id}')">View Profile</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// Generate mock workers
function generateMockWorkers(service) {
  const names = ['Rajesh Kumar', 'Amit Singh', 'Suresh Patel', 'Vijay Sharma', 'Ramesh Gupta', 'Prakash Yadav'];
  const locations = ['Andheri', 'Bandra', 'Powai', 'Thane', 'Navi Mumbai', 'Borivali'];

  return Array.from({ length: 6 }, (_, i) => ({
    id: generateId(),
    name: names[i],
    rating: (4 + Math.random()).toFixed(1),
    reviews: Math.floor(Math.random() * 100) + 20,
    location: locations[i],
    distance: `${(Math.random() * 5 + 0.5).toFixed(1)} km`,
    experience: `${Math.floor(Math.random() * 8) + 2} years`,
    rate: Math.floor(Math.random() * 200) + 150,
    jobsCompleted: Math.floor(Math.random() * 200) + 50
  }));
}

// Home Appliances page
function getHomeAppliancesPage() {
  return `
    <div class="page-header">
      <h1 class="page-title">🏠 Home Appliances Services</h1>
      <p class="page-subtitle">AC, Washing Machine, TV, Refrigerator repairs</p>
    </div>
    
    <div class="services-grid">
      ${['AC Repair', 'Washing Machine', 'TV Repair', 'Refrigerator'].map(service => `
        <div class="service-card" onclick="loadPage('${service.toLowerCase().replace(' ', '-')}')">
          <h3>${service}</h3>
          <p>Professional ${service.toLowerCase()} services</p>
          <button class="btn btn-primary btn-sm">View Services</button>
        </div>
      `).join('')}
    </div>
  `;
}

// Radar page (Nearby Workers Map)
function getRadarPage() {
  return `
    <div class="page-header">
      <h1 class="page-title">📍 Nearby Workers</h1>
      <p class="page-subtitle">Find workers near your location</p>
    </div>
    
    <div class="map-container">
      <div class="map-placeholder">
        <p>🗺️ Map View</p>
        <p>Interactive map showing nearby workers would appear here</p>
        <button class="btn btn-primary" onclick="showToast('Map integration coming soon!', 'info')">Enable Location</button>
      </div>
    </div>
  `;
}

// My Jobs page
function getMyJobsPage() {
  return `
    <div class="page-header">
      <h1 class="page-title">📋 My Jobs</h1>
      <p class="page-subtitle">Track your job requests and history</p>
    </div>
    
    <div class="jobs-container">
      <div class="empty-state">
        <h3>No jobs yet</h3>
        <p>Start by booking a service</p>
        <button class="btn btn-primary" onclick="loadPage('mechanic')">Book a Service</button>
      </div>
    </div>
  `;
}

// Wallet page
function getWalletPage() {
  return `
    <div class="page-header">
      <h1 class="page-title">💰 Wallet</h1>
      <p class="page-subtitle">Manage your payments and transactions</p>
    </div>
    
    <div class="wallet-container">
      <div class="card">
        <h2>Balance: ₹0</h2>
        <button class="btn btn-primary">Add Money</button>
      </div>
    </div>
  `;
}

// Support page
function getSupportPage() {
  return `
    <div class="page-header">
      <h1 class="page-title">🆘 Help & Support</h1>
      <p class="page-subtitle">We're here to help</p>
    </div>
    
    <div class="support-container">
      <div class="card">
        <h3>Emergency Support</h3>
        <button class="btn btn-error btn-lg">🚨 Report Issue</button>
        <p>24/7 Helpline: 1800-123-4567</p>
      </div>
    </div>
  `;
}

// Settings page
function getSettingsPage() {
  return `
    <div class="page-header">
      <h1 class="page-title">⚙️ Settings</h1>
      <p class="page-subtitle">Manage your preferences</p>
    </div>
    
    <div class="settings-container">
      <div class="card">
        <h3>Account Settings</h3>
        <button class="btn btn-secondary">Change Password</button>
        <button class="btn btn-secondary">Notification Preferences</button>
      </div>
    </div>
  `;
}

// Initialize page-specific functionality
function initializePage(pageName) {
  // Add any page-specific event listeners or initialization here
  console.log(`Initialized page: ${pageName}`);
}

// Booking modal
function showBookingModal(service) {
  showToast(`Booking ${service} - Feature coming soon!`, 'info');
}

// Book worker
function bookWorker(workerId, workerName) {
  showConfirm(`Book ${workerName}?`, () => {
    showToast('Booking confirmed!', 'success');
  });
}

// View worker profile
function viewWorkerProfile(workerId) {
  showToast('Worker profile - Feature coming soon!', 'info');
}

// Initialize
console.log('Dashboard initialized');

// === Dashboard Interactivity ===

// Service quick items click handlers
document.addEventListener('DOMContentLoaded', () => {
  // Quick service items
  const serviceQuickItems = document.querySelectorAll('.service-quick-item');
  serviceQuickItems.forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      if (page) {
        loadPage(page);
        // Update active nav link
        navLinks.forEach(l => l.classList.remove('active'));
        const navLink = document.querySelector(`.nav-link[data-page="${page}"]`);
        if (navLink) navLink.classList.add('active');
      }
    });
  });

  // Stat cards click handlers
  const statCards = document.querySelectorAll('.stat-card');
  statCards.forEach(card => {
    card.addEventListener('click', () => {
      if (card.classList.contains('stat-primary')) {
        loadPage('my-jobs');
      } else if (card.classList.contains('stat-warning')) {
        loadPage('wallet');
      } else if (card.classList.contains('stat-info')) {
        loadPage('profile');
      }
    });
  });

  // Animate stat values on load
  animateStatValues();

  // Simulate real-time updates
  simulateDashboardUpdates();
});

// Animate stat values with counter effect
function animateStatValues() {
  const activeJobsEl = document.getElementById('activeJobs');
  const completedJobsEl = document.getElementById('completedJobs');
  const walletBalanceEl = document.getElementById('walletBalance');

  if (activeJobsEl) animateCounter(activeJobsEl, 0, 3, 1000);
  if (completedJobsEl) animateCounter(completedJobsEl, 0, 12, 1200);
  if (walletBalanceEl) animateCounter(walletBalanceEl, 0, 1250, 1500);
}

// Counter animation helper
function animateCounter(element, start, end, duration) {
  const startTime = performance.now();
  const range = end - start;

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const current = Math.floor(start + (range * easeOutQuart));

    element.textContent = current;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = end;
    }
  }

  requestAnimationFrame(update);
}

// Simulate real-time dashboard updates
function simulateDashboardUpdates() {
  // Simulate notification updates
  setInterval(() => {
    const notificationItems = document.querySelectorAll('.notification-item');
    if (notificationItems.length > 0 && Math.random() > 0.7) {
      // Add pulse animation to first notification
      notificationItems[0].style.animation = 'pulse 0.5s ease-in-out';
      setTimeout(() => {
        notificationItems[0].style.animation = '';
      }, 500);
    }
  }, 10000);

  // Simulate activity feed updates
  setInterval(() => {
    const activityList = document.getElementById('activityList');
    if (activityList && Math.random() > 0.8) {
      // Add subtle highlight to recent activity
      const firstActivity = activityList.querySelector('.activity-item');
      if (firstActivity) {
        firstActivity.style.background = 'var(--bg-elevated)';
        setTimeout(() => {
          firstActivity.style.background = '';
        }, 2000);
      }
    }
  }, 15000);
}

// Add pulse animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }
`;
document.head.appendChild(style);


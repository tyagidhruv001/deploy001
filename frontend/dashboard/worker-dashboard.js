// ============================================
// WORKER DASHBOARD - COMPLETE IMPLEMENTATION
// ============================================

// ============================================
// AUTHENTICATION & INITIALIZATION
// ============================================

const userData = Storage.get('karyasetu_user');
const userProfile = Storage.get('karyasetu_user_profile');
const userRole = localStorage.getItem('karyasetu_user_role');

if (!userData || !userData.loggedIn) {
  window.location.href = '../auth/login.html';
}

// if (userRole !== 'worker') {
//   window.location.href = '../dashboard/customer-dashboard.html';
// }

if (!userProfile) {
  window.location.href = '../onboarding/worker-about.html';
}

// Update user info
document.getElementById('userName').textContent = userData.name || 'Worker';
document.getElementById('userRole').textContent = 'Service Provider';

// ============================================
// DATA MANAGEMENT
// ============================================

// Initialize worker data in localStorage
function initializeWorkerData() {
  if (!Storage.get('worker_jobs')) {
    Storage.set('worker_jobs', generateMockJobs());
  }
  if (!Storage.get('worker_earnings')) {
    Storage.set('worker_earnings', generateMockEarnings());
  }
  if (!Storage.get('worker_reviews')) {
    Storage.set('worker_reviews', generateMockReviews());
  }
  if (!Storage.get('worker_availability')) {
    Storage.set('worker_availability', {
      isOnline: true,
      workingHours: {
        monday: { start: '09:00', end: '18:00', enabled: true },
        tuesday: { start: '09:00', end: '18:00', enabled: true },
        wednesday: { start: '09:00', end: '18:00', enabled: true },
        thursday: { start: '09:00', end: '18:00', enabled: true },
        friday: { start: '09:00', end: '18:00', enabled: true },
        saturday: { start: '10:00', end: '16:00', enabled: true },
        sunday: { start: '00:00', end: '00:00', enabled: false }
      }
    });
  }
}

// Generate mock job data
function generateMockJobs() {
  return {
    pending: [
      {
        id: 'job_001',
        title: 'Plumbing Repair',
        description: 'Kitchen sink is leaking, needs urgent repair',
        customer: { name: 'Priya Sharma', phone: '9876543210', location: 'Andheri West' },
        location: 'Andheri West, Mumbai',
        distance: '2.3 km',
        budget: { min: 500, max: 800 },
        scheduledDate: new Date(Date.now() + 86400000).toISOString(),
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        status: 'pending',
        urgency: 'high'
      },
      {
        id: 'job_002',
        title: 'Pipe Installation',
        description: 'New bathroom pipe installation required',
        customer: { name: 'Rahul Verma', phone: '9123456789', location: 'Bandra East' },
        location: 'Bandra East, Mumbai',
        distance: '3.5 km',
        budget: { min: 1000, max: 1500 },
        scheduledDate: new Date(Date.now() + 172800000).toISOString(),
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        status: 'pending',
        urgency: 'medium'
      },
      {
        id: 'job_003',
        title: 'Electrical Wiring',
        description: 'Complete house rewiring needed',
        customer: { name: 'Anjali Patel', phone: '9988776655', location: 'Powai' },
        location: 'Powai, Mumbai',
        distance: '5.1 km',
        budget: { min: 2000, max: 3000 },
        scheduledDate: new Date(Date.now() + 259200000).toISOString(),
        createdAt: new Date(Date.now() - 10800000).toISOString(),
        status: 'pending',
        urgency: 'low'
      }
    ],
    active: [
      {
        id: 'job_004',
        title: 'Kitchen Sink Repair',
        description: 'Fixing leaking kitchen sink',
        customer: { name: 'Suresh Kumar', phone: '9876501234', location: 'Thane' },
        location: 'Thane, Mumbai',
        distance: '4.2 km',
        payment: 600,
        startedAt: new Date(Date.now() - 7200000).toISOString(),
        estimatedCompletion: new Date(Date.now() + 3600000).toISOString(),
        status: 'in_progress',
        progress: 60
      }
    ],
    completed: [
      {
        id: 'job_005',
        title: 'Bathroom Plumbing',
        description: 'Fixed bathroom drainage issue',
        customer: { name: 'Meera Singh', phone: '9123450987', location: 'Borivali' },
        location: 'Borivali, Mumbai',
        payment: 850,
        completedAt: new Date(Date.now() - 86400000).toISOString(),
        rating: 5,
        review: 'Excellent work! Very professional and quick.',
        status: 'completed'
      },
      {
        id: 'job_006',
        title: 'Tap Replacement',
        description: 'Replaced old kitchen tap',
        customer: { name: 'Vikram Joshi', phone: '9876123456', location: 'Andheri' },
        location: 'Andheri, Mumbai',
        payment: 400,
        completedAt: new Date(Date.now() - 172800000).toISOString(),
        rating: 4,
        review: 'Good service, arrived on time.',
        status: 'completed'
      },
      {
        id: 'job_007',
        title: 'Water Heater Installation',
        description: 'Installed new geyser',
        customer: { name: 'Pooja Reddy', phone: '9988112233', location: 'Navi Mumbai' },
        location: 'Navi Mumbai',
        payment: 1200,
        completedAt: new Date(Date.now() - 259200000).toISOString(),
        rating: 5,
        review: 'Great work! Highly recommended.',
        status: 'completed'
      }
    ]
  };
}

// Generate mock earnings data
function generateMockEarnings() {
  return {
    today: 850,
    week: 4200,
    month: 18500,
    total: 125000,
    pending: 2500,
    history: [
      { date: new Date().toISOString(), amount: 850, job: 'Bathroom Plumbing', status: 'completed' },
      { date: new Date(Date.now() - 86400000).toISOString(), amount: 600, job: 'Tap Repair', status: 'completed' },
      { date: new Date(Date.now() - 172800000).toISOString(), amount: 1200, job: 'Geyser Installation', status: 'completed' },
      { date: new Date(Date.now() - 259200000).toISOString(), amount: 450, job: 'Pipe Fixing', status: 'completed' },
      { date: new Date(Date.now() - 345600000).toISOString(), amount: 1100, job: 'Drainage Cleaning', status: 'completed' }
    ],
    weeklyBreakdown: [
      { day: 'Mon', amount: 850 },
      { day: 'Tue', amount: 1200 },
      { day: 'Wed', amount: 600 },
      { day: 'Thu', amount: 950 },
      { day: 'Fri', amount: 400 },
      { day: 'Sat', amount: 200 },
      { day: 'Sun', amount: 0 }
    ]
  };
}

// Generate mock reviews
function generateMockReviews() {
  return [
    {
      id: 'rev_001',
      customer: 'Meera Singh',
      rating: 5,
      comment: 'Excellent work! Very professional and quick. Fixed the issue perfectly.',
      date: new Date(Date.now() - 86400000).toISOString(),
      job: 'Bathroom Plumbing'
    },
    {
      id: 'rev_002',
      customer: 'Vikram Joshi',
      rating: 4,
      comment: 'Good service, arrived on time. Would recommend.',
      date: new Date(Date.now() - 172800000).toISOString(),
      job: 'Tap Replacement'
    },
    {
      id: 'rev_003',
      customer: 'Pooja Reddy',
      rating: 5,
      comment: 'Great work! Highly recommended. Very skilled and friendly.',
      date: new Date(Date.now() - 259200000).toISOString(),
      job: 'Water Heater Installation'
    },
    {
      id: 'rev_004',
      customer: 'Amit Desai',
      rating: 5,
      comment: 'Perfect job! Will definitely hire again.',
      date: new Date(Date.now() - 345600000).toISOString(),
      job: 'Pipe Repair'
    },
    {
      id: 'rev_005',
      customer: 'Sneha Kapoor',
      rating: 4,
      comment: 'Good work, but took a bit longer than expected.',
      date: new Date(Date.now() - 432000000).toISOString(),
      job: 'Drainage Fix'
    }
  ];
}

// Initialize data
// Initialize data
initializeWorkerData();
refreshDashboardData();

async function refreshDashboardData() {
  try {
    if (!userData || !userData.uid) return;

    console.log('Fetching real jobs from API...');
    const jobs = await API.jobs.getMyJobs(userData.uid, 'worker');
    console.log('Fetched jobs:', jobs);

    // Map backend fields to frontend expected structure
    const mappedJobs = jobs.map(j => ({
      ...j,
      id: j.id, // Ensure ID is present
      title: j.title || j.serviceType + ' Job',
      scheduledDate: j.scheduledTime, // Map backend field
      budget: j.budget || { min: 0, max: 0 },
      customer: j.customer || { name: 'Unknown', phone: '', location: j.address || '' },
      urgency: j.urgency || 'medium'
    }));

    // Categorize
    const workerJobs = {
      pending: mappedJobs.filter(j => j.status === 'pending'),
      active: mappedJobs.filter(j => ['in_progress', 'active'].includes(j.status)),
      completed: mappedJobs.filter(j => j.status === 'completed')
    };

    Storage.set('worker_jobs', workerJobs);
    console.log('Updated worker_jobs in storage');

    // Update UI if we are on the home page
    if (document.querySelector('.dashboard-home')) {
      const contentArea = document.getElementById('contentArea');
      if (contentArea) {
        contentArea.innerHTML = getWorkerHomePage();
        // Re-initialize any listeners if needed, though home page is mostly static links
      }
    }

  } catch (error) {
    console.error("Failed to refresh dashboard data:", error);
  }
}

// ============================================
// AVAILABILITY MANAGEMENT
// ============================================

let availabilityData = Storage.get('worker_availability');
let isAvailable = availabilityData.isOnline;

const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const toggleAvailabilityBtn = document.getElementById('toggleAvailability');

function updateAvailabilityStatus() {
  if (isAvailable) {
    statusDot.className = 'status-dot status-online';
    statusText.textContent = 'Available';
    toggleAvailabilityBtn.textContent = 'Go Offline';
    toggleAvailabilityBtn.className = 'btn btn-sm btn-secondary';
    showToast('You are now available for jobs', 'success');
  } else {
    statusDot.className = 'status-dot status-offline';
    statusText.textContent = 'Offline';
    toggleAvailabilityBtn.textContent = 'Go Online';
    toggleAvailabilityBtn.className = 'btn btn-sm btn-primary';
    showToast('You are now offline', 'info');
  }

  // Save to localStorage
  availabilityData.isOnline = isAvailable;
  Storage.set('worker_availability', availabilityData);
}

toggleAvailabilityBtn?.addEventListener('click', () => {
  isAvailable = !isAvailable;
  updateAvailabilityStatus();
});

// ============================================
// SIDEBAR & NAVIGATION
// ============================================

const sidebar = document.getElementById('sidebar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebarToggle = document.getElementById('sidebarToggle');

mobileMenuBtn?.addEventListener('click', () => {
  sidebar.classList.toggle('active');
});

sidebarToggle?.addEventListener('click', () => {
  sidebar.classList.remove('active');
});

document.addEventListener('click', (e) => {
  if (window.innerWidth <= 1024) {
    if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
      sidebar.classList.remove('active');
    }
  }
});

const navLinks = document.querySelectorAll('.nav-link[data-page]');
const contentArea = document.getElementById('contentArea');

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const page = link.dataset.page;
    loadPage(page);

    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    if (window.innerWidth <= 1024) {
      sidebar.classList.remove('active');
    }
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

// ============================================
// PAGE LOADER
// ============================================

async function loadPage(pageName, params = null) {
  showLoading('Loading...');

  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    const pageContent = getPageContent(pageName, params);
    contentArea.innerHTML = pageContent;
    initializePage(pageName, params);
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

// ============================================
// PAGE CONTENT GENERATOR
// ============================================

function getPageContent(pageName, params = null) {
  const pages = {
    'profile': getProfilePage,
    'job-requests': getJobRequestsPage,
    'active-jobs': getActiveJobsPage,
    'job-history': getJobHistoryPage,
    'availability': getAvailabilityPage,
    'earnings': getEarningsPage,
    'wallet': getWalletPage,
    'ratings': getRatingsPage,
    'support': getSupportPage,
    'settings': getSettingsPage,
    'chat': getChatPage,
    'refer-coworker': getReferralPage
  };

  const pageFunction = pages[pageName];
  return pageFunction ? pageFunction(params) : getWorkerHomePage();
}

// ============================================
// HOME PAGE
// ============================================

function getWorkerHomePage() {
  const jobs = Storage.get('worker_jobs');
  const earnings = Storage.get('worker_earnings');
  const profile = userProfile || {};

  return `
    <div class="dashboard-home">
      <!-- Welcome Header -->
      <div class="dashboard-welcome">
        <div class="welcome-content">
          <h1>Welcome back, <span id="dashboardUserName">${userData.name || 'Worker'}</span>! ðŸ‘·</h1>
          <p>Manage your jobs and grow your business</p>
        </div>
        <div class="welcome-actions">
          <button class="btn ${isAvailable ? 'btn-secondary' : 'btn-primary'}" onclick="toggleAvailabilityBtn.click()">
            <span>${isAvailable ? 'Go Offline' : 'Go Online'}</span>
          </button>
        </div>
      </div>

      <!-- Daily Overview Section -->
      <div class="dashboard-overview-section" style="margin-bottom: var(--spacing-xl); background: var(--bg-secondary); padding: var(--spacing-lg); border-radius: var(--radius-lg); border: 1px solid var(--border-primary);">
        <div class="overview-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-md);">
           <h2 style="font-size: 1.25rem;">ðŸ“… Today's Overview</h2>
           <span style="color: var(--text-tertiary); font-size: 0.9rem;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <div class="overview-content" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: var(--spacing-md);">
           <div class="overview-item">
              <span style="color: var(--text-secondary); font-size: 0.9rem;">Scheduled Jobs</span>
              <div style="font-size: 1.5rem; font-weight: bold; color: var(--primary-500);">${jobs.active.filter(j => new Date(j.startDate).toDateString() === new Date().toDateString()).length} Today</div>
           </div>
           <div class="overview-item">
              <span style="color: var(--text-secondary); font-size: 0.9rem;">Pending Requests</span>
              <div style="font-size: 1.5rem; font-weight: bold; color: var(--warning);">${jobs.pending.length} Waiting</div>
           </div>
           <div class="overview-item">
              <span style="color: var(--text-secondary); font-size: 0.9rem;">Est. Earnings</span>
              <div style="font-size: 1.5rem; font-weight: bold; color: var(--success);">&#8377;${earnings.today}</div>
           </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card stat-primary" onclick="loadPage('job-requests')">
          <div class="stat-icon">ðŸ“¬</div>
          <div class="stat-content">
            <div class="stat-label">New Requests</div>
            <div class="stat-value" id="newRequests">${jobs.pending.length}</div>
            <div class="stat-change positive">Pending review</div>
          </div>
        </div>

        <div class="stat-card stat-warning" onclick="loadPage('active-jobs')">
          <div class="stat-icon">âš¡</div>
          <div class="stat-content">
            <div class="stat-label">Active Jobs</div>
            <div class="stat-value" id="activeJobs">${jobs.active.length}</div>
            <div class="stat-change positive">In progress</div>
          </div>
        </div>

        <div class="stat-card stat-success" onclick="loadPage('earnings')">
          <div class="stat-icon">ðŸ’°</div>
          <div class="stat-content">
            <div class="stat-label">This Month</div>
            <div class="stat-value">&#8377;<span id="monthlyEarnings">${earnings.month.toLocaleString()}</span></div>
            <div class="stat-change positive">+15% from last month</div>
          </div>
        </div>

        <div class="stat-card stat-info" onclick="loadPage('ratings')">
          <div class="stat-icon">â­</div>
          <div class="stat-content">
            <div class="stat-label">Your Rating</div>
            <div class="stat-value" id="workerRating">4.8</div>
            <div class="stat-change positive">Top 10% workers</div>
          </div>
        </div>
      </div>

      <!-- Main Dashboard Grid -->
      <div class="dashboard-grid">
        <!-- Job Requests -->
        <div class="dashboard-card job-requests-card">
          <div class="card-header">
            <h2><i class="fas fa-envelope-open-text" style="color:var(--primary-400);"></i> New Job Requests</h2>
            <button class="btn-text" onclick="loadPage('job-requests')">View All</button>
          </div>
          <div class="job-requests-list" id="jobRequestsList">
             <!-- Content loaded via API -->
             <div style="text-align:center; padding:1rem; opacity:0.6;">Loading...</div>
          </div>
        </div>

        <!-- Active Jobs -->
        <div class="dashboard-card active-jobs-card">
          <div class="card-header">
            <h2><i class="fas fa-bolt" style="color:#fbbf24;"></i> Active Jobs</h2>
            <button class="btn-text" onclick="loadPage('active-jobs')">View All</button>
          </div>
          <div class="active-jobs-list" id="activeJobsList">
            <!-- Content loaded via API -->
            <div style="text-align:center; padding:1rem; opacity:0.6;">Loading...</div>
          </div>
        </div>

        <!-- Earnings Overview -->
        <div class="dashboard-card earnings-card">
          <div class="card-header">
            <h2><i class="fas fa-wallet" style="color:#34d399;"></i> Earnings Overview</h2>
            <button class="btn-text" onclick="loadPage('earnings')">View Details</button>
          </div>
          <div class="earnings-summary" id="earningsSummary">
            <div class="earnings-item">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: var(--spacing-md);">
                   <span style="font-size: 1.5rem;"><i class="fas fa-calendar-day" style="color:var(--primary-400);"></i></span>
                   <div>
                      <h4 style="margin:0;">Today's Income</h4>
                      <p style="margin:0; font-size: 0.8rem; color: var(--text-tertiary);">Summary for today</p>
                   </div>
                </div>
                <span class="earnings-value" style="font-size: 1.25rem; font-weight: 700; color: var(--success);">&#8377;${earnings.today}</span>
              </div>
            </div>
            <div class="earnings-item">
               <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: var(--spacing-md);">
                   <span style="font-size: 1.5rem;"><i class="fas fa-chart-bar" style="color:var(--success);"></i></span>
                   <div>
                      <h4 style="margin:0;">This Week</h4>
                      <p style="margin:0; font-size: 0.8rem; color: var(--text-tertiary);">Current week's progress</p>
                   </div>
                </div>
                <span class="earnings-value" style="font-size: 1.25rem; font-weight: 700; color: var(--success);">&#8377;${earnings.week.toLocaleString()}</span>
              </div>
            </div>
            <div class="earnings-item">
               <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: var(--spacing-md);">
                   <span style="font-size: 1.5rem;"><i class="fas fa-chart-line" style="color:var(--primary-400);"></i></span>
                   <div>
                      <h4 style="margin:0;">This Month</h4>
                      <p style="margin:0; font-size: 0.8rem; color: var(--text-tertiary);">Total month-to-date</p>
                   </div>
                </div>
                <span class="earnings-value" style="font-size: 1.25rem; font-weight: 700; color: var(--primary-500);">&#8377;${earnings.month.toLocaleString()}</span>
              </div>
            </div>
            <div class="earnings-item">
               <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: var(--spacing-md);">
                   <span style="font-size: 1.5rem;">ðŸ¦</span>
                   <div>
                      <h4 style="margin:0;">Lifetime Total</h4>
                      <p style="margin:0; font-size: 0.8rem; color: var(--text-tertiary);">All time earnings</p>
                   </div>
                </div>
                <span class="earnings-value" style="font-size: 1.25rem; font-weight: 700; color: var(--primary-500);">&#8377;${earnings.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <button class="btn btn-primary btn-block" style="margin-top: auto;" onclick="loadPage('wallet')">Withdraw Earnings</button>
        </div>

        <!-- Recent Reviews -->
        <div class="dashboard-card reviews-card">
          <div class="card-header">
            <h2>â­ Recent Reviews</h2>
            <button class="btn-text" onclick="loadPage('ratings')">View All</button>
          </div>
          <div class="reviews-list">
            ${Storage.get('worker_reviews').slice(0, 3).map(review => `
              <div class="review-item">
                <div class="review-header">
                  <div class="review-meta">
                    <span class="review-rating" style="font-size: 1.1rem;">${'â­'.repeat(review.rating)}</span>
                    <h4 style="margin: 0.25rem 0;">${review.customer}</h4>
                  </div>
                  <span class="review-date" style="font-size: 0.75rem; color: var(--text-tertiary);">${getRelativeTime(review.date)}</span>
                </div>
                <p class="review-text" style="margin: var(--spacing-sm) 0; font-style: italic; color: var(--text-secondary);">"${review.comment}"</p>
                <div style="font-size: 0.75rem; color: var(--success); font-weight: 600;">Verified Booking</div>
              </div>
            `).join('')}
            ${Storage.get('worker_reviews').length === 0 ? '<div class="empty-state-small">No reviews yet</div>' : ''}
          </div>
        </div>

        <!-- Performance Chart -->
        <div class="dashboard-card performance-card">
          <div class="card-header">
            <h2>ðŸ“Š Weekly Performance</h2>
          </div>
          <div class="performance-chart" style="position: relative; height: 300px;">
            <canvas id="performanceChart"></canvas>
          </div>
        </div>

        </div>
      </div>
    </div>
  `;
}

// ============================================
// PROFILE PAGE
// ============================================

// ============================================
// PROFILE PAGE
// ============================================

let isEditingProfile = false;

function toggleEditProfile() {
  isEditingProfile = !isEditingProfile;
  loadPage('profile');
}

function saveProfile() {
  try {
    const getVal = (id) => {
      const el = document.getElementById(id);
      return el ? el.value : '';
    };

    const name = getVal('editName');
    const phone = getVal('editPhone');
    const email = getVal('editEmail');
    const location = getVal('editLocation');

    const skillsInput = document.getElementById('editSkills');
    const skills = skillsInput ? skillsInput.value.split(',').map(s => s.trim()).filter(s => s) : [];

    const experience = getVal('editExperience');
    const hourlyRate = getVal('editHourlyRate');

    // Collect Education Array
    const eduEntries = document.querySelectorAll('.education-entry');
    const educationList = Array.from(eduEntries).map(entry => {
      const schoolInput = entry.querySelector('.edu-school');
      const degreeInput = entry.querySelector('.edu-degree');
      const yearInput = entry.querySelector('.edu-year');
      return {
        school: schoolInput ? schoolInput.value : '',
        degree: degreeInput ? degreeInput.value : '',
        year: yearInput ? yearInput.value : ''
      };
    }).filter(e => e.school || e.degree);

    // Update Data
    const userData = Storage.get('karyasetu_user') || {};
    userData.name = name;
    userData.phone = phone;
    userData.email = email;
    Storage.set('karyasetu_user', userData);

    const profile = Storage.get('karyasetu_user_profile') || {};
    profile.location = location;
    profile.skills = skills;
    profile.experience = experience;
    profile.hourlyRate = hourlyRate;
    profile.education = educationList;
    Storage.set('karyasetu_user_profile', profile);

    // Update UI State
    isEditingProfile = false;

    // Refresh Sidebar Name
    const sidebarName = document.getElementById('userName');
    if (sidebarName) sidebarName.textContent = name;

    // Refresh Dashboard Header
    const dashboardName = document.getElementById('dashboardUserName');
    if (dashboardName) dashboardName.textContent = name;

    loadPage('profile');
    showToast('Profile updated successfully!', 'success');
  } catch (err) {
    console.error("Save Profile Error:", err);
    showToast('Error saving: ' + err.message, 'error');
  }
}

function getProfilePage() {
  const profile = Storage.get('karyasetu_user_profile') || {};
  const user = Storage.get('karyasetu_user') || {};
  const jobs = Storage.get('worker_jobs');
  const earnings = Storage.get('worker_earnings');

  return `
    <!-- PROFILE HEADER (Reconstructed) -->
    <div class="page-header" style="position: relative; overflow: visible; border-radius: 24px; padding: 2rem; margin-bottom: 2rem; background: linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(236, 72, 153, 0.2)); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);">
      <div style="position: absolute; top:0; left:0; width:100%; height:100%; backdrop-filter: blur(40px); z-index:0; border-radius: 24px;"></div>
      
      <!-- Flex Container -->
      <div style="position: relative; z-index:1; display:flex; align-items: flex-start; gap: 2rem; flex-wrap: wrap;">
        
        <!-- 1. AVATAR SECTION -->
        <div style="flex-shrink: 0;">
            <div style="position: relative; width: 110px; height: 110px;">
                <!-- Image Ring -->
                <div style="width:100%; height:100%; border-radius:50%; padding:3px; background: linear-gradient(135deg, #00d2ff, #3a7bd5); box-shadow: 0 0 20px rgba(0, 210, 255, 0.2);">
                    <img id="profile-image-display" 
                         src="${user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || 'Worker') + '&background=0f172a&color=fff&size=256&font-size=0.33'}" 
                         alt="Profile" 
                         style="width:100%; height:100%; border-radius:50%; object-fit:cover; border: none; background-color: #0f172a;">
                </div>
                
                ${isEditingProfile ? '' : `
                <!-- Camera Button (Absolute to Avatar) -->
                <button onclick="triggerImageUpload()" style="position:absolute; bottom:0; right:0; background: var(--bg-elevated); border: 2px solid var(--bg-primary); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3); cursor:pointer; z-index: 10;" title="Change Photo">
                    <i class="fas fa-camera" style="font-size: 13px; color: var(--text-primary);"></i>
                </button>
                `}
                <input type="file" id="profile-image-upload" accept="image/*" style="display: none;" onchange="handleImageUpload(this)">
            </div>
        </div>

        <!-- 2. INFO SECTION (Name, Badges, Remove Link) -->
        <div style="flex: 1; min-width: 250px; display: flex; flex-direction: column; justify-content: center; padding-top: 0.5rem; gap: 0.5rem;">
            <!-- Name -->
            <h1 style="font-size: 2.2rem; font-weight: 700; margin: 0; background: linear-gradient(to right, #fff, rgba(255,255,255,0.9)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.5px; line-height: 1.2;">
                ${user.name || 'Worker Name'}
            </h1>
            
            <!-- Details Row -->
            <div style="display:flex; align-items:center; gap: 1rem; flex-wrap: wrap;">
                <span class="badge badge-success" style="backdrop-filter: blur(4px); padding: 0.25rem 0.7rem; font-size: 0.75rem; letter-spacing: 0.5px; border-radius: 20px;">Verified Pro</span>
                <span style="color: rgba(255,255,255,0.7); display:flex; align-items:center; gap:0.5rem; font-size: 1rem;">
                    <i class="fas fa-map-marker-alt" style="color: var(--neon-pink);"></i> ${profile.location || 'Location not set'}
                </span>
            </div>

            <!-- Remove Button (Conditional) -->
             ${!isEditingProfile ? `
            <div style="margin-top: 0.5rem;">
                <button onclick="removeProfileImage()" 
                        style="background: transparent; border: none; color: #fca5a5; font-size: 0.75rem; display: inline-flex; gap: 4px; align-items: center; cursor: pointer; padding: 0; transition: color 0.2s;" 
                        onmouseover="this.style.color='#ef4444'" 
                        onmouseout="this.style.color='#fca5a5'">
                    <i class="fas fa-trash-alt" style="font-size: 0.7rem;"></i> Remove Photo
                </button>
            </div>
            ` : ''}
        </div>

        <!-- 3. ACTIONS SECTION (Edit/Save) -->
        <div style="margin-left: auto; align-self: flex-start;">
            ${isEditingProfile
      ? `<div style="display:flex; gap:10px;">
                     <button class="btn btn-secondary" onclick="toggleEditProfile()" style="background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1);">Cancel</button>
                     <button class="btn btn-primary" onclick="saveProfile()" style="box-shadow: 0 0 15px rgba(59, 130, 246, 0.4); border: none;">Save Changes</button>
                   </div>`
      : `<button class="btn btn-secondary" onclick="toggleEditProfile()" style="background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); transition: all 0.3s ease; padding: 0.75rem 1.5rem; font-size: 1rem;"><i class="fas fa-pen" style="margin-right: 8px;"></i> Edit Profile</button>`
    }
        </div>
      </div>
    </div>

    <!-- Stats Grid (Unchanged) -->
    <div class="profile-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">

      <!-- Personal Info Card -->
      <div class="card" style="background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 20px;">
        <div class="card-header" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem; margin-bottom: 1rem;">
          <h2 class="card-title" style="font-size: 1.5rem;"><i class="fas fa-user-circle" style="margin-right: 10px; color: var(--primary-400);"></i> Personal Information</h2>
        </div>
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div class="info-group">
              <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; letter-spacing:1px; font-weight: 600;">FULL NAME</label>
              ${isEditingProfile
      ? `<input type="text" id="editName" class="form-control" value="${user.name || ''}" placeholder="Enter Name" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 1rem; border-radius: 12px;">`
      : `<p style="font-size:1.2rem; font-weight:500; margin:0;">${user.name || 'Not set'}</p>`
    }
            </div>
            <div class="info-group">
              <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; letter-spacing:1px; font-weight: 600;">PHONE NUMBER</label>
              ${isEditingProfile
      ? `<input type="tel" id="editPhone" class="form-control" value="${user.phone || ''}" placeholder="Enter Phone" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 1rem; border-radius: 12px;">`
      : `<p style="font-size:1.2rem; font-weight:500; margin:0; font-family: 'Courier New', monospace;">${user.phone || 'Not set'}</p>`
    }
            </div>
            <div class="info-group">
              <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; letter-spacing:1px; font-weight: 600;">EMAIL ADDRESS</label>
              ${isEditingProfile
      ? `<input type="email" id="editEmail" class="form-control" value="${user.email || ''}" placeholder="Enter Email" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 1rem; border-radius: 12px;">`
      : `<p style="font-size:1.2rem; font-weight:500; margin:0;">${user.email || 'Not set'}</p>`
    }
            </div>
            <div class="info-group">
              <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; letter-spacing:1px; font-weight: 600;">LOCATION</label>
               ${isEditingProfile
      ? `<input type="text" id="editLocation" class="form-control" value="${profile.location || ''}" placeholder="Enter Location" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 1rem; border-radius: 12px;">`
      : `<p style="font-size:1.2rem; font-weight:500; margin:0;">${profile.location || 'Not set'}</p>`
    }
            </div>
        </div>
      </div>

      <!-- Professional Info Card -->
      <div class="card" style="background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 20px;">
        <div class="card-header" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem; margin-bottom: 1rem;">
           <h2 class="card-title" style="font-size: 1.5rem;"><i class="fas fa-briefcase" style="margin-right: 10px; color: var(--primary-400);"></i> Professional Details</h2>
        </div>
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div class="info-group">
              <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; letter-spacing:1px; font-weight: 600;">SKILLS</label>
              ${isEditingProfile
      ? `<input type="text" id="editSkills" class="form-control" value="${(profile.skills || []).join(', ')}" placeholder="Comma separated skills" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 1rem; border-radius: 12px;">`
      : `<div class="skills-tags" style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    ${(profile.skills || []).map(skill => `
                      <span class="badge" style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; padding: 0.5rem 1rem; border-radius: 8px;">${skill}</span>
                    `).join('')}
                   </div>`
    }
            </div>
            <div class="info-group">
              <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; letter-spacing:1px; font-weight: 600;">EXPERIENCE LEVEL</label>
              ${isEditingProfile
      ? `<select id="editExperience" class="form-control" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 1rem; border-radius: 12px;">
                     <option value="entry" ${profile.experience === 'entry' ? 'selected' : ''}>Entry Level (0-2 years)</option>
                     <option value="intermediate" ${profile.experience === 'intermediate' ? 'selected' : ''}>Intermediate (2-5 years)</option>
                     <option value="expert" ${profile.experience === 'expert' ? 'selected' : ''}>Expert (5+ years)</option>
                   </select>`
      : `<p style="text-transform: capitalize; font-size:1.2rem; font-weight:500; margin:0;">${profile.experience || 'Not set'}</p>`
    }
            </div>
            <div class="info-group">
              <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; letter-spacing:1px; font-weight: 600;">HOURLY RATE</label>
              ${isEditingProfile
      ? `<div style="position:relative;">
                     <span style="position:absolute; left:15px; top:50%; transform:translateY(-50%); color:rgba(255,255,255,0.5);">&#8377;</span>
                     <input type="number" id="editHourlyRate" class="form-control" value="${profile.hourlyRate || ''}" placeholder="0" style="padding-left: 35px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 1rem 1rem 1rem 2.5rem; border-radius: 12px;">
                   </div>`
      : `<p style="font-size:1.5rem; font-weight:700; color: #4ade80; margin:0;">&#8377;${profile.hourlyRate || '0'}<span style="font-size:1rem; color:rgba(255,255,255,0.5); font-weight:400;">/hour</span></p>`
    }
            </div>
        </div>
      </div>
      
      <!-- Education Qualifications Card (New) -->
      <div class="card" style="background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 20px;">
        <div class="card-header" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem; margin-bottom: 1rem; display:flex; justify-content:space-between; align-items:center;">
           <h2 class="card-title" style="font-size: 1.5rem;"><i class="fas fa-graduation-cap" style="margin-right: 10px; color: var(--primary-400);"></i> Education</h2>
        </div>
        <div style="display: flex; flex-direction: column; gap: 1rem; max-height: 320px; overflow-y: auto; padding-right: 0.5rem;" class="hide-scrollbar">
             ${(() => {
      let eduList = profile.education;
      if (!Array.isArray(eduList)) {
        if (typeof eduList === 'object' && eduList !== null && eduList.school) arr = [eduList];
        else if (typeof eduList === 'string') arr = [{ school: 'Previous Education', degree: eduList, year: '' }];
        else eduList = [];
      }
      if (!Array.isArray(eduList)) eduList = [];

      if (isEditingProfile) {
        return `
                        <div id="education-fields-container">
                            ${eduList.map((edu, index) => `
                                <div class="education-entry" id="edu-entry-${index}" style="background:rgba(255,255,255,0.05); padding:1rem; border-radius:12px; margin-bottom:1rem; position:relative;">
                                    <button onclick="removeEducationField('${index}')" style="position:absolute; top:5px; right:5px; background:none; border:none; color:rgba(255,100,100,0.8); cursor:pointer;"><i class="fas fa-trash"></i></button>
                                    <div class="info-group">
                                        <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; font-weight: 600;">INSTITUTION</label>
                                        <input type="text" class="edu-school form-control" value="${edu.school || ''}" placeholder="Ex: Boston University" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.8rem; border-radius: 12px; margin-bottom: 0.8rem; width: 100%;">
                                        
                                        <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; font-weight: 600;">DEGREE / FIELD</label>
                                        <input type="text" class="edu-degree form-control" value="${edu.degree || ''}" placeholder="Ex: Bachelor's in Architecture" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.8rem; border-radius: 12px; margin-bottom: 0.8rem; width: 100%;">
                                        
                                        <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; font-weight: 600;">YEARS</label>
                                        <input type="text" class="edu-year form-control" value="${edu.year || ''}" placeholder="Ex: 2018 - 2022" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.8rem; border-radius: 12px; width: 100%;">
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <button onclick="addEducationField()" class="btn btn-sm btn-secondary" style="width:100%; border:1px dashed rgba(255,255,255,0.3); background:rgba(255,255,255,0.05);"><i class="fas fa-plus"></i> Add Another Education</button>
                     `;
      } else {
        if (eduList.length === 0) return `<p style="color:rgba(255,255,255,0.5); font-style:italic;">No education details added.</p>`;
        return eduList.map((edu, idx) => `
                        <div style="display: flex; gap: 1rem; align-items: flex-start; margin-bottom: 1.5rem; position: relative;">
                            ${idx !== eduList.length - 1 ? `<div style="position:absolute; left:23px; top:48px; bottom:-24px; width:2px; background:rgba(255,255,255,0.1);"></div>` : ''}
                            <div style="width: 48px; height: 48px; background: rgba(255,255,255,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; z-index:1;">
                                <i class="fas fa-university" style="font-size: 24px; color: rgba(255,255,255,0.8);"></i>
                            </div>
                            <div style="flex: 1;">
                                <h3 style="font-size: 1.1rem; font-weight: 700; margin: 0 0 0.25rem 0; color: #fff;">${edu.school || 'University Name'}</h3>
                                <p style="font-size: 0.95rem; margin: 0 0 0.25rem 0; color: rgba(255,255,255,0.9);">${edu.degree || 'Degree'}</p>
                                <p style="font-size: 0.85rem; margin: 0; color: rgba(255,255,255,0.5);">${edu.year || 'Date range'}</p>
                            </div>
                        </div>
                     `).join('');
      }
    })()}
        </div>
      </div>
      
       <!-- Stats Card -->
       <div class="card" style="background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.05); grid-column: 1 / -1; border-radius: 20px;">
          <div class="card-header" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem; margin-bottom: 1rem;">
            <h2 class="card-title" style="font-size: 1.5rem;"><i class="fas fa-chart-line" style="margin-right: 10px; color: var(--primary-400);"></i> Performance Overview</h2>
          </div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;">
              <div style="background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02)); padding: 2rem; border-radius: 16px; text-align: center; border: 1px solid rgba(255,255,255,0.05);">
                  <div style="font-size: 2.5rem; margin-bottom: 1rem;"><i class="fas fa-clipboard-list" style="color: #60a5fa;"></i></div>
                  <div style="font-weight: 800; font-size: 1.8rem; color: #fff; line-height: 1;">${jobs.completed.length}</div>
                  <div style="font-size: 0.9rem; color: rgba(255,255,255,0.5); margin-top: 5px; text-transform: uppercase; letter-spacing: 1px;">Jobs Done</div>
              </div>
              <div style="background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02)); padding: 2rem; border-radius: 16px; text-align: center; border: 1px solid rgba(255,255,255,0.05);">
                  <div style="font-size: 2.5rem; margin-bottom: 1rem;"><i class="fas fa-wallet" style="color: #34d399;"></i></div>
                   <div style="font-weight: 800; font-size: 1.8rem; color: #fff; line-height: 1;">&#8377;${earnings}</div>
                  <div style="font-size: 0.9rem; color: rgba(255,255,255,0.5); margin-top: 5px; text-transform: uppercase; letter-spacing: 1px;">Total Earned</div>
              </div>
              <div style="background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02)); padding: 2rem; border-radius: 16px; text-align: center; border: 1px solid rgba(255,255,255,0.05);">
                  <div style="font-size: 2.5rem; margin-bottom: 1rem;"><i class="fas fa-star" style="color: #fbbf24;"></i></div>
                  <div style="font-weight: 800; font-size: 1.8rem; color: #fff; line-height: 1;">${user.karyasetu_rating || 5.0}</div>
                  <div style="font-size: 0.9rem; color: rgba(255,255,255,0.5); margin-top: 5px; text-transform: uppercase; letter-spacing: 1px;">Rating</div>
              </div>
              <div style="background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02)); padding: 2rem; border-radius: 16px; text-align: center; border: 1px solid rgba(255,255,255,0.05);">
                  <div style="font-size: 2.5rem; margin-bottom: 1rem;"><i class="fas fa-check-circle" style="color: #a78bfa;"></i></div>
                  <div style="font-weight: 800; font-size: 1.8rem; color: #fff; line-height: 1;">100%</div>
                  <div style="font-size: 0.9rem; color: rgba(255,255,255,0.5); margin-top: 5px; text-transform: uppercase; letter-spacing: 1px;">Success Rate</div>
              </div>
          </div>
       </div>

    </div>
  `;
}
// ============================================
// JOB REQUESTS PAGE
// ============================================

function getJobRequestsPage() {
  const jobs = Storage.get('worker_jobs');

  return `
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-envelope-open-text" style="color:var(--primary-400);"></i> Job Requests</h1>
      <p class="page-subtitle">Review and accept job requests from customers</p>
      <div class="page-stats">
        <span class="stat-badge">
          <span class="stat-badge-value">--</span>
          <span class="stat-badge-label">Pending Requests</span>
        </span>
      </div>
    </div>
    
    <div class="job-requests-list" id="jobRequestsList">
       <!-- Content loaded asynchronously -->
    </div>
    
      ${jobs.pending.length === 0 ? `
        <div class="empty-state">
          <h3>No pending requests</h3>
          <p>New job requests will appear here</p>
          <button class="btn btn-primary" onclick="loadPage('home')">Go to Dashboard</button>
        </div>
      ` : ''}
    </div>
  `;
}

// ============================================
// ACTIVE JOBS PAGE
// ============================================

// ============================================
// ACTIVE JOBS PAGE
// ============================================

function getActiveJobsPage() {
  return `
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-bolt" style="color:#fbbf24;"></i> Active Jobs</h1>
      <p class="page-subtitle">Jobs currently in progress</p>
      <div class="page-stats">
        <span class="stat-badge">
          <span class="stat-badge-value" id="active-jobs-count">--</span>
          <span class="stat-badge-label">Active Jobs</span>
        </span>
      </div>
    </div>
    
    <div class="jobs-list" id="activeJobsList">
       <!-- Content loaded asynchronously -->
    </div>
  `;
}

// ============================================
// JOB HISTORY PAGE
// ============================================

// ============================================
// JOB HISTORY PAGE
// ============================================

function getJobHistoryPage() {
  return `
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-clipboard-list" style="color:var(--primary-400);"></i> Job History</h1>
      <p class="page-subtitle">Your completed jobs and earnings</p>
      <div class="page-stats">
        <span class="stat-badge">
          <span class="stat-badge-value" id="history-count">--</span>
          <span class="stat-badge-label">Completed Jobs</span>
        </span>
        <span class="stat-badge">
          <span class="stat-badge-value" id="history-earnings">--</span>
          <span class="stat-badge-label">Total Earned</span>
        </span>
      </div>
    </div>
    
    <div class="jobs-list" id="jobHistoryList">
       <!-- Content loaded asynchronously -->
    </div>
  `;
}

// Continue in next message due to length...
console.log('Worker Dashboard - Part 1 Loaded');

// Sidebar Toggling Logic
document.addEventListener('DOMContentLoaded', () => {
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.sidebar');

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('minimized');
      // Save preference
      localStorage.setItem('sidebarMinimized', sidebar.classList.contains('minimized'));
    });

    // Load preference
    if (localStorage.getItem('sidebarMinimized') === 'true') {
      sidebar.classList.add('minimized');
    }
  }
});




// --- New Helpers for Education Section ---
window.addEducationField = function () {
  const container = document.getElementById('education-fields-container');
  const id = Date.now();
  const div = document.createElement('div');
  div.className = 'education-entry';
  div.id = 'edu-entry-' + id;
  div.style.background = 'rgba(255,255,255,0.05)';
  div.style.padding = '1rem';
  div.style.borderRadius = '12px';
  div.style.marginBottom = '1rem';
  div.style.position = 'relative';

  div.innerHTML = `
      <button onclick="removeEducationField('${id}')" style="position:absolute; top:5px; right:5px; background:none; border:none; color:rgba(255,100,100,0.8); cursor:pointer;"><i class="fas fa-trash"></i></button>
      <div class="info-group">
          <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; font-weight: 600;">INSTITUTION</label>
          <input type="text" class="edu-school form-control" placeholder="Ex: Boston University" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.8rem; border-radius: 12px; margin-bottom: 0.8rem; width: 100%;">
          
          <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; font-weight: 600;">DEGREE / FIELD</label>
          <input type="text" class="edu-degree form-control" placeholder="Ex: Bachelor's in Architecture" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.8rem; border-radius: 12px; margin-bottom: 0.8rem; width: 100%;">
          
          <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; font-weight: 600;">YEARS</label>
          <input type="text" class="edu-year form-control" placeholder="Ex: 2018 - 2022" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.8rem; border-radius: 12px; width: 100%;">
      </div>
  `;
  container.appendChild(div);
};

window.removeEducationField = function (id) {
  const el = document.getElementById('edu-entry-' + id);
  if (el) el.remove();
};


// --- Image Upload Helper ---
window.triggerImageUpload = function () {
  document.getElementById('profile-image-upload').click();
};

window.handleImageUpload = function (input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      // Update UI
      const img = document.getElementById('profile-image-display');
      if (img) img.src = e.target.result;

      // Save to Storage
      const userData = Storage.get('karyasetu_user') || {};
      userData.avatar = e.target.result;
      Storage.set('karyasetu_user', userData);

      showToast('Profile picture updated!', 'success');
    };
    reader.readAsDataURL(input.files[0]);
  }
};


// --- Remove Profile Image Helper ---
window.removeProfileImage = function () {
  if (!confirm('Are you sure you want to remove your profile picture?')) return;

  // Reset to default
  const userData = Storage.get('karyasetu_user') || {};
  delete userData.avatar;
  Storage.set('karyasetu_user', userData);

  // Update UI
  const img = document.getElementById('profile-image-display');
  if (img) {
    img.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userData.name || 'Worker') + '&background=0f172a&color=fff&size=256';
  }
  showToast('Profile picture removed.', 'info');
};

// ============================================
// PAGE INITIALIZATION & ASYNC DATA FETCHING
// ============================================




// ============================================
// PAGE INITIALIZATION & ASYNC DATA FETCHING
// ============================================

function initializePage(pageName, params) {
  console.log(`Initializing page: ${pageName}`);

  // Page-specific initialization logic
  if (pageName === 'job-requests') {
    fetchAndRenderJobRequests();
  } else if (pageName === 'active-jobs') {
    fetchAndRenderActiveJobs();
  } else if (pageName === 'job-history') {
    fetchAndRenderJobHistory();
  }
}



async function fetchAndRenderJobRequests() {
  const listContainer = document.getElementById('jobRequestsList');
  if (!listContainer) return;

  // 1. Try to load from cache first for instant UI
  const cachedJobs = Storage.get('worker_jobs_requests_cache');
  if (cachedJobs && Array.isArray(cachedJobs) && cachedJobs.length > 0) {
    renderJobRequestsList(cachedJobs, listContainer);
  } else {
    // Only show loading spinner if no cache (first time load)
    listContainer.innerHTML = `
        <div style="text-align:center; padding: 2rem;">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--neon-blue);"></i>
            <p style="margin-top: 1rem; color: var(--text-tertiary);">Loading available jobs...</p>
        </div>
    `;
  }

  try {
    // 2. Fetch fresh data
    console.log('Fetching fresh job requests...');
    const jobs = await API.jobs.getAvailable();

    // 3. Update Cache & UI
    Storage.set('worker_jobs_requests_cache', jobs);
    renderJobRequestsList(jobs, listContainer);

    // Update Pending Count in Header
    const countBadge = document.querySelector('.stat-badge-value');
    if (countBadge) countBadge.textContent = jobs.length;

  } catch (error) {
    console.error('Failed to load jobs:', error);
    // Only show error if we have no cache to show
    if (!cachedJobs || cachedJobs.length === 0) {
      listContainer.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: var(--error);"></i>
                <p>Failed to load jobs.</p>
                <button class="btn btn-sm btn-secondary" onclick="fetchAndRenderJobRequests()">Retry</button>
            </div>
        `;
    }
  }
}

function renderJobRequestsList(jobs, container) {
  if (jobs.length === 0) {
    container.innerHTML = `
                <div class="empty-state">
                   <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
                   <h3>No New Job Requests</h3>
                   <p>Check back later for open opportunities in your area.</p>
                </div>
            `;
    return;
  }

  container.innerHTML = jobs.map(job => `
          <div class="job-request-item" style="animation: slideUp 0.3s ease-out;">
            <div class="job-request-header">
              <h4>${job.serviceType || 'Service Request'}</h4>
              <span class="badge ${job.createdAt && (Date.now() - new Date(job.createdAt).getTime() < 3600000) ? 'badge-error' : 'badge-info'}">
                ${job.status ? job.status.toUpperCase() : 'PENDING'}
              </span>
            </div>
            <p class="job-request-desc">${job.description || 'No description provided.'}</p>
            <p class="job-request-location"><i class="fas fa-map-marker-alt" style="color:var(--neon-pink)"></i> ${job.address || 'Location Hidden'}</p>
            <p class="job-request-price">💰 &#8377;${job.price || '450 - 800'}</p>
            
            <div class="job-request-actions">
              <button class="btn btn-sm btn-primary" onclick="acceptJob('${job.id}')">Accept</button>
              <button class="btn btn-sm btn-secondary" onclick="viewJobDetails('${job.id}')">Details</button>
              <button class="btn btn-sm btn-ghost" onclick="declineJob('${job.id}')">Decline</button>
            </div>
          </div>
        `).join('');
}

async function fetchAndRenderActiveJobs() {
  const listContainer = document.getElementById('activeJobsList');
  if (!listContainer) return;

  // 1. Try to load from cache first
  const cachedActive = Storage.get('worker_active_jobs_cache');
  if (cachedActive && Array.isArray(cachedActive) && cachedActive.length > 0) {
    renderActiveJobsList(cachedActive, listContainer);
    const countEl = document.getElementById('active-jobs-count');
    if (countEl) countEl.textContent = cachedActive.length;
  } else {
    // Show loading only if no cache
    listContainer.innerHTML = `
          <div style="text-align:center; padding: 2rem;">
              <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--neon-blue);"></i>
              <p style="margin-top: 1rem; color: var(--text-tertiary);">Loading active jobs...</p>
          </div>
      `;
  }

  try {
    const user = Storage.get('karyasetu_user');
    // Fetch fresh data
    console.log('Fetching fresh active jobs...');
    const allJobs = await API.jobs.getMyJobs(user.uid, 'worker');
    const activeJobs = allJobs.filter(j => j.status === 'in_progress');

    // Update Cache & UI
    Storage.set('worker_active_jobs_cache', activeJobs);
    renderActiveJobsList(activeJobs, listContainer);

    // Update count
    const countEl = document.getElementById('active-jobs-count');
    if (countEl) countEl.textContent = activeJobs.length;

  } catch (error) {
    console.error('Failed to load active jobs:', error);
    if (!cachedActive || cachedActive.length === 0) {
      listContainer.innerHTML = '<div class="error-state">Failed to load active jobs.</div>';
    }
  }
}

function renderActiveJobsList(activeJobs, container) {
  if (activeJobs.length === 0) {
    container.innerHTML = `
          <div class="empty-state">
             <div style="font-size: 3rem; margin-bottom: 1rem;">⚡</div>
             <h3>No Active Jobs</h3>
             <p>You have no jobs in progress.</p>
             <button class="btn btn-primary" onclick="loadPage('job-requests')">Find New Jobs</button>
          </div>
      `;
    return;
  }

  container.innerHTML = activeJobs.map(job => `
        <div class="job-card active-job-card" style="animation: slideUp 0.3s ease-out;">
          <div class="job-card-header">
            <div>
              <h3>${job.serviceType}</h3>
              <span class="badge badge-success">IN PROGRESS</span>
            </div>
            <span class="job-time">Accepted ${getRelativeTime(job.acceptedAt || job.updatedAt)}</span>
          </div>
          
          <p class="job-description">${job.description || 'No description'}</p>
          
           <div class="job-progress">
             <div class="progress-bar">
               <div class="progress-fill" style="width: 50%"></div>
             </div>
             <span class="progress-text">In Progress</span>
          </div>
          
          <div class="job-details">
            <div class="job-detail-row">
              <span class="detail-icon"><i class="fas fa-user"></i></span>
              <span class="detail-text">Customer: ${job.customerName || 'Customer'}</span>
            </div>
            <div class="job-detail-row">
              <span class="detail-icon"><i class="fas fa-map-marker-alt"></i></span>
              <span class="detail-text">${job.address}</span>
            </div>
            <div class="job-detail-row">
              <span class="detail-icon"><i class="fas fa-wallet"></i></span>
              <span class="detail-text">₹${job.price}</span>
            </div>
             <div class="job-detail-row">
              <span class="detail-icon"><i class="fas fa-calendar-alt"></i></span>
              <span class="detail-text">${job.date || 'Today'} @ ${job.time || 'Now'}</span>
            </div>
          </div>
          
          <div class="job-actions">
            <button class="btn btn-success" onclick="completeJob('${job.id}')">
              <span>Mark as Complete</span>
            </button>
            <button class="btn btn-sm btn-info" onclick="window.location.href='chat.html?bookingId=${job.id}&customerName=${encodeURIComponent(job.customerName || 'Customer')}'">Chat</button>
          </div>
        </div>
      `).join('');
}

async function fetchAndRenderJobHistory() {
  const listContainer = document.getElementById('jobHistoryList');
  if (!listContainer) return;

  listContainer.innerHTML = `
      <div style="text-align:center; padding: 2rem;">
          <i class="fas fa-history fa-spin" style="font-size: 2rem; color: var(--neon-blue);"></i>
          <p style="margin-top: 1rem; color: var(--text-tertiary);">Loading history...</p>
      </div>
  `;

  try {
    const user = Storage.get('karyasetu_user');
    const allJobs = await API.jobs.getMyJobs(user.uid, 'worker');
    const completedJobs = allJobs.filter(j => j.status === 'completed');

    // Update Stats
    const countEl = document.getElementById('history-count');
    const earnEl = document.getElementById('history-earnings');

    if (countEl) countEl.textContent = completedJobs.length;

    const totalEarnings = completedJobs.reduce((sum, job) => sum + (Number(job.price) || 0), 0);
    if (earnEl) earnEl.innerHTML = '&#8377;' + totalEarnings.toLocaleString();

    if (completedJobs.length === 0) {
      listContainer.innerHTML = `
          <div class="empty-state">
             <div style="font-size: 3rem; margin-bottom: 1rem;">📜</div>
             <h3>No History Yet</h3>
             <p>Complete jobs to build your work history.</p>
          </div>
      `;
      return;
    }

    listContainer.innerHTML = completedJobs.map(job => `
        <div class="job-card" style="animation: slideUp 0.3s ease-out; opacity: 0.8;">
          <div class="job-card-header">
            <div>
              <h3>${job.serviceType}</h3>
              <p style="color:var(--text-secondary); font-size:0.9rem;">Customer: ${job.customerName || 'Valued Customer'}</p>
            </div>
            <div style="text-align:right;">
               <span class="badgem badge-success" style="background:rgba(16, 185, 129, 0.2); color:#34d399; padding:0.2rem 0.5rem; border-radius:4px; font-size:0.75rem;">COMPLETED</span>
              <span class="job-time" style="display:block; margin-top:5px;">${formatDate(job.completedAt || job.updatedAt)}</span>
            </div>
          </div>
          
          <p class="job-description">${job.description || 'No description'}</p>
          
          <div class="job-details" style="border-top:1px solid rgba(255,255,255,0.05); padding-top:1rem; margin-top:1rem;">
            <div class="job-detail-row">
              <span class="detail-icon"><i class="fas fa-wallet" style="color:#34d399;"></i></span>
              <span class="detail-text" style="color:#34d399; font-weight:bold;">Earned &#8377;${job.price}</span>
            </div>
          </div>
          
          <!-- Rating placeholder if we had reviews -->
           <div class="job-history-footer" style="margin-top:1rem;">
             <div class="job-rating">
               <span class="rating-stars"><i class="fas fa-star" style="color:#fbbf24; margin-right:2px;"></i><i class="fas fa-star" style="color:#fbbf24; margin-right:2px;"></i><i class="fas fa-star" style="color:#fbbf24; margin-right:2px;"></i><i class="fas fa-star" style="color:#fbbf24; margin-right:2px;"></i><i class="fas fa-star" style="color:#fbbf24; margin-right:2px;"></i></span>
               <span class="rating-value">5/5</span>
             </div>
           </div>
        </div>
      `).join('');

  } catch (error) {
    console.error('Failed to load job history:', error);
    listContainer.innerHTML = '<div class="error-state">Failed to load history.</div>';
  }
}

// ============================================
// JOB ACTIONS
// ============================================

window.acceptJob = async function (jobId) {
  if (!confirm('Are you sure you want to accept this job?')) return;

  showLoading('Accepting Job...');
  try {
    const user = Storage.get('karyasetu_user');
    await API.jobs.update(jobId, {
      status: 'in_progress',
      workerId: user.uid,
      acceptedAt: new Date().toISOString()
    });

    showToast('Job Accepted Successfully!', 'success');
    fetchAndRenderJobRequests(); // Refresh requests list
    fetchAndRenderActiveJobs();  // Refresh active jobs list

  } catch (error) {
    console.error('Failed to accept job:', error);
    showToast('Failed to accept job. Please try again.', 'error');
  } finally {
    hideLoading();
  }
};

window.declineJob = function (jobId) {
  if (!confirm('Dismiss this job request?')) return;

  // For now, just remove from UI or mark as ignored locally
  // In real app, might want to blacklist this Job ID for this worker
  const card = document.querySelector(`button[onclick="declineJob('${jobId}')"]`).closest('.job-request-item');
  if (card) {
    card.style.opacity = '0';
    setTimeout(() => card.remove(), 300);
  }
  showToast('Job request dismissed.', 'info');
};

window.viewJobDetails = function (jobId) {
  alert('Job Details View coming soon for ID: ' + jobId);
};

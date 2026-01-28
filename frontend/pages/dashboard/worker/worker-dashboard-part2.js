// ============================================
// WORKER DASHBOARD - PART 2
// Additional Pages and Functionality
// ============================================

<<<<<<< HEAD:frontend/dashboard/worker-dashboard-part2.js
=======
// Imports
import { API, apiFetch } from '../../../js/api.js';
import { Storage } from '../../../js/utils.js';

// Note: This file uses ES modules and is loaded after worker-dashboard.js
let selectedWorkerName = null;

// Helper to safely get dashboardData from window
const getDashboardData = () => window.dashboardData || {
  jobs: { active: [], pending: [], completed: [] },
  earnings: { today: 0, week: 0, month: 0, total: 0 },
  reviews: [],
  performance: { satisfaction: 0, onTime: 0, responseRate: 0, repeatCustomers: 0 }
};

>>>>>>> vengeance2.0:frontend/pages/dashboard/worker/worker-dashboard-part2.js
// ============================================
// AVAILABILITY PAGE
// ============================================

function getAvailabilityPage() {
<<<<<<< HEAD:frontend/dashboard/worker-dashboard-part2.js
  const availability = Storage.get('worker_availability') || {
=======
  const defaultAvailability = {
>>>>>>> vengeance2.0:frontend/pages/dashboard/worker/worker-dashboard-part2.js
    isOnline: false,
    workingHours: {
      monday: { enabled: true, start: '09:00', end: '17:00' },
      tuesday: { enabled: true, start: '09:00', end: '17:00' },
      wednesday: { enabled: true, start: '09:00', end: '17:00' },
      thursday: { enabled: true, start: '09:00', end: '17:00' },
      friday: { enabled: true, start: '09:00', end: '17:00' },
<<<<<<< HEAD:frontend/dashboard/worker-dashboard-part2.js
      saturday: { enabled: true, start: '10:00', end: '14:00' },
      sunday: { enabled: false, start: '00:00', end: '00:00' }
=======
      saturday: { enabled: false, start: '10:00', end: '14:00' },
      sunday: { enabled: false, start: '10:00', end: '14:00' }
    }
  };

  const availability = Storage.get('worker_availability') || defaultAvailability;
  if (!availability.workingHours) availability.workingHours = defaultAvailability.workingHours;

  // Calculate total hours
  let totalHours = 0;
  Object.values(availability.workingHours).forEach(h => {
    if (h && h.enabled && h.start && h.end) {
      const start = new Date(`2000-01-01T${h.start}`);
      const end = new Date(`2000-01-01T${h.end}`);
      totalHours += (end - start) / 3600000;
>>>>>>> vengeance2.0:frontend/pages/dashboard/worker/worker-dashboard-part2.js
    }
  };

  return `
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-calendar-alt"></i> Availability Settings</h1>
      <p class="page-subtitle">Manage your working hours and availability</p>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h2>Working Hours</h2>
      </div>
      <div class="card-body">
        <p>Configure your availability schedule here. (Feature coming soon)</p>
      </div>
    </div>
  `;
}

// ============================================
// EARNINGS PAGE
// ============================================

<<<<<<< HEAD:frontend/dashboard/worker-dashboard-part2.js
=======
// ============================================
// EARNINGS PAGE
// ============================================

async function fetchAndRenderEarningsPage() {
  const user = Storage.get('karyasetu_user');
  if (!user) return;

  const container = document.getElementById('earnings-placeholder');
  if (!container) return;

  container.innerHTML = `
      <div style="text-align:center; padding: 4rem;">
          <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--success);"></i>
          <p style="margin-top: 1rem; color: var(--text-tertiary);">Loading your earnings...</p>
      </div>
  `;

  try {
    const transactions = await API.transactions.getByUser(user.uid);

    // Calculate Metrics
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const earningsNow = new Date();
    const startOfWeek = new Date(earningsNow.setDate(earningsNow.getDate() - earningsNow.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let today = 0, week = 0, month = 0, total = 0;

    // Filter credits only for earnings
    const credits = transactions.filter(t => t.type === 'credit');

    credits.forEach(t => {
      const date = new Date(t.createdAt);
      const amount = parseFloat(t.amount);

      if (date >= startOfDay) today += amount;
      if (date >= startOfWeek) week += amount;
      if (date >= startOfMonth) month += amount;
      total += amount;
    });

    container.innerHTML = `
        <div class="page-header">
          <h1 class="page-title"><i class="fas fa-wallet" style="color:var(--success);"></i> My Earnings</h1>
          <p class="page-subtitle">Track your income and financial performance</p>
        </div>
        
        <div class="earnings-dashboard">
          <div class="earnings-summary-grid">
            <div class="earnings-summary-card">
              <div class="summary-icon"><i class="fas fa-calendar-day"></i></div>
              <div class="summary-content">
                <span class="summary-label">Today</span>
                <span class="summary-value">₹${today.toLocaleString()}</span>
              </div>
            </div>
            <div class="earnings-summary-card">
              <div class="summary-icon"><i class="fas fa-chart-bar"></i></div>
              <div class="summary-content">
                <span class="summary-label">This Week</span>
                <span class="summary-value">₹${week.toLocaleString()}</span>
              </div>
            </div>
            <div class="earnings-summary-card">
              <div class="summary-icon"><i class="fas fa-chart-line"></i></div>
              <div class="summary-content">
                <span class="summary-label">This Month</span>
                <span class="summary-value">₹${month.toLocaleString()}</span>
              </div>
            </div>
            <div class="earnings-summary-card">
              <div class="summary-icon"><i class="fas fa-gem"></i></div>
              <div class="summary-content">
                <span class="summary-label">Total Earned</span>
                <span class="summary-value">₹${total.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <!-- Weekly Chart -->
          <div class="card">
            <div class="card-header">
              <h2>Weekly Earnings</h2>
            </div>
            <div class="chart-container" style="height: 300px; position: relative;">
              <canvas id="earningsChart"></canvas>
            </div>
          </div>
          
          <!-- Recent Transactions -->
          <div class="card">
            <div class="card-header">
              <h2>Recent Transactions</h2>
              <button class="btn-text" onclick="loadPage('wallet')">View All</button>
            </div>
            <div class="earnings-history">
              ${credits.slice(0, 5).map(t => `
                <div class="earning-item">
                  <div class="earning-info">
                    <h4>${t.description || t.source}</h4>
                    <span class="earning-date">${new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div class="earning-amount">
                    <span class="amount-value">+₹${t.amount}</span>
                    <span class="badge badge-success">${t.status}</span>
                  </div>
                </div>
              `).join('')}
              ${credits.length === 0 ? '<p>No earnings yet.</p>' : ''}
            </div>
          </div>
        </div>
    `;

    // Initialize Chart
    if (typeof initializeEarningsChart === 'function') {
      setTimeout(() => initializeEarningsChart(transactions), 100);
    } else {
      console.warn('initializeEarningsChart not defined, skipping chart init');
    }

  } catch (err) {
    console.error("Earnings Load Error:", err);
    container.innerHTML = `
        <div class="error-state">
            <i class="fas fa-exclamation-circle" style="font-size: 2.5rem; color: var(--error);"></i>
            <h3>Failed to load earnings</h3>
            <p>Please try again later. Error: ${err.message}</p>
            <button class="btn btn-secondary" onclick="fetchAndRenderEarningsPage()">Retry</button>
        </div>
    `;
  }
}

>>>>>>> vengeance2.0:frontend/pages/dashboard/worker/worker-dashboard-part2.js
function getEarningsPage() {
  const earnings = dashboardData.earnings || { today: 0, week: 0, month: 0, total: 0 };

  return `
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-wallet"></i> My Earnings</h1>
      <p class="page-subtitle">Track your income and payment history</p>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <i class="fas fa-calendar-day"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">₹${earnings.today}</div>
          <div class="stat-label">Today</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
          <i class="fas fa-calendar-week"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">₹${earnings.week}</div>
          <div class="stat-label">This Week</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
          <i class="fas fa-calendar-alt"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">₹${earnings.month}</div>
          <div class="stat-label">This Month</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
          <i class="fas fa-coins"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">₹${earnings.total}</div>
          <div class="stat-label">Total Earned</div>
        </div>
      </div>
    </div>
  `;
}

// ============================================
// WALLET PAGE
// ============================================

function getWalletPage() {
  return `
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-credit-card"></i> Wallet</h1>
      <p class="page-subtitle">Manage your balance and withdrawals</p>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h2>Wallet Balance</h2>
      </div>
      <div class="card-body">
        <div style="text-align: center; padding: 2rem;">
          <div style="font-size: 3rem; font-weight: bold; color: var(--primary-400);">₹${dashboardData.earnings.total || 0}</div>
          <p style="color: var(--text-secondary); margin-top: 0.5rem;">Available Balance</p>
          <button class="btn btn-primary" style="margin-top: 1rem;" onclick="alert('Withdrawal feature coming soon!')">
            <i class="fas fa-money-bill-wave"></i> Withdraw Funds
          </button>
        </div>
      </div>
    </div>
  `;
}

// ============================================
// RATINGS & REVIEWS PAGE
// ============================================

function getRatingsPage() {
  const reviews = Storage.get('worker_reviews') || dashboardData.reviews || [];
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    : 0;
  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length
  };

  return `
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-star" style="color:#fbbf24;"></i> Ratings & Reviews</h1>
      <p class="page-subtitle">See what customers say about your work</p>
    </div>
    
    <div class="ratings-container">
      <!-- Rating Summary -->
      <div class="card rating-summary-card">
        <div class="rating-summary">
          <div class="rating-score">
            <div class="score-value">${avgRating.toFixed(1)}</div>
            <div class="score-stars">${'⭐'.repeat(Math.round(avgRating))}</div>
            <div class="score-count">${reviews.length} reviews</div>
          </div>
          
          <div class="rating-distribution">
            ${[5, 4, 3, 2, 1].map(star => {
    const count = ratingDistribution[star];
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return `
                <div class="rating-bar">
                  <span class="rating-label">${star} <i class="fas fa-star" style="color:#fbbf24;"></i></span>
                  <div class="rating-progress">
                    <div class="rating-progress-fill" style="width: ${percentage}%"></div>
                  </div>
                  <span class="rating-count">${count}</span>
                </div>
              `;
  }).join('')}
          </div>
        </div>
      </div>
      
      <!-- Reviews List -->
      <div class="card">
        <div class="card-header">
          <h2>Customer Reviews</h2>
          <select class="filter-select">
            <option>All Reviews</option>
            <option>5 Stars</option>
            <option>4 Stars</option>
            <option>3 Stars</option>
            <option>Recent</option>
          </select>
        </div>
        <div class="reviews-list">
          ${reviews.length > 0 ? reviews.map(review => `
            <div class="review-card">
              <div class="review-header">
                <div class="review-customer">
                  <div class="customer-avatar">${(review.customerName || 'U').charAt(0)}</div>
                  <div class="customer-info">
                    <h4>${review.customerName || 'Anonymous'}</h4>
                    <span class="review-date">${new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div class="review-rating">
                  <span class="rating-stars">${'⭐'.repeat(review.rating || 0)}</span>
                  <span class="rating-value">${review.rating || 0}/5</span>
                </div>
              </div>
              <p class="review-comment">"${review.comment || 'No comment provided'}"</p>
            </div>
          `).join('') : '<p style="text-align: center; padding: 2rem; color: var(--text-secondary);">No reviews yet</p>'}
        </div>
      </div>
      
       <!-- Performance Insights -->
      <div class="card">
        <div class="card-header">
          <h2><i class="fas fa-chart-pie" style="color:var(--primary-400);"></i> Performance Insights</h2>
        </div>
        <div class="insights-grid">
          <div class="insight-item">
            <span class="insight-icon"><i class="fas fa-bullseye" style="color:var(--error);"></i></span>
            <div class="insight-content">
              <span class="insight-value">${getDashboardData().performance.satisfaction}%</span>
              <span class="insight-label">Customer Satisfaction</span>
            </div>
          </div>
          <div class="insight-item">
            <span class="insight-icon"><i class="fas fa-bolt" style="color:#fbbf24;"></i></span>
            <div class="insight-content">
              <span class="insight-value">${getDashboardData().performance.onTime}%</span>
              <span class="insight-label">On-Time Completion</span>
            </div>
          </div>
          <div class="insight-item">
            <span class="insight-icon"><i class="fas fa-comments" style="color:var(--info);"></i></span>
            <div class="insight-content">
              <span class="insight-value">${getDashboardData().performance.responseRate}%</span>
              <span class="insight-label">Response Rate</span>
            </div>
          </div>
          <div class="insight-item">
            <span class="insight-icon"><i class="fas fa-sync" style="color:var(--success);"></i></span>
            <div class="insight-content">
<<<<<<< HEAD:frontend/dashboard/worker-dashboard-part2.js
              <span class="insight-value">${dashboardData.performance.repeatCustomers}</span>
=======
              <span class="insight-value">${getDashboardData().performance.repeatCustomers}%</span>
>>>>>>> vengeance2.0:frontend/pages/dashboard/worker/worker-dashboard-part2.js
              <span class="insight-label">Repeat Customers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Add missing chart functions
function initializeEarningsChart(transactions) {
  const ctx = document.getElementById('earningsChart')?.getContext('2d');
  if (!ctx) return;

  if (window.Chart) {
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Earnings (₹)',
          data: [0, 0, 0, 0, 0, 0, 0], // Placeholder
          borderColor: '#3b82f6',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
}

function updateEarningsChart(range) {
  console.log('Update earnings chart for:', range);
}

function updatePerformanceChart(range) {
  console.log('Update performance chart for:', range);
}


// ============================================
// SUPPORT PAGE
// ============================================

function getSupportPage() {
  return `
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-life-ring"></i> Support</h1>
      <p class="page-subtitle">Get help when you need it</p>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h2>Contact Support</h2>
      </div>
      <div class="card-body">
        <p>Need help? Contact our support team:</p>
        <p style="margin-top: 1rem;"><strong>Email:</strong> support@karyasetu.com</p>
        <p><strong>Phone:</strong> +91-1800-123-4567</p>
        <p><strong>Hours:</strong> 9 AM - 6 PM (Mon-Sat)</p>
      </div>
    </div>
  `;
}

// ============================================
// SETTINGS PAGE
// ============================================

function getSettingsPage() {
  const user = Storage.get('karyasetu_user') || {};

  return `
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-cog"></i> Settings</h1>
      <p class="page-subtitle">Manage your account preferences</p>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h2>Account Settings</h2>
      </div>
      <div class="card-body">
        <div class="form-group">
          <label>Email</label>
          <input type="email" class="form-control" value="${user.email || ''}" readonly>
        </div>
        <div class="form-group">
          <label>Phone</label>
          <input type="tel" class="form-control" value="${user.phone || ''}" readonly>
        </div>
        <button class="btn btn-primary" onclick="changePassword()">
          <i class="fas fa-key"></i> Change Password
        </button>
      </div>
    </div>
  `;
}

// ============================================
// REFERRALS PAGE
// ============================================

function getReferralsPage() {
  return `
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-users"></i> Refer & Earn</h1>
      <p class="page-subtitle">Invite friends and earn rewards</p>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h2>Your Referral Code</h2>
      </div>
      <div class="card-body">
        <p style="text-align: center; font-size: 2rem; font-weight: bold; color: var(--primary-400);">WORKER2024</p>
        <p style="text-align: center; color: var(--text-secondary);">Share this code with friends to earn ₹500 per referral!</p>
      </div>
    </div>
  `;
}

// ============================================
// CHAT PAGE
// ============================================

function getChatPage() {
  return `
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-comments"></i> Messages</h1>
      <p class="page-subtitle">Chat with customers</p>
    </div>
    
    <div class="card">
      <div class="card-body">
        <p style="text-align: center; padding: 2rem; color: var(--text-secondary);">No messages yet</p>
      </div>
    </div>
<<<<<<< HEAD:frontend/dashboard/worker-dashboard-part2.js
  `;
}
=======

    <div class="dashboard-card" style="max-width: 800px; margin: 0 auto;">
         <div class="card-header">
             <h2>Select Co-worker</h2>
             <input type="text" placeholder="Search co-workers..." class="search-input" style="width: 250px;">
         </div>
         
         <div class="worker-list" id="workerListContainer" style="max-height: 600px; overflow-y: auto; padding: var(--spacing-md);">
            ${coWorkers.map(w => `
             <div class="worker-item ${!w.available ? 'disabled' : ''}" 
                  onclick="selectCoWorker(this, '${w.name}')" 
                  style="display: flex; align-items: center; gap: var(--spacing-md); padding: var(--spacing-md); background: var(--bg-tertiary); border-radius: var(--radius-lg); margin-bottom: var(--spacing-sm); cursor: pointer; transition: all 0.2s; border: 1px solid transparent; ${!w.available ? 'opacity:0.6; pointer-events:none;' : ''}">
               
               <div class="user-avatar" style="width:50px; height:50px; font-size:1.5rem; background: var(--primary-600); color: white; display:flex; align-items:center; justify-content:center; border-radius:50%;">👷</div>
               
               <div style="flex:1;">
                  <div style="font-weight:600; font-size: 1.1rem; margin-bottom: 2px;">${w.name}</div>
                  <div style="font-size:0.9rem; color:var(--text-tertiary);">${w.skill} • ⭐ ${w.rating}</div>
               </div>
               
               <span class="badge ${w.available ? 'badge-success' : 'badge-warning'}">
                 ${w.available ? 'Available' : 'Busy'}
               </span>
             </div>
           `).join('')}
         </div>

         <div style="margin-top: var(--spacing-xl); padding-top: var(--spacing-lg); border-top: 1px solid var(--border-primary); display: flex; justify-content: flex-end; gap: var(--spacing-md);">
             <button class="btn btn-ghost" onclick="loadPage('active-jobs')">Cancel</button>
             <button class="btn btn-primary" id="referBtn" disabled onclick="confirmReferralPage('${jobId}')">Confirm Referral</button>
         </div>
    </div>
    `;
}

// Reuse existing helper functions but safeguard them
function selectCoWorker(el, name) {
  document.querySelectorAll('.worker-item').forEach(i => {
    i.style.borderColor = 'transparent';
    i.style.backgroundColor = 'var(--bg-tertiary)';
  });
  el.style.borderColor = 'var(--success)';
  el.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
  selectedWorkerName = name; // Global var usage

  const btn = document.getElementById('referBtn');
  if (btn) btn.disabled = false;
}

function confirmReferralPage(jobId) {
  if (selectedWorkerName) {
    showToast(`Job ${jobId} successfully referred to ${selectedWorkerName}!`, 'success');
    // Navigate back or refresh
    setTimeout(() => loadPage('active-jobs'), 1500);
  }
}

function referCoWorker(jobId) {
  const coWorkers = [
    { name: 'Ramesh Kumar', skill: 'Plumber', rating: 4.8, available: true },
    { name: 'Amit Singh', skill: 'Plumber', rating: 4.5, available: true },
    { name: 'John Doe', skill: 'Helper', rating: 4.2, available: false }
  ];

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Refer a Co-worker</h3>
          <button class="btn-text" onclick="this.closest('.modal-overlay').remove()">✕</button>
        </div>
        <div class="worker-list">
           ${coWorkers.map(w => `
             <div class="worker-item" onclick="selectCoWorker(this, '${w.name}')" style="${!w.available ? 'opacity:0.5;pointer-events:none;' : ''}">
               <div class="chat-avatar">👷</div>
               <div style="flex:1;">
                  <div style="font-weight:600;">${w.name}</div>
                  <div style="font-size:0.8rem;color:var(--text-tertiary);">${w.skill} • ⭐ ${w.rating}</div>
               </div>
               ${w.available ? '<span class="badge badge-success">Available</span>' : '<span class="badge badge-warning">Busy</span>'}
             </div>
           `).join('')}
        </div>
        <div class="modal-footer" style="padding-top:var(--spacing-lg); display:flex; justify-content:flex-end; gap:var(--spacing-sm);">
           <button class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
           <button class="btn btn-primary" id="referBtn" disabled onclick="confirmReferral('${jobId}')">Refer</button>
        </div>
      </div>
    `;
  document.body.appendChild(modal);
}

>>>>>>> vengeance2.0:frontend/pages/dashboard/worker/worker-dashboard-part2.js

// ============================================
// REFERRAL PAGE (Alias)
// ============================================

<<<<<<< HEAD:frontend/dashboard/worker-dashboard-part2.js
function getReferralPage() {
  return getReferralsPage();
}
=======
function initializePage(pageName, params) {
  console.log(`Initialized page: ${pageName}`, params);

  // Initialize chart if we are on home/overview or any page with the chart
  const performanceCanvas = document.getElementById('performanceChart');
  if (performanceCanvas) {
    updatePerformanceChart('week');

    // Also fetch jobs for the dashboard
    if (typeof fetchAndRenderJobRequests === 'function') fetchAndRenderJobRequests();
    if (typeof fetchAndRenderActiveJobs === 'function') fetchAndRenderActiveJobs();
  } else if (pageName === 'job-history') {
    if (typeof fetchAndRenderJobHistory === 'function') fetchAndRenderJobHistory();
  } else if (pageName === 'support') {
    const user = Storage.get('karyasetu_user');
    if (user && typeof loadTicketsHistory === 'function') loadTicketsHistory(user.uid);
  } else if (pageName === 'referrals') {
    const user = Storage.get('karyasetu_user');
    if (user && typeof loadReferralsHistory === 'function') loadReferralsHistory(user.uid);
  }

  // Initialize earnings chart if on earnings page
  // fetchAndRenderEarningsPage handles chart init now
  // if (pageName === 'earnings') {
  //   setTimeout(initializeEarningsChart, 500);
  // }
  const earningsCanvas = document.getElementById('earningsChart');
  if (earningsCanvas) {
    updateEarningsChart('week');
  }

  if (pageName === 'availability') {
    // Initialize time pickers (already handled by HTML value)
  }

  if (pageName === 'earnings') {
    if (typeof fetchAndRenderEarningsPage === 'function') fetchAndRenderEarningsPage();
  }
}

// ============================================
// GLOBAL EXPOSURE FOR CROSS-MODULE ACCESS
// ============================================
// Expose page content functions globally so worker-dashboard.js can access them
window.getAvailabilityPage = getAvailabilityPage;
window.getEarningsPage = getEarningsPage;
window.getWalletPage = getWalletPage;
window.getRatingsPage = getRatingsPage;
window.getRatingsReviewsPage = getRatingsPage; // Compatibility alias
window.getSupportPage = getSupportPage;
window.getSettingsPage = getSettingsPage;
window.getReferralsPage = getReferralsPage;
window.showReferralModal = referCoWorker;
window.selectCoWorker = selectCoWorker;
window.confirmReferralPage = confirmReferralPage;
window.toggleDay = toggleDay;
window.updateTime = updateTime;
window.applyToAllDays = applyToAllDays;
window.getChatPage = getChatPage;
window.getReferralPage = getReferralPage;
window.initializePage = initializePage;

// ============================================
// INITIAL LOAD
// ============================================
// Note: Initialization is handled in worker-dashboard.js
>>>>>>> vengeance2.0:frontend/pages/dashboard/worker/worker-dashboard-part2.js

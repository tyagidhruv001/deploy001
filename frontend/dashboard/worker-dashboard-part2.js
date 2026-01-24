// ============================================
// WORKER DASHBOARD - PART 2
// Additional Pages and Functionality
// ============================================

// This file continues from worker-dashboard.js
// Append this to the main file or include separately

// ============================================
// AVAILABILITY PAGE
// ============================================

function getAvailabilityPage() {
  const availability = Storage.get('worker_availability');

  // Calculate total hours
  let totalHours = 0;
  Object.values(availability.workingHours).forEach(h => {
    if (h.enabled) {
      const start = new Date(`2000-01-01T${h.start}`);
      const end = new Date(`2000-01-01T${h.end}`);
      totalHours += (end - start) / 3600000;
    }
  });

  return `
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-calendar-alt" style="color:var(--primary-400);"></i> Availability Settings</h1>
      <p class="page-subtitle">Configure your work schedule and real-time status</p>
    </div>
    
    <div class="availability-container">
      <!-- Status Card -->
      <div class="status-card">
        <div style="display: flex; align-items: center; gap: var(--spacing-lg);">
          <div class="status-indicator-large" style="width: 60px; height: 60px; border-radius: 50%; background: ${availability.isOnline ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)'}; display: flex; align-items: center; justify-content: center; border: 2px solid ${availability.isOnline ? 'var(--success)' : 'var(--text-tertiary)'};">
             <span style="font-size: 2rem;">${availability.isOnline ? '<i class="fas fa-check-circle" style="color:var(--success);"></i>' : '<i class="fas fa-times-circle" style="color:var(--text-tertiary);"></i>'}</span>
          </div>
          <div>
            <h2 style="margin: 0; font-size: 1.5rem;">${availability.isOnline ? 'You are Online' : 'You are Offline'}</h2>
            <p style="margin: var(--spacing-xs) 0 0 0; color: var(--text-tertiary);">
              ${availability.isOnline ? 'Customers can see you and book sessions' : 'You are hidden from new job requests'}
            </p>
          </div>
        </div>
        
        <button class="btn ${availability.isOnline ? 'btn-secondary' : 'btn-primary'} btn-lg" onclick="document.getElementById('toggleAvailability').click(); setTimeout(() => loadPage('availability'), 100)" style="min-width: 160px; height: 50px; font-weight: 700;">
          ${availability.isOnline ? 'Go Offline' : 'Go Online'}
        </button>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
        <h2 style="margin: 0; font-size: var(--font-size-xl);">Weekly Schedule</h2>
        <div style="display: flex; gap: var(--spacing-sm); align-items: center;">
          <button class="btn btn-sm btn-ghost" onclick="applyToAllDays()" title="Apply current day settings to all other days">
            <span>Apply to all days</span>
          </button>
          <div class="badge badge-info" style="font-size: 0.9rem; padding: 0.5rem 1rem;">
            Total: ${totalHours.toFixed(1)} hrs / week
          </div>
        </div>
      </div>
      
      <div class="schedule-grid">
        ${Object.entries(availability.workingHours).map(([day, hours]) => `
          <div class="schedule-day ${hours.enabled ? 'active' : ''}">
            <div class="schedule-day-header">
              <span class="day-name">${day.charAt(0).toUpperCase() + day.slice(1)}</span>
              <label class="switch">
                <input type="checkbox" ${hours.enabled ? 'checked' : ''} onchange="toggleDay('${day}', this.checked)">
                <span class="slider"></span>
              </label>
            </div>
            
            ${hours.enabled ? `
              <div class="schedule-time">
                <div class="time-input-group">
                  <label class="time-input-label">Start Time</label>
                  <input type="time" value="${hours.start}" onchange="updateTime('${day}', 'start', this.value)" class="time-input">
                </div>
                <div style="margin-top: 1.5rem; color: var(--text-tertiary);">→</div>
                <div class="time-input-group">
                  <label class="time-input-label">End Time</label>
                  <input type="time" value="${hours.end}" onchange="updateTime('${day}', 'end', this.value)" class="time-input">
                </div>
              </div>
            ` : `
              <div class="schedule-time-disabled">
                <span style="font-size: 1.2rem; display: block; margin-bottom: 4px;"><i class="fas fa-bed" style="color:var(--text-tertiary);"></i></span>
                Off Duty
              </div>
            `}
          </div>
        `).join('')}
      </div>
      
      <div style="margin-top: var(--spacing-2xl); display: flex; justify-content: center; gap: var(--spacing-md);">
        <button class="btn btn-primary btn-lg" onclick="saveAvailability()" style="min-width: 200px;">
          <span>Apply Changes</span>
        </button>
        <button class="btn btn-secondary btn-lg" onclick="loadPage('availability')" style="min-width: 120px;">
          <span>Discard</span>
        </button>
      </div>
    </div>
  `;
}

// ============================================
// EARNINGS PAGE
// ============================================

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
    setTimeout(() => initializeEarningsChart(transactions), 100);

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

function getEarningsPage() {
  return '<div id="earnings-placeholder"></div>';
}

// ============================================
// WALLET PAGE
// ============================================


// ============================================
// WALLET PAGE
// ============================================

async function fetchAndRenderWalletPage() {
  const container = document.getElementById('wallet-page-container'); // You'll need to wrap content in this ID or similar
  // Actually, worker-dashboard.js likely sets innerHTML of 'main-content'. 
  // We should probably return a skeleton and then fetch data or make this function render to the main content.
  // However, the current structure expects 'getWalletPage' to return a string. 
  // We will change it to return a loading state and then trigger a fetch.

  setTimeout(async () => { // Defer execution to let the loading state render
    const user = Storage.get('karyasetu_user');
    if (!user) return;

    try {
      const transactions = await API.transactions.getByUser(user.uid);
      renderWalletContent(transactions);
    } catch (err) {
      console.error("Failed to load wallet:", err);
      document.getElementById('wallet-content').innerHTML = `<div class="error-state"><p>Failed to load wallet data.</p></div>`;
    }
  }, 100);

  return `
    <div id="wallet-content">
        <div class="page-header">
           <h1 class="page-title"><i class="fas fa-credit-card" style="color:var(--primary-400);"></i> Wallet</h1>
        </div>
        <div style="text-align:center; padding: 3rem;">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem;"></i> Loading...
        </div>
    </div>`;
}

// We need to keep the function name for compatibility if possible, or change how it's called.
// existing 'getWalletPage' is synchronous returning HTML.
// Let's modify it to return the skeleton and trigger the async fetch.

function getWalletPage() {
  const user = Storage.get('karyasetu_user');

  // Trigger async fetch
  fetchWalletData(user.uid);

  return `
    <div id="wallet-page-root">
        <div class="page-header">
             <h1 class="page-title"><i class="fas fa-credit-card" style="color:var(--primary-400);"></i> Wallet</h1>
             <p class="page-subtitle">Manage your earnings and withdrawals</p>
        </div>
        
        <div id="wallet-loading" style="text-align:center; padding: 4rem;">
             <i class="fas fa-circle-notch fa-spin" style="font-size: 2rem; color: var(--primary-400);"></i>
             <p style="margin-top: 1rem; color: var(--text-tertiary);">Loading your wallet...</p>
        </div>
        
        <div id="wallet-data-container" style="display:none;"></div>
    </div>
   `;
}

async function fetchWalletData(userId) {
  try {
    // 1. Fetch real wallet balance
    const balData = await API.payments.getBalance(userId);
    let balance = 0;
    if (balData.success) balance = balData.balance;

    // 2. Fetch transaction history
    const transactions = await API.transactions.getByUser(userId);

    renderWalletUI(transactions, balance);
  } catch (error) {
    console.error("Wallet Fetch Error:", error);
    const el = document.getElementById('wallet-loading');
    if (el) el.innerHTML = `<p style="color: var(--error)">Failed to load wallet data. Please try again.</p>`;
  }
}

// ============================================
// REFERRALS PAGE (GENERAL)
// ============================================

function getReferralsPage() {
  const user = Storage.get('karyasetu_user');

  return `
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-user-friends" style="color:var(--success);"></i> Refer & Earn</h1>
      <p class="page-subtitle">Invite your co-workers to KaryaSetu and earn ₹100 for each successful signup!</p>
    </div>
    
    <div class="referrals-container">
      <div class="card" style="background: linear-gradient(135deg, rgba(74, 222, 128, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%); border: 1px solid rgba(255, 255, 255, 0.1);">
        <div style="display: flex; flex-direction: column; gap: 1.5rem; padding: 1rem;">
          <div style="text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🎁</div>
            <h2 style="font-size: 1.8rem; margin-bottom: 0.5rem;">Give ₹50, Get ₹100</h2>
            <p style="color: rgba(255,255,255,0.7);">Your friend gets ₹50 on their first job, and you get ₹100!</p>
          </div>
          
          <div class="referral-box" style="background: rgba(0,0,0,0.2); padding: 1.5rem; border-radius: 12px; border: 1px dashed rgba(255,255,255,0.2);">
            <label style="display: block; font-size: 0.8rem; color: rgba(255,255,255,0.5); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 1px;">Your Referral Code</label>
            <div style="display: flex; gap: 1rem; align-items: center;">
              <input type="text" value="${user?.uid?.substring(0, 8).toUpperCase() || 'KSETU100'}" readonly style="flex: 1; background: none; border: none; color: #fff; font-size: 1.5rem; font-weight: 700; letter-spacing: 2px;">
              <button class="btn btn-primary" onclick="copyReferralCode(this)">Copy</button>
            </div>
          </div>
          
          <div class="invite-form">
            <h3 style="margin-bottom: 1rem;">Send an Invitation</h3>
            <div style="display: flex; gap: 0.5rem;">
              <input type="email" id="inviteEmail" class="form-control" placeholder="Enter colleague's email" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.8rem; border-radius: 8px; flex: 1;">
              <button class="btn btn-primary" onclick="submitReferral()">Send Invite</button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card" style="margin-top: 2rem;">
        <div class="card-header">
          <h2>Your Referral History</h2>
        </div>
        <div id="referralsList" class="referrals-history">
          <div style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.5);">
            <i class="fas fa-spinner fa-spin" style="font-size: 1.5rem; margin-bottom: 1rem;"></i>
            <p>Loading referral history...</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function submitReferral() {
  const emailInput = document.getElementById('inviteEmail');
  const email = emailInput?.value;
  if (!email) return showToast('Please enter an email address', 'error');

  const user = Storage.get('karyasetu_user');
  try {
    await API.referrals.create({
      referrerId: user.uid,
      inviteeEmail: email,
      status: 'pending'
    });
    showToast('Invitation sent successfully!', 'success');
    emailInput.value = '';
    loadReferralsHistory(user.uid);
  } catch (err) {
    showToast('Failed to send invite: ' + err.message, 'error');
  }
}

async function loadReferralsHistory(userId) {
  const listContainer = document.getElementById('referralsList');
  if (!listContainer) return;

  try {
    const referrals = await API.referrals.getHistory(userId);
    if (referrals.length === 0) {
      listContainer.innerHTML = '<p style="text-align:center; padding: 2rem; color:rgba(255,255,255,0.5);">No referrals yet. Spread the word!</p>';
      return;
    }

    listContainer.innerHTML = referrals.map(ref => `
            <div class="earning-item" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);">
                <div class="earning-info">
                    <h4 style="margin: 0;">${ref.inviteeEmail}</h4>
                    <span class="earning-date" style="font-size: 0.8rem; color: rgba(255,255,255,0.5);">${new Date(ref.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="earning-amount">
                    <span class="badge ${ref.status === 'completed' ? 'badge-success' : 'badge-warning'}">${ref.status}</span>
                </div>
            </div>
        `).join('');
  } catch (err) {
    listContainer.innerHTML = '<p class="error">Failed to load history.</p>';
  }
}

window.copyReferralCode = function (btn) {
  const input = btn.previousElementSibling;
  input.select();
  document.execCommand('copy');
  const originalText = btn.textContent;
  btn.textContent = 'Copied!';
  setTimeout(() => btn.textContent = originalText, 2000);
}

function renderWalletUI(transactions, balance) {
  const container = document.getElementById('wallet-data-container');
  const loading = document.getElementById('wallet-loading');
  if (!container) return;

  if (loading) loading.style.display = 'none';
  container.style.display = 'block';

  const user = Storage.get('karyasetu_user') || {};

  container.innerHTML = `
    <div class="wallet-container">
      <!-- Balance Card -->
      <div class="card wallet-balance-card" style="padding: 2rem; text-align: center; background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary)); border: 1px solid rgba(255,255,255,0.05);">
        <div class="balance-header">
          <h2 style="font-size: var(--font-size-sm); text-transform: uppercase; letter-spacing: 2px; color: var(--text-tertiary); margin-bottom: var(--spacing-xs);">Available Balance</h2>
          <span class="balance-amount" style="font-size: var(--font-size-5xl); font-weight: 800; color: var(--primary-400);">₹${balance.toLocaleString()}</span>
        </div>
        <div class="balance-actions" style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: center;">
          <button class="btn btn-primary" onclick="showToast('Withdrawal initiated', 'success')">
            <span>Withdraw Money</span>
          </button>
          <a href="../wallet/add-money-demo.html" class="btn btn-secondary" style="text-decoration:none;">
            <span>Demo Top-up</span>
          </a>
        </div>
      </div>
      
      <!-- Transactions History -->
      <div class="card">
        <div class="card-header">
          <h2>Transaction History</h2>
        </div>
        <div class="withdrawals-list">
          ${transactions.length === 0 ? '<p style="padding:1rem; color:var(--text-tertiary);">No transactions yet.</p>' : ''}
          ${transactions.map(t => `
          <div class="withdrawal-item">
            <div class="withdrawal-info">
              <h4>${t.description || t.source}</h4>
              <span class="withdrawal-date">${new Date(t.createdAt).toLocaleDateString()}</span>
            </div>
            <div class="withdrawal-amount">
              <span class="amount-value" style="color: ${t.type === 'credit' ? 'var(--success)' : 'var(--error)'}">${t.type === 'credit' ? '+' : '-'}₹${t.amount}</span>
              <span class="badge badge-success">${t.status}</span>
            </div>
          </div>
          `).join('')}
        </div>
      </div>
    </div>`;
}

// ============================================
// RATINGS & REVIEWS PAGE
// ============================================

function getRatingsPage() {
  const reviews = Storage.get('worker_reviews');
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
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
    const percentage = (count / reviews.length) * 100;
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
          ${reviews.map(review => `
            <div class="review-card">
              <div class="review-header">
                <div class="review-customer">
                  <div class="customer-avatar">${review.customer.charAt(0)}</div>
                  <div class="customer-info">
                    <h4>${review.customer}</h4>
                    <span class="review-date">${getRelativeTime(review.date)}</span>
                  </div>
                </div>
                <div class="review-rating">
                  <span class="rating-stars">${'⭐'.repeat(review.rating)}</span>
                  <span class="rating-value">${review.rating}/5</span>
                </div>
              </div>
              <p class="review-comment">"${review.comment}"</p>
              <div class="review-footer">
                <span class="review-job">Job: ${review.job}</span>
              </div>
            </div>
          `).join('')}
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
              <span class="insight-value">${dashboardData.performance.satisfaction}%</span>
              <span class="insight-label">Customer Satisfaction</span>
            </div>
          </div>
          <div class="insight-item">
            <span class="insight-icon"><i class="fas fa-bolt" style="color:#fbbf24;"></i></span>
            <div class="insight-content">
              <span class="insight-value">${dashboardData.performance.onTime}%</span>
              <span class="insight-label">On-Time Completion</span>
            </div>
          </div>
          <div class="insight-item">
            <span class="insight-icon"><i class="fas fa-comments" style="color:var(--info);"></i></span>
            <div class="insight-content">
              <span class="insight-value">${dashboardData.performance.responseRate}%</span>
              <span class="insight-label">Response Rate</span>
            </div>
          </div>
          <div class="insight-item">
            <span class="insight-icon"><i class="fas fa-sync" style="color:var(--success);"></i></span>
            <div class="insight-content">
              <span class="insight-value">${dashboardData.performance.repeatCustomers}%</span>
              <span class="insight-label">Repeat Customers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================
// SUPPORT PAGE
// ============================================


// ============================================
// SUPPORT PAGE
// ============================================

function getSupportPage() {
  // We can fetch existing tickets if we want to show history, 
  // currently the design only shows a form. 
  // Let's add a "Your Tickets" section dynamically if we had time,
  // but for now let's just make the form work.

  return `
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-life-ring" style="color:var(--error);"></i> Help & Support</h1>
      <p class="page-subtitle">We're here to help you succeed</p>
    </div>
    
    <div class="support-container">
      <!-- Emergency Support -->
      <div class="card emergency-card">
        <div class="emergency-header">
          <h2><i class="fas fa-exclamation-triangle" style="color:var(--error);"></i> Emergency Support</h2>
          <p>Need immediate assistance? We're available 24/7</p>
        </div>
        <div class="emergency-actions">
          <button class="btn btn-error btn-lg" onclick="window.location.href='tel:18001234567'">
            <i class="fas fa-phone-alt"></i> Call Support: 1800-123-4567
          </button>
        </div>
      </div>
      
      <!-- Contact Form -->
      <div class="card">
        <div class="card-header">
          <h2>Create Support Ticket</h2>
        </div>
        <form class="support-form" onsubmit="handleSupportSubmit(event)">
          <div class="input-group">
            <label class="input-label">Subject</label>
            <select id="ticketSubject" class="input-field" required>
              <option value="">Select a topic</option>
              <option>Payment Issue</option>
              <option>Job Dispute</option>
              <option>Account Problem</option>
              <option>Technical Issue</option>
              <option>Other</option>
            </select>
          </div>
          
          <div class="input-group">
            <label class="input-label">Description</label>
            <textarea id="ticketDesc" class="input-field" rows="5" placeholder="Describe your issue in detail..." required></textarea>
          </div>
          
          <button type="submit" class="btn btn-primary">Submit Ticket</button>
        </form>
      </div>

       <!-- Tickets History (Optional, loading via separate call if needed) -->
       <div class="card" id="tickets-history-card">
           <div class="card-header"><h2>Your Tickets</h2></div>
           <div id="tickets-list">Loading...</div>
       </div>
    </div>
  `;
}

// Global handler for support form
window.handleSupportSubmit = async function (event) {
  event.preventDefault();
  const subject = document.getElementById('ticketSubject').value;
  const description = document.getElementById('ticketDesc').value;
  const user = Storage.get('karyasetu_user');

  try {
    await API.support.createTicket({
      userId: user.uid,
      subject,
      description,
      priority: 'normal'
    });
    showToast('Ticket created successfully!', 'success');
    event.target.reset();
    loadTicketsHistory(user.uid); // Refresh list
  } catch (err) {
    showToast('Failed to create ticket: ' + err.message, 'error');
  }
};

async function loadTicketsHistory(userId) {
  const container = document.getElementById('tickets-list');
  if (!container) return;

  try {
    const tickets = await API.support.getUserTickets(userId);
    if (tickets.length === 0) {
      container.innerHTML = '<p style="color:var(--text-tertiary)">No tickets found.</p>';
      return;
    }

    container.innerHTML = tickets.map(t => `
            <div style="background:rgba(255,255,255,0.05); padding:1rem; border-radius:8px; margin-bottom:1rem;">
                <div style="display:flex; justify-content:space-between;">
                    <strong>${t.subject}</strong>
                    <span class="badge ${t.status === 'open' ? 'badge-warning' : 'badge-success'}">${t.status}</span>
                </div>
                <p style="font-size:0.9rem; color:rgba(255,255,255,0.7); margin-top:0.5rem;">${t.description}</p>
                <div style="font-size:0.8rem; color:rgba(255,255,255,0.4); margin-top:0.5rem;">
                    ${new Date(t.createdAt).toLocaleDateString()}
                </div>
            </div>
        `).join('');
  } catch (err) {
    container.innerHTML = '<p>Error loading tickets.</p>';
  }
}

// Ensure loadTicketsHistory is called when page loads
// We can hook into initializePage or just modify getSupportPage to trigger it
// Since getSupportPage returns HTML string, we'll use a timeout hack or rely on `initializePage` loop if we add it there.
// Let's add it to initializePage in Part 2.


// ============================================
// SETTINGS PAGE
// ============================================

function getSettingsPage() {
  return `
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-cog" style="color:var(--text-secondary);"></i> Settings</h1>
      <p class="page-subtitle">Manage your account preferences</p>
    </div>
    
    <div class="settings-container">
      <!-- Account Settings -->
      <div class="card">
        <div class="card-header">
          <h2>Account Settings</h2>
        </div>
        <div class="settings-list">
          <div class="setting-item">
            <div class="setting-info">
              <h4>Change Password</h4>
              <p>Update your account password</p>
            </div>
            <button class="btn btn-secondary" onclick="changePassword()">Change</button>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <h4>Phone Number</h4>
              <p>${userData.phone}</p>
            </div>
            <button class="btn btn-secondary" onclick="showToast('Phone verification required', 'info')">Update</button>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <h4>Email Address</h4>
              <p>${userData.email || 'Not set'}</p>
            </div>
            <button class="btn btn-secondary" onclick="showToast('Email update feature coming soon', 'info')">Update</button>
          </div>
        </div>
      </div>
      
      <!-- Notification Settings -->
      <div class="card">
        <div class="card-header">
          <h2>Notifications</h2>
        </div>
        <div class="settings-list">
          <div class="setting-item">
            <div class="setting-info">
              <h4>Job Requests</h4>
              <p>Get notified about new job opportunities</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" checked onchange="toggleNotification('jobs', this.checked)">
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <h4>Payment Updates</h4>
              <p>Notifications about earnings and withdrawals</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" checked onchange="toggleNotification('payments', this.checked)">
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <h4>Customer Messages</h4>
              <p>Get notified when customers contact you</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" checked onchange="toggleNotification('messages', this.checked)">
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <h4>Promotional Offers</h4>
              <p>Receive updates about special offers</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" onchange="toggleNotification('promos', this.checked)">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
      
      <!-- Tracking Settings -->
      <div class="card">
        <div class="card-header">
          <h2>Tracking & Movement</h2>
        </div>
        <div class="settings-list">
          <div class="setting-item">
            <div class="setting-info">
              <h4>Live Tracking</h4>
              <p>Broadcast your location when you are online</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="setting_live_tracking" onchange="toggleLiveTracking(this.checked)">
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <h4>Battery Saver Mode</h4>
              <p>Reduce update frequency and accuracy to save power</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="setting_battery_saver" onchange="toggleBatterySaver(this.checked)">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
      
      <!-- Privacy Settings -->
      <div class="card">
        <div class="card-header">
          <h2>Privacy & Security</h2>
        </div>
        <div class="settings-list">
          <div class="setting-item">
            <div class="setting-info">
              <h4>Profile Visibility</h4>
              <p>Control who can see your profile</p>
            </div>
            <select class="setting-select">
              <option>Public</option>
              <option>Verified Customers Only</option>
              <option>Private</option>
            </select>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <h4>Two-Factor Authentication</h4>
              <p>Add an extra layer of security</p>
            </div>
            <button class="btn btn-secondary" onclick="setup2FA()">Enable</button>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <h4>Data & Privacy</h4>
              <p>Manage your data and privacy settings</p>
            </div>
            <button class="btn btn-ghost" onclick="showPrivacySettings()">Manage</button>
          </div>
        </div>
      </div>
      
      <!-- Danger Zone -->
      <div class="card danger-card">
        <div class="card-header">
          <h2>Danger Zone</h2>
        </div>
        <div class="settings-list">
          <div class="setting-item">
            <div class="setting-info">
              <h4>Deactivate Account</h4>
              <p>Temporarily disable your account</p>
            </div>
            <button class="btn btn-ghost" onclick="deactivateAccount()">Deactivate</button>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <h4>Delete Account</h4>
              <p>Permanently delete your account and data</p>
            </div>
            <button class="btn btn-error" onclick="deleteAccount()">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================
// HELPER FUNCTIONS & EVENT HANDLERS
// ============================================

// Job Actions
function acceptJob(jobId) {
  showConfirm('Accept this job request?', () => {
    const jobs = Storage.get('worker_jobs');
    const jobIndex = jobs.pending.findIndex(j => j.id === jobId);

    if (jobIndex !== -1) {
      const job = jobs.pending[jobIndex];
      jobs.pending.splice(jobIndex, 1);

      // Move to active jobs
      jobs.active.push({
        ...job,
        status: 'in_progress',
        startedAt: new Date().toISOString(),
        estimatedCompletion: new Date(Date.now() + 14400000).toISOString(),
        progress: 0,
        payment: (job.budget.min + job.budget.max) / 2
      });

      Storage.set('worker_jobs', jobs);
      showToast('Job accepted! Customer will be notified.', 'success');
      loadPage('active-jobs');
    }
  });
}

function declineJob(jobId) {
  showConfirm('Decline this job request?', () => {
    const jobs = Storage.get('worker_jobs');
    jobs.pending = jobs.pending.filter(j => j.id !== jobId);
    Storage.set('worker_jobs', jobs);
    showToast('Job request declined', 'info');
    loadPage('job-requests');
  });
}

function viewJobDetails(jobId) {
  const jobs = Storage.get('worker_jobs');
  const job = jobs.pending.find(j => j.id === jobId) || jobs.active.find(j => j.id === jobId);

  if (job) {
    showToast(`Viewing details for: ${job.title}`, 'info');
    // In a real app, this would open a modal with full job details
  }
}

function completeJob(jobId) {
  showConfirm('Mark this job as complete?', () => {
    const jobs = Storage.get('worker_jobs');
    const jobIndex = jobs.active.findIndex(j => j.id === jobId);

    if (jobIndex !== -1) {
      const job = jobs.active[jobIndex];
      jobs.active.splice(jobIndex, 1);

      // Move to completed jobs
      jobs.completed.unshift({
        ...job,
        status: 'completed',
        completedAt: new Date().toISOString(),
        rating: 0,
        review: null
      });

      // Update earnings
      const earnings = Storage.get('worker_earnings');
      earnings.today += job.payment;
      earnings.week += job.payment;
      earnings.month += job.payment;
      earnings.total += job.payment;
      earnings.history.unshift({
        date: new Date().toISOString(),
        amount: job.payment,
        job: job.title,
        status: 'completed'
      });

      Storage.set('worker_jobs', jobs);
      Storage.set('worker_earnings', earnings);

      showToast('Job marked as complete! Payment will be processed.', 'success');
      loadPage('job-history');
    }
  });
}

function updateProgress(jobId) {
  const newProgress = prompt('Enter progress percentage (0-100):');
  if (newProgress && !isNaN(newProgress)) {
    const progress = Math.min(100, Math.max(0, parseInt(newProgress)));
    const jobs = Storage.get('worker_jobs');
    const job = jobs.active.find(j => j.id === jobId);

    if (job) {
      job.progress = progress;
      Storage.set('worker_jobs', jobs);
      showToast(`Progress updated to ${progress}%`, 'success');
      loadPage('active-jobs');
    }
  }
}

function contactCustomer(phone) {
  showToast(`Calling ${phone}...`, 'info');
  // In a real app, this would initiate a call
}

function reportIssue(jobId) {
  showToast('Issue reporting feature coming soon!', 'info');
}

// Availability Functions
function toggleDay(day, enabled) {
  const availability = Storage.get('worker_availability');
  availability.workingHours[day].enabled = enabled;
  Storage.set('worker_availability', availability);
  loadPage('availability');
}

function updateTime(day, type, value) {
  const availability = Storage.get('worker_availability');
  const hours = availability.workingHours[day];

  if (type === 'start' && value >= hours.end) {
    showToast('Start time must be before end time', 'error');
    return;
  }
  if (type === 'end' && value <= hours.start) {
    showToast('End time must be after start time', 'error');
    return;
  }

  availability.workingHours[day][type] = value;
  Storage.set('worker_availability', availability);

  // Update total hours display without full reload if possible, 
  // but for simplicity we'll just reload the page or do nothing since types don't overlap much.
}

function applyToAllDays() {
  const availability = Storage.get('worker_availability');
  // Use Monday as the source template if available, otherwise just use the first day that is enabled
  const sourceDayKey = Object.keys(availability.workingHours).find(d => availability.workingHours[d].enabled) || 'monday';
  const sourceDay = availability.workingHours[sourceDayKey];

  showConfirm(`Apply ${sourceDayKey}'s settings (${sourceDay.start} - ${sourceDay.end}) to all days?`, () => {
    Object.keys(availability.workingHours).forEach(day => {
      availability.workingHours[day] = { ...sourceDay };
    });
    Storage.set('worker_availability', availability);
    showToast(`Schedule synced for all days!`, 'success');
    loadPage('availability');
  });
}

function saveAvailability() {
  showToast('Availability settings saved!', 'success');
}

// Wallet Functions
function initiateWithdrawal() {
  const amount = prompt('Enter withdrawal amount (₹):');
  if (amount && !isNaN(amount) && parseInt(amount) >= 500) {
    showConfirm(`Withdraw ₹${amount} to your bank account?`, () => {
      showToast('Withdrawal request submitted! Processing within 1-2 business days.', 'success');
    });
  } else if (amount) {
    showToast('Minimum withdrawal amount is ₹500', 'error');
  }
}

function addPaymentMethod() {
  showToast('Add payment method feature coming soon!', 'info');
}

// Support Functions
function callSupport() {
  showToast('Calling support: 1800-123-4567', 'info');
}

function chatSupport() {
  showToast('Live chat feature coming soon!', 'info');
}

function showHelpArticle(topic) {
  showToast(`Opening help article: ${topic}`, 'info');
}

function submitSupportTicket(e) {
  e.preventDefault();
  showToast('Support ticket submitted! We\'ll respond within 24 hours.', 'success');
  e.target.reset();
}

// Settings Functions
function changePassword() {
  showToast('Password change feature coming soon!', 'info');
}

function toggleNotification(type, enabled) {
  showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} notifications ${enabled ? 'enabled' : 'disabled'}`, 'success');
}

function toggleLiveTracking(enabled) {
  const user = Storage.get('karyasetu_user');
  if (!user) return;

  localStorage.setItem(`tracking_enabled_${user.uid}`, enabled);

  if (enabled && availabilityStatus === 'online') {
    window.locationTracker.start();
  } else {
    window.locationTracker.stop();
  }

  showToast(`Live tracking ${enabled ? 'enabled' : 'disabled'}`, 'info');
}

function toggleBatterySaver(enabled) {
  localStorage.setItem('karyasetu_battery_saver', enabled);

  // Force frequency update if tracking
  if (window.locationTracker && window.locationTracker.isTracking) {
    // Simple way: restart tracker with new settings
    window.locationTracker.stop();
    window.locationTracker.start();
  }

  showToast(`Battery saver ${enabled ? 'on' : 'off'}`, 'info');
}

function setup2FA() {
  showToast('2FA setup feature coming soon!', 'info');
}

function showPrivacySettings() {
  showToast('Privacy settings feature coming soon!', 'info');
}

function deactivateAccount() {
  showConfirm('Are you sure you want to deactivate your account?', () => {
    showToast('Account deactivation feature coming soon!', 'info');
  });
}

function deleteAccount() {
  showConfirm('⚠️ This action cannot be undone! Delete your account permanently?', () => {
    showToast('Account deletion feature coming soon!', 'info');
  });
}

// Chart Update
function updateEarningsChart(period) {
  const ctx = document.getElementById('earningsChart');
  if (!ctx) return;

  if (window.myEarningsChart) {
    window.myEarningsChart.destroy();
  }

  const earnings = Storage.get('worker_earnings');
  const isWeek = period === 'week';

  // Use mock data if period is month, else use actual breakdown
  const labels = isWeek ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const data = isWeek ? [2400, 1800, 3200, 950, 4100, 2200, 1500] : [12000, 15000, 11000, 18000];

  if (typeof Chart !== 'undefined') {
    window.myEarningsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Earnings (₹)',
          data: data,
          backgroundColor: 'rgba(99, 102, 241, 0.6)',
          borderColor: '#6366f1',
          borderWidth: 2,
          borderRadius: 8,
          hoverBackgroundColor: '#6366f1',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            titleColor: '#fff',
            bodyColor: '#fff',
            padding: 12,
            displayColors: false,
            callbacks: {
              label: (ctx) => ` ₹${ctx.raw.toLocaleString()}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
            ticks: { color: '#64748b', callback: (value) => '₹' + value }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#64748b' }
          }
        }
      }
    });
  }
}

function updatePerformanceChart(period) {
  const ctx = document.getElementById('performanceChart');
  if (!ctx) return;

  // Clear existing chart instance
  if (window.myPerformanceChart) {
    window.myPerformanceChart.destroy();
  }

  // Get Data from Storage
  const earningsData = Storage.get('worker_earnings') || {};
  let labels = [];
  let data = [];

  // Default to zero if no data
  if (period === 'week') {
    const weeklyData = earningsData.weeklyBreakdown || [
      { day: 'Mon', amount: 0 }, { day: 'Tue', amount: 0 }, { day: 'Wed', amount: 0 },
      { day: 'Thu', amount: 0 }, { day: 'Fri', amount: 0 }, { day: 'Sat', amount: 0 }, { day: 'Sun', amount: 0 }
    ];
    labels = weeklyData.map(d => d.day);
    data = weeklyData.map(d => d.amount);
  } else {
    // Fallback for other periods
    labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    data = [0, 0, 0, 0];
  }

  // Check if we have any actual data
  const total = data.reduce((a, b) => a + b, 0);

  // Parent container for empty state handling
  const container = ctx.parentElement;

  // Remove any existing empty message
  const existingMsg = container.querySelector('.empty-chart-msg');
  if (existingMsg) existingMsg.remove();

  // Show Empty State if no data
  if (total === 0) {
    ctx.style.display = 'none';
    const msg = document.createElement('div');
    msg.className = 'empty-chart-msg';
    msg.style.position = 'absolute';
    msg.style.top = '0';
    msg.style.left = '0';
    msg.style.width = '100%';
    msg.style.height = '100%';
    msg.style.display = 'flex';
    msg.style.flexDirection = 'column';
    msg.style.alignItems = 'center';
    msg.style.justifyContent = 'center';
    msg.innerHTML = `
        <div style="text-align: center; color: var(--text-tertiary);">
            <i class="fas fa-chart-line" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
            <p style="margin: 0;">No performance data available yet.</p>
            <p style="font-size: 0.8rem; margin-top: 5px;">Complete jobs to see your progress!</p>
        </div>
      `;
    container.appendChild(msg);
    // Don't return if we want to render an empty chart, but here we just show the message
    return;
  }

  // Ensure chart is visible
  ctx.style.display = 'block';

  // Check for library
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js not loaded');
    return;
  }

  window.myPerformanceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Earnings',
        data: data,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#10B981',
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              return 'Earnings: ₹' + context.parsed.y;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: 'rgba(255, 255, 255, 0.5)' }
        },
        x: {
          grid: { display: false },
          ticks: { color: 'rgba(255, 255, 255, 0.5)' }
        }
      }
    }
  });
}

// ============================================
// CHAT FUNCTIONALITY
// ============================================

function getChatPage(params) {
  // If params.jobId exists, we could filter or select specific chat
  console.log('Opening chat for job:', params?.jobId);

  return `
    <div class="page-header" style="display: flex; align-items: center; gap: var(--spacing-md);">
      <button class="btn-icon" onclick="loadPage('active-jobs')" style="background:none; border:none; cursor:pointer; font-size:1.5rem; padding:0; color:var(--text-primary);">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
      </button>
      <div>
        <h1 class="page-title" style="margin:0;">💬 Messages</h1>
        <p class="page-subtitle" style="margin:0;">Chat with customers</p>
      </div>
    </div>
    <div class="chat-layout" style="height: 500px;">
      <div class="chat-sidebar">
        <div class="chat-sidebar-header">
          <input type="text" placeholder="Search..." class="chat-search">
        </div>
        <div class="chat-list">
          <div class="chat-list-item active">
            <div class="chat-avatar">SP<div class="chat-status online"></div></div>
            <div class="chat-info">
               <div class="chat-name">Suresh Patel</div>
               <div class="chat-preview">On my way...</div>
            </div>
            <div class="chat-meta"><span class="chat-time">10:00 AM</span></div>
          </div>
          <div class="chat-list-item">
            <div class="chat-avatar" style="background:var(--secondary);">MJ</div>
            <div class="chat-info">
               <div class="chat-name">Meera Joshi</div>
               <div class="chat-preview">Thanks!</div>
            </div>
            <div class="chat-meta"><span class="chat-time">Yesterday</span></div>
          </div>
        </div>
      </div>
      <div class="chat-main">
        <div class="chat-main-header">
           <div style="display:flex; align-items:center; gap:10px;">
             <div class="chat-avatar">SP</div>
             <div><div class="chat-name">Suresh Patel</div><div style="font-size:0.8rem;color:var(--success);">Online</div></div>
           </div>
        </div>
        <div class="chat-messages" id="chatMessages">
           <div class="message-bubble received">
              Hello, are you available?
              <span class="message-time">10:00 AM</span>
           </div>
           <div class="message-bubble sent">
              Yes, I'm coming.
              <span class="message-time">10:01 AM</span>
           </div>
        </div>
        <div class="chat-input-area">
           <button class="chat-action-btn" title="Attach File">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
           </button>
           <input type="text" class="chat-input-field" placeholder="Type a message..." id="chatInput" onkeypress="if(event.key==='Enter') sendChatMessage()">
           <button class="chat-action-btn" onclick="sendChatMessage()">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
           </button>
        </div>
      </div>
    </div>
    `;
}

function sendChatMessage() {
  const input = document.getElementById('chatInput');
  if (!input.value.trim()) return;
  const msgs = document.getElementById('chatMessages');
  msgs.innerHTML += `<div class="message-bubble sent">${input.value}<span class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>`;
  input.value = '';
  msgs.scrollTop = msgs.scrollHeight;
}

// ============================================
// REFERRAL FUNCTIONALITY
// ============================================

function getReferralPage(params) {
  const jobId = params?.jobId || 'Unknown ID';

  // Mock Co-workers data
  const coWorkers = [
    { id: 1, name: 'Ramesh Kumar', skill: 'Plumber', rating: 4.8, available: true },
    { id: 2, name: 'Amit Singh', skill: 'Plumber', rating: 4.5, available: true },
    { id: 3, name: 'John Doe', skill: 'Helper', rating: 4.2, available: false },
    { id: 4, name: 'Priya Sharma', skill: 'Electrician', rating: 4.9, available: true }
  ];

  return `
    <div class="page-header" style="display: flex; align-items: center; gap: var(--spacing-md);">
      <button class="btn-icon" onclick="loadPage('active-jobs')" style="background:none; border:none; cursor:pointer; font-size:1.5rem; padding:0; color:var(--text-primary);">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
      </button>
      <div>
        <h1 class="page-title" style="margin:0;">🤝 Refer a Co-worker</h1>
        <p class="page-subtitle" style="margin:0;">Refer job #${jobId} to a trusted colleague</p>
      </div>
    </div>

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

let selectedWorkerName = null;
function selectCoWorker(el, name) {
  document.querySelectorAll('.worker-item').forEach(i => i.classList.remove('selected'));
  el.classList.add('selected');
  selectedWorkerName = name;
  document.getElementById('referBtn').disabled = false;
}

function confirmReferral(jobId) {
  if (selectedWorkerName) {
    showToast(`Job referred to ${selectedWorkerName}`, 'success');
    document.querySelector('.modal-overlay').remove();
  }
}

// ============================================
// PAGE INITIALIZATION
// ============================================

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
// INITIAL LOAD
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  loadPage('home');

  // Update request count badge
  const jobs = Storage.get('worker_jobs');
  const requestCountBadge = document.getElementById('requestCount');
  if (requestCountBadge && jobs && jobs.pending) {
    requestCountBadge.textContent = jobs.pending.length;
  }
});

console.log('Worker Dashboard - Complete Implementation Loaded');

// --- Page Initialization Logic ---
function initializePage(pageName, params) {
  if (pageName === 'settings') {
    const user = Storage.get('karyasetu_user');
    if (!user) return;

    // Live Tracking Toggle
    const trackingEnabled = localStorage.getItem(`tracking_enabled_${user.uid}`) !== 'false';
    const trackingToggle = document.getElementById('setting_live_tracking');
    if (trackingToggle) trackingToggle.checked = trackingEnabled;

    // Battery Saver Toggle
    const batterySaver = localStorage.getItem('karyasetu_battery_saver') === 'true';
    const batteryToggle = document.getElementById('setting_battery_saver');
    if (batteryToggle) batteryToggle.checked = batterySaver;
  }
}

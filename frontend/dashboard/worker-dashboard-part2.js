// ============================================
// WORKER DASHBOARD - PART 2
// Additional Pages and Functionality
// ============================================

// ============================================
// AVAILABILITY PAGE
// ============================================

function getAvailabilityPage() {
  const availability = Storage.get('worker_availability') || {
    isOnline: false,
    workingHours: {
      monday: { enabled: true, start: '09:00', end: '17:00' },
      tuesday: { enabled: true, start: '09:00', end: '17:00' },
      wednesday: { enabled: true, start: '09:00', end: '17:00' },
      thursday: { enabled: true, start: '09:00', end: '17:00' },
      friday: { enabled: true, start: '09:00', end: '17:00' },
      saturday: { enabled: true, start: '10:00', end: '14:00' },
      sunday: { enabled: false, start: '00:00', end: '00:00' }
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
              <span class="insight-value">${dashboardData.performance.repeatCustomers}</span>
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
  `;
}

// ============================================
// REFERRAL PAGE (Alias)
// ============================================

function getReferralPage() {
  return getReferralsPage();
}
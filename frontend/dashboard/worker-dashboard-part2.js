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

function getEarningsPage() {
  const earnings = Storage.get('worker_earnings');

  return `
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-wallet" style="color:var(--success);"></i> My Earnings</h1>
      <p class="page-subtitle">Track your income and financial performance</p>
    </div>
    
    <div class="earnings-dashboard">
      <!-- Summary Cards -->
      <div class="earnings-summary-grid">
        <div class="earnings-summary-card">
          <div class="summary-icon"><i class="fas fa-calendar-day"></i></div>
          <div class="summary-content">
            <span class="summary-label">Today</span>
            <span class="summary-value">₹${earnings.today}</span>
          </div>
        </div>
        
        <div class="earnings-summary-card">
          <div class="summary-icon"><i class="fas fa-chart-bar"></i></div>
          <div class="summary-content">
            <span class="summary-label">This Week</span>
            <span class="summary-value">₹${earnings.week.toLocaleString()}</span>
          </div>
        </div>
        
        <div class="earnings-summary-card">
          <div class="summary-icon"><i class="fas fa-chart-line"></i></div>
          <div class="summary-content">
            <span class="summary-label">This Month</span>
            <span class="summary-value">₹${earnings.month.toLocaleString()}</span>
          </div>
        </div>
        
        <div class="earnings-summary-card">
          <div class="summary-icon"><i class="fas fa-gem"></i></div>
          <div class="summary-content">
            <span class="summary-label">Total Earned</span>
            <span class="summary-value">₹${earnings.total.toLocaleString()}</span>
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
      
      <!-- Earnings History -->
      <div class="card">
        <div class="card-header">
          <h2>Recent Transactions</h2>
          <button class="btn-text" onclick="loadPage('wallet')">View All</button>
        </div>
        <div class="earnings-history">
          ${earnings.history.map(transaction => `
            <div class="earning-item">
              <div class="earning-info">
                <h4>${transaction.job}</h4>
                <span class="earning-date">${formatDate(transaction.date)}</span>
              </div>
              <div class="earning-amount">
                <span class="amount-value">+₹${transaction.amount}</span>
                <span class="badge badge-success">${transaction.status}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <!-- Pending Earnings -->
      ${earnings.pending > 0 ? `
        <div class="card pending-earnings-card">
          <div class="card-header">
            <h2><i class="fas fa-hourglass-half" style="color:var(--warning);"></i> Pending Earnings</h2>
          </div>
          <div class="pending-earnings-content">
            <div class="pending-amount">₹${earnings.pending.toLocaleString()}</div>
            <p>Will be available for withdrawal after job completion verification</p>
            <button class="btn btn-secondary" onclick="showToast('Pending earnings will be released within 24 hours', 'info')">Learn More</button>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

// ============================================
// WALLET PAGE
// ============================================

function getWalletPage() {
  const earnings = Storage.get('worker_earnings');

  return `
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-credit-card" style="color:var(--primary-400);"></i> Wallet</h1>
      <p class="page-subtitle">Manage your earnings and withdrawals</p>
    </div>
    
    <div class="wallet-container">
      <!-- Balance Card -->
      <div class="card wallet-balance-card" style="position:relative; overflow:hidden; padding: 2.5rem; background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));">
        <!-- Realistic CSS Card -->
        <div style="margin-bottom: var(--spacing-xl); display: flex; justify-content: center; perspective: 1000px;">
            <div style="width: 340px; height: 210px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 20px; padding: 2rem; color: #fff; position: relative; box-shadow: 0 20px 40px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); overflow: hidden; transform: rotateX(5deg); transition: transform 0.5s;">
                <!-- Card Glow Effect -->
                <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%); pointer-events: none;"></div>
                
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem;">
                    <div style="display: flex; flex-direction: column;">
                        <span style="font-size: 0.6rem; letter-spacing: 2px; color: rgba(255,255,255,0.5);">KARYASETU PRO</span>
                        <div style="width: 50px; height: 38px; background: linear-gradient(135deg, #fbbf24, #d97706); border-radius: 6px; margin-top: 10px; position: relative; box-shadow: 0 0 10px rgba(251, 191, 36, 0.3);">
                            <div style="position: absolute; top: 10%; left: 10%; width: 80%; height: 2px; background: rgba(0,0,0,0.1);"></div>
                            <div style="position: absolute; top: 30%; left: 10%; width: 80%; height: 2px; background: rgba(0,0,0,0.1);"></div>
                            <div style="position: absolute; top: 50%; left: 10%; width: 80%; height: 2px; background: rgba(0,0,0,0.1);"></div>
                        </div>
                    </div>
                    <i class="fab fa-cc-mastercard" style="font-size: 2.5rem; color: rgba(255,255,255,0.8);"></i>
                </div>
                
                <p style="font-size: 1.4rem; font-family: 'Courier New', monospace; letter-spacing: 4px; text-shadow: 0 2px 4px rgba(0,0,0,0.5); margin-bottom: 1.5rem;">•••• •••• •••• ${Math.floor(1000 + Math.random() * 9000)}</p>
                
                <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                    <div>
                        <p style="font-size: 0.6rem; color: rgba(255,255,255,0.5); letter-spacing: 1px;">WORKER</p>
                        <p style="font-weight: 600; font-size: 0.9rem; text-transform: uppercase;">${Storage.get('userData')?.name || 'WORKER NAME'}</p>
                    </div>
                    <div style="text-align: right;">
                        <p style="font-size: 0.6rem; color: rgba(255,255,255,0.5); letter-spacing: 1px;">VALID THRU</p>
                        <p style="font-weight: 600; font-size: 0.9rem;">12/28</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="balance-header" style="text-align: center;">
          <h2 style="font-size: var(--font-size-sm); text-transform: uppercase; letter-spacing: 2px; color: var(--text-tertiary); margin-bottom: var(--spacing-xs);">Available Balance</h2>
          <span class="balance-amount" style="font-size: var(--font-size-5xl); font-weight: 800; color: var(--text-primary);">₹${earnings.month.toLocaleString()}</span>
        </div>
        <div class="balance-actions">
          <button class="btn btn-primary btn-lg" onclick="initiateWithdrawal()">
            <span>Withdraw Money</span>
          </button>
          <button class="btn btn-secondary btn-lg" onclick="showToast('Transaction history feature coming soon!', 'info')">
            <span>View History</span>
          </button>
        </div>
      </div>
      
      <!-- Withdrawal Methods -->
      <div class="card">
        <div class="card-header">
          <h2>Withdrawal Methods</h2>
          <button class="btn-text" onclick="addPaymentMethod()">+ Add New</button>
        </div>
        <div class="payment-methods">
          <div class="payment-method-item">
            <div class="payment-method-icon"><i class="fas fa-university"></i></div>
            <div class="payment-method-info">
              <h4>Bank Account</h4>
              <p>HDFC Bank •••• 4567</p>
            </div>
            <span class="badge badge-primary">Primary</span>
          </div>
          <div class="payment-method-item">
            <div class="payment-method-icon"><i class="fas fa-mobile-alt"></i></div>
            <div class="payment-method-info">
              <h4>UPI</h4>
              <p>9876543210@paytm</p>
            </div>
            <button class="btn btn-sm btn-ghost">Set as Primary</button>
          </div>
        </div>
      </div>
      
      <!-- Recent Withdrawals -->
      <div class="card">
        <div class="card-header">
          <h2>Recent Withdrawals</h2>
        </div>
        <div class="withdrawals-list">
          <div class="withdrawal-item">
            <div class="withdrawal-info">
              <h4>Withdrawal to Bank</h4>
              <span class="withdrawal-date">${formatDate(new Date(Date.now() - 172800000))}</span>
            </div>
            <div class="withdrawal-amount">
              <span class="amount-value">-₹5,000</span>
              <span class="badge badge-success">Completed</span>
            </div>
          </div>
          <div class="withdrawal-item">
            <div class="withdrawal-info">
              <h4>Withdrawal to UPI</h4>
              <span class="withdrawal-date">${formatDate(new Date(Date.now() - 604800000))}</span>
            </div>
            <div class="withdrawal-amount">
              <span class="amount-value">-₹3,500</span>
              <span class="badge badge-success">Completed</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Withdrawal Info -->
      <div class="card info-card">
        <h3><i class="fas fa-lightbulb" style="color:var(--warning);"></i> Withdrawal Information</h3>
        <ul class="info-list">
          <li>Minimum withdrawal amount: ₹500</li>
          <li>Processing time: 1-2 business days</li>
          <li>No withdrawal fees for bank transfers</li>
          <li>Instant withdrawals available for UPI (₹10 fee)</li>
        </ul>
      </div>
    </div>
  `;
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
              <span class="insight-value">96%</span>
              <span class="insight-label">Customer Satisfaction</span>
            </div>
          </div>
          <div class="insight-item">
            <span class="insight-icon"><i class="fas fa-bolt" style="color:#fbbf24;"></i></span>
            <div class="insight-content">
              <span class="insight-value">98%</span>
              <span class="insight-label">On-Time Completion</span>
            </div>
          </div>
          <div class="insight-item">
            <span class="insight-icon"><i class="fas fa-comments" style="color:var(--info);"></i></span>
            <div class="insight-content">
              <span class="insight-value">95%</span>
              <span class="insight-label">Response Rate</span>
            </div>
          </div>
          <div class="insight-item">
            <span class="insight-icon"><i class="fas fa-sync" style="color:var(--success);"></i></span>
            <div class="insight-content">
              <span class="insight-value">85%</span>
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
          <button class="btn btn-error btn-lg" onclick="callSupport()">
            <i class="fas fa-phone-alt"></i> Call Support: 1800-123-4567
          </button>
          <button class="btn btn-secondary btn-lg" onclick="chatSupport()">
            <i class="fas fa-comments"></i> Live Chat
          </button>
        </div>
      </div>
      
      <!-- Quick Help -->
      <div class="card">
        <div class="card-header">
          <h2>Quick Help Topics</h2>
        </div>
        <div class="help-topics">
          <div class="help-topic" onclick="showHelpArticle('payment')">
            <span class="topic-icon"><i class="fas fa-money-bill-wave"></i></span>
            <div class="topic-content">
              <h4>Payment Issues</h4>
              <p>Withdrawal, earnings, and payment methods</p>
            </div>
            <span class="topic-arrow">→</span>
          </div>
          <div class="help-topic" onclick="showHelpArticle('jobs')">
            <span class="topic-icon"><i class="fas fa-clipboard-list"></i></span>
            <div class="topic-content">
              <h4>Job Management</h4>
              <p>Accepting, completing, and tracking jobs</p>
            </div>
            <span class="topic-arrow">→</span>
          </div>
          <div class="help-topic" onclick="showHelpArticle('account')">
            <span class="topic-icon"><i class="fas fa-user-circle"></i></span>
            <div class="topic-content">
              <h4>Account Settings</h4>
              <p>Profile, verification, and preferences</p>
            </div>
            <span class="topic-arrow">→</span>
          </div>
          <div class="help-topic" onclick="showHelpArticle('safety')">
            <span class="topic-icon"><i class="fas fa-shield-alt"></i></span>
            <div class="topic-content">
              <h4>Safety & Security</h4>
              <p>Guidelines and best practices</p>
            </div>
            <span class="topic-arrow">→</span>
          </div>
        </div>
      </div>
      
      <!-- Contact Form -->
      <div class="card">
        <div class="card-header">
          <h2>Send us a Message</h2>
        </div>
        <form class="support-form" onsubmit="submitSupportTicket(event)">
          <div class="input-group">
            <label class="input-label">Subject</label>
            <select class="input-field" required>
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
            <textarea class="input-field" rows="5" placeholder="Describe your issue in detail..." required></textarea>
          </div>
          
          <div class="input-group">
            <label class="input-label">Attach Screenshot (Optional)</label>
            <input type="file" class="input-field" accept="image/*">
          </div>
          
          <button type="submit" class="btn btn-primary">Submit Ticket</button>
        </form>
      </div>
      
      <!-- FAQ -->
      <div class="card">
        <div class="card-header">
          <h2>Frequently Asked Questions</h2>
        </div>
        <div class="faq-list">
          <details class="faq-item">
            <summary>How do I withdraw my earnings?</summary>
            <p>Go to Wallet → Click "Withdraw Money" → Select payment method → Enter amount → Confirm. Withdrawals are processed within 1-2 business days.</p>
          </details>
          <details class="faq-item">
            <summary>What happens if I can't complete a job?</summary>
            <p>Contact the customer immediately and report the issue through the app. Our support team will help resolve the situation.</p>
          </details>
          <details class="faq-item">
            <summary>How can I improve my rating?</summary>
            <p>Arrive on time, communicate clearly, complete jobs professionally, and follow up with customers. Quality work leads to better ratings!</p>
          </details>
          <details class="faq-item">
            <summary>Can I change my service categories?</summary>
            <p>Yes! Go to Profile → Edit → Update your skills. Changes will be reflected immediately.</p>
          </details>
        </div>
      </div>
    </div>
  `;
}

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
  showToast(`${type} notifications ${enabled ? 'enabled' : 'disabled'}`, 'success');
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
  }

  // Initialize earnings chart if on earnings page
  const earningsCanvas = document.getElementById('earningsChart');
  if (earningsCanvas) {
    updateEarningsChart('week');
  }

  // Add any page-specific initialization here
  if (pageName === 'availability') {
    // Initialize time pickers (already handled by HTML value)
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
  if (requestCountBadge) {
    requestCountBadge.textContent = jobs.pending.length;
  }
});

console.log('Worker Dashboard - Complete Implementation Loaded');

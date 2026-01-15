/**
 * KARYASETU - CUSTOMER DASHBOARD JAVASCRIPT
 * Comprehensive dashboard logic with persistence and AI integration.
 */

// --- Persistence & State Management ---
const STORAGE_KEYS = {
    USER: 'karyasetu_user',
    BOOKINGS: 'karyasetu_bookings',
    WALLET: 'karyasetu_wallet'
};

// --- RICH MOCK DATA (New Default) ---
const richBookingsData = [
    // ACTIVE
    { id: 'BK-9012', service: 'Home Cleaning', worker: 'Sunita Devi', date: '2023-11-20', time: '10:00 AM', status: 'Active', price: 800 },
    { id: 'BK-9015', service: 'Plumbing', worker: 'Rajesh Kumar', date: '2023-11-20', time: '12:30 PM', status: 'On the way', price: 450 },

    // SCHEDULED
    { id: 'BK-9100', service: 'Sofa Cleaning', worker: 'UrbanClean Team', date: '2023-11-25', time: '09:00 AM', status: 'Confirmed', price: 1500 },
    { id: 'BK-9105', service: 'Painting', worker: 'Colors Inc', date: '2023-11-28', time: '10:00 AM', status: 'Scheduled', price: 5000 },
    { id: 'BK-9120', service: 'Carpentry', worker: 'Suresh Wood', date: '2023-11-30', time: '02:00 PM', status: 'Scheduled', price: 800 },

    // COMPLETED
    { id: 'BK-8801', service: 'Electrical', worker: 'Amit Singh', date: '2023-11-10', time: '11:00 AM', status: 'Completed', price: 350 },
    { id: 'BK-8755', service: 'Salon for Men', worker: 'Vikram Barber', date: '2023-11-05', time: '05:00 PM', status: 'Completed', price: 600 },
    { id: 'BK-8600', service: 'Pest Control', worker: 'PestBusters', date: '2023-10-28', time: '03:00 PM', status: 'Completed', price: 1100 },
    { id: 'BK-8900', service: 'RO Service', worker: 'PureWater', date: '2023-11-12', time: '04:00 PM', status: 'Completed', price: 550 },
    { id: 'BK-7500', service: 'Gardening', worker: 'Green Thumb', date: '2023-09-15', time: '07:00 AM', status: 'Completed', price: 1200 },
    { id: 'BK-7200', service: 'Appliance Repair', worker: 'FixIt fast', date: '2023-09-10', time: '05:30 PM', status: 'Completed', price: 400 },

    // CANCELLED (Requested Examples)
    { id: 'BK-8500', service: 'Massage Therapy', worker: 'Ayush Wellness', date: '2023-10-15', time: '06:00 PM', status: 'Cancelled', price: 1200 },
    { id: 'BK-8400', service: 'Car Wash', worker: 'Express Wash', date: '2023-10-10', time: '08:00 AM', status: 'Cancelled', price: 400 },
    { id: 'BK-8350', service: 'Yoga Session', worker: 'FitLife', date: '2023-10-05', time: '07:00 AM', status: 'Cancelled', price: 300 },
    { id: 'BK-6000', service: 'Movers & Packers', worker: 'SafeMove', date: '2023-08-20', time: '09:00 AM', status: 'Cancelled', price: 5000 },
    { id: 'BK-5500', service: 'Interior Design', worker: 'SpaceCrafters', date: '2023-08-15', time: '02:00 PM', status: 'Cancelled', price: 1500 }
];


// --- DOM Elements ---
const getEl = (id) => document.getElementById(id);
const getAll = (sel) => document.querySelectorAll(sel);

// --- Initialization ---
function init() {
    console.log('Initializing Dashboard...');

    const userData = Storage.get(STORAGE_KEYS.USER);
    if (!userData || !userData.loggedIn) {
        window.location.href = '../auth/login.html';
        return;
    }

    // --- FORCE DATA REFRESH LOGIC ---
    // If bookings don't exist OR if we only have the old small default set (< 5 items),
    // we force-overwrite with the new RICH dataset.
    // --- DATA INTEGRITY CHECK ---
    const currentBookings = Storage.get(STORAGE_KEYS.BOOKINGS);
    let forceReset = false;

    // Check 1: Too few items (old default)
    if (!currentBookings || currentBookings.length < 5) forceReset = true;

    // Check 2: Duplicate IDs (The "Disappearing" Bug)
    if (currentBookings && currentBookings.length > 1) {
        const ids = currentBookings.map(b => b.id);
        const uniqueIds = new Set(ids);
        if (uniqueIds.size !== ids.length) {
            console.log('Detected duplicate booking IDs! Corrupted data.');
            forceReset = true;
        }
    }

    if (forceReset) {
        console.log('Forcing update to Rich Mock Data to fix corruption...');
        Storage.set(STORAGE_KEYS.BOOKINGS, richBookingsData);
    }

    setupEventListeners();
    updateUIWithUserData(userData);
    updateDashboardStats();

    try {
        renderOverview();
        renderBookingsGrid(); // Loads 'all' by default
        renderWallet();
        renderProfile();
        renderFavorites();
        renderSupport();
    } catch (e) {
        console.error('Initial rendering error:', e);
    }

    startClock(); // Start Real-time Clock
    handleTabSwitching();
}

function setupEventListeners() {
    getEl('menu-toggle')?.addEventListener('click', () => {
        getEl('sidebar')?.classList.toggle('active');
    });

    getEl('logout-btn-header')?.addEventListener('click', (e) => {
        e.preventDefault();
        Storage.remove(STORAGE_KEYS.USER);
        window.location.href = '../index.html';
    });

    document.addEventListener('change', (e) => {
        if (e.target && (e.target.id === 'profile-upload' || e.target.id === 'profile-upload-main')) {
            e.stopPropagation();
            handleProfileUpload(e);
        }
    });

    getEl('ai-widget-toggle')?.addEventListener('click', toggleChatPopup);
    getEl('close-chat-popup')?.addEventListener('click', toggleChatPopup);

    // Maximize Button Logic
    getEl('maximize-chat-popup')?.addEventListener('click', () => {
        const popup = getEl('ai-chat-popup');
        popup.classList.toggle('maximized');
    });

    // Minimize Button Logic
    getEl('minimize-chat-popup')?.addEventListener('click', () => {
        const popup = getEl('ai-chat-popup');
        if (popup.classList.contains('maximized')) {
            popup.classList.remove('maximized'); // Restore from Max to Normal
        } else {
            toggleChatPopup(); // Hide completely (Back to Icon)
        }
    });

    const aiSendBtn = getEl('ai-popup-send');
    if (aiSendBtn) {
        console.log('Attaching Chat Send Listener');
        aiSendBtn.addEventListener('click', (e) => {
            console.log('Send Button Clicked');
            e.preventDefault();
            handleAIMessage();
        });
    } else {
        console.error('AI Send Button NOT FOUND');
    }

    const aiInput = getEl('ai-popup-input');
    if (aiInput) {
        aiInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                console.log('Enter Key Pressed');
                e.preventDefault();
                handleAIMessage();
            }
        });
    }
}

function handleProfileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        alert('Image too large. Max 2MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const base64Img = event.target.result;
        const user = Storage.get(STORAGE_KEYS.USER) || {};
        user.profilePic = base64Img;
        Storage.set(STORAGE_KEYS.USER, user);
        updateUIWithUserData(user);
    };
    reader.readAsDataURL(file);
}

function updateUIWithUserData(user) {
    const userNameDisp = getEl('user-display-name');
    const welcomeName = getEl('welcome-name');
    const userAvatarInit = getEl('user-avatar-initials');
    const userAvatarImg = getEl('user-avatar-img');

    if (userNameDisp) userNameDisp.textContent = user.name || 'User';
    if (welcomeName) welcomeName.textContent = (user.name || 'User').split(' ')[0];

    if (user.profilePic && userAvatarImg) {
        userAvatarImg.src = user.profilePic;
        userAvatarImg.style.display = 'block';
        if (userAvatarInit) userAvatarInit.style.display = 'none';

        const miniAvatars = getAll('.user-profile-mini .avatar');
        miniAvatars.forEach(av => {
            av.style.backgroundImage = `url(${user.profilePic})`;
            av.style.backgroundSize = 'cover';
            av.textContent = '';
        });
    } else if (userAvatarInit) {
        userAvatarImg.style.display = 'none';
        userAvatarInit.style.display = 'flex';
        const names = (user.name || 'U').split(' ');
        userAvatarInit.textContent = names.length > 1 ? names[0][0] + names[1][0] : names[0][0];
    }
}

function handleTabSwitching() {
    const navItems = getAll('.nav-item[data-tab]');
    const tabContents = getAll('.tab-content');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = item.getAttribute('data-tab');
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            tabContents.forEach(content => {
                content.style.display = 'none';
                if (content.id === `${tabId}-tab`) {
                    content.style.display = 'block';
                }
            });
            loadTabData(tabId);
        });
    });
}

function loadTabData(tabId) {
    try {
        if (tabId === 'my-bookings') renderBookingsGrid();
        if (tabId === 'overview') renderOverview();
        if (tabId === 'wallet') renderWallet();
        if (tabId === 'profile') renderProfile();
        if (tabId === 'favorites') renderFavorites();
        if (tabId === 'support') renderSupport();
        if (tabId === 'nearby-workers') renderNearbyWorkers();
    } catch (e) {
        console.error(`Error loading data for tab ${tabId}:`, e);
    }
}

// Expose to window for inline HTML access
window.handleAIMessage = handleAIMessage;

function updateDashboardStats() {
    const statsGrid = document.querySelector('.stats-grid');
    if (statsGrid) {
        statsGrid.style.display = 'none';
    }
}

// --- CALENDAR HELPER ---
function startClock() {
    setInterval(() => {
        const clockEl = document.getElementById('real-time-clock');
        if (clockEl) {
            const now = new Date();
            clockEl.textContent = now.toLocaleTimeString();
        }
    }, 1000);
}

function handleCalendarDateClick(dateStr) {
    // Switch to Scheduled Tab
    const scheduledTab = document.querySelector('[data-tab="my-bookings"]');
    if (scheduledTab) scheduledTab.click();

    // Filter by scheduled
    setTimeout(() => {
        if (window.filterBookings) window.filterBookings('scheduled');
        // Optional: Scroll to specific date if we implemented IDs
    }, 100);
}

// --- CALENDAR HELPER (3D & Weeks) ---
function generateOverviewCalendar(bookings) {
    const now = new Date();
    const currentMonth = now.toLocaleString('default', { month: 'long' });
    const currentYear = now.getFullYear();
    const todayDate = now.getDate();

    // Setup Dates
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    let startDayIndex = firstDay.getDay(); // 0-Sun, 6-Sat

    // Inject 3D Styles Dynamically
    const styleId = 'calendar-3d-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .cal-3d-container {
                perspective: 1000px;
            }
            .cal-card {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid transparent;
                border-radius: 12px;
                height: 50px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                transform-style: preserve-3d;
                cursor: default;
                position: relative;
            }
            .cal-card.interactive:hover {
                transform: translateY(-5px) scale(1.05) rotateX(10deg);
                background: rgba(255, 255, 255, 0.08);
                box-shadow: 0 10px 20px rgba(0, 210, 255, 0.2);
                border-color: rgba(0, 210, 255, 0.3);
                z-index: 10;
            }
            .cal-card.today {
                background: rgba(0, 210, 255, 0.15);
                border: 1px solid var(--neon-blue);
                box-shadow: 0 0 15px rgba(0, 210, 255, 0.1);
            }
            .cal-card.today:hover {
                box-shadow: 0 0 25px rgba(0, 210, 255, 0.4);
            }
            .week-label {
                font-size: 0.7rem; 
                color: var(--text-muted); 
                writing-mode: vertical-lr; 
                transform: rotate(180deg);
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0.5;
            }
        `;
        document.head.appendChild(style);
    }

    let gridHtml = '';

    // Header Row (Week + 7 Days)
    gridHtml += `<div class="text-muted" style="font-size: 0.7rem;">Wk</div>`;
    ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].forEach(d => {
        gridHtml += `<div class="text-muted" style="font-size: 0.75rem;">${d}</div>`;
    });

    let currentWeek = getWeekNumber(firstDay);
    let dayCount = 1;
    let currentRow = [];

    // First Week Logic
    // 1. Add Week Number
    gridHtml += `<div class="week-label">W${currentWeek}</div>`;

    // 2. Empty Slots
    for (let i = 0; i < startDayIndex; i++) {
        gridHtml += `<div></div>`;
    }

    // 3. Fill First Week
    for (let i = startDayIndex; i < 7; i++) {
        gridHtml += renderDayCell(dayCount, currentYear, now.getMonth() + 1, bookings, todayDate);
        dayCount++;
    }
    currentWeek++;

    // Remaining Weeks
    while (dayCount <= daysInMonth) {
        // New Week Row Start
        gridHtml += `<div class="week-label">W${currentWeek}</div>`;

        for (let i = 0; i < 7; i++) {
            if (dayCount <= daysInMonth) {
                gridHtml += renderDayCell(dayCount, currentYear, now.getMonth() + 1, bookings, todayDate);
                dayCount++;
            } else {
                gridHtml += `<div></div>`; // Empty filler
            }
        }
        currentWeek++;
        if (currentWeek > 52) currentWeek = 1; // Basic reset
    }

    return `
        <div class="calendar-widget cal-3d-container" style="margin-top: 2rem; background: rgba(255,255,255,0.02); border-radius: 20px; padding: 1.5rem; border: 1px solid var(--glass-border);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 style="margin: 0; font-size: 1.2rem; display: flex; align-items: center; gap: 10px;">
                    <i class="far fa-calendar-alt" style="color: var(--neon-purple);"></i> ${currentMonth} ${currentYear}
                </h3>
                <div style="text-align: right;">
                     <div class="text-muted" style="font-size: 0.7rem; letter-spacing: 1px;">CURRENT TIME</div>
                     <div id="real-time-clock" style="font-family: monospace; font-size: 1.1rem; color: var(--neon-blue); font-weight: 700;">--:--:--</div>
                </div>
            </div>
            <!-- Grid: 8 Columns (1 for Week + 7 for Days) -->
            <div style="display: grid; grid-template-columns: 30px repeat(7, 1fr); gap: 0.6rem; text-align: center; align-items: center;">
                ${gridHtml}
            </div>
        </div>
    `;
}

function renderDayCell(day, year, month, bookings, todayDate) {
    const checkDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const hasBooking = bookings.some(b => (['Scheduled', 'Confirmed', 'Active'].includes(b.status) && b.date.includes(day.toString())));
    const isToday = day === todayDate;

    // Classes
    let classes = 'cal-card';
    if (isToday) classes += ' today';
    if (hasBooking || isToday) classes += ' interactive';

    // Attrs
    const onClick = hasBooking ? `onclick="handleCalendarDateClick('${checkDate}')"` : '';
    const cursor = hasBooking ? 'pointer' : 'default';

    // Dot
    const dot = hasBooking ? `<div style="width: 6px; height: 6px; background: var(--neon-green); border-radius: 50%; margin-top: 4px; box-shadow: 0 0 8px var(--neon-green);"></div>` : '';

    return `
        <div class="${classes}" style="cursor: ${cursor};" ${onClick}>
            <span style="font-weight: 700; color: ${isToday ? 'var(--neon-blue)' : '#fff'}; font-size: 0.9rem;">${day}</span>
            ${dot}
        </div>
    `;
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}

function renderOverview() {
    const container = getEl('overview-active-booking-container');
    if (!container) return;

    let bookings = Storage.get(STORAGE_KEYS.BOOKINGS) || [];

    // FAIL-SAFE: If data is wiped, restore it immediately
    if (bookings.length === 0) {
        console.log('No bookings found (Data Loss Detected). Restoring default data...');
        bookings = richBookingsData;
        Storage.set(STORAGE_KEYS.BOOKINGS, bookings);
    }
    // Broadened filter to ensure 'On the way' and other active states show up
    const activeBookings = bookings.filter(b => ['Active', 'Confirmed', 'Scheduled', 'On the way', 'Running', 'Pending'].includes(b.status));
    const calendar = generateOverviewCalendar(bookings);

    try {
        let contentHtml = '';

        if (activeBookings.length > 0) {
            // Scrollable Container
            contentHtml += `<div style="display: flex; gap: 1.5rem; overflow-x: auto; padding-bottom: 1.5rem; margin-top: 1rem; scrollbar-width: thin;">`;

            activeBookings.forEach(activeBooking => {
                const timeline = activeBooking.timeline || [];
                // Compact Card
                contentHtml += `
                    <div class="active-booking-card" style="min-width: 320px; max-width: 350px; flex-shrink: 0; position: relative; padding: 1.25rem; border-radius: 16px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--glass-border);">
                        <div class="booking-header" style="margin-bottom: 1rem;">
                            <div style="display:flex; justify-content:space-between; align-items:start;">
                                <div>
                                    <span class="text-muted" style="font-size: 0.65rem; letter-spacing: 1px; text-transform: uppercase;">Ongoing</span>
                                    <h3 style="font-size: 1.1rem; margin: 0.2rem 0; color: #fff;">${activeBooking.service}</h3>
                                    <p class="text-muted" style="font-size: 0.8rem; margin:0;">#${activeBooking.id}</p>
                                </div>
                                <span class="booking-badge" style="background: rgba(0, 210, 255, 0.1); border: 1px solid var(--neon-blue); padding: 0.25rem 0.6rem; font-size: 0.7rem; border-radius: 20px; color: var(--neon-blue);">${activeBooking.status}</span>
                            </div>
                        </div>
                        
                        <div style="display: flex; gap: 1rem; margin-bottom: 1rem; padding: 0.8rem; background: rgba(0,0,0,0.2); border-radius: 10px;">
                            <div class="avatar" style="width: 40px; height: 40px; font-size: 0.9rem; border-color: var(--neon-blue);">${(activeBooking.worker || 'S')[0]}</div>
                            <div>
                                <p style="font-weight: 600; font-size: 0.95rem; margin:0;">${activeBooking.worker || 'Searching...'}</p>
                                <p style="font-size: 0.8rem; color: var(--text-muted); margin:0;"><i class="fas fa-star" style="color: var(--neon-orange);"></i> 4.8</p>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; font-size: 0.85rem;">
                            <div>
                                <p class="text-muted" style="margin:0; font-size:0.7rem;">DATE</p>
                                <p style="margin:0; font-weight:600;">${activeBooking.date}</p>
                            </div>
                            <div>
                                <p class="text-muted" style="margin:0; font-size:0.7rem;">TIME</p>
                                <p style="margin:0; font-weight:600;">${activeBooking.time}</p>
                            </div>
                        </div>

                        <div class="booking-timeline" style="margin-bottom: 1.2rem; display:flex; justify-content: space-between; position:relative;">
                            ${timeline.slice(0, 3).map((step, idx) => `
                                <div style="display:flex; flex-direction:column; align-items:center; z-index:1; width:33%;">
                                    <div style="width: 20px; height: 20px; border-radius: 50%; background: ${step.status === 'completed' ? 'var(--neon-green)' : step.status === 'active' ? 'var(--neon-blue)' : 'var(--bg-dark-600)'}; display:flex; align-items:center; justify-content:center; font-size:0.6rem; color:#000;">
                                        ${step.status === 'completed' ? '<i class="fas fa-check"></i>' : ''}
                                    </div>
                                    <span style="font-size: 0.6rem; margin-top: 4px; color: ${step.status === 'active' ? 'var(--text-primary)' : 'var(--text-muted)'}; text-align:center;">${step.label}</span>
                                </div>
                            `).join('')}
                             <div style="position:absolute; top:10px; left:16%; right:16%; height:2px; background:var(--bg-dark-600); z-index:0;"></div>
                        </div>
                        
                        <div style="display: flex; gap: 0.5rem; border-top: 1px solid var(--glass-border); padding-top: 1rem;">
                            <button class="btn btn-primary btn-sm" style="flex:1; background: var(--neon-green); color: #000; font-size:0.8rem; padding:0.5rem;" onclick="window.open('tel:9199999999')"><i class="fas fa-phone-alt"></i></button>
                            <button class="btn btn-secondary btn-sm" style="flex:1; font-size:0.8rem; padding:0.5rem;" onclick="window.location.href='chat.html?bookingId=${activeBooking.id}'"><i class="fas fa-comment-dots"></i></button>
                            <button class="btn btn-secondary btn-sm" style="flex:1; font-size:0.8rem; padding:0.5rem; color: var(--neon-blue); border-color: var(--neon-blue);" onclick="window.openTracking('${activeBooking.id}')"><i class="fas fa-map-marker-alt"></i></button>
                            <button class="btn btn-ghost btn-sm" style="flex:1; color: var(--neon-pink); font-size:0.8rem; padding:0.5rem; border: 1px solid var(--neon-pink);" onclick="cancelBooking('${activeBooking.id}')"><i class="fas fa-times"></i></button>
                        </div>
                    </div>
                `;
            });
            contentHtml += `</div>`; // Close container

        } else {
            contentHtml = `
                <div class="active-booking-card" style="text-align: center; padding: 2rem; background:rgba(255,255,255,0.02); border-radius:12px;">
                    <p class="text-muted">No active bookings found.</p>
                    <button class="btn btn-primary" style="margin-top: 1rem;" onclick="document.querySelector('[data-tab=book-service]').click()">Book a Service Now</button>
                </div>
            `;
        }

        container.innerHTML = calendar + contentHtml;

    } catch (e) {
        console.error('Error rendering overview:', e);
        container.innerHTML = '<p class="text-muted">Error loading overview.</p>';
    }
}

async function renderBookingsGrid(filterType = 'all') {
    const grid = getEl('bookings-grid');
    if (!grid) return;

    // Show loading state
    grid.innerHTML = '<div style="text-align:center; padding:2rem;"><div class="spinner"></div><p>Loading bookings...</p></div>';

    try {
        const user = Storage.get(STORAGE_KEYS.USER);
        if (!user || !user.uid) {
            grid.innerHTML = '<p>Please log in to view bookings.</p>';
            return;
        }

        // Fetch from API
        // API.jobs.getMyJobs returns array of jobs
        let bookings = [];
        try {
            const apiBookings = await API.jobs.getMyJobs(user.uid, 'customer');

            if (apiBookings && apiBookings.length > 0) {
                // Map API data to UI format
                bookings = apiBookings.map(job => ({
                    id: job.id,
                    service: job.serviceType || 'General',
                    worker: job.workerId === 'auto-assign' ? 'Assigning...' : 'Worker assigned',
                    date: job.scheduledTime || job.date || 'TBD',
                    time: job.time || '09:00 AM',
                    status: job.status ? (job.status.charAt(0).toUpperCase() + job.status.slice(1)) : 'Pending',
                    price: job.price || 450,
                    address: job.address
                }));
                // Update LocalStorage cache only if we got fresh data
                Storage.set(STORAGE_KEYS.BOOKINGS, bookings);
            } else {
                // Fallback to LocalStorage (preserves Demo Data)
                console.log('API returned empty. Using local Demo Data.');
                bookings = Storage.get(STORAGE_KEYS.BOOKINGS) || [];
            }
        } catch (err) {
            console.warn('API Fetch failed, using local data:', err);
            bookings = Storage.get(STORAGE_KEYS.BOOKINGS) || [];
        }

        // Filter Logic
        let filtered = bookings;
        if (filterType === 'active') {
            // treat 'Pending' as active for now
            filtered = bookings.filter(b => ['Active', 'Running', 'On the way', 'Pending'].includes(b.status));
        } else if (filterType === 'completed') {
            filtered = bookings.filter(b => ['Completed', 'Cancelled'].includes(b.status));
        } else if (filterType === 'scheduled') {
            filtered = bookings.filter(b => ['Confirmed', 'Scheduled'].includes(b.status));
        }

        // ... (Rest of the rendering logic remains mostly the same, just need to ensure variables match)

        // We need to re-include the rendering part since we replaced the start of the function
        // Copying the rendering logic from the original file to ensure it matches

        const getServiceStyle = (service) => {
            service = service.toLowerCase();
            if (service.includes('clean')) return { icon: 'fa-broom', color: '#00d2ff' };
            if (service.includes('plumb')) return { icon: 'fa-faucet', color: '#00ff9d' };
            if (service.includes('electric') || service.includes('ac') || service.includes('appliance')) return { icon: 'fa-bolt', color: '#ff9d00' };
            if (service.includes('paint') || service.includes('design')) return { icon: 'fa-paint-roller', color: '#ff00ff' };
            if (service.includes('salon') || service.includes('massage') || service.includes('yoga')) return { icon: 'fa-spa', color: '#ff0055' };
            if (service.includes('garden')) return { icon: 'fa-seedling', color: '#00ff00' };
            if (service.includes('move')) return { icon: 'fa-truck-moving', color: '#ffcc00' };
            return { icon: 'fa-tools', color: '#ffffff' };
        };

        const getStatusBadge = (status) => {
            if (['Active', 'Running', 'On the way'].includes(status)) return `<span style="background: rgba(0, 210, 255, 0.15); color: #00d2ff; padding: 6px 16px; border-radius: 20px; font-size: 0.8rem; border: 1px solid #00d2ff; display:flex; align-items:center; gap:6px; font-weight: 700; letter-spacing: 0.5px;"><span style="width:8px; height:8px; background:#00d2ff; border-radius:50%; box-shadow: 0 0 5px #00d2ff; animation: pulse 2s infinite;"></span> ${status.toUpperCase()}</span>`;
            if (status === 'Completed') return `<span style="background: rgba(57, 255, 20, 0.15); color: #00ff9d; padding: 6px 16px; border-radius: 20px; font-size: 0.8rem; border: 1px solid #00ff9d; font-weight: 700; letter-spacing: 0.5px;">COMPLETED</span>`;
            if (status === 'Cancelled') return `<span style="background: rgba(255, 59, 48, 0.15); color: #ff3b30; padding: 6px 16px; border-radius: 20px; font-size: 0.8rem; border: 1px solid #ff3b30; font-weight: 700; letter-spacing: 0.5px;">CANCELLED</span>`;
            return `<span style="background: rgba(255, 255, 255, 0.1); color: #fff; padding: 6px 16px; border-radius: 20px; font-size: 0.8rem;">${status}</span>`;
        };

        const tabsHtml = `
           <div class="booking-tabs" style="display: flex; gap: 1.5rem; margin-bottom: 2rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 5px; overflow-x: auto;">
               <button class="filter-tab ${filterType === 'all' ? 'active' : ''}" onclick="window.filterBookings('all')" 
                   style="white-space:nowrap; background:none; border:none; color:${filterType === 'all' ? '#fff' : 'rgba(255,255,255,0.5)'}; font-weight: 900; font-size: 1.1rem; padding-bottom: 1rem; border-bottom: 3px solid ${filterType === 'all' ? 'var(--neon-blue)' : 'transparent'}; cursor:pointer; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s ease;">ALL</button>
               <button class="filter-tab ${filterType === 'active' ? 'active' : ''}" onclick="window.filterBookings('active')" 
                   style="white-space:nowrap; background:none; border:none; color:${filterType === 'active' ? '#fff' : 'rgba(255,255,255,0.5)'}; font-weight: 900; font-size: 1.1rem; padding-bottom: 1rem; border-bottom: 3px solid ${filterType === 'active' ? 'var(--neon-blue)' : 'transparent'}; cursor:pointer; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s ease;">IN PROGRESS</button>
               <button class="filter-tab ${filterType === 'completed' ? 'active' : ''}" onclick="window.filterBookings('completed')" 
                   style="white-space:nowrap; background:none; border:none; color:${filterType === 'completed' ? '#fff' : 'rgba(255,255,255,0.5)'}; font-weight: 900; font-size: 1.1rem; padding-bottom: 1rem; border-bottom: 3px solid ${filterType === 'completed' ? 'var(--neon-blue)' : 'transparent'}; cursor:pointer; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s ease;">COMPLETED</button>
               <button class="filter-tab ${filterType === 'scheduled' ? 'active' : ''}" onclick="window.filterBookings('scheduled')" 
                   style="white-space:nowrap; background:none; border:none; color:${filterType === 'scheduled' ? '#fff' : 'rgba(255,255,255,0.5)'}; font-weight: 900; font-size: 1.1rem; padding-bottom: 1rem; border-bottom: 3px solid ${filterType === 'scheduled' ? 'var(--neon-blue)' : 'transparent'}; cursor:pointer; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s ease;">SCHEDULED</button>
           </div>
       `;

        const cardsHtml = filtered.length > 0 ? filtered.map(b => {
            const style = getServiceStyle(b.service);
            const isLive = ['Active', 'Running', 'On the way'].includes(b.status);
            const isCancelled = b.status === 'Cancelled';

            const chatAction = isCancelled ? 'onclick="alert(\'Cannot chat on cancelled bookings.\')"' : `onclick="window.location.href='chat.html?bookingId=${b.id}&workerName=${encodeURIComponent(b.worker || 'Professional')}'"`;
            const callAction = isCancelled ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : 'onclick="alert(\'Calling professional...\')"';

            const trackStyle = isLive
                ? 'background: var(--neon-blue); color: #fff; border:none; box-shadow: 0 0 10px rgba(0, 210, 255, 0.4); cursor: pointer;'
                : 'background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.3); border: 1px solid rgba(255,255,255,0.1); cursor: not-allowed;';
            const trackAction = isLive ? `onclick="window.openTracking('${b.id}')"` : 'disabled';

            return `
           <div class="booking-card" style="background: linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%); padding: 0; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; transition: transform 0.3s ease; position: relative; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                <div style="height: 60px; background: linear-gradient(to right, ${style.color}33, transparent); border-left: 4px solid ${style.color}; display: flex; align-items: center; padding: 0 1.5rem;">
                   <div style="width: 36px; height: 36px; background: ${style.color}22; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: ${style.color}; margin-right: 1rem; border: 1px solid ${style.color}44;">
                       <i class="fas ${style.icon}"></i>
                   </div>
                   <span style="font-weight: 700; font-size: 1.1rem; color: #fff; letter-spacing: 0.5px;">${b.service.toUpperCase()}</span>
                </div>
   
                <div style="padding: 1.5rem;">
                   <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;">
                       <div>
                            <p class="text-muted" style="font-size: 0.7rem; margin-bottom: 0.25rem; letter-spacing: 1px;">PROFESSIONAL</p>
                            <p style="font-weight: 600; font-size: 1.05rem;">${b.worker || 'Assigned Worker'}</p>
                       </div>
                       ${getStatusBadge(b.status)}
                   </div>
   
                   <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                       <div>
                           <p class="text-muted" style="font-size: 0.7rem; margin-bottom: 4px; letter-spacing: 0.5px;">DATE</p>
                           <p style="font-size: 0.95rem; font-weight: 600;">${b.date}</p>
                       </div>
                       <div>
                           <p class="text-muted" style="font-size: 0.7rem; margin-bottom: 4px; letter-spacing: 0.5px;">TIME</p>
                           <p style="font-size: 0.95rem; font-weight: 600;">${b.time}</p>
                       </div>
                   </div>
   
                   <div style="display: flex; justify-content: space-between; align-items: center;">
                       <span style="font-weight: 800; font-size: 1.2rem; color: #fff;">₹${b.price}</span>
                   </div>
                   
                   <div style="display: flex; gap: 0.8rem; margin-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1rem;">
                       <button class="btn btn-sm" ${callAction} style="flex:1; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: #fff; border-radius: 8px; padding: 0.6rem;">
                           <i class="fas fa-phone-alt" style="color:var(--neon-green)"></i> Call
                       </button>
                       <button class="btn btn-sm" ${chatAction} style="flex:1; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: #fff; border-radius: 8px; padding: 0.6rem;">
                           <i class="fas fa-comment-dots" style="color:var(--neon-blue)"></i> Chat
                       </button>
                       <button class="btn btn-sm" ${trackAction} style="flex:1; ${trackStyle} border-radius: 8px; padding: 0.6rem;">
                           <i class="fas fa-map-marker-alt"></i> Track
                       </button>
                   </div>
   
                </div>
           </div>`
        }).join('') : `
           <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--text-muted);">
               <i class="far fa-calendar-times" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
               <p>No ${filterType !== 'all' ? filterType : ''} bookings available.</p>
           </div>
       `;

        grid.innerHTML = `
           ${tabsHtml}
           <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
               ${cardsHtml}
           </div>
       `;

    } catch (error) {
        console.error('Error fetching bookings:', error);
        grid.innerHTML = '<p class="text-error">Failed to load bookings.</p>';
    }
}

window.filterBookings = function (type) {
    renderBookingsGrid(type);
};

window.openTracking = function (id) {
    window.location.href = `tracking.html?bookingId=${id}`;
};

function renderWallet() {
    const container = getEl('wallet-container');
    if (!container) return;

    const user = Storage.get(STORAGE_KEYS.USER) || {};
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 2rem;">
            <!-- Balance Card -->
            <div class="stat-card" style="background: linear-gradient(135deg, var(--bg-dark-600), var(--bg-dark-800)); border-color: var(--neon-blue);">
                <p class="text-muted" style="text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px;">Available Balance</p>
                <h1 style="font-size: 3rem; margin: 1rem 0;">₹1,250.00</h1>
                <div style="display: flex; gap: 1rem;">
                    <button class="btn btn-primary btn-sm" onclick="showToast('Add money feature coming soon!')">Add Money</button>
                    <button class="btn btn-secondary btn-sm" onclick="showToast('Withdraw feature coming soon!')">Withdraw</button>
                </div>
            </div>

            <!-- Saved Cards -->
            <div class="stat-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3>Your Cards</h3>
                    <button class="btn btn-ghost btn-sm" style="color: var(--neon-blue);">+ Add New</button>
                </div>
                <div style="background: linear-gradient(135deg, #1e264a, #0a0b14); border-radius: 20px; padding: 2rem; color: #fff; position: relative; box-shadow: 0 15px 35px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); overflow: hidden;">
                    <!-- Card Glow Effect -->
                    <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(0,210,255,0.1) 0%, transparent 70%); pointer-events: none;"></div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem;">
                        <div style="display: flex; flex-direction: column;">
                            <span style="font-size: 0.6rem; letter-spacing: 2px; color: rgba(255,255,255,0.5);">KARYASETU PRIVILEGE</span>
                            <div style="width: 45px; height: 35px; background: linear-gradient(135deg, #ffd700, #b8860b); border-radius: 6px; margin-top: 10px; position: relative;">
                                <div style="position: absolute; top: 10%; left: 10%; width: 80%; height: 2px; background: rgba(0,0,0,0.1);"></div>
                                <div style="position: absolute; top: 30%; left: 10%; width: 80%; height: 2px; background: rgba(0,0,0,0.1);"></div>
                                <div style="position: absolute; top: 50%; left: 10%; width: 80%; height: 2px; background: rgba(0,0,0,0.1);"></div>
                            </div>
                        </div>
                        <i class="fab fa-cc-visa" style="font-size: 2.5rem; opacity: 0.9;"></i>
                    </div>
                    
                    <p style="font-size: 1.5rem; font-family: 'Courier New', monospace; letter-spacing: 4px; text-shadow: 0 2px 4px rgba(0,0,0,0.5); margin-bottom: 1.5rem;">•••• •••• •••• 4242</p>
                    
                    <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                        <div>
                            <p style="font-size: 0.6rem; color: rgba(255,255,255,0.5); letter-spacing: 1px;">CARD HOLDER</p>
                            <p style="font-weight: 600; font-size: 0.9rem; text-transform: uppercase;">${(user.name || 'USER')}</p>
                        </div>
                        <div style="text-align: right;">
                            <p style="font-size: 0.6rem; color: rgba(255,255,255,0.5); letter-spacing: 1px;">EXPIRES</p>
                            <p style="font-weight: 600; font-size: 0.9rem;">12/25</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="stat-card" style="margin-top: 2rem;">
            <h3>Recent Transactions</h3>
            <div style="margin-top: 1rem;">
                <div style="display: flex; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid var(--glass-border);">
                    <div>
                        <p style="font-weight: 600;">Plumbing Service - BK-1102</p>
                        <p class="text-muted" style="font-size: 0.75rem;">Nov 15, 2023 • Paid via Wallet</p>
                    </div>
                    <p style="color: var(--neon-pink); font-weight: 800;">-₹350.00</p>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid var(--glass-border);">
                    <div>
                        <p style="font-weight: 600;">Wallet Top-up</p>
                        <p class="text-muted" style="font-size: 0.75rem;">Nov 10, 2023 • Added via UPI</p>
                    </div>
                    <p style="color: var(--neon-green); font-weight: 800;">+₹1,500.00</p>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 1rem 0;">
                    <div>
                        <p style="font-weight: 600;">Mechanic Service - BK-1050</p>
                        <p class="text-muted" style="font-size: 0.75rem;">Oct 28, 2023 • Paid via Wallet</p>
                    </div>
                    <p style="color: var(--neon-pink); font-weight: 800;">-₹600.00</p>
                </div>
            </div>
        </div>
    `;
}

window.removeProfilePic = function () {
    if (confirm('Remove profile picture?')) {
        const user = Storage.get(STORAGE_KEYS.USER) || {};
        delete user.profilePic;
        Storage.set(STORAGE_KEYS.USER, user);

        // Update Sidebar Avatar immediately
        const sidebarAvatar = document.getElementById('user-avatar-img');
        const sidebarInitials = document.getElementById('user-avatar-initials');
        if (sidebarAvatar && sidebarInitials) {
            sidebarAvatar.style.display = 'none';
            sidebarInitials.style.display = 'flex';
        }

        renderProfile();
        showToast('Profile picture removed.');
    }
};

function renderProfile() {
    const container = getEl('profile-layout');
    if (!container) return;
    const user = Storage.get(STORAGE_KEYS.USER) || {};

    // Profile Pic Logic
    let avatarSrc = user.profilePic || '';
    let avatarContent = avatarSrc
        ? `<img src="${avatarSrc}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 4px solid var(--neon-blue);">`
        : `<div style="width: 100%; height: 100%; border-radius: 50%; background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple)); display: flex; align-items: center; justify-content: center; font-size: 2.5rem; color: white;">${user.name ? user.name[0] : 'U'}</div>`;

    container.innerHTML = `
        <div class="stat-card" style="max-width: 900px; margin: 0 auto;">
            <div style="display: flex; align-items: center; gap: 2rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 2rem; margin-bottom: 2rem;">
                <!-- Avatar Section -->
                <div style="position: relative; width: 100px; height: 100px; cursor: pointer; flex-shrink: 0;" onclick="document.getElementById('profile-upload-main').click()">
                    ${avatarContent}
                    <div style="position: absolute; bottom: 0; right: 0; background: var(--neon-green); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #1a1a1a; z-index: 10;">
                        <i class="fas fa-camera" style="font-size: 12px; color: #000;"></i>
                    </div>
                </div>
                <input type="file" id="profile-upload-main" hidden accept="image/*">

                <!-- Name Section -->
                <div>
                    <h2 style="margin: 0; font-size: 1.8rem;">${user.name || 'User Name'}</h2>
                    <p class="text-muted" style="margin: 0.25rem 0 0;">Customer Account</p>
                    ${user.profilePic ? `<button onclick="removeProfilePic()" class="btn btn-sm btn-ghost" style="color: var(--neon-pink); margin-top: 0.5rem; padding: 0; font-size: 0.8rem;"><i class="fas fa-trash-alt"></i> Remove Photo</button>` : ''}
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                <div>
                    <label class="text-muted" style="font-size: 0.8rem;">FULL NAME</label>
                    <input type="text" id="edit-name" value="${user.name || ''}" disabled 
                        style="width:100%; background:transparent; border:none; border-bottom:1px solid var(--glass-border); color:#fff; padding:5px 0; font-size:1.1rem;">
                </div>
                <div>
                    <label class="text-muted" style="font-size: 0.8rem;">EMAIL ADDRESS</label>
                    <input type="email" id="edit-email" value="${user.email || 'customer@karyasetu.com'}" disabled 
                            style="width:100%; background:transparent; border:none; border-bottom:1px solid var(--glass-border); color:#fff; padding:5px 0; font-size:1.1rem;">
                </div>
                <div>
                    <label class="text-muted" style="font-size: 0.8rem;">PHONE NUMBER</label>
                    <input type="tel" id="edit-phone" value="${user.phone || '+91 98XXX XXX00'}" disabled 
                            style="width:100%; background:transparent; border:none; border-bottom:1px solid var(--glass-border); color:#fff; padding:5px 0; font-size:1.1rem;">
                </div>
                <div>
                    <label class="text-muted" style="font-size: 0.8rem;">MEMBER SINCE</label>
                    <input type="text" id="edit-joined" value="${user.joinedDate || 'Nov 2023'}" disabled 
                            style="width:100%; background:transparent; border:none; border-bottom:1px solid var(--glass-border); color:#fff; padding:5px 0; font-size:1.1rem;">
                </div>
            </div>
            
            <h3 style="margin-top: 2rem; margin-bottom: 1.5rem;">Saved Address</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                <div>
                    <label class="text-muted" style="font-size: 0.8rem;">HOUSE / FLAT NO.</label>
                    <input type="text" id="edit-house" value="${user.address?.house || '42, Galaxy Apartments'}" disabled 
                            style="width:100%; background:transparent; border:none; border-bottom:1px solid var(--glass-border); color:#fff; padding:5px 0; font-size:1.1rem;">
                </div>
                <div>
                    <label class="text-muted" style="font-size: 0.8rem;">LANDMARK</label>
                    <input type="text" id="edit-landmark" value="${user.address?.landmark || 'Near Orbital Mall'}" disabled 
                            style="width:100%; background:transparent; border:none; border-bottom:1px solid var(--glass-border); color:#fff; padding:5px 0; font-size:1.1rem;">
                </div>
                <div>
                    <label class="text-muted" style="font-size: 0.8rem;">CITY / STATE</label>
                    <input type="text" id="edit-city" value="${user.address?.city || 'New Delhi, Delhi'}" disabled 
                            style="width:100%; background:transparent; border:none; border-bottom:1px solid var(--glass-border); color:#fff; padding:5px 0; font-size:1.1rem;">
                </div>
                <div>
                    <label class="text-muted" style="font-size: 0.8rem;">PINCODE</label>
                    <input type="text" id="edit-pincode" value="${user.address?.pincode || '1100XX'}" disabled 
                            style="width:100%; background:transparent; border:none; border-bottom:1px solid var(--glass-border); color:#fff; padding:5px 0; font-size:1.1rem;">
                </div>
            </div>
            
            <div style="margin-top: 2.5rem; text-align: right;">
                <button id="edit-profile-btn" class="btn btn-primary" style="padding: 0.75rem 2rem;">Edit Account Info</button>
            </div>
        </div>
    `;

    // Attach Listeners
    getEl('edit-profile-btn').addEventListener('click', handleProfileEditToggle);
}

function renderFavorites() {
    // We'll reuse the bookings grid for consistency in display
    const grid = document.getElementById('favorites-grid-layout');
    if (!grid) return;

    grid.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
            <div class="stat-card" style="display: flex; align-items: center; gap: 1.25rem;">
                <div class="avatar">RK</div>
                <div style="flex: 1;">
                    <h4 style="margin: 0;">Rajesh Kumar</h4>
                    <p class="text-muted">Plumber • 4.8 ⭐</p>
                </div>
                <i class="fas fa-heart" style="color: var(--neon-pink); cursor: pointer;"></i>
            </div>
            <div class="stat-card" style="display: flex; align-items: center; gap: 1.25rem;">
                <div class="avatar">AS</div>
                <div style="flex: 1;">
                    <h4 style="margin: 0;">Amit Singh</h4>
                    <p class="text-muted">Electrician • 4.7 ⭐</p>
                </div>
                <i class="fas fa-heart" style="color: var(--neon-pink); cursor: pointer;"></i>
            </div>
        </div>
    `;
}

function renderSupport() {
    const container = getEl('support-grid');
    if (!container) return;

    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card" style="text-align: center; cursor: pointer;">
                <i class="fas fa-phone-alt" style="font-size: 2rem; color: var(--neon-blue); margin-bottom: 1rem;"></i>
                <h4>Call Support</h4>
                <p class="text-muted">24/7 Helpline available</p>
            </div>
            <div class="stat-card" style="text-align: center; cursor: pointer;">
                <i class="fas fa-comment-dots" style="font-size: 2rem; color: var(--neon-purple); margin-bottom: 1rem;"></i>
                <h4>Chat with Us</h4>
                <p class="text-muted">Wait time: ~2 mins</p>
            </div>
            <div class="stat-card" style="text-align: center; cursor: pointer;">
                <i class="fas fa-envelope" style="font-size: 2rem; color: var(--neon-orange); margin-bottom: 1rem;"></i>
                <h4>Email Support</h4>
                <p class="text-muted">Response in 24 hours</p>
            </div>
        </div>
        
        <div class="stat-card" style="margin-top: 2rem;">
            <h3>Frequently Asked Questions</h3>
            <div style="margin-top: 1rem;">
                <details style="padding: 1rem 0; border-bottom: 1px solid var(--glass-border);">
                    <summary style="font-weight: 600; cursor: pointer;">How do I cancel a booking?</summary>
                    <p class="text-muted" style="margin-top: 0.5rem; font-size: 0.9rem;">You can cancel a booking from the 'My Bookings' tab or direct tracks on the overview page before the worker starts the job.</p>
                </details>
                <details style="padding: 1rem 0; border-bottom: 1px solid var(--glass-border);">
                    <summary style="font-weight: 600; cursor: pointer;">Is my payment secure?</summary>
                    <p class="text-muted" style="margin-top: 0.5rem; font-size: 0.9rem;">Yes, KaryaSetu uses industry-standard encryption for all transactions and supports secure wallet payments.</p>
                </details>
            </div>
        </div>
    `;
}

// --- AI Chat Logic (Gemini API Multimodal) ---
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

let currentAttachment = null; // { data: base64, mime: string }
let recognition = null;

function setupMultimodalListeners() {
    // Attach Button
    getEl('chat-attach-btn')?.addEventListener('click', () => getEl('chat-file-input').click());

    // File Input
    getEl('chat-file-input')?.addEventListener('change', handleFileSelect);

    // Mic Button
    getEl('chat-mic-btn')?.addEventListener('click', toggleVoiceInput);
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size too large. Max 5MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const base64Data = event.target.result.split(',')[1];
        currentAttachment = {
            data: base64Data,
            mime: file.type
        };
        showFilePreview(file, event.target.result);
    };
    reader.readAsDataURL(file);
}

function showFilePreview(file, src) {
    const container = getEl('chat-file-preview');
    container.style.display = 'block';

    let previewHtml = '';
    if (file.type.startsWith('image/')) {
        previewHtml = `<img src="${src}" alt="preview">`;
    } else {
        previewHtml = `<div style="display:flex;align-items:center;gap:0.5rem;color:#fff;"><i class="fas fa-file-pdf"></i> <span>${file.name}</span></div>`;
    }

    container.innerHTML = `
        <div class="preview-item">
            ${previewHtml}
            <button class="preview-remove" onclick="removeAttachment()">×</button>
        </div>
    `;
}

function removeAttachment() {
    currentAttachment = null;
    getEl('chat-file-input').value = '';
    getEl('chat-file-preview').style.display = 'none';
    getEl('chat-file-preview').innerHTML = '';
}

function toggleVoiceInput() {
    if (!('webkitSpeechRecognition' in window)) {
        alert('Voice input is not supported in this browser.');
        return;
    }

    const btn = getEl('chat-mic-btn');

    if (recognition && btn.classList.contains('mic-active')) {
        recognition.stop();
        return;
    }

    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        btn.classList.add('mic-active');
    };

    recognition.onend = () => {
        btn.classList.remove('mic-active');
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const input = getEl('ai-popup-input');
        input.value = (input.value + ' ' + transcript).trim();
        input.focus();
    };

    recognition.start();
}

function toggleChatPopup() {
    const popup = getEl('ai-chat-popup');
    if (popup) {
        popup.classList.toggle('active');
        if (popup.classList.contains('active')) {
            setTimeout(() => getEl('ai-popup-input')?.focus(), 300);
            if (!getEl('chat-file-input').hasAttribute('listening')) {
                setupMultimodalListeners();
                getEl('chat-file-input').setAttribute('listening', 'true');
            }
        }
    }
}

// Chat History State
let chatHistory = [];

async function handleAIMessage() {
    try {
        console.log('handleAIMessage triggered');
        const aiInput = getEl('ai-popup-input');

        if (!aiInput) {
            alert('Error: Chat input element not found!');
            return;
        }

        const query = aiInput.value.trim();

        // Allow sending just file without text (use default prompt)
        if (!query && !currentAttachment) return;

        // Append User Message with attachment
        let displayMsg = query;
        let attachmentToSend = null; // Hold ref before clearing

        if (currentAttachment) {
            attachmentToSend = currentAttachment; // Keep reference

            if (currentAttachment.mime.startsWith('image/')) {
                // Image Display
                const imgSrc = `data:${currentAttachment.mime};base64,${currentAttachment.data}`;
                displayMsg += `<br><img src="${imgSrc}" class="chat-uploaded-image" alt="Uploaded Image">`;
            } else {
                // File Display
                displayMsg += `
                    <div class="chat-file-card">
                        <i class="fas fa-file-alt"></i>
                        <span>Attached File</span>
                    </div>`;
            }
        }

        appendChatMessage('user', displayMsg);
        aiInput.value = '';

        // Handle Attachment (Text-only backend warning logic preserved but simplified)
        if (attachmentToSend) {
            // Optional: Backend technically supports images if we updated API, but keeping simple for now
            appendChatMessage('ai', "I received your file. Analyzing...");
        }
        removeAttachment();

        // Show typing indicator
        const typingId = showTypingIndicator();

        try {
            // Prepare payload for Backend API
            const payload = {
                message: query,
                previousHistory: chatHistory,
                workerContext: { type: 'platform_assistant' } // Special context for General Assistant
            };

            const response = await API.chat.send(payload);
            removeTypingIndicator(typingId);

            const replyText = response.reply;
            appendChatMessage('ai', replyText);

            // Update History
            chatHistory.push(
                { role: "user", parts: [{ text: query }] },
                { role: "model", parts: [{ text: replyText }] }
            );

        } catch (error) {
            console.error('AI Chat Error:', error);
            removeTypingIndicator(typingId);
            appendChatMessage('ai', `⚠️ Error: ${error.message || 'Failed to connect to assistant'}.`);
        }
    } catch (criticalError) {
        alert('Critical Chat Error: ' + criticalError.message);
        console.error(criticalError);
    }
}

// --- Multi-step Booking Page ---
function openBookingPage(serviceType) {
    // Save selection and redirect to dedicated booking page
    Storage.set('karyasetu_selected_service', serviceType);
    window.location.href = 'booking.html';
}

function cancelBooking(bookingId) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        let bookings = Storage.get(STORAGE_KEYS.BOOKINGS) || [];

        // Find the index of the booking
        const targetIndex = bookings.findIndex(b => String(b.id) === String(bookingId));

        if (targetIndex !== -1) {
            // PERMANENTLY REMOVE via splice
            bookings.splice(targetIndex, 1);
            Storage.set(STORAGE_KEYS.BOOKINGS, bookings);

            renderOverview();
            updateDashboardStats();
            showToast('Booking removed successfully.');
        } else {
            console.warn('Booking ID not found:', bookingId);
            showToast('Could not cancel: Booking not found.');
        }
    }
}

// Utility for toast (placeholder)
function showToast(msg) {
    alert(msg);
}

// --- Profile Edit Logic ---
async function handleProfileEditToggle() {
    const btn = getEl('edit-profile-btn');
    const inputs = [
        'edit-name', 'edit-email', 'edit-phone', 'edit-joined',
        'edit-house', 'edit-landmark', 'edit-city', 'edit-pincode'
    ];

    if (btn.textContent.includes('Edit')) {
        // Switch to Edit Mode
        inputs.forEach(id => {
            const el = getEl(id);
            if (el) {
                el.disabled = false;
                el.style.borderBottom = '1px solid var(--neon-blue)';
            }
        });
        btn.textContent = 'Save Changes';
        btn.style.backgroundColor = 'var(--neon-green)';
        btn.style.color = '#000';
    } else {
        // Save Changes
        const btn = getEl('edit-profile-btn'); // Re-select to be safe
        const originalText = btn.textContent;
        btn.textContent = 'Saving...';
        btn.disabled = true;

        const user = Storage.get(STORAGE_KEYS.USER) || {};

        // Prepare Update Data
        const updates = {
            name: getEl('edit-name').value,
            // email: getEl('edit-email').value, // Email updates usually restricted
            phone: getEl('edit-phone').value,
            address: {
                house: getEl('edit-house').value,
                landmark: getEl('edit-landmark').value,
                city: getEl('edit-city').value,
                pincode: getEl('edit-pincode').value
            }
        };

        try {
            // Check if we have a UID to update
            if (user.uid) {
                await API.auth.updateProfile(user.uid, updates);
            }

            // Update Local Storage with new values
            const updatedUser = { ...user, ...updates };
            Storage.set(STORAGE_KEYS.USER, updatedUser);

            // Update UI (Header Name, etc.)
            const headerName = getEl('welcome-name');
            if (headerName) headerName.textContent = updatedUser.name.split(' ')[0];

            // Sidebar Name
            const sidebarName = getEl('user-display-name');
            if (sidebarName) sidebarName.textContent = updatedUser.name;

            // Re-render Profile to reflect changes
            renderProfile();

            // Switch back to "Edit" View
            const inputIds = [
                'edit-name', 'edit-email', 'edit-phone', 'edit-joined',
                'edit-house', 'edit-landmark', 'edit-city', 'edit-pincode'
            ];
            inputIds.forEach(id => {
                const el = getEl(id);
                if (el) {
                    el.disabled = true;
                    el.style.borderBottom = 'none';
                }
            });

            btn.textContent = 'Edit Profile';
            btn.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            btn.style.color = '#fff';
            btn.disabled = false;

            showToast('Profile updated successfully!');

        } catch (error) {
            console.error('Profile Update Failed:', error);
            showToast('Failed to save profile changes. Please try again.', 'error');
            btn.textContent = 'Save Changes';
            btn.disabled = false;
        }
    }
}

// Run on load
document.addEventListener('DOMContentLoaded', init);

// --- Nearby Workers Map Feature ---
const nearbyWorkersMock = [
    { id: 'W-001', name: 'Rajesh Kumar', category: 'Plumbing', rating: 4.8, jobs: 156, lat: 19.0760, lng: 72.8777, avatar: 'RK', status: 'Online' },
    { id: 'W-002', name: 'Amit Singh', category: 'Electrical', rating: 4.9, jobs: 243, lat: 19.0850, lng: 72.8900, avatar: 'AS', status: 'Online' },
    { id: 'W-003', name: 'Sunita Devi', category: 'Cleaning', rating: 4.7, jobs: 189, lat: 19.0600, lng: 72.8600, avatar: 'SD', status: 'Online' },
    { id: 'W-004', name: 'Vikram Barber', category: 'Salon', rating: 4.9, jobs: 312, lat: 19.0900, lng: 72.8700, avatar: 'VB', status: 'Busy' },
    { id: 'W-005', name: 'Anita Sharma', category: 'Cleaning', rating: 4.6, jobs: 124, lat: 19.0700, lng: 72.9000, avatar: 'AS', status: 'Online' },
    { id: 'W-006', name: 'Suresh Wood', category: 'Carpentry', rating: 4.8, jobs: 215, lat: 19.1000, lng: 72.8800, avatar: 'SW', status: 'Online' }
];

let nearbyMap = null;
let mapMarkers = [];

async function renderNearbyWorkers(category = 'all') {
    const listContainer = getEl('nearby-workers-list');
    if (!listContainer) return;

    listContainer.innerHTML = '<div style="color: #aaa; text-align: center; padding: 2rem;">Loading professionals...</div>';

    try {
        const filters = category === 'all' ? {} : { skill: category };
        const workers = await API.workers.getAll(filters);

        // Map Backend Data to UI Format
        const mappedWorkers = workers.map(w => ({
            id: w.uid,
            name: w.name || 'Unknown Worker',
            category: w.profile?.skills?.[0] || 'General', // Take first skill as primary
            rating: 4.8, // Mock rating as backend doesn't have it yet
            jobs: 12, // Mock job count
            lat: w.profile?.location?.lat || (19.0760 + (Math.random() - 0.5) * 0.1), // Mock location or use real
            lng: w.profile?.location?.lng || (72.8777 + (Math.random() - 0.5) * 0.1),
            avatar: (w.name || 'W').substring(0, 2).toUpperCase(),
            status: 'Online' // Mock status
        }));

        if (mappedWorkers.length === 0) {
            listContainer.innerHTML = '<div style="color: #aaa; text-align: center; padding: 2rem;">No workers found in this category.</div>';
            return;
        }

        listContainer.innerHTML = mappedWorkers.map(w => `
            <div class="nearby-worker-card" style="padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 12px; border: 1px solid var(--glass-border); cursor: pointer; transition: all 0.3s ease; margin-bottom: 0.5rem;" 
                 onclick="focusOnWorker('${w.id}')">
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <div class="avatar" style="min-width: 45px; height: 45px; border: 1px solid var(--neon-blue); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; background: rgba(0, 210, 255, 0.1);">${w.avatar}</div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <h4 style="margin: 0; font-size: 0.95rem; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${w.name}</h4>
                            <span style="font-size: 0.65rem; color: ${w.status === 'Online' ? 'var(--neon-green)' : 'var(--neon-orange)'}; font-weight: bold;">● ${w.status.toUpperCase()}</span>
                        </div>
                        <p class="text-muted" style="font-size: 0.75rem; margin: 2px 0;">${w.category}</p>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px;">
                            <span style="font-size: 0.75rem; color: #fff;"><i class="fas fa-star" style="color: var(--neon-orange); font-size: 0.7rem;"></i> ${w.rating}</span>
                            <button class="btn btn-sm" style="padding: 2px 8px; font-size: 0.65rem; background: rgba(0, 210, 255, 0.1); border: 1px solid var(--neon-blue); color: var(--neon-blue); border-radius: 4px;" onclick="event.stopPropagation(); openBookingPage('${w.category}')">Book Now</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Update map
        setTimeout(() => initNearbyMap(mappedWorkers), 100);

    } catch (error) {
        console.error('Failed to load workers:', error);
        listContainer.innerHTML = '<div style="color: var(--error); text-align: center; padding: 2rem;">Failed to load professionals.</div>';
    }

    // One-time setup for controls
    if (!window.mapControlsInitialized) {
        getEl('worker-category-filter')?.addEventListener('change', (e) => {
            renderNearbyWorkers(e.target.value);
        });
        getEl('refresh-map')?.addEventListener('click', () => {
            renderNearbyWorkers(getEl('worker-category-filter').value);
        });
        window.mapControlsInitialized = true;
    }
}

function initNearbyMap(workers) {
    const mapEl = getEl('nearby-map');
    if (!mapEl) return;

    if (!nearbyMap) {
        nearbyMap = L.map('nearby-map').setView([19.0760, 72.8777], 13);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; CARTO',
            maxZoom: 20
        }).addTo(nearbyMap);
    }

    // Clear existing markers
    mapMarkers.forEach(m => nearbyMap.removeLayer(m));
    mapMarkers = [];

    // Custom Icon
    const workerIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color:var(--neon-blue); width: 12px; height: 12px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 10px var(--neon-blue);"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
    });

    // Add new markers
    workers.forEach(w => {
        const marker = L.marker([w.lat, w.lng], { icon: workerIcon }).addTo(nearbyMap);
        marker.bindPopup(`
            <div style="background: #1a1a1a; color: #fff; padding: 10px; border-radius: 8px; font-family: 'Inter', sans-serif;">
                <h4 style="margin: 0; font-size: 0.9rem;">${w.name}</h4>
                <p style="margin: 4px 0; font-size: 0.75rem; color: #aaa;">${w.category}</p>
                <div style="display:flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                    <span style="font-size: 0.75rem;"><i class="fas fa-star" style="color:var(--neon-orange)"></i> ${w.rating}</span>
                    <button onclick="openBookingPage('${w.category}')" style="background: var(--neon-blue); border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; color: #000; font-weight: bold; font-size: 0.7rem;">Book</button>
                </div>
            </div>
        `, { className: 'dark-popup' });
        marker.workerId = w.id;
        mapMarkers.push(marker);
    });

    if (workers.length > 0) {
        const group = new L.featureGroup(mapMarkers);
        nearbyMap.fitBounds(group.getBounds().pad(0.1));
    }
}

window.focusOnWorker = (workerId) => {
    const marker = mapMarkers.find(m => m.workerId === workerId);
    if (marker && nearbyMap) {
        nearbyMap.setView(marker.getLatLng(), 15);
        marker.openPopup();
    }
};

// --- Chat Helper Functions (Restored) ---
function appendChatMessage(sender, text) {
    const chatBody = getEl('chat-popup-body');
    if (!chatBody) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = sender === 'user' ? 'user-message' : 'ai-message';
    msgDiv.innerHTML = `<p>${text.replace(/\n/g, '<br>')}</p>`;
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function showTypingIndicator() {
    const chatBody = getEl('chat-popup-body');
    if (!chatBody) return null;
    const id = 'typing-' + Date.now();
    const msgDiv = document.createElement('div');
    msgDiv.className = 'ai-message';
    msgDiv.id = id;
    msgDiv.innerHTML = `<p><i class="fas fa-ellipsis-h fa-pulse"></i></p>`;
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
    return id;
}

function removeTypingIndicator(id) {
    if (id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }
}

// Ensure handleAIMessage is globally available for inline HTML events
window.handleAIMessage = handleAIMessage;
console.log('Customer Dashboard System Loaded - Chat Ready');


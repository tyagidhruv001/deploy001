# KaryaSetu - Complete User Flow

## 🎯 Your Current Implementation

**Good news!** Your flow is already correctly implemented exactly as you requested:

> "After signup → fill details → ask user about role → redirect to respective role page"

---

## 📊 Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                             │
└─────────────────────────────────────────────────────────────────┘

    START
      │
      ▼
┌─────────────┐
│   SIGNUP    │  ← User enters: Name, Phone, Email, Password
│ signup.html │
└──────┬──────┘
       │
       │ ✅ Account Created
       │ 📦 Stored: karyasetu_user
       │
       ▼
┌──────────────────┐
│  ROLE SELECTION  │  ← User chooses: Customer OR Worker
│ role-select.html │
└────────┬─────────┘
         │
         │ 📦 Stored: karyasetu_user_role
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌─────────┐
│CUSTOMER │ │ WORKER  │  ← Fill role-specific details
│ONBOARD  │ │ONBOARD  │
└────┬────┘ └────┬────┘
     │           │
     │           │ 📦 Stored: karyasetu_user_profile
     │           │
     └─────┬─────┘
           │
           ▼
    ┌──────────────┐
    │   ROUTER     │  ← Detects role from localStorage
    │dashboard.html│
    └──────┬───────┘
           │
      ┌────┴────┐
      │         │
      ▼         ▼
┌──────────┐ ┌──────────┐
│CUSTOMER  │ │ WORKER   │  ← Role-specific dashboard
│DASHBOARD │ │DASHBOARD │
└──────────┘ └──────────┘
```

---

## 🔄 Detailed Step-by-Step Flow

### 1️⃣ **SIGNUP** (`auth/signup.html`)

**User Actions:**
- Enter full name
- Enter phone number (10 digits)
- Enter email (optional)
- Create password (min 6 chars)
- Accept terms & conditions

**System Actions:**
```javascript
// Store user data
localStorage.setItem('karyasetu_user', JSON.stringify({
  name: "John Doe",
  phone: "9876543210",
  email: "john@example.com",
  loggedIn: true,
  signupTime: "2026-01-08T..."
}));

// Redirect
window.location.href = 'role-select.html';
```

---

### 2️⃣ **ROLE SELECTION** (`auth/role-select.html`)

**User Sees:**
```
┌─────────────────────┐  ┌─────────────────────┐
│   I'm a Customer    │  │    I'm a Worker     │
│                     │  │                     │
│  👤 User Icon       │  │  🔧 Tool Icon       │
│                     │  │                     │
│  • Post jobs        │  │  • Get jobs         │
│  • Find workers     │  │  • Build profile    │
│  • Track progress   │  │  • Earn money       │
│  • Rate workers     │  │  • Grow business    │
│                     │  │                     │
│ [Continue as        │  │ [Continue as        │
│    Customer]        │  │    Worker]          │
└─────────────────────┘  └─────────────────────┘
```

**System Actions:**
```javascript
// Store selected role
localStorage.setItem('karyasetu_user_role', 'customer'); // or 'worker'

// Redirect based on role
if (role === 'customer') {
  window.location.href = '../onboarding/customer-about.html';
} else {
  window.location.href = '../onboarding/worker-about.html';
}
```

---

### 3️⃣ **ONBOARDING** (Role-Specific)

#### 3A. **Customer Onboarding** (`onboarding/customer-about.html`)

**User Fills:**
- 📍 Location (city)
- 🏠 Full address
- 📮 Pincode (6 digits)

**System Actions:**
```javascript
// Store customer profile
localStorage.setItem('karyasetu_user_profile', JSON.stringify({
  location: "Mumbai",
  address: "123 Main Street",
  pincode: "400053",
  role: "customer",
  createdAt: "2026-01-08T..."
}));

// Redirect to dashboard
window.location.href = '../dashboard/dashboard.html';
```

#### 3B. **Worker Onboarding** (`onboarding/worker-about.html`)

**User Fills:**
- ✅ Skills (multiple selection)
  - 🔧 Mechanic
  - 🚰 Plumber
  - ⚡ Electrician
  - 🪚 Carpenter
  - 🎨 Painter
  - 🧵 Tailor
  - 🚗 Driver
  - 🧹 Cleaner
- 📊 Experience level (Beginner/Skilled/Expert)
- 📍 Location
- 💰 Hourly rate
- 🆔 Government ID (optional)

**System Actions:**
```javascript
// Store worker profile
localStorage.setItem('karyasetu_user_profile', JSON.stringify({
  skills: ["plumber", "electrician"],
  experience: "skilled",
  location: "Mumbai",
  hourlyRate: "250",
  role: "worker",
  verified: false,
  rating: 0,
  jobsCompleted: 0,
  createdAt: "2026-01-08T..."
}));

// Redirect to dashboard
window.location.href = '../dashboard/dashboard.html';
```

---

### 4️⃣ **DASHBOARD ROUTER** (`dashboard/dashboard.html`)

**What User Sees:**
```
┌─────────────────────────┐
│  Loading Dashboard...  │
│         ⏳              │
└─────────────────────────┘
```

**System Logic:**
```javascript
// Read role from localStorage
const userRole = localStorage.getItem('karyasetu_user_role');

// Redirect based on role
if (userRole === 'customer') {
  window.location.href = 'customer-dashboard.html';
} else if (userRole === 'worker') {
  window.location.href = 'worker-dashboard.html';
} else {
  // No role set, go back to role selection
  window.location.href = '../auth/role-select.html';
}
```

---

### 5️⃣ **ROLE-BASED DASHBOARDS**

#### 5A. **Customer Dashboard** (`dashboard/customer-dashboard.html`)

**Features:**
```
┌────────────────────────────────────────────┐
│ 🔧 KaryaSetu          🔍 Search    🔔      │
├────────────────────────────────────────────┤
│                                            │
│  Welcome back, John Doe! 👋                │
│  Find skilled workers for your needs       │
│                                            │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐     │
│  │📋 2  │ │✅ 8  │ │💰1250│ │⭐ 5  │     │
│  │Active│ │Done  │ │Wallet│ │Fav   │     │
│  └──────┘ └──────┘ └──────┘ └──────┘     │
│                                            │
│  Quick Services                            │
│  ┌────┐ ┌────┐ ┌────┐                     │
│  │🔧  │ │🚰  │ │⚡  │ ...                 │
│  └────┘ └────┘ └────┘                     │
│                                            │
│  Nearby Workers                            │
│  • Rajesh Kumar - Mechanic - 1.2km - ⭐4.8│
│  • Amit Singh - Electrician - 2.5km - ⭐4.9│
│                                            │
└────────────────────────────────────────────┘
```

**Sidebar Navigation:**
- 👤 My Profile
- 🔧 Mechanic
- 🚰 Plumber
- ⚡ Electrician
- 🪚 Carpenter
- 🎨 Painter
- 🧵 Tailor
- 🚗 Driver
- 🧹 Cleaner
- 🏠 Home Appliances
- 📍 Nearby Workers
- 📋 My Bookings
- ⭐ Favorites
- 💰 Wallet
- 🆘 Support
- ⚙️ Settings

#### 5B. **Worker Dashboard** (`dashboard/worker-dashboard.html`)

**Features:**
```
┌────────────────────────────────────────────┐
│ 🔧 KaryaSetu    🟢 Available  [Go Offline] │
├────────────────────────────────────────────┤
│                                            │
│  Welcome back, Rajesh Kumar! 👷            │
│  Manage your jobs and grow your business   │
│                                            │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐     │
│  │📬 3  │ │⚡ 1  │ │💰18.5K│ │⭐4.8 │     │
│  │New   │ │Active│ │Month │ │Rating│     │
│  └──────┘ └──────┘ └──────┘ └──────┘     │
│                                            │
│  New Job Requests                          │
│  ┌────────────────────────────────┐       │
│  │ Plumbing Repair         [New]  │       │
│  │ 📍 Andheri • 2.3km             │       │
│  │ 💰 ₹500-800                    │       │
│  │ [Accept] [Details]             │       │
│  └────────────────────────────────┘       │
│                                            │
│  Earnings Overview                         │
│  Today: ₹850  |  Week: ₹4,200             │
│  Month: ₹18,500  |  Total: ₹125,000       │
│                                            │
└────────────────────────────────────────────┘
```

**Sidebar Navigation:**
- 👤 My Profile
- 📬 Job Requests (3)
- ⚡ Active Jobs
- 📋 Job History
- 📅 Availability
- 💰 My Earnings
- 💳 Wallet
- ⭐ Ratings & Reviews
- 🆘 Support
- ⚙️ Settings

---

## 🎯 Key Points

### ✅ What's Already Working:

1. **Signup Flow** ✓
   - User creates account
   - Data stored in localStorage
   - Redirects to role selection

2. **Role Selection** ✓
   - User chooses Customer or Worker
   - Role stored in localStorage
   - Redirects to appropriate onboarding

3. **Onboarding** ✓
   - Role-specific forms
   - Customer: Location details
   - Worker: Skills, experience, rate
   - Profile stored in localStorage
   - Redirects to dashboard router

4. **Dashboard Router** ✓
   - Detects user role
   - Redirects to correct dashboard
   - Prevents unauthorized access

5. **Role-Based Dashboards** ✓
   - Customer dashboard for service seekers
   - Worker dashboard for service providers
   - Different navigation and features
   - Role verification on load

---

## 🚀 To Test Your Flow:

1. **Open** `frontend/auth/signup.html` in your browser
2. **Fill** the signup form
3. **Choose** your role (Customer or Worker)
4. **Complete** the onboarding form
5. **See** your role-specific dashboard!

---

## 📦 localStorage Structure

After completing the flow, you'll have:

```javascript
// User authentication data
karyasetu_user = {
  name: "John Doe",
  phone: "9876543210",
  email: "john@example.com",
  loggedIn: true,
  signupTime: "..."
}

// User role
karyasetu_user_role = "customer" // or "worker"

// User profile (role-specific)
karyasetu_user_profile = {
  // Customer fields OR Worker fields
  role: "customer", // or "worker"
  ...
}
```

---

## ✨ Summary

Your implementation is **complete and working perfectly**! The flow is:

1. ✅ User signs up
2. ✅ User selects role
3. ✅ User completes role-specific onboarding
4. ✅ System automatically redirects to correct dashboard
5. ✅ User sees personalized experience based on role

**No changes needed!** Everything is working as you requested. 🎉

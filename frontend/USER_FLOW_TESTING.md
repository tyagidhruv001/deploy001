# User Flow Testing Guide

## Complete Registration & Dashboard Flow

### ✅ Flow Summary

```
Signup → Role Selection → Onboarding → Dashboard (Role-Based)
```

---

## 🧪 Test Case 1: Customer Journey

### Step 1: Signup
1. Navigate to: `frontend/auth/signup.html`
2. Fill in the form:
   - **Name:** John Doe
   - **Phone:** 9876543210
   - **Email:** john@example.com (optional)
   - **Password:** password123
   - Check "I agree to Terms & Conditions"
3. Click **"Create Account"**
4. ✅ **Expected:** Redirected to `role-select.html`

### Step 2: Role Selection
1. You should see two cards: "I'm a Customer" and "I'm a Worker"
2. Click **"Continue as Customer"** button
3. ✅ **Expected:** Redirected to `customer-about.html`

### Step 3: Customer Onboarding
1. Fill in the form:
   - **Location:** Mumbai
   - **Address:** 123 Main Street, Andheri West
   - **Pincode:** 400053
2. Click **"Complete Setup"**
3. ✅ **Expected:** 
   - Toast message: "Profile created successfully!"
   - Redirected to `dashboard.html`
   - Then auto-redirected to `customer-dashboard.html`

### Step 4: Customer Dashboard
1. ✅ **Expected to see:**
   - Sidebar with service categories (Mechanic, Plumber, etc.)
   - "My Bookings" section
   - "Favorites" section
   - "Nearby Workers" section
   - Search bar in topbar
   - Welcome message: "Welcome back, John Doe!"
   - Stats: Active Bookings, Completed, Wallet Balance, Favorites

---

## 🧪 Test Case 2: Worker Journey

### Step 1: Signup
1. Navigate to: `frontend/auth/signup.html`
2. Fill in the form:
   - **Name:** Rajesh Kumar
   - **Phone:** 9123456789
   - **Email:** rajesh@example.com (optional)
   - **Password:** worker123
   - Check "I agree to Terms & Conditions"
3. Click **"Create Account"**
4. ✅ **Expected:** Redirected to `role-select.html`

### Step 2: Role Selection
1. You should see two cards: "I'm a Customer" and "I'm a Worker"
2. Click **"Continue as Worker"** button
3. ✅ **Expected:** Redirected to `worker-about.html`

### Step 3: Worker Onboarding
1. Fill in the form:
   - **Skills:** Check "Plumber" and "Electrician"
   - **Experience:** Select "Skilled (2-5 years)"
   - **Location:** Mumbai
   - **Hourly Rate:** 250
   - **Government ID:** (optional - skip for demo)
2. Click **"Complete Setup"**
3. ✅ **Expected:** 
   - Toast message: "Profile created successfully!"
   - Redirected to `dashboard.html`
   - Then auto-redirected to `worker-dashboard.html`

### Step 4: Worker Dashboard
1. ✅ **Expected to see:**
   - Sidebar with job management (Job Requests, Active Jobs, etc.)
   - "Earnings" section
   - "Ratings & Reviews" section
   - **Availability toggle** in topbar (Online/Offline)
   - Welcome message: "Welcome back, Rajesh Kumar!"
   - Stats: New Requests, Active Jobs, Monthly Earnings, Rating
   - Job request cards with Accept/Decline buttons

---

## 🔑 localStorage Keys Used

After completing the flow, check your browser's localStorage:

### For All Users:
```javascript
karyasetu_user: {
  "name": "John Doe",
  "phone": "9876543210",
  "email": "john@example.com",
  "loggedIn": true,
  "signupTime": "2026-01-08T08:41:17.000Z"
}

karyasetu_user_role: "customer" // or "worker"
```

### For Customers:
```javascript
karyasetu_user_profile: {
  "location": "Mumbai",
  "address": "123 Main Street, Andheri West",
  "pincode": "400053",
  "role": "customer",
  "createdAt": "2026-01-08T08:41:17.000Z"
}
```

### For Workers:
```javascript
karyasetu_user_profile: {
  "skills": ["plumber", "electrician"],
  "experience": "skilled",
  "location": "Mumbai",
  "hourlyRate": "250",
  "role": "worker",
  "verified": false,
  "rating": 0,
  "jobsCompleted": 0,
  "createdAt": "2026-01-08T08:41:17.000Z"
}
```

---

## 🔄 Role-Based Redirection Logic

### In `dashboard.html`:
```javascript
const userRole = localStorage.getItem('karyasetu_user_role');

if (userRole === 'customer') {
  window.location.href = 'customer-dashboard.html';
} else if (userRole === 'worker') {
  window.location.href = 'worker-dashboard.html';
}
```

### In `customer-dashboard.js`:
```javascript
// Verify this is a customer
if (userRole !== 'customer') {
  window.location.href = '../dashboard/worker-dashboard.html';
}
```

### In `worker-dashboard.js`:
```javascript
// Verify this is a worker
if (userRole !== 'worker') {
  window.location.href = '../dashboard/customer-dashboard.html';
}
```

---

## 🐛 Troubleshooting

### Issue: Stuck on loading screen
**Solution:** 
- Open browser console (F12)
- Check localStorage for `karyasetu_user_role`
- If missing, go back to `role-select.html`

### Issue: Wrong dashboard loads
**Solution:**
- Clear localStorage: `localStorage.clear()`
- Start from signup again

### Issue: Redirected to login after onboarding
**Solution:**
- Check if `karyasetu_user` exists in localStorage
- Ensure `loggedIn: true` is set

---

## 📊 Dashboard Differences

| Feature | Customer Dashboard | Worker Dashboard |
|---------|-------------------|------------------|
| **Sidebar Navigation** | Services, Bookings, Favorites | Jobs, Earnings, Ratings |
| **Topbar** | Search bar | Availability toggle |
| **Main Stats** | Bookings, Wallet | Jobs, Earnings |
| **Primary Action** | "Book Service" | "Go Online/Offline" |
| **Color Accent** | Blue/Purple | Blue/Purple (same theme) |

---

## ✅ Success Criteria

### Customer Dashboard:
- [x] Can browse service categories
- [x] Can see nearby workers
- [x] Can view bookings
- [x] Can manage favorites
- [x] Can access wallet
- [x] Search bar is visible

### Worker Dashboard:
- [x] Can see job requests
- [x] Can toggle availability
- [x] Can view earnings
- [x] Can see ratings
- [x] Can manage active jobs
- [x] Status indicator is visible

---

## 🚀 Quick Start Commands

### To test locally:
```bash
# Using Python
cd frontend
python -m http.server 8000

# Then open: http://localhost:8000/auth/signup.html
```

### To clear test data:
```javascript
// In browser console
localStorage.clear();
location.reload();
```

---

## 📝 Notes

1. **Mock Data:** Both dashboards use mock data for demonstration
2. **No Backend:** All data is stored in localStorage
3. **Persistence:** Data persists until localStorage is cleared
4. **Security:** In production, implement proper authentication
5. **Validation:** Basic client-side validation is implemented

---

**Last Updated:** January 8, 2026
**Status:** ✅ Fully Functional

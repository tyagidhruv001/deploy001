# 💳 Payment System Setup Guide

## Quick Start (Demo Mode - No API Key Needed)

### Test the payment flow NOW:

1. **Open demo wallet page:**
   ```
   http://localhost:3000/wallet/add-money-demo.html
   ```

2. **Select amount** (₹100, ₹500, etc.)

3. **Click "Add Money (Demo)"** - Money added instantly!

4. **Reset balance** - Press 'R' key to reset to ₹0

> This demo uses localStorage - perfect for testing the UI flow!

---

## Activate Real Payments (Later)

### Step 1: Get Razorpay API Keys

1. Go to **https://razorpay.com** and sign up
2. Complete verification (takes 1-2 days for live mode)
3. Go to **Settings → API Keys**
4. Generate **Test Keys** (free, unlimited testing)
5. Copy:
   - Key ID: `rzp_test_XXXXX`
   - Key Secret: `XXXXX`

### Step 2: Add Keys to Backend

Open `backend/.env` and update:

```env
RAZORPAY_KEY_ID=rzp_test_YOUR_ACTUAL_KEY_HERE
RAZORPAY_KEY_SECRET=YOUR_ACTUAL_SECRET_HERE
```

### Step 3: Use Real Payment Page

Once keys are added, use:
```
http://localhost:3000/wallet/add-money.html
```

This will open real Razorpay checkout!

---

## Test Cards (When Keys Added)

**Success Card:**
- Number: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

**Failure Card:**
- Number: `4000 0000 0000 0002`

---

## Files Created

| File | Purpose |
|------|---------|
| `frontend/wallet/add-money-demo.html` | Demo mode (no keys needed) ⭐ |
| `frontend/wallet/add-money.html` | Real Razorpay payments |
| `backend/routes/payments.js` | Payment API (7 endpoints) |
| `backend/.env` | API keys configuration |

---

## Summary

✅ **Demo payment page ready** - Test now!  
✅ **Real payment system ready** - Add keys later  
✅ **No setup needed** for demo mode  

**Current status:** Demo mode active, add API keys when ready! 🚀

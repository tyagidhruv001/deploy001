# 🗄️ Firestore Database Structure

## Database Schema for KaryaSetu

### Collections Overview

```
firestore/
├── users/                    # User accounts
├── workers/                  # Worker profiles
├── bookings/                 # Service bookings
├── transactions/             # Payment transactions
├── locations/                # GPS tracking data
├── reviews/                  # Worker reviews
├── favorites/                # Saved workers
├── notifications/            # User notifications
├── supportTickets/           # Support requests
└── verifications/           # Document verification records
```

---

## 📋 Detailed Schema

### 1. users/{userId}
```javascript
{
  userId: string,
  email: string,
  displayName: string,
  phoneNumber: string,
  role: "customer" | "worker",
  photoURL: string,
  
  // Wallet (NEW)
  wallet: {
    balance: number,           // Current balance in INR
    currency: "INR",
    lastUpdated: timestamp
  },
  
  // Location
  location: {
    lat: number,
    lng: number,
    address: string
  },
  
  createdAt: timestamp,
  lastLogin: timestamp
}
```

**Indexes Needed:**
- `email` (ascending)
- `role` (ascending)

---

### 2. transactions/{transactionId}
```javascript
{
  transactionId: string,
  userId: string,               // Customer ID
  
  // Transaction Type
  type: "wallet_topup" | "booking_payment" | "refund" | "payout",
  
  // Payment Details
  amount: number,
  currency: "INR",
  status: "pending" | "success" | "failed",
  
  // Razorpay IDs (for topup)
  orderId: string,              // Razorpay order ID
  paymentId: string,            // Razorpay payment ID
  signature: string,            // Payment signature
  
  // Booking reference (for booking payments)
  bookingId: string,            // Optional
  description: string,
  
  // Timestamps
  createdAt: timestamp,
  completedAt: timestamp
}
```

**Indexes Needed:**
- `userId` (ascending), `createdAt` (descending)
- `type` (ascending)
- `status` (ascending)

---

### 3. locations/{bookingId}
```javascript
{
  bookingId: string,
  
  // Customer Info
  customerId: string,
  customerLocation: {
    lat: number,
    lng: number,
    timestamp: timestamp
  },
  
  // Worker Info
  workerId: string,
  workerLocation: {
    lat: number,
    lng: number,
    timestamp: timestamp
  },
  
  // Status
  status: "active" | "completed",
  
  // Timestamps
  createdAt: timestamp,
  lastUpdated: timestamp,
  completedAt: timestamp          // When tracking stopped
}
```

**Indexes Needed:**
- `customerId` (ascending)
- `workerId` (ascending)
- `status` (ascending)

---

### 4. verifications/{verificationId}
```javascript
{
  verificationId: string,
  userId: string,                 // Worker ID
  
  // Document Details
  documentType: "aadhaar" | "pan" | "driving_license" | "voter_id",
  documentImage: string,          // Base64 or URL
  
  // AI Verification Result
  verified: boolean,
  confidence: number,             // 0-100
  extractedData: {
    name: string,
    idNumber: string,
    dateOfBirth: string,
    address: string,
    validUntil: string
  },
  
  // AI Response
  aiAnalysis: string,
  
  // Status
  status: "pending" | "verified" | "rejected",
  reviewedBy: string,             // Admin ID who reviewed (if manual)
  
  // Timestamps
  createdAt: timestamp,
  verifiedAt: timestamp
}
```

**Indexes Needed:**
- `userId` (ascending)
- `status` (ascending)
- `documentType` (ascending)

---

### 5. bookings/{bookingId}
(Existing - updated with payment reference)

```javascript
{
  bookingId: string,
  customerId: string,
  workerId: string,
  
  serviceType: string,
  description: string,
  
  // Payment
  price: number,
  paymentStatus: "pending" | "paid" | "refunded",
  transactionId: string,          // Reference to transactions collection
  
  // Status
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled",
  
  // Location tracking
  trackingEnabled: boolean,       // If GPS tracking is active
  
  scheduledDate: timestamp,
  createdAt: timestamp,
  completedAt: timestamp
}
```

---

## 🔒 Firestore Security Rules

Create these rules in Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
      
      // Wallet updates only via backend
      allow update: if request.resource.data.wallet == resource.data.wallet;
    }
    
    // Transactions - read own, write via backend only
    match /transactions/{transactionId} {
      allow read: if request.auth != null && 
                    resource.data.userId == request.auth.uid;
      allow write: if false; // Only backend can write
    }
    
    // Locations - read if involved in booking
    match /locations/{bookingId} {
      allow read: if request.auth != null && 
                    (resource.data.customerId == request.auth.uid || 
                     resource.data.workerId == request.auth.uid);
      allow write: if request.auth != null &&
                     (resource.data.customerId == request.auth.uid || 
                      resource.data.workerId == request.auth.uid);
    }
    
    // Verifications - read own, write own (workers only)
    match /verifications/{verificationId} {
      allow read: if request.auth != null && 
                    resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
      allow update: if false; // Only backend/admin can update status
    }
    
    // Bookings - read if customer or worker
    match /bookings/{bookingId} {
      allow read: if request.auth != null && 
                    (resource.data.customerId == request.auth.uid || 
                     resource.data.workerId == request.auth.uid);
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                      (resource.data.customerId == request.auth.uid || 
                       resource.data.workerId == request.auth.uid);
    }
    
    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 📊 Required Indexes

Create these indexes in Firebase Console → Firestore → Indexes:

### Composite Indexes

1. **transactions**
   - Collection: `transactions`
   - Fields: `userId` (Ascending), `createdAt` (Descending)
   - Query scope: Collection

2. **locations** (Optional - for admin dashboard)
   - Collection: `locations`
   - Fields: `status` (Ascending), `lastUpdated` (Descending)
   - Query scope: Collection

3. **verifications**
   - Collection: `verifications`
   - Fields: `userId` (Ascending), `createdAt` (Descending)
   - Query scope: Collection

---

## 🚀 Setup Instructions

### Step 1: Create Collections

Collections are created automatically when first document is added. No manual setup needed.

### Step 2: Set Security Rules

1. Go to Firebase Console
2. Navigate to **Firestore Database** → **Rules**
3. Copy the security rules above
4. Click **Publish**

### Step 3: Create Indexes

**Option A: Automatic (Recommended)**
- Run your app
- Firebase will show error messages with links to create required indexes
- Click the link and Firebase creates the index automatically

**Option B: Manual**
1. Go to **Firestore Database** → **Indexes**
2. Click **Create Index**
3. Add the composite indexes listed above

---

## 💾 Data Migration (If Needed)

If you have existing data, update user documents to include wallet:

```javascript
// Run this in Firebase Console → Firestore → Cloud Functions or locally

const admin = require('firebase-admin');
const db = admin.firestore();

async function addWalletToUsers() {
  const usersSnapshot = await db.collection('users').get();
  
  const batch = db.batch();
  
  usersSnapshot.forEach(doc => {
    if (!doc.data().wallet) {
      batch.update(doc.ref, {
        wallet: {
          balance: 0,
          currency: 'INR',
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        }
      });
    }
  });
  
  await batch.commit();
  console.log('Wallet added to all users');
}

addWalletToUsers();
```

---

## 🧪 Test Data Examples

### Sample Transaction
```javascript
{
  transactionId: "txn_1234567890",
  userId: "user123",
  type: "wallet_topup",
  amount: 500,
  currency: "INR",
  status: "success",
  orderId: "order_ABC123",
  paymentId: "pay_XYZ789",
  description: "Added money to wallet",
  createdAt: Timestamp.now(),
  completedAt: Timestamp.now()
}
```

### Sample Location
```javascript
{
  bookingId: "booking_567",
  customerId: "user123",
  customerLocation: {
    lat: 28.6139,
    lng: 77.2090,
    timestamp: Timestamp.now()
  },
  workerId: "worker456",
  workerLocation: {
    lat: 28.6239,
    lng: 77.2190,
    timestamp: Timestamp.now()
  },
  status: "active",
  createdAt: Timestamp.now(),
  lastUpdated: Timestamp.now()
}
```

---

## ✅ Verification Checklist

- [ ] Security rules published
- [ ] Composite indexes created
- [ ] Existing users have wallet field
- [ ] Test transaction creation
- [ ] Test location updates
- [ ] Test verification records

---

## 📝 Notes

- **Automatic Cleanup:** Consider adding Cloud Functions to delete old location data after booking completion
- **Data Retention:** Transaction data should be kept for accounting purposes
- **Backups:** Enable daily backups in Firebase Console
- **Monitoring:** Set up alerts for security rule violations

Your Firestore database is now ready for all features! 🎉

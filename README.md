"# 🛠️ KaryaSetu - Service Worker Platform

**KaryaSetu** is a comprehensive platform connecting customers with skilled workers for home services. Built with modern web technologies, it features real-time GPS tracking, AI-powered document verification, secure payments, and instant chat support.

---

## ✨ Features

### 🏠 Customer Features
- **Service Booking** - Book 15+ service categories (plumbing, electrical, cleaning, etc.)
- **Real-time GPS Tracking** - Track worker location during active jobs
- **Digital Wallet** - Add money and pay for services instantly  
- **AI Chat Assistant** - Get instant help with bookings and queries
- **Favorites** - Save and quickly rebook trusted workers
- **Reviews & Ratings** - Rate workers after service completion

### 👷 Worker Features
- **Job Management** - Accept/reject job requests
- **Location Sharing** - Share real-time GPS location with customers
- **Earnings Tracker** - View income and transaction history
- **AI Document Verification** - Verify government IDs instantly
- **Profile Management** - Update skills, rates, and availability

### 🤖 AI Features
- **Document Verification** - Instant ID verification using Google Gemini AI
- **Smart Chat** - Context-aware assistant for platform help

### 💳 Payment Features
- **Razorpay Integration** - UPI, Cards, Net Banking, Wallets
- **Wallet System** - Add money and track spending
- **Demo Mode** - Test without API keys

### 📍 Live Tracking
- **Leaflet Maps** - Interactive real-time location tracking
- **Distance & ETA** - Automatic calculation

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- Firebase account
- Razorpay account (for payments)
- Google Gemini API key (for AI)

### Installation

1. **Clone repository**
```bash
git clone https://github.com/yourusername/karyasetu.git
cd K2.0
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your API keys
npm run dev  # Runs on http://localhost:5000
```

3. **Frontend Setup**
```bash
cd ../frontend
npx http-server -p 3000  # Runs on http://localhost:3000
```

4. **Configure API Keys**

Edit `backend/.env`:
```env
GEMINI_API_KEY=your_key_here
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
```

---

## 📂 Project Structure

```
K2.0/
├── backend/          # Node.js Express server
│   ├── routes/       # API endpoints
│   ├── config/       # Firebase config
│   └── server.js     
├── frontend/         # Static frontend
│   ├── dashboard/    # Customer/Worker dashboards
│   ├── wallet/       # Payment pages
│   ├── tracking/     # GPS tracking
│   └── config.js     # Firebase config
└── README.md
```

---

## 🧪 Testing (No API Keys Required)

**Demo Wallet:**
```
http://localhost:3000/wallet/add-money-demo.html
```

**GPS Simulator:**
```
http://localhost:3000/tracking/test-map.html
```

**AI Features** (Requires Gemini API key):
```
http://localhost:3000/test-ai-verification.html
http://localhost:3000/test-ai-chat.html
```

---

## 🎨 Tech Stack

- **Frontend:** HTML/CSS/JavaScript, Leaflet.js, Firebase
- **Backend:** Node.js, Express.js, Razorpay, Google Gemini AI
- **Database:** Firebase Firestore

---

## 📄 License

MIT License

---

**Made with ❤️ for connecting people with skilled workers**" 

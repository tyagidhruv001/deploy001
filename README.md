# 🛠️ KaryaSetu - Modern Home Service Platform

**KaryaSetu** is a comprehensive, premium platform designed to bridge the gap between skilled service professionals and customers. Built with a focus on reliability, transparency, and modern user experience, it offers a seamless way to book and manage home services.

---

## ✨ Core Features

### 🏠 For Customers
- **15+ Service Categories** - Seamlessly book professionals for plumbing, electrical, cleaning, carpentry, and more.
- **Smart Worker Matching** - Find the best-rated and nearest professionals using location-based discovery.
- **Real-time GPS Tracking** - Track your service provider's arrival in real-time with live map integration.
- **Digital Wallet** - Integrated payment system with a secure wallet for instant, hassle-free transactions.
- **AI Chat Assistant** - Context-aware support to help with bookings, queries, and platform navigation.
- **Ratings & Reviews** - Rate services and read verified reviews to ensure top-quality help.

### 👷 For Service Workers
- **Onboarding & Verification** - Simplified registration with AI-powered document verification (Aadhaar, PAN, DL).
- **Job Management** - Smart dashboard to accept, track, and manage active and upcoming service requests.
- **Earnings Tracker** - Detailed history of transactions, income breakdown, and wallet management.
- **Dynamic Profile** - Showcase skills, experience, and hourly rates to attract more customers.
- **Live Location Sharing** - Securely share location only during active jobs for customer transparency.

### 🤖 AI & Advanced Modules
- **AI Document Verification** - Powered by **Google Gemini AI** for instant, automated worker identity verification.
- **Secure Payments** - Full **Razorpay** integration supporting UPI, Cards, and Net Banking.
- **Integrated GPS** - Real-time tracking powered by **Leaflet.js** and OpenStreetMap.

---

## 🎨 Tech Stack

- **Frontend:** HTML5, Vanilla CSS3 (Glassmorphism), Vanilla JavaScript (ES6+), Leaflet.js
- **Backend:** Node.js, Express.js
- **Database:** Firebase Firestore (Real-time DB)
- **AI Engine:** Google Gemini AI
- **Payments:** Razorpay API
- **Authentication:** Firebase Auth

---

## 📂 Project Structure

```text
cynide/
├── backend/                # Node.js Express server
│   ├── routes/             # API endpoints (Workers, Payments, AI)
│   ├── config/             # Firebase and Third-party configurations
│   └── server.js           # Server entry point
├── frontend/               # Premium Static Web App
│   ├── auth/               # Login, Signup, and Role Selection
│   ├── dashboard/          # Customer & Worker Dashboards
│   ├── tracking/           # Real-time GPS tracking modules
│   ├── wallet/             # Payment and Wallet management
│   ├── css/                # Design system and theme tokens
│   └── js/                 # Core logic and API integration
├── firestore.rules         # Security rules for production
└── README.md               # Main documentation
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- Firebase Project (Firestore enabled)
- Razorpay Account (for payments)
- Google Gemini API Key (for AI verification)

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/karyasetu.git
cd cynide

# Setup Backend
cd backend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_key
RAZORPAY_KEY_ID=your_razorpay_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### 3. Running the Platform
```bash
# Start Backend (from backend directory)
npm start

# Start Frontend (from root, using any static server)
# Example using npx:
cd ../frontend
npx http-server -p 3000
```

---

## 🧪 Testing & Demo Modes

The platform includes several "Demo modes" to test features without active API keys:

- **Demo Wallet:** [http://localhost:3000/wallet/add-money-demo.html](http://localhost:3000/wallet/add-money-demo.html)
- **GPS Simulator:** [http://localhost:3000/tracking/test-map.html](http://localhost:3000/tracking/test-map.html)
- **Identity Verification Test:** [http://localhost:3000/test-ai-verification.html](http://localhost:3000/test-ai-verification.html)

---

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ by the KaryaSetu Team**
*Connecting India's skilled workforce with modern technology.*

# KaryaSetu - Blue-Collar Service Platform

A comprehensive web platform connecting customers with verified blue-collar workers across various service categories.

## 🚀 Features Implemented

### 1️⃣ Worker Onboarding & Verification
- ✅ Worker registration with phone number
- ✅ Skills selection (Plumber, Electrician, Carpenter, Painter, etc.)
- ✅ Experience level selection (Beginner / Skilled / Expert)
- ✅ Government ID upload (demo)
- ✅ Profile completion flow

### 2️⃣ Customer Job Posting / Booking
- ✅ Service type selection
- ✅ Worker browsing and filtering
- ✅ Location-based matching
- ✅ Booking interface

### 3️⃣ Smart Worker Matching
- ✅ Location-based worker display
- ✅ Skill category filtering
- ✅ Rating-based sorting
- ✅ Nearest workers first

### 6️⃣ Price Transparency
- ✅ Hourly rate display
- ✅ Cost estimation before booking
- ✅ Transparent pricing

### 7️⃣ Ratings & Reviews
- ✅ Worker rating display (1-5 ⭐)
- ✅ Review count
- ✅ Average rating in profile

### 8️⃣ Emergency / Support
- ✅ Support page with emergency contact
- ✅ 24/7 helpline information
- ✅ Report issue functionality

## 📁 Project Structure

```
frontend/
├── index.html                 # Landing page
├── css/
│   ├── theme.css             # Design system & variables
│   ├── main.css              # Global styles & components
│   └── sidebar.css           # Dashboard page styles
├── auth/
│   ├── login.html            # Login page
│   ├── signup.html           # Signup page
│   ├── role-select.html      # Customer/Worker selection
│   ├── auth.css              # Auth page styles
│   └── auth.js               # Auth utilities
├── onboarding/
│   ├── customer-about.html   # Customer onboarding
│   ├── worker-about.html     # Worker onboarding
│   └── onboarding.css        # Onboarding styles
├── dashboard/
│   ├── dashboard.html        # Main dashboard
│   ├── dashboard.css         # Dashboard styles
│   └── dashboard.js          # Dashboard functionality
├── landing/
│   ├── landing.css           # Landing page styles
│   └── landing.js            # Landing page interactions
├── js/
│   └── utils.js              # Utility functions
└── assets/
    └── images/
        └── hero-illustration.svg  # Hero image
```

## 🎨 Design Features

- **Modern Dark Mode Theme** - Premium dark UI with vibrant accents
- **Glassmorphism Effects** - Frosted glass aesthetic
- **Smooth Animations** - Micro-interactions throughout
- **Responsive Design** - Works on all devices
- **Premium Color Palette** - HSL-based color system
- **Google Fonts** - Inter & Outfit typography

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables
- **Vanilla JavaScript** - No frameworks, pure JS
- **LocalStorage** - Client-side data persistence
- **SVG** - Scalable vector graphics

## 🚦 Getting Started

1. **Open the application:**
   - Simply open `index.html` in a modern web browser
   - Or use a local server (recommended):
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx serve
     ```

2. **Navigate to:**
   - Landing page: `http://localhost:8000/index.html`
   - Direct dashboard: `http://localhost:8000/dashboard/dashboard.html`

## 📱 User Flow

### For Customers:
1. **Landing Page** → Click "Get Started"
2. **Sign Up** → Enter name, phone, email, password
3. **Role Selection** → Choose "I'm a Customer"
4. **Onboarding** → Enter location and address
5. **Dashboard** → Browse services and book workers

### For Workers:
1. **Landing Page** → Click "Get Started"
2. **Sign Up** → Enter name, phone, email, password
3. **Role Selection** → Choose "I'm a Worker"
4. **Onboarding** → Select skills, experience, location, rate
5. **Dashboard** → View profile and manage jobs

## 🎯 Service Categories

1. 🔧 Mechanic - Vehicle repairs & maintenance
2. 🚰 Plumber - Pipe repairs & installations
3. ⚡ Electrician - Electrical work & wiring
4. 🪚 Carpenter - Furniture & woodwork
5. 🎨 Painter - Interior & exterior painting
6. 🧵 Tailor - Clothing alterations & stitching
7. 🚗 Driver - Personal & commercial driving
8. 🧹 Cleaner - Home & office cleaning
9. 🏠 Home Appliances - AC, Washing Machine, TV, Refrigerator

## 🔐 Authentication

- **Login** - Phone number + Password OR OTP
- **Signup** - Name, Phone, Email, Password
- **Session Management** - LocalStorage-based
- **Role-based Access** - Customer vs Worker views

## 💡 Key Features

### Dashboard
- **Sidebar Navigation** - All services accessible
- **Search Bar** - Quick service search
- **Notifications** - Real-time alerts
- **Profile Management** - Edit user details
- **Responsive** - Mobile-friendly sidebar

### Worker Cards
- **Avatar & Name**
- **Rating & Reviews**
- **Location & Distance**
- **Experience Level**
- **Hourly Rate**
- **Jobs Completed**
- **Book Now / View Profile**

### Pages
- ✅ Profile - User information
- ✅ All Service Pages - Worker listings
- ✅ Nearby Workers (Radar) - Map view placeholder
- ✅ My Jobs - Job tracking
- ✅ Wallet - Payment management
- ✅ Support - Help & emergency
- ✅ Settings - Preferences

## 🎨 Design System

### Colors
- **Primary**: Blue (HSL 220, 85%, 55%)
- **Accent Orange**: HSL 25, 95%, 58%
- **Accent Purple**: HSL 270, 70%, 60%
- **Success**: Green HSL 142, 71%, 45%

### Typography
- **Display**: Outfit (headings)
- **Body**: Inter (text)

### Spacing
- XS: 0.25rem, SM: 0.5rem, MD: 1rem, LG: 1.5rem, XL: 2rem

## 🔄 State Management

All data is stored in LocalStorage:
- `karyasetu_user` - User authentication data
- `karyasetu_user_role` - User role (customer/worker)
- `karyasetu_user_profile` - User profile details

## 🚀 Future Enhancements

- Backend API integration
- Real-time chat
- Payment gateway
- Google Maps integration
- Push notifications
- Job scheduling
- Invoice generation
- Advanced filtering
- Worker verification system
- Review & rating system

## 📄 License

This is a demo project for educational purposes.

## 👨‍💻 Developer

Built with ❤️ for KaryaSetu

---

**Note**: This is a frontend-only implementation. Backend integration and real payment processing would be required for production use.

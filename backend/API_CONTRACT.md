# 📜 KaryaSetu API Contract

This document defines the stable API endpoints for the KaryaSetu platform. Frontend implementations must adhere to these contracts.

## 🔐 AUTH
- **POST** `/api/auth/signup` - Register a new user
- **POST** `/api/auth/login` - Authenticate user
- **PUT**  `/api/auth/profile/:uid` - Update user core profile

## 👤 USERS
- **POST** `/api/users` - Create or update extended user profile
- **GET**  `/api/users/:uid` - Fetch localized user profile data

## 🛠️ WORKERS
- **POST** `/api/workers/:uid` - Register/Update worker professional data
- **GET**  `/api/workers` - Search for workers (filters: category, lat, lng, radiusInKm)
- **PATCH** `/api/workers/:uid/location` - Update real-time worker location

## 📅 BOOKINGS
- **POST** `/api/bookings` - Create a new service booking
- **GET**  `/api/bookings?user_id=&role=` - List bookings for customer or worker
- **PUT**  `/api/bookings/:id` - Update booking status and details

## 📂 METADATA
- **GET** `/api/metadata/categories` - Fetch list of available service categories

---
*Note: This contract is frozen. Any changes must be communicated across the stack.*

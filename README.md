# 🍔 Campus Food Ordering & Delivery System

Grab & Go is a full-stack web application developed specifically for university students, enabling convenient and efficient food ordering and delivery.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Auth:** JWT, bcryptjs
- **Payments:** Stripe
- **Real-time:** Socket.IO

## ✨ Features

- User registration & login
- Browse menus, add to cart, and checkout
- Stripe payment integration
- Real-time order tracking
- Delivery staff management
- Inventory & stock management
- Order history & feedback
- Promotions & refund handling
- Admin dashboard with analytics
- PDF receipts & QR codes

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB

### Backend

```bash
cd Backend
npm install
# create a .env file with your MongoDB URI, JWT secret, Stripe keys, etc.
npm run dev
```

### Frontend

```bash
cd frontend
npm install
# create a .env file with VITE_API_URL pointing to your backend
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:5001` by default.

## 📁 Project Structure

```
├── Backend/
│   ├── Controllers/
│   ├── Models/
│   ├── Routes/
│   ├── middleware/
│   ├── services/
│   └── app.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   └── pages/
│   ├── tests/
│   └── index.html
└── README.md
```


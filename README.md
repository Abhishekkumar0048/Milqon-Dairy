# 🥛 Milqon Dairy App

An online dairy shop where customers can order milk, paneer, curd, ghee, butter, lassi, chach, makhan, peda and more with home delivery.

> **Har Ghar Ka Bharosa – Milqon Dairy**

---

## Project Structure

```
farmhouse/
├── backend/      → Node.js + Express + MongoDB API
└── frontend/     → React web app
```

---

## Backend Setup

```bash
cd backend
npm install
# Make sure MongoDB is running locally
npm run dev         # starts on http://localhost:5000
node seed.js        # seeds sample products
```

### API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/products | Get all products |
| POST | /api/products | Add product (admin) |
| DELETE | /api/products/:id | Delete product (admin) |
| POST | /api/orders | Place order |
| GET | /api/orders | Get all orders (admin) |
| GET | /api/orders/my | Get my orders (user) |
| PUT | /api/orders/:id | Update order status (admin) |

---

## Frontend Setup

```bash
cd frontend
npm install
npm start           # starts on http://localhost:3000
```

---

## Features

- 🛒 Product listing with category filter (milk, paneer, curd, ghee, butter)
- 🧺 Cart with quantity controls
- 📦 Order placement with Cash on Delivery / UPI
- 🔄 Daily milk subscription option
- 👤 User registration & login (JWT)
- 📋 My Orders page for customers
- 🔧 Admin dashboard — manage orders & products

---

## Create Admin User

Register normally, then update role in MongoDB:
```js
db.users.updateOne({ email: "admin@milqondairy.com" }, { $set: { role: "admin" } })
```

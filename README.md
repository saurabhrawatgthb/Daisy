# 🌸 Daisy - Modern E-Commerce Store & Admin Portal

**Daisy** is a modern, full-stack e-commerce web application built with **Next.js (App Router)**, **React 19**, **Prisma ORM**, and **PostgreSQL**. It offers a boutique shopping experience for jewellery and scrunchies with dual payment options (UPI QR & Cash on Delivery), customer account management, live order tracking, a feature-packed Admin Dashboard, and automated multi-channel (Email & SMS) notifications.

---

## ✨ Features

### 🛍️ Customer Storefront & Shopping Experience
- **Live Search & Price Sorting**: Real-time keyword search bar and sorting (Featured, Price: Low-to-High, Price: High-to-Low, Newest) on the Shop page.
- **Product Reviews & Ratings ⭐**: Interactive 1–5 star rating system with verified customer reviews and average rating scorecards.
- **Wishlist & Favorites ❤️**: Heart favorite items, access dedicated `/wishlist`, and move items directly into the shopping cart.
- **🎟️ Promo & Coupon Discounts**: Apply coupon discount codes at checkout (`DAISY10` for 10% off, `WELCOME50` for ₹50 off, `FESTIVE20` for 20% off) with dynamic recalculation.
- **Dual Payment Options**:
  - 📱 **UPI / QR Code**: Direct QR scanning with UTR / Transaction ID submission.
  - 💵 **Cash on Delivery (COD)**: Seamless one-click checkout without UPI requirements.
- **Free Delivery for Dehradun**: Built-in shipping logic providing free delivery across Dehradun and standard flat rates elsewhere.
- **Smart Live Order Tracking (`/track`)**:
  - **Logged-in Users**: Automatically detects session and displays all active orders with visual interactive progress timelines (**Order Placed** → **Confirmed** → **Shipped** → **Delivered**) without requiring order IDs.
  - **Guest Users**: Look up orders using Order ID & Email.
- **🖨️ Printable Tax Invoices**: Download/print formatted order receipts directly from Tracking and Order History.

### 👤 Customer Accounts & Multi-Address Book
- **Email & Password Authentication**: Secure customer registration and login at `/login`.
- **📍 Multi-Address Book**: Save and manage multiple delivery addresses (Home, Work, Other) with instant selection during checkout or from `/my-orders`.
- **Connected Orders (`/my-orders`)**: Logged-in customers automatically see their complete order history, payment methods, and live fulfillment statuses.

### 📊 Admin Dashboard & Management Portal
- **Dashboard Overview (`/admin`)**: Real-time stats for Total Products, Total Orders, and Total Revenue (aggregates across `Paid`, `Shipped`, and `Delivered` orders).
- **Order Management (`/admin/orders`)**:
  - View all orders with customer details, order items, payment method (`COD` vs `UPI`), and UTR numbers.
  - Update status through full lifecycle: `Pending` → `Payment Submitted` → `Paid` → `Shipped` → `Delivered` (or `Rejected`).
  - **🗑️ Order Deletion**: Permanently remove orders from both admin view and customer tracking with cascading cleanup.
- **Product Management (`/admin/products`)**: Add new products, upload images, and **permanently delete products** with cascading cleanup so deleted products never reappear.
- **⚙️ Admin Account Settings (`/admin/settings`)**: Securely update admin email address and password with current password verification.
- **🔑 Admin Secret Authorization Code**: Multi-admin registration requires a secret code (`ADMIN_SECRET_KEY`) to prevent unauthorized sign-ups.

### 🔔 Automated Notifications (Customer & Admin)
- **Customer Notifications**:
  - **Email**: Instant HTML confirmation email with itemized table, shipping address, and tracking link.
  - **SMS/Phone**: Order ID, amount, payment mode, and tracking alert dispatched to customer's phone.
- **Admin Notifications**:
  - **Email**: Real-time order notification with customer info, address, items, and total amount.
  - **SMS/Phone**: Instant SMS alert dispatched to admin mobile number upon new orders.
- **Pluggable SMS Gateways**: Supports Fast2SMS, Twilio, and generic SMS webhooks.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Actions & Route Handlers)
- **Frontend**: React 19, Vanilla CSS with custom glassmorphism design system
- **Database & ORM**: PostgreSQL, [Prisma Client](https://www.prisma.io/)
- **Authentication & Security**: `jose` (JWT sessions) & `bcryptjs` (Password hashing)
- **Email Dispatcher**: [Nodemailer](https://nodemailer.com/) (SMTP / Gmail)
- **Language**: TypeScript

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher, v20+ recommended)
- **PostgreSQL Database** (local or hosted e.g. Neon, Supabase, Railway)

### 2. Clone the Repository
```bash
git clone https://github.com/saurabhrawatgthb/Daisy.git
cd Daisy
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Environment Variables Setup
Create a `.env` file in the root directory:

```env
# Database Connection (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/daisy_db?schema=public"

# Auth Secret
JWT_SECRET="your-super-secret-jwt-key"

# Base Application URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Email Configuration (Nodemailer)
SMTP_EMAIL="your-store-email@gmail.com"
SMTP_PASSWORD="your-gmail-app-password"
SMTP_SERVICE="gmail"

# Admin Secret Key (Required for registering new Admin accounts)
ADMIN_SECRET_KEY="daisy_admin_secret_2026"

# Admin Notifications
ADMIN_NOTIFICATION_EMAIL="admin@daisy.com"
ADMIN_PHONE_NUMBER="+919876543210"

# SMS Configuration (Optional: Fast2SMS or Twilio or Custom Webhook)
# Option A: Fast2SMS
FAST2SMS_API_KEY="your_fast2sms_api_key"

# Option B: Twilio
# TWILIO_ACCOUNT_SID="your_twilio_sid"
# TWILIO_AUTH_TOKEN="your_twilio_token"
# TWILIO_PHONE_NUMBER="+1234567890"

# Option C: Webhook
# SMS_WEBHOOK_URL="https://your-sms-webhook.com/api/send"
```

### 5. Initialize Database
```bash
npx prisma generate
npx prisma db push
```

### 6. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Admin Access & Secret Code

1. **Default Admin Credentials**:
   - **Email**: `admin@daisy.com`
   - **Password**: `daisy123`

2. **Registering Multiple Admins (Secret Authorization Code)**:
   - Navigate to `/admin/login` and click **"+ Register Admin"**.
   - Enter your Name, Email, Password, and the **Admin Secret Code** (configured in `.env` as `ADMIN_SECRET_KEY`, default: `daisy_admin_secret_2026`).
   - If the code is correct, your account is created with `role: "admin"` and granted access to the admin dashboard.
   - Any user without the valid Secret Code is rejected.

3. **Updating Credentials**:
   - Navigate to **Admin Dashboard → ⚙️ Settings** (`/admin/settings`) to update your email address and password.

---

## 📂 Project Structure

```text
Daisy/
├── prisma/
│   └── schema.prisma          # Database models (User, Product, Order, OrderItem)
├── public/                    # Static assets & icons
├── src/
│   ├── app/
│   │   ├── admin/             # Admin portal (Dashboard, Orders, Products, Settings)
│   │   ├── api/
│   │   │   ├── admin/         # Admin API routes (Orders, Products, Change Credentials)
│   │   │   ├── auth/          # Customer auth API (login, register, logout, me)
│   │   │   ├── checkout/      # Checkout order creation and confirmation
│   │   │   ├── my-orders/     # Customer order history API
│   │   │   └── track/         # Live order tracking API
│   │   ├── cart/              # Cart page
│   │   ├── checkout/          # Checkout page (UPI & Cash on Delivery)
│   │   ├── login/             # Customer Sign In & Registration page
│   │   ├── my-orders/         # Customer order history view
│   │   ├── product/[id]/      # Product detail view
│   │   ├── shop/              # Catalog with category filters
│   │   ├── track/             # Public order tracking
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   ├── components/            # Header, Footer, CartCount, SocialIcons
│   ├── lib/
│   │   ├── auth.ts            # Password hashing & JWT helpers
│   │   ├── db.ts              # Prisma client initialization
│   │   └── notifications.ts   # Multi-channel Email & SMS notification service
│   └── middleware.ts          # Route protection for admin portal
├── package.json
└── tsconfig.json
```

---

## 📄 License

This project is licensed under the MIT License.


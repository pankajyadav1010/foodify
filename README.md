# 🍕 Foodify — Online Food Ordering System

A complete, production-ready **Online Food Ordering System** built with **React.js** and **Firebase** (Backend-as-a-Service). Customers can browse a menu, add items to cart, place orders, and track them. Restaurant admins can manage the menu and update order statuses — all in a beautiful dark-themed responsive UI.

---

## 📸 Screenshots

| Home Page | Login Page |
|-----------|------------|
| Hero banner with search, category filter, food cards | Email/password login with validation & demo buttons |

| Register Page | Cart Page |
|---------------|-----------|
| Role selection (Customer / Admin) | Quantity controls, GST calc, order summary |

| Checkout | Orders Page |
|----------|-------------|
| Address form, payment method, order summary | Order history with status timeline |

| Admin Dashboard | Seed Menu |
|----------------|-----------|
| Menu CRUD + Order management + Stats | Utility to populate Firestore with demo items |

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js 19 (Vite) — Functional components & Hooks |
| **Styling** | Bootstrap 5 + Custom dark CSS |
| **Routing** | React Router DOM v7 |
| **Auth** | Firebase Authentication (Email/Password) |
| **Database** | Cloud Firestore (NoSQL) |
| **Storage** | Firebase Storage (optional — image uploads) |
| **Analytics** | Firebase Analytics |
| **Notifications** | react-hot-toast |
| **Icons** | react-icons (Feather + Material Design) |

> **No traditional backend.** Firebase handles everything — auth, database, storage, and hosting.

---

## ✨ Features

### 🔐 Authentication
- User registration with **email/password** (Firebase Auth)
- Login with **form validation** and friendly error messages
- **Session persistence** — stays logged in on page refresh (`onAuthStateChanged`)
- Logout with one click
- Demo login buttons for quick testing

### 👤 User Roles
- **Two roles:** Customer and Admin (Restaurant)
- Role stored in Firestore `users` collection on registration
- **Role-based routing** — customers see Cart/Orders, admins see Admin Dashboard
- Protected routes redirect unauthenticated users to `/login`

### 🍽️ Menu Browsing (Home Page)
- **Hero banner** with animated search bar
- **Category filter** — Pizza, Burger, Biryani, Sushi, Pasta, Salad, Dessert, Drinks
- **Real-time search** — filters by name, category, or description
- **Food cards** with image, name, price, rating, category badge, and "Add to Cart" button
- **Demo fallback** — shows 12 sample items if Firestore menu is empty
- Results count with "Clear Filters" option

### 🛒 Cart System
- Add/remove items with **quantity controls** (+/−)
- Cart persisted in **localStorage** — survives page refresh
- **Order summary sidebar** with item breakdown
- **GST calculation** (5%) and free delivery
- "Continue Shopping" and "Proceed to Checkout" buttons
- "Clear All" with confirmation prompt
- Cart badge count on navbar

### 🧾 Checkout & Payment
- **Delivery address form** — Full Name, Phone, Street, City, Pincode with validation
- **3 payment methods** — Credit/Debit Card, UPI, Cash on Delivery (mock)
- **Order summary** with item images and grand total
- On "Place Order":
  - Saves order to Firestore `orders` collection
  - Includes: userId, userEmail, items[], total, status, createdAt
  - Clears cart
  - Shows **success animation** → redirects to Orders page

### 📦 Order Tracking (Customer)
- View **all previous orders** with status badges
- Order details: ID, date, items with images, quantities, total
- **Visual timeline** showing order progress:
  `Pending → Preparing → Out for Delivery → Delivered`
- **Refresh button** to check for status updates
- Color-coded status badges (yellow=Pending, blue=Preparing, green=Delivered, red=Cancelled)

### ⚙️ Admin Dashboard
- **Two tabs:** Menu Management + Order Management
- **Stats cards:** Total Items, Total Orders, Pending Orders, Revenue

#### Menu Management (Admin)
- **Add** new food items — name, price, category, image URL, description
- **Edit** existing items with pre-filled modal
- **Delete** items with confirmation
- Image preview when adding/editing
- Table view with all items

#### Order Management (Admin)
- View **all customer orders** across the platform
- **Filter by status** — All, Pending, Preparing, Out for Delivery, Delivered, Cancelled
- **Update order status** via dropdown — changes reflect immediately for customers
- Customer email and order date visible

### 🌱 Seed Menu Utility
- Visit `/seed-menu` to populate Firestore with **12 ready-made food items**
- Check existing item count before seeding
- Clear all items option
- Progress tracking during seeding

### 🎨 UI/UX
- **Dark theme** with premium gradient backgrounds
- **Responsive** — mobile, tablet, and desktop
- **Smooth hover animations** on food cards
- **Toast notifications** for all actions (success/error)
- **Loading spinners** on every async operation
- Custom scrollbar styling
- Google Fonts (Poppins + Inter)

---

## 📁 Project Structure

```
Foodify/
├── public/
├── src/
│   ├── components/                 # Reusable UI components
│   │   ├── FoodCard.jsx            # Food item card with Add to Cart
│   │   ├── LoadingSpinner.jsx      # Reusable loading indicator
│   │   ├── Navbar.jsx              # Top navigation with cart badge
│   │   ├── OrderStatusBadge.jsx    # Colored status badge component
│   │   └── PrivateRoute.jsx        # Auth & role-based route guard
│   │
│   ├── context/                    # React Context providers
│   │   ├── AuthContext.jsx         # Auth state, login/register/logout
│   │   └── CartContext.jsx         # Cart state with localStorage
│   │
│   ├── pages/                      # Route-level page components
│   │   ├── AdminDashboard.jsx      # Admin: Menu CRUD + Order mgmt
│   │   ├── Cart.jsx                # Shopping cart with qty controls
│   │   ├── Checkout.jsx            # Address + payment + place order
│   │   ├── Home.jsx                # Menu browsing with search/filter
│   │   ├── Login.jsx               # Firebase email/password login
│   │   ├── Orders.jsx              # Customer order history + tracking
│   │   ├── Register.jsx            # Registration with role selection
│   │   └── SeedMenu.jsx            # Utility to seed Firestore data
│   │
│   ├── services/                   # Firebase service functions
│   │   ├── authService.js          # Auth helper functions
│   │   ├── menuService.js          # Firestore menu CRUD
│   │   └── orderService.js         # Firestore orders CRUD
│   │
│   ├── App.css                     # Global dark theme styles
│   ├── App.jsx                     # Root component with routing
│   ├── firebase.js                 # Firebase initialization
│   ├── index.css                   # Base CSS reset
│   └── main.jsx                    # React entry point
│
├── .env.example                    # Environment variable template
├── .env.local                      # YOUR Firebase credentials (gitignored)
├── firestore.rules                 # Firestore security rules
├── firestore.indexes.json          # Firestore composite indexes
├── index.html                      # HTML entry with SEO meta tags
├── package.json                    # Dependencies and scripts
└── vite.config.js                  # Vite build configuration
```

---

## 🗄️ Firestore Database Schema

### `users` Collection
| Field | Type | Description |
|-------|------|-------------|
| `uid` | string | Firebase Auth UID |
| `email` | string | User email address |
| `displayName` | string | Full name |
| `role` | string | `"customer"` or `"admin"` |
| `createdAt` | string | ISO timestamp |

### `menu` Collection
| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Food item name |
| `price` | number | Price in ₹ |
| `category` | string | Pizza, Burger, Biryani, etc. |
| `image` | string | Image URL |
| `description` | string | Item description |
| `createdAt` | timestamp | Server timestamp |

### `orders` Collection
| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | Customer's Firebase UID |
| `userEmail` | string | Customer's email |
| `items` | array | `[{id, name, price, quantity, category, image}]` |
| `total` | string | Grand total amount |
| `status` | string | Pending / Preparing / Out for Delivery / Delivered / Cancelled |
| `createdAt` | timestamp | Server timestamp |

---

## 🔒 Routing & Access Control

| Route | Access | Component | Description |
|-------|--------|-----------|-------------|
| `/` | Public | `Home` | Menu browsing, search, filter |
| `/login` | Public | `Login` | Firebase email/password login |
| `/register` | Public | `Register` | Register with role selection |
| `/cart` | 🔐 Auth required | `Cart` | Shopping cart |
| `/checkout` | 🔐 Auth required | `Checkout` | Address + payment + order |
| `/orders` | 🔐 Auth required | `Orders` | Order history & tracking |
| `/admin` | 🔐 Admin only | `AdminDashboard` | Menu CRUD + order management |
| `/seed-menu` | 🔐 Auth required | `SeedMenu` | Populate Firestore with demo data |

---

## 🛠️ Setup Instructions

### Prerequisites
- **Node.js** v18+ and npm
- A **Firebase project** ([create one here](https://console.firebase.google.com/))

### Step 1: Install Dependencies

```bash
cd c:\Foodify
npm install
```

### Step 2: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/) → **Add Project**
2. Name it `Foodify` → Create

### Step 3: Enable Firebase Services

**Authentication:**
1. Firebase Console → **Authentication** → **Get Started**
2. Click **Email/Password** → **Enable** → **Save**

**Firestore Database:**
1. Firebase Console → **Firestore Database** → **Create database**
2. Choose **Start in test mode** → Select region → **Done**

**Update Firestore Rules:**
1. Firestore → **Rules** tab → Replace with contents of `firestore.rules` → **Publish**

### Step 4: Get Firebase Config

1. Firebase Console → ⚙️ **Project Settings** → **Your apps** → Click **Web** (`</>`)
2. Register app → Copy the `firebaseConfig` values

### Step 5: Create `.env.local`

Copy `.env.example` to `.env.local` and fill in your values:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Step 6: Run the App

```bash
npm run dev
```

Visit **http://localhost:5173/** 🎉

### Step 7: Seed Menu Data

1. Register an account at `/register`
2. Go to **http://localhost:5173/seed-menu**
3. Click **"🚀 Seed Menu Items"** → 12 food items added to Firestore

---

## 👤 User Flows

### Customer Flow

```
Register (Customer role)
    ↓
Login with email/password
    ↓
Browse Menu → Search/Filter by category
    ↓
Add items to Cart → Adjust quantities
    ↓
Proceed to Checkout → Fill address → Select payment
    ↓
Place Order → Order saved to Firestore
    ↓
View Orders → Track status (Pending → Preparing → Delivered)
    ↓
Logout
```

### Admin Flow

```
Register (Admin role)
    ↓
Login → Redirected to /admin
    ↓
Menu Management:
  → Add new food items (name, price, category, image, description)
  → Edit existing items
  → Delete items
    ↓
Order Management:
  → View all customer orders
  → Filter by status
  → Update order status (Pending → Preparing → Delivered)
    ↓
Logout
```

---

## 🔧 Firebase Auth — How It Works

| Feature | Firebase Method | Location |
|---------|----------------|----------|
| Register | `createUserWithEmailAndPassword()` | `AuthContext.jsx` |
| Login | `signInWithEmailAndPassword()` | `AuthContext.jsx` |
| Logout | `signOut()` | `AuthContext.jsx` |
| Session Persistence | `onAuthStateChanged()` | `AuthContext.jsx` |
| Store User Role | `setDoc()` → `users/{uid}` | `AuthContext.jsx` |
| Fetch User Role | `getDoc()` → `users/{uid}` | `AuthContext.jsx` |

### Error Handling

| Firebase Error Code | User-Friendly Message |
|--------------------|-----------------------|
| `auth/invalid-email` | Please enter a valid email address |
| `auth/user-not-found` | No account found with this email |
| `auth/wrong-password` | Incorrect password |
| `auth/email-already-in-use` | An account with this email already exists |
| `auth/weak-password` | Password must be at least 6 characters |
| `auth/too-many-requests` | Too many attempts. Try again later |
| `auth/invalid-credential` | Invalid credentials |

---

## 📦 Firestore Operations Used

| Operation | Firebase Method | Used For |
|-----------|----------------|----------|
| Create | `addDoc()` | Adding menu items, placing orders |
| Read | `getDocs()` | Fetching menu, orders |
| Read One | `getDoc()` | Fetching user role |
| Update | `updateDoc()` | Editing menu items, updating order status |
| Delete | `deleteDoc()` | Removing menu items |
| Set | `setDoc()` | Storing user data on registration |

---

## 🧪 Testing Guide

### Authentication Tests
1. **Register** → Go to `/register` → Fill form → "Create Account" → Should redirect to Home
2. **Duplicate email** → Register again with same email → Error: "already exists"
3. **Login** → Go to `/login` → Enter credentials → "Sign In" → Should redirect to Home
4. **Wrong password** → Should show "Incorrect password" error
5. **Session** → Refresh the page → Should remain logged in
6. **Logout** → Click "Logout" → Should redirect to Login

### Cart Tests
1. Click **"Add"** on any food card → Toast notification appears
2. Go to `/cart` → Items listed with quantities
3. Click **+/−** → Quantity updates, total recalculates
4. Click **🗑️** → Item removed
5. Close browser → Reopen → Cart items still there (localStorage)

### Order Tests
1. Go to `/checkout` → Fill address → Select payment → "Place Order"
2. **Success screen** → Auto-redirect to `/orders` after 3 seconds
3. Orders page shows order with **"Pending"** status and timeline
4. Click **Refresh** → Should still show the order

### Admin Tests
1. Login as Admin → Auto-redirected to `/admin`
2. Click **"Add Item"** → Fill form → Save → Appears in table
3. Click **Edit** icon → Modify → Update → Changes reflected
4. Click **Delete** icon → Confirm → Item removed
5. Switch to **Orders tab** → All orders visible
6. Change status dropdown → Status updates for customer

---

## 🔨 Build for Production

```bash
npm run build
```

Output: `dist/` folder — deploy to any static host:

```bash
# Firebase Hosting
npm install -g firebase-tools
firebase login
firebase init hosting    # Set "dist" as public directory
firebase deploy

# Or deploy to Vercel/Netlify by connecting the repo
```

---

## 📝 Key Design Decisions

1. **No composite indexes needed** — All Firestore queries use simple `where()` or `getDocs()` with client-side sorting, avoiding the need to deploy composite indexes.

2. **Cart in localStorage** — Cart state persists across sessions without needing Firestore writes for every cart change, reducing database costs.

3. **Demo fallback** — The Home page shows 12 sample food items when Firestore is empty, so the app looks functional even before admin adds menu items.

4. **Environment variables** — Firebase config stored in `.env.local` (gitignored) and accessed via `import.meta.env.VITE_*` for security.

5. **Duplicate init guard** — `getApps().length === 0` check prevents Firebase re-initialization errors during Vite Hot Module Replacement.

6. **Role stored in Firestore** — User role (`customer`/`admin`) saved in Firestore `users` collection rather than custom claims, making it easy to query and update.

---

## 📄 License

This project is built for educational and portfolio purposes.

---

## 🙏 Acknowledgments

- **Firebase** — Backend-as-a-Service (Auth + Firestore + Storage)
- **React.js** — UI library
- **Bootstrap 5** — CSS framework
- **Unsplash** — Food images used in demo data
- **react-hot-toast** — Toast notifications
- **react-icons** — Icon library

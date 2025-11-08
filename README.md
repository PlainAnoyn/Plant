## PlantSelling – Full-Stack E‑commerce for Plants

A Next.js + MongoDB app for browsing, buying, and administering a plant storefront. Includes an admin dashboard with charts, user and review moderation, product management with discounts, featured/free-delivery flags, and robust image handling.

### Key Features
- Admin authentication and role recognition (admin@gmail.com or username "admin").
- Admin dashboard with sidebar navigation and business metrics (Recharts).
- Manage products: create, edit, discount %, featured, free delivery, stock, categories.
- Manage users: blacklist/unblacklist.
- Moderate reviews: react, reply, block/unblock, delete.
- Storefront with discounted price display and image normalization/fallbacks.
- **Featured & Free Delivery sections** on homepage (controlled by admin flags).
- **SEO optimized**: sitemap.xml, robots.txt, dynamic metadata, OpenGraph, Twitter cards.
- **Performance**: ISR caching for product pages and listings.
- **Audit logging**: Track all admin actions with IP and user agent.
- **Observability**: Sentry integration (optional, env-based).

### Tech Stack
- Next.js App Router (React, TypeScript)
- MongoDB + Mongoose
- JWT authentication (API routes)
- Recharts for analytics
- Next/Image with remotePatterns (Unsplash) + fallback
- (Optional) Cloudinary for image hosting

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB instance (local or cloud)

### 1) Clone and install
```bash
git clone <your-repo-url> Plantselling
cd Plantselling
npm install
```

### 2) Configure environment
Create a `.env.local` file in the project root:
```bash
MONGODB_URI="mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority"

# JWT
JWT_SECRET="a-strong-random-secret"
JWT_EXPIRES_IN="7d"

# (Optional) Cloudinary
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# App base URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# (Optional) Sentry for error tracking
NEXT_PUBLIC_SENTRY_ENABLED="false"
NEXT_PUBLIC_SENTRY_DSN=""
```

Notes:
- Ensure `MONGODB_URI` points to a valid database.
- `JWT_SECRET` must be long and random in production.

### 3) Next.js image config
`next.config.js` already allows Unsplash hosts. If you add new external hosts, update `images.remotePatterns` accordingly.

### 4) Run in development
```bash
npm run dev
```
App will start at `http://localhost:3000`.

### 5) Production build
```bash
npm run build
npm start
```

---

## Project Structure (high-level)
- `app/`
  - `layout.tsx` – Global providers and layout via `LayoutWrapper`.
  - `page.tsx` – Home page (storefront).
  - `plants/` – Storefront listing and details pages.
  - `admin/` – Admin pages with `layout.tsx` and `page.tsx` (dashboard).
  - `api/` – API routes (auth, public plants, and admin endpoints).
- `components/` – UI components (Navbar, AdminSidebar, PlantCard, etc.).
- `contexts/` – React context providers (Auth, Cart, Wishlist).
- `models/` – Mongoose models (User, Plant, Order, Review).

---

## Authentication & Admin Access
- Login via the app’s auth flow.
- A user becomes admin if either:
  - email is `admin@gmail.com`, or
  - username is `admin`.
- On login/me checks, role is set/returned as `admin` and normalized in background.

Admin UI is available at `/admin`. Admin-only APIs also verify this access.

---

## Admin Dashboard
Accessible at `/admin` with a left `AdminSidebar` and tabs via `?tab=` query param.

Includes:
- Overview charts: user growth, sales revenue, product growth, orders (Recharts).
- Orders, Products, Users, Reviews management tabs.

---

## Product Management
Create: `/admin/plants/new`

Fields:
- name, description, price, stock, category (predefined select), imageUrl
- discountPercentage (0–100)
- isFeatured (boolean)
- isFreeDelivery (boolean)
- optional: sunlight, water, care instructions

Edit: `/admin/plants/[id]`

Discounts:
- Storefront shows a badge and strikethrough original price when `discountPercentage > 0`.

Featured/Free Delivery:
- Admin can toggle `isFeatured` and `isFreeDelivery` on create/edit.
- You can surface these on the storefront (e.g., a Featured carousel or a Free Delivery section) by filtering products on these flags using the public `/api/plants` endpoint with custom filters (extend as needed).

---

## Reviews & Users Management
- Reviews: list, react (like/dislike), reply, block/unblock, delete.
- Users: blacklist/unblacklist with reason.

---

## Image Handling
- `next/image` configured for Unsplash (`images.unsplash.com`, `source.unsplash.com`).
- Backend normalizes Unsplash URLs where possible; falls back to a category-based placeholder when missing/invalid.
- You can switch to Cloudinary by uploading images and storing the resulting URLs.

---

## Key API Endpoints (summary)

Auth
- `POST /api/auth/login` – Login, returns JWT.
- `GET /api/auth/me` – Returns current user; recognizes admin based on email/username.

Public Plants
- `GET /api/plants` – List plants (supports pagination and returns `discountPercentage`).
- `GET /api/plants/[id]` – Get a single plant (always includes `discountPercentage`).

Admin Plants
- `GET /api/admin/plants` – List all plants (admin only).
- `POST /api/admin/plants` – Create plant (admin only). Accepts `discountPercentage`, `isFeatured`, `isFreeDelivery`.
- `GET /api/admin/plants/[id]` – Get single plant (admin only).
- `PATCH /api/admin/plants/[id]` – Update plant (admin only). Supports discount and section flags.
- `DELETE /api/admin/plants/[id]` – Delete plant (admin only).

Admin Reviews
- `GET /api/admin/reviews` – Fetch reviews with filters/pagination.
- `PATCH /api/admin/reviews/[id]` – React, reply, block/unblock (admin only).
- `DELETE /api/admin/reviews/[id]` – Delete review (admin only).

Admin Users
- `PATCH /api/admin/users/[id]` – Blacklist/unblacklist.
- `DELETE /api/admin/users/[id]` – Remove user (use with care).

Admin Stats
- `GET /api/admin/stats` – Aggregated metrics for charts.

Notes:
- All admin endpoints require a valid JWT and admin identity.

---

## Environment & Configuration Details
- Ensure `AuthProvider`, `CartProvider`, `WishlistProvider` are mounted in `app/layout.tsx` via `LayoutWrapper`.
- Admin sidebar/layout rendering is controlled by `app/admin/layout.tsx` and `components/LayoutWrapper.tsx`.
- If you add new external image hosts, update `next.config.js` `images.remotePatterns`.

---

## Troubleshooting
- Admin rejected/redirects:
  - Verify you’re logged in as `admin@gmail.com` or username `admin`.
  - Check JWT is present in requests (browser devtools → Network).
- Dashboard stuck on loading:
  - Ensure admin check in API routes is updated and MongoDB connection succeeds.
- Images missing or 404 from Unsplash:
  - Confirm `next.config.js` contains the hosts used.
  - Verify image URLs are direct image URLs or covered by normalization; otherwise set a valid `imageUrl` or rely on fallback.
- Discount not persisting:
  - Ensure the admin edit page calls `/api/admin/plants/[id]` and the PATCH payload includes `discountPercentage`.
- Featured/Free Delivery not showing on storefront:
  - Implement a section on the storefront querying products with `isFeatured: true` or `isFreeDelivery: true` (extend public list API or filter client-side after fetching, depending on your needs).

---

## Development Scripts
```bash
npm run dev     # Start dev server
npm run build   # Build for production
npm start       # Start production server (after build)
```

---

## Conventions
- TypeScript with descriptive variable and function names.
- Minimal but meaningful comments (avoid obvious commentary).
- Avoid deep nesting and unnecessary try/catch.

---

## Deployment
- Set all environment variables as in `.env.local` on your hosting provider.
- Ensure production MongoDB and `JWT_SECRET` are configured.
- Verify `next.config.js` image hosts meet your production image sources.

---

## New Features (High Priority Completed)

### Featured & Free Delivery Sections
- Homepage now displays products marked as `isFeatured` and `isFreeDelivery`.
- Admin can toggle these flags when creating/editing products.
- Sections automatically update based on product flags.

### SEO Essentials
- **Sitemap**: Auto-generated at `/sitemap.xml` with all products.
- **Robots.txt**: Configured at `/robots.txt` to allow public pages, block admin/API routes.
- **Dynamic Metadata**: Root layout includes OpenGraph and Twitter card metadata.
- **Note**: Product detail pages are client components; convert to server components for per-product metadata.

### Performance & Caching
- **ISR (Incremental Static Regeneration)**:
  - Product listings: 60s cache, 300s stale-while-revalidate.
  - Individual products: 5min cache, 10min stale-while-revalidate.
- API routes include `Cache-Control` headers for optimal performance.

### Audit Logging
- **AuditLog Model**: Tracks all admin actions (create, update, delete, blacklist, etc.).
- **Automatic Logging**: Admin actions are logged with:
  - User ID and email
  - Action type and resource
  - Before/after changes
  - IP address and user agent
- **Usage**: Import `logAudit` from `@/lib/audit` in admin API routes.
- **Example**: See `app/api/admin/plants/[id]/route.ts` for implementation.

### Observability (Sentry)
- **Optional Integration**: Enable via `NEXT_PUBLIC_SENTRY_ENABLED=true` and `NEXT_PUBLIC_SENTRY_DSN`.
- **Setup**: Install `@sentry/nextjs` package: `npm install @sentry/nextjs`.
- **Features**:
  - Error tracking with context
  - Performance monitoring
  - Session replay (masked for privacy)
  - Automatic filtering of sensitive data (passwords, tokens).
- **Config Files**: `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`.

## Roadmap Ideas
- Convert product detail page to server component for per-product SEO metadata.
- Image uploads via Cloudinary with admin media library.
- Coupons and advanced promotions.
- Order management improvements and fulfillment statuses.

# Plant Selling Website

A full-stack e-commerce website for selling plants, built with Next.js, React, MongoDB, and Node.js.

## Features

- 🛍️ **Product Catalog**: Browse and search through a wide variety of plants
- 🔍 **Advanced Search**: Search by name, description, or category
- 📱 **Responsive Design**: Beautiful, modern UI that works on all devices
- ⚡ **Fast Performance**: Built with Next.js for optimal performance
- 🗄️ **MongoDB Integration**: Robust database for storing plant information
- 🎨 **Modern UI**: Clean, intuitive interface with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose
- **Image Optimization**: Next.js Image component

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB installed and running (or MongoDB Atlas account)

### Installation

1. Clone the repository:
```bash
cd /home/xebec/Documents/Plantselling
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your MongoDB connection string:
```
MONGODB_URI=mongodb://localhost:27017/plant-selling
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/plant-selling
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── plants/        # Plant CRUD endpoints
│   ├── plants/            # Plant pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Navbar.tsx        # Navigation bar
│   ├── Footer.tsx        # Footer component
│   └── PlantCard.tsx     # Plant card component
├── lib/                   # Utility functions
│   └── mongodb.ts         # MongoDB connection
├── models/                # Database models
│   └── Plant.ts           # Plant schema
└── public/                # Static assets
```

## API Endpoints

### Plants

- `GET /api/plants` - Get all plants (supports query params: category, search, page, limit)
- `GET /api/plants/[id]` - Get a specific plant
- `POST /api/plants` - Create a new plant
- `PUT /api/plants/[id]` - Update a plant
- `DELETE /api/plants/[id]` - Delete a plant

## Adding Sample Data

You can add sample plants through the API or directly in MongoDB. Here's an example using the API:

```bash
curl -X POST http://localhost:3000/api/plants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monstera Deliciosa",
    "description": "A beautiful tropical plant with large, glossy leaves.",
    "price": 29.99,
    "category": "Indoor",
    "imageUrl": "https://images.unsplash.com/photo-1519336056116-9e7e0b82d6e9",
    "stock": 10,
    "sunlight": "Indirect Light",
    "water": "Weekly",
    "careInstructions": "Keep in bright, indirect light. Water when top inch of soil is dry."
  }'
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Features to Add

- [ ] User authentication
- [ ] Shopping cart functionality
- [ ] Order management
- [ ] Payment integration
- [ ] Admin dashboard
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Email notifications

## License

This is a personal project for learning and portfolio purposes.

## Contributing

This is a personal project, but feel free to fork and modify for your own use!


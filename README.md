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


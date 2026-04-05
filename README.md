# FoodOS - Frontend Only Application

## Overview
FoodOS is a food delivery application that has been converted to run entirely in the frontend with mock data. The backend has been removed and all API calls have been replaced with local mock data.

## Features
- 🏠 **Home Page**: Browse restaurants with mock data
- 🍕 **Restaurant Pages**: View restaurant details and menus
- 🔍 **Search**: Search for dishes across all restaurants
- 👤 **User Profile**: Mock user profile with order history
- 🛒 **Shopping Cart**: Add items to cart (mock functionality)
- 💳 **Checkout**: Mock checkout process
- 🔐 **Authentication**: Mock login/register (use "demo"/"demo" for login)

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and go to `http://localhost:3000`

## Mock Data
The application uses mock data for:
- Restaurants and their details
- Menu items for each restaurant
- User profiles and order history
- Shopping cart functionality

## Demo Login
- **Username**: `demo`
- **Password**: `demo`

## Project Structure
```
frontend/
├── src/
│   ├── components/     # React components
│   ├── pages/         # Page components
│   ├── data/          # Mock data
│   └── context/       # React context
├── public/            # Static assets
└── package.json       # Dependencies
```

## Technologies Used
- HTML
- React 18
- Vite
- Tailwind CSS
- Material-UI
- React Router

## Notes
- This is a frontend-only application
- All data is mock data and will reset on page refresh
- No backend server is required
- Perfect for development, testing, and demonstration purposes

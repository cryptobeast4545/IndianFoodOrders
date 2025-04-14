
# Restaurant Management System

A full-stack restaurant management system built with React, Express, and PostgreSQL.

## Features

- 🍽️ Customer Portal: Browse menu, place orders, and track order status
- 👨‍🍳 Staff Portal: Manage orders and view customer data
- 🔑 Admin Portal: Configure restaurant settings, manage menu items
- 🛒 Real-time order tracking
- 📱 Responsive design for all devices

## Tech Stack

- Frontend: React, TypeScript, Tailwind CSS, Shadcn/ui
- Backend: Express.js, Node.js
- Database: PostgreSQL with Drizzle ORM
- Real-time: WebSocket for live updates

## Quick Start

1. Click "Run" on Replit to start the development server
2. The application will be available at the URL shown in the preview window

## Login Credentials

- Staff Portal: `staff123`
- Admin Portal: `admin123`

## Project Structure

```
├── client/          # Frontend React application
├── server/          # Backend Express server
└── shared/          # Shared types and schemas
```

## Development

The development server runs on port 5000 and includes:
- Hot Module Replacement (HMR)
- TypeScript compilation
- Tailwind CSS processing

## API Endpoints

- `/api/menu-items`: Menu management
- `/api/orders`: Order processing
- `/api/customers`: Customer data
- `/api/settings`: Restaurant configuration

## Database

The project uses PostgreSQL with Drizzle ORM for:
- Menu item management
- Order tracking
- Customer data
- Restaurant settings

## Contributing

Feel free to fork this project and make improvements!

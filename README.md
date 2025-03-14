# Twitter Clone

A full-stack Twitter/X clone built with Next.js, Nest.js, Prisma, and NeonDB.

## Project Structure

This project consists of two main components:

- `frontend`: Next.js application for the user interface
- `backend`: Nest.js API with Prisma ORM and NeonDB

## Features

- User authentication (signup, login)
- Tweet publishing (text, images, videos)
- Polls
- User profiles
- Real-time feed updates
- Search functionality
- Profile management
- Push notifications

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (or NeonDB account)

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables in a `.env` file:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/twitter_clone"
   JWT_SECRET="your-jwt-secret"
   ```

   For NeonDB, your DATABASE_URL will look like:
   ```
   DATABASE_URL="postgresql://username:password@db.neon.tech/twitter_clone"
   ```

4. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start the backend server:
   ```bash
   npm run start:dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables in a `.env.local` file:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

5. Access the application at `http://localhost:3000`

## API Documentation

API documentation is available at `http://localhost:3001/api/docs` when the backend server is running.

## Testing

The project includes Postman collections for API testing, with different environments for various scenarios:
- Development
- Testing
- Staging
- Production

Import the provided Postman collection and environment files to get started with API testing. 
# Twitter Clone

A modern, full-stack Twitter/X clone built with Next.js, Nest.js, Prisma, and NeonDB. This project demonstrates a production-ready social media platform with real-time features and scalable architecture.

## 🚀 Features

### User Features
- Authentication (signup, login, JWT-based)
- Profile customization and management
- Follow/unfollow functionality
- Real-time notifications

### Content Features
- Tweet creation and interaction
  - Text posts
  - Image and video uploads
  - Interactive polls
- Retweets and quotes

### UI Features
- Responsive design
- Dark/light mode
- Infinite scroll
- Real-time feed updates

### Technical Features
- RESTful API with Swagger documentation
- JWT authentication
- Real-time updates
- File upload handling
- Database migrations
- API rate limiting
- Error handling

## 🛠 Tech Stack

### Frontend
- Next.js 14 (React)
- TypeScript
- Tailwind CSS
- SWR for data fetching
- Context API for state management

### Backend
- NestJS
- Prisma ORM
- PostgreSQL (NeonDB)
- JWT Authentication
- Swagger/OpenAPI

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (or NeonDB account)
- Git

## 🚀 Quick Start

### 1. Clone the Repository
bash
git clone https://github.com/yourusername/twitter-clone.git
cd twitter-clone


### 2. Install Dependencies
bash
# Install root dependencies
npm run install:all


### 3. Environment Setup

#### Backend (.env)
env
DATABASE_URL="postgresql://username:password@localhost:5432/twitter_clone"
JWT_SECRET="your-jwt-secret"
PORT=3001


#### Frontend (.env.local)
env
NEXT_PUBLIC_API_URL=http://localhost:3001/api

.env and .env.local are attached in the zip file

### 4. Database Setup
bash
cd backend
npx prisma migrate dev


### 5. Start Development Servers
bash
# From root directory
npm run dev


The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Documentation: http://localhost:3001/api/docs

## 📖 API Documentation

Comprehensive API documentation is available through Swagger UI at http://localhost:3001/api/docs when the backend server is running. This includes:
- Endpoint descriptions
- Request/response schemas
- Authentication requirements
- Example requests

## 🧪 Testing

### API Testing
The project includes Postman collections for comprehensive API testing across different environments:
- Development
- Testing
- Staging
- Production

### Running Tests
bash
# Backend tests
cd backend
npm run test        # Unit tests
npm run test:e2e    # E2E tests
npm run test:cov    # Coverage reports

# Frontend tests
cd frontend
npm run test        # Run tests
npm run test:watch  # Watch mode


##    Project Structure

This project consists of two main components:

- frontend: Next.js application for the user interface
- backend: Nest.js API with Prisma ORM and NeonDB

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
   bash
   cd backend
   

2. Install dependencies:
   bash
   npm install
   

3. Set up your environment variables in a .env file:
   
   DATABASE_URL="postgresql://username:password@localhost:5432/twitter_clone"
   JWT_SECRET="your-jwt-secret"
   

   For NeonDB, your DATABASE_URL will look like:
   
   DATABASE_URL="postgresql://username:password@db.neon.tech/twitter_clone"
   

4. Run Prisma migrations:
   bash
   npx prisma migrate dev
   

5. Start the backend server:
   bash
   npm run start:dev
   

### Frontend Setup

1. Navigate to the frontend directory:
   bash
   cd frontend
   

2. Install dependencies:
   bash
   npm install
   

3. Set up your environment variables in a .env.local file:
   
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   

4. Start the frontend development server:
   bash
   npm run dev
   

5. Access the application at http://localhost:3000

## API Documentation

API documentation is available at http://localhost:3001/api/docs when the backend server is running.

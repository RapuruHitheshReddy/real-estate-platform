# 🏡 Cloud-Based Real Estate Management Platform

<p align="left">

<a href="https://main.d237kx43xwjr43.amplifyapp.com/">
  <img src="https://img.shields.io/badge/Live-Demo-2ea44f?style=for-the-badge&logo=vercel&logoColor=white"/>
</a>
&nbsp;&nbsp;&nbsp;&nbsp;
<a href="https://github.com/RapuruHitheshReddy/real-estate-platform">
  <img src="https://img.shields.io/badge/View-Repository-181717?style=for-the-badge&logo=github"/>
</a>

</p>

---

# 📌 Project Overview
A production-style full-stack real estate application that enables property discovery, rental applications, lease management, and payment tracking with location-based search and secure cloud deployment.

## ✨ Features

📍 **Location-based property discovery** using PostgreSQL + PostGIS  
🔐 **Secure role-based authentication** with AWS Cognito  
🏠 **Property listing management** for managers  
📝 **Rental application workflow** for tenants  
💳 **Lease lifecycle and payment tracking system**  
🖼 **Image uploads stored in AWS S3**  
☁️ **Cloud deployment using AWS infrastructure**

---

##  🛠️ Tech Stack

### Frontend
- Next.js
- React
- Tailwind CSS
- Mapbox

### Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM

### Database
- PostgreSQL
- PostGIS (Geospatial Queries)

### Cloud & Infrastructure
- AWS Amplify (Frontend Hosting)
- AWS EC2 (Backend Server)
- AWS RDS PostgreSQL
- AWS S3 (Image Storage)
- AWS Cognito (Authentication)
- API Gateway

---

## System Architecture
```bash
 User
  ↓
Next.js Frontend (AWS Amplify)
  ↓
API Gateway
  ↓
Node.js Express Backend (EC2)
  ↓
PostgreSQL + PostGIS (AWS RDS)
  ↓
AWS S3 (Image Storage)

Authentication handled using AWS Cognito.
```
---

## Backend Design

The backend follows a modular architecture:
```bash
server
│
├── controllers
├── routes
├── middleware
├── utils
├── prisma
└── config

Flow:

Client → Route → Controller → Prisma ORM → PostgreSQL
```
---

## Geospatial Property Search

Properties are stored with geographic coordinates using PostGIS.


Example query:

```bash
ST_DWithin(
 location.coordinates,
 ST_SetSRID(ST_MakePoint(longitude, latitude),4326),
 radius
)
```

This allows users to search for properties within a specified distance from a location.

---

## Authentication Flow
Authentication is handled using AWS Cognito.

Flow:
```bash
User Login
  ↓
Cognito verifies credentials
  ↓
JWT token issued
  ↓
Frontend sends token in Authorization header
  ↓
Backend middleware validates token
```

## Database Models
The application models a real-world rental ecosystem.

Entities include:
- Manager
- Tenant
- Property
- Location
- Application
- Lease
- Payment

Relationships:

Manager → Properties
Tenant → Applications
Property → Leases
Lease → Payments

---


# Run Locally
Follow the steps below to run the project on your local machine.

## 1. Clone the Repository
```bash
git clone https://github.com/RapuruHitheshReddy/real-estate-platform.git
cd real-estate-platform
``` 
## 2. Backend setup

```bash
cd server
npm install
```
### 1. Backend Environment Variables
Create a .env file inside the server folder

```bash
# Server configuration
PORT=3001

# PostgreSQL connection string
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL=postgresql://postgres:password@localhost:5432/real_estate_db

# AWS Configuration
AWS_REGION=your_aws_region

# IAM user credentials with access to S3
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key

# S3 bucket used to store property images
S3_BUCKET_NAME=your_aws_s3_bucket_name
```
### 2. Setup Database
Ensure PostgreSQL is running and PostGIS extension is enabled.

Example:
```bash
CREATE EXTENSION postgis;
```
Then run Prisma migrations.

```bash
cd server
npx prisma migrate dev
```
Seed sample data
```bash
npm run seed
```

### 3. Run the Backend
```bash
npm run dev
```
Backend will start at:
```bash
http://localhost:3001
```
# 3. Frontend setup

```bash
cd ..
cd client
npm install
```

## 1. Frontend Environment Variables
Create a .env file inside the client folder.

```bash
# AWS Cognito configuration
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# Backend API URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# Mapbox API key for location search
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_mapbox_public_token
```
## 2. Run the Frontend
```bash
npm run dev
```
Frontend will start at:
```bash
http://localhost:3000
```
---

# 🎉 Setup Complete

The project has been successfully set up on your machine.

You can now run the application locally and explore the platform.
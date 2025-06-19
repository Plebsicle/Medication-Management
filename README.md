# Medication Management System

A full-featured, application for managing medications, electronic health records, communication between patients and doctors.

## Live Website

https://plebsicle.me — Fully hosted on this domain

## Features

- Medication Reminders  
  Send reminders via email and SMS to ensure timely medication intake.

- Electronic Health Records  
  Manage and maintain patient medical history and documents in a secure manner.

- AI Medical Assistant  
  Integrated chatbot powered by OpenAI API to answer basic medical queries.

- Real-time Chat System  
  patient-doctor chat with support for file sharing and persistent history.

- Authentication & Authorization  
  Secure login system using OAuth2 and JWT tokens for API access.

- AWS S3 File Uploads  
  Secure document upload using presigned URLs to ensure limited, controlled access.

- Nearby Hospital Search  
  Caches search results using Redis for fast repeated access.

## Tech Stack

- Frontend: React, TypeScript  
- Backend: Express.js, PostgreSQL
- Caching: Redis  
- Cloud Storage: AWS S3  
- Authentication: OAuth2, JWT  
- AI Assistant: OpenAI API  
- Deployment: Fully deployed and accessible at https://plebsicle.me

## Project Structure

```
/frontend       # React frontend
/backend        # Express backend with REST APIs
/backend/src/database               #PostgreSQL Schema and Prisma
/backend/src/_utilities         # Redis, AWS, and OpenAI helpers
```

## Security Highlights

- Uses presigned URLs for all file uploads to AWS S3.
- JWT-based stateless authentication system.
- Role-based access control for doctors and patients.


## Installation

```bash
git clone https://github.com/Plebsicle/Medication-Management.git
cd Medication-Management
cd backend
npm install
cd frontend
npm install

npm run dev for both backend and frontend
```

Set up environment variables as mentioned in .env.sample for AWS S3, Redis, PostgreSQL, OPENAI , Twilio and Google Oauth

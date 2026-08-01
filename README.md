# Rotaract Social Media Booking App

A comprehensive time slot booking system for Rotaract clubs to manage social media content posting schedules. This application allows members to book time slots for their social media posts with real-time availability checking, duplicate prevention, and an intuitive calendar view.

**Live Demo:** [https://booking-application-git-main-spark-z.vercel.app/](https://booking-application-lovat.vercel.app/)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Security Features](#security-features)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Author](#author)

---

## Overview

This application is designed specifically for Rotaract clubs to streamline their social media content planning. It provides a centralized platform where members can:

- View available time slots in real-time
- Book slots for their social media posts
- Filter and search for specific bookings
- View a calendar of all scheduled posts
- Track booking status (Pending, Confirmed, Completed)
- Archive completed bookings automatically

**Problem Solved:** Eliminates double-booking, missed slots, and confusion about posting schedules.

---

## Features

### Core Features

| Feature | Description |
|---------|-------------|
| Booking Form | Create new bookings with name, project, email, date, time slot, category, platforms, priority, and status |
| Real-time Availability | Instant feedback when selecting date/time - shows if slot is available or booked |
| Duplicate Prevention | Database-level UNIQUE constraint and API validation to prevent double bookings |
| Bookings Dashboard | View all bookings with sortable columns and filters |
| Calendar View | Monthly calendar showing booking counts with clickable dates for details |
| Archive System | Completed bookings automatically moved to archive to keep dashboard clean |
| Edit and Delete | Modify or remove existing bookings with confirmation |
| Stats Cards | Quick overview of total, today's, pending, and category counts |

### Filters

| Filter | Options |
|--------|---------|
| Date | Pick a specific date |
| Category | Flyer, Video, Reel, Carousel, Story, Infographic |
| Priority | Low, Medium, High |
| Status | Pending, Confirmed, Completed |
| Platform | WhatsApp, YouTube, Facebook, Instagram, LinkedIn, TikTok |
| Search | Search by name, project, email, category, or time slot |

### User Interface

- Dark theme with glass-morphism design
- Fully responsive for desktop, tablet, and mobile devices
- Color-coded badges for categories, priorities, and statuses
- Flash messages for success and error notifications

---

## Technology Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Backend | Node.js + Express | 20.x | Server-side logic and API |
| Database | PostgreSQL (Supabase) | 15.x | Data storage |
| Frontend | HTML5, CSS3, JavaScript | - | User interface |
| CSS Framework | Tailwind CSS | 3.0+ | Styling and responsiveness |
| Icons | Font Awesome | 6.5+ | Icon library |
| Fonts | Google Fonts (Outfit) | - | Typography |
| Hosting | Vercel | - | Production hosting |
| Database Hosting | Supabase | - | Cloud PostgreSQL |

---

## Database Schema

### Bookings Table (PostgreSQL)

```sql
CREATE TABLE bookings (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(100) NOT NULL,
    project_name VARCHAR(200) NOT NULL,
    email VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    platforms TEXT,
    note TEXT,
    priority VARCHAR(20) DEFAULT 'Medium',
    status VARCHAR(20) DEFAULT 'Pending',
    archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_slot UNIQUE (date, time_slot)
);
```

### Column Descriptions

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| id | BIGINT | Primary key (auto-generated) | 1 |
| name | VARCHAR(100) | User's full name | John Doe |
| project_name | VARCHAR(200) | Project or post name | Project Alpha |
| email | VARCHAR(100) | User's email address | john@email.com |
| date | DATE | Booking date | 2026-08-10 |
| time_slot | VARCHAR(50) | Time slot | 9:00 AM - 9:30 AM |
| category | VARCHAR(50) | Post type | Flyer |
| platforms | TEXT | Comma-separated platforms | instagram,facebook |
| note | TEXT | Optional additional notes | Campaign launch |
| priority | VARCHAR(20) | Priority level | High |
| status | VARCHAR(20) | Booking status | Confirmed |
| archived | BOOLEAN | false for active, true for archived | false |
| created_at | TIMESTAMPTZ | Auto-generated timestamp | 2026-07-28 12:04:38+00 |

### Unique Constraint

The UNIQUE constraint on `(date, time_slot)` prevents duplicate bookings for the same date and time at the database level.

---

## Deployment

### Vercel Deployment Guide

#### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up using GitHub, Google, or email
3. Verify your account

#### Step 2: Set Up Supabase Database

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your **Project URL** and **Anon Key** from Project Settings → API
4. Run the SQL schema above in the Supabase SQL Editor

#### Step 3: Configure Environment Variables

Set these environment variables in your project:

**Local Development (`.env` file):**
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Vercel Production:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `SUPABASE_URL` and `SUPABASE_ANON_KEY`
3. Click Save

#### Step 4: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

#### Step 5: Access Application

```
https://your-project-name.vercel.app
```

---

## API Endpoints

### Base URL

```
https://your-project-name.vercel.app/api/
```

### Endpoints Table

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| /api/bookings | GET | Fetch all bookings | date, category, priority, status, platform, search, archived |
| /api/bookings | POST | Create new booking | JSON body with booking data |
| /api/bookings/:id | PUT | Update existing booking | JSON body with updated data |
| /api/bookings/:id | DELETE | Delete booking | - |
| /api/check-availability | GET | Check slot availability | date, timeSlot |

### Create Booking Example

**Request:**

```http
POST /api/bookings
Content-Type: application/json

{
    "name": "John Doe",
    "project_name": "Project Alpha",
    "email": "john@email.com",
    "date": "2026-08-10",
    "time_slot": "9:00 AM - 9:30 AM",
    "category": "Flyer",
    "platforms": ["instagram", "facebook"],
    "note": "Campaign launch",
    "priority": "High"
}
```

**Response:**

```json
{
    "success": true,
    "message": "Booking created successfully!",
    "booking_id": 6
}
```

### Check Availability Example

**Request:**

```http
GET /api/check-availability?date=2026-08-10&timeSlot=9:00%20AM%20-%209:30%20AM
```

**Response:**

```json
{
    "available": true,
    "booked": false
}
```

### HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 OK | Request successful |
| 201 Created | Booking created successfully |
| 400 Bad Request | Missing or invalid parameters |
| 404 Not Found | Resource not found |
| 409 Conflict | Duplicate booking (slot already taken) |
| 500 Internal Server Error | Server error |

---

## Project Structure

```
rotaract-social-media-booking/
├── api/
│   └── bookings.js              # API routes (GET, POST, PUT, DELETE)
|
│─── index.html               # Main application page
│── style.css                # Custom styles
│── script.js                # Client-side JavaScript
├── .env                     # Environment variables template
├── .gitignore                   # Git ignore file
├── vercel.json                  # Vercel configuration
├── package.json                 # Node.js dependencies
└── README.md                    # Documentation
```

---

## Security Features

| Feature | Implementation |
|---------|----------------|
| SQL Injection Prevention | Supabase parameterized queries |
| Input Sanitization | Sanitization on client and server |
| Email Validation | `validateEmail()` function |
| Date Validation | `validateDate()` function |
| XSS Prevention | `escapeHtml()` on all output |
| Database Credentials | Stored in environment variables - not in version control |
| Row Level Security | Supabase RLS policies |
| Unique Constraint | Database-level duplicate prevention |

---

## Testing

### Manual Testing Checklist

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Create booking | Booking appears in dashboard | Passed |
| Duplicate booking | Error message "Slot already booked" | Passed |
| Real-time availability | Shows "Available" or "Booked" instantly | Passed |
| Edit booking | Changes reflected in table | Passed |
| Delete booking | Booking removed with confirmation | Passed |
| Filters | Only matching bookings shown | Passed |
| Search | Only matching bookings shown | Passed |
| Calendar | Dates with bookings highlighted | Passed |
| Archive | Completed bookings hidden | Passed |
| Past dates | Cannot select past dates | Passed |
| Responsive | Works on mobile, tablet, and desktop | Passed |

### Demo Data

The `seed.sql` file includes 5 demo bookings:

| ID | Name | Date | Time Slot | Category | Platforms | Priority | Status |
|----|------|------|-----------|----------|-----------|----------|--------|
| 1 | Demo User 1 | 2026-08-03 | 9:00 AM - 9:30 AM | Flyer | WhatsApp, Instagram | High | Confirmed |
| 2 | Demo User 2 | 2026-08-03 | 10:00 AM - 10:30 AM | Video | YouTube, Facebook | Medium | Pending |
| 3 | Demo User 3 | 2026-08-04 | 1:30 PM - 2:00 PM | Reel | Instagram, TikTok | High | Confirmed |
| 4 | Demo User 4 | 2026-08-05 | 3:00 PM - 3:30 PM | Carousel | Facebook, LinkedIn | Low | Pending |
| 5 | Demo User 5 | 2026-08-06 | 11:00 AM - 11:30 AM | Story | Instagram, Facebook | Medium | Confirmed |

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Database connection failed | Check Supabase credentials in environment variables |
| 404 Not Found | Ensure files are in the correct directory |
| Booking not saving | Check Supabase RLS policies |
| Calendar not showing | Clear browser cache (Ctrl+F5) |
| Edit modal blank | Check JavaScript console for errors (F12, then Console) |
| Duplicate booking allowed | Verify UNIQUE constraint exists on `(date, time_slot)` |

### Debugging

**Enable error reporting in browser:**
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for error messages

**Check Vercel logs:**
```bash
vercel logs
```

---

## Author

**Shervin Salaah**

- Email: shervinsalaah@gmail.com
- GitHub: [github.com/ShervinSalaah](https://github.com/ShervinSalaah)

---

**Built for Rotaract IT Team Recruitment Task**

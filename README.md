# Rotaract Social Media Booking App

A comprehensive time slot booking system for Rotaract clubs to manage social media content posting schedules. This application allows members to book time slots for their social media posts with real-time availability checking, duplicate prevention, and an intuitive calendar view.

**Live Demo:** [Your InfinityFree Link Here]

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
| Backend | PHP | 8.0+ | Server-side logic and API |
| Database | MySQL / MariaDB | 5.7+ | Data storage |
| Frontend | HTML5, CSS3, JavaScript | - | User interface |
| CSS Framework | Tailwind CSS | 3.0+ | Styling and responsiveness |
| Icons | Font Awesome | 6.5+ | Icon library |
| Fonts | Google Fonts (Outfit) | - | Typography |
| Local Server | XAMPP | 8.2+ | Local development |
| Hosting | InfinityFree | - | Production hosting |

---

## Database Schema

### Bookings Table

```sql
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    project_name VARCHAR(200) NOT NULL,
    email VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    platforms TEXT,
    note TEXT,
    priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    status ENUM('Pending', 'Confirmed', 'Completed') DEFAULT 'Pending',
    archived TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_slot (date, time_slot)
);
```

### Column Descriptions

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| id | INT AUTO_INCREMENT | Primary key | 1 |
| name | VARCHAR(100) | User's full name | John Doe |
| project_name | VARCHAR(200) | Project or post name | Project Alpha |
| email | VARCHAR(100) | User's email address | john@email.com |
| date | DATE | Booking date | 2026-08-10 |
| time_slot | VARCHAR(50) | Time slot | 9:00 AM - 9:30 AM |
| category | VARCHAR(50) | Post type | Flyer |
| platforms | TEXT | Comma-separated platforms | instagram,facebook |
| note | TEXT | Optional additional notes | Campaign launch |
| priority | ENUM | Priority level | High |
| status | ENUM | Booking status | Confirmed |
| archived | TINYINT(1) | 0 for active, 1 for archived | 0 |
| created_at | TIMESTAMP | Auto-generated timestamp | 2026-07-28 12:04:38 |

### Unique Constraint

The UNIQUE constraint on `(date, time_slot)` prevents duplicate bookings for the same date and time at the database level.

---

## Deployment

### InfinityFree Deployment Guide

#### Step 1: Create InfinityFree Account

1. Go to InfinityFree.net
2. Sign up and verify your email
3. Claim a free subdomain (e.g., your-app.rf.gd)

#### Step 2: Create Database

1. In InfinityFree Control Panel, navigate to MySQL Databases
2. Click Create Database
3. Enter a database name
4. Note down the following credentials:
   - Database Host: sql123.infinityfree.com
   - Database Name: if0_12345678_rotaract_booking
   - Username: if0_12345678
   - Password: (your chosen password)

#### Step 3: Update Database Configuration

Open `config/database.php` and update production credentials:

```php
if (isProduction()) {
    $db_host = 'sql123.infinityfree.com';
    $db_name = 'if0_12345678_rotaract_booking';
    $db_user = 'if0_12345678';
    $db_password = 'your_password_here';
}
```

#### Step 4: Upload Files

Using FileZilla or InfinityFree File Manager:

```
Host: ftp.your-domain.rf.gd
Username: your-username
Password: your-password
Port: 21
```

Upload all files to the `htdocs/` folder.

#### Step 5: Import Database

1. In InfinityFree Control Panel, click phpMyAdmin
2. Select your database
3. Click the Import tab
4. Choose the `seed.sql` file
5. Click Go

#### Step 6: Access Application

```
http://your-app.rf.gd/index.php
```

---

## API Endpoints

### Base URL

```
http://your-app.rf.gd/api/
```

### Endpoints Table

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| /api/get_bookings.php | GET | Fetch all bookings | date, category, priority, status, platform, search, archived, id |
| /api/create_booking.php | POST | Create new booking | JSON body with booking data |
| /api/update_booking.php | POST | Update existing booking | JSON body with id and updated data |
| /api/delete_booking.php | DELETE | Delete booking | id parameter |
| /api/check_availability.php | GET | Check slot availability | date, timeSlot |

### Create Booking Example

**Request:**

```http
POST /api/create_booking.php
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
GET /api/check_availability.php?date=2026-08-10&timeSlot=9:00%20AM%20-%209:30%20AM
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
│   ├── get_bookings.php          # Fetch bookings with filters
│   ├── create_booking.php        # Create new booking
│   ├── update_booking.php        # Update booking
│   ├── delete_booking.php        # Delete booking
│   └── check_availability.php    # Real-time availability check
├── config/
│   └── database.php              # Database connection and helper functions
├── includes/
│   ├── header.php                # Reusable header with navigation
│   └── footer.php                # Reusable footer with scripts
├── index.php                     # Main application page
├── style.css                     # Custom styles
├── script.js                     # JavaScript functionality
├── seed.sql                      # Database schema and demo records
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore file
├── .htaccess                     # Apache configuration
├── test-db.php                   # Database connection test file
└── README.md                     # Documentation
```

---

## Security Features

| Feature | Implementation |
|---------|----------------|
| SQL Injection Prevention | PDO Prepared Statements throughout |
| Input Sanitization | sanitize() function with htmlspecialchars() |
| Email Validation | validateEmail() using PHP's FILTER_VALIDATE_EMAIL |
| Date Validation | validateDate() to ensure YYYY-MM-DD format |
| XSS Prevention | htmlspecialchars() on all output |
| Database Credentials | Stored in .env - not in version control |
| CSRF Protection | Session-based flash messages |
| Unique Constraint | Database-level duplicate prevention |

---

## Testing

### Manual Testing Checklist

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Create booking | Booking appears in dashboard | Passed |
| Duplicate booking | Error message Slot already booked | Passed |
| Real-time availability | Shows Available or Booked instantly | Passed |
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
| Database connection failed | Check MySQL is running in XAMPP or verify InfinityFree credentials |
| 404 Not Found | Ensure files are in the correct directory (htdocs/) |
| Booking not saving | Check database permissions and table structure |
| Calendar not showing | Clear browser cache (Ctrl+F5) |
| Edit modal blank | Check JavaScript console for errors (F12, then Console) |
| Duplicate booking allowed | Verify UNIQUE constraint exists on (date, time_slot) |

### Debugging

Enable error reporting by adding to `config/database.php`:

```php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
```

**Error Log Locations:**

- XAMPP: `C:\xampp\php\logs\php_error_log`
- InfinityFree: Control Panel, then Error Logs

---

## Author

**Shervin Salaah**

- Email: shervinsalaah@gmail.com
- GitHub: github.com/ShervinSalaah
---

**Built for Rotaract Social Media Management**

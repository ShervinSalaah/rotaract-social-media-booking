-- ============================================
-- ROTARACT SOCIAL MEDIA BOOKING APP
-- PostgreSQL Schema for Supabase
-- ============================================

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
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

-- Create indexes
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_category ON bookings(category);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_priority ON bookings(priority);

-- ============================================
-- INSERT 5 DEMO RECORDS
-- ============================================
INSERT INTO bookings (name, project_name, email, date, time_slot, category, platforms, note, priority, status, archived) VALUES
(
    'Demo User 1',
    'Project Alpha',
    'demo1@email.com',
    '2026-08-03',
    '9:00 AM - 9:30 AM',
    'Flyer',
    'whatsapp,instagram',
    'Project discussion for upcoming event',
    'High',
    'Confirmed',
    FALSE
),
(
    'Demo User 2',
    'Beta Launch Campaign',
    'demo2@email.com',
    '2026-08-03',
    '10:00 AM - 10:30 AM',
    'Video',
    'youtube,facebook',
    'Team interview for promotional video',
    'Medium',
    'Pending',
    FALSE
),
(
    'Demo User 3',
    'Gamma Initiative',
    'demo3@email.com',
    '2026-08-04',
    '1:30 PM - 2:00 PM',
    'Reel',
    'instagram,tiktok',
    'Technical discussion for social media strategy',
    'High',
    'Confirmed',
    FALSE
),
(
    'Demo User 4',
    'Delta Project',
    'demo4@email.com',
    '2026-08-05',
    '3:00 PM - 3:30 PM',
    'Carousel',
    'facebook,linkedin',
    'Planning meeting for quarterly goals',
    'Low',
    'Pending',
    FALSE
),
(
    'Demo User 5',
    'Epsilon Initiative',
    'demo5@email.com',
    '2026-08-06',
    '11:00 AM - 11:30 AM',
    'Story',
    'instagram,facebook',
    'General consultation for content strategy',
    'Medium',
    'Confirmed',
    FALSE
);

-- ============================================
-- VERIFY DATA
-- ============================================
SELECT * FROM bookings ORDER BY date, time_slot;
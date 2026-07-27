CREATE TABLE IF NOT EXISTS bookings (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate bookings (same date + time)
    UNIQUE KEY unique_slot (date, time_slot)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_category ON bookings(category);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_priority ON bookings(priority);

-- ============================================
-- INSERT 5 DEMO RECORDS
-- ============================================
INSERT INTO bookings (name, project_name, email, date, time_slot, category, platforms, note, priority, status) VALUES
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
    'Confirmed'
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
    'Pending'
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
    'Confirmed'
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
    'Pending'
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
    'Confirmed'
);


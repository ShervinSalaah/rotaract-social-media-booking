const pool = require('../config/database');

// Get index page
exports.getIndex = async (req, res) => {
    try {
        // Fetch all bookings
        const result = await pool.query(
            'SELECT * FROM bookings ORDER BY date ASC, time_slot ASC'
        );
        
        const bookings = result.rows;

        // Render EJS with data
        res.render('pages/index', {
            title: 'Rotaract Social Media Booking',
            bookings: bookings,
            messages: {
                success: req.session.success || null,
                error: req.session.error || null
            }
        });

        // Clear session messages
        req.session.success = null;
        req.session.error = null;
    } catch (error) {
        console.error('Error loading index:', error);
        res.status(500).send('Server Error');
    }
};

// Create booking
exports.createBooking = async (req, res) => {
    try {
        const { name, project_name, email, date, time_slot, category, platforms, note, priority, status } = req.body;

        // Check if slot is available
        const checkResult = await pool.query(
            'SELECT id FROM bookings WHERE date = $1 AND time_slot = $2',
            [date, time_slot]
        );

        if (checkResult.rows.length > 0) {
            req.session.error = '❌ This time slot is already booked. Please choose another.';
            return res.redirect('/');
        }

        // Process platforms (convert array to comma-separated string)
        const platformsStr = Array.isArray(platforms) ? platforms.join(',') : platforms || '';

        // Insert new booking
        await pool.query(
            `INSERT INTO bookings (name, project_name, email, date, time_slot, category, platforms, note, priority, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [name, project_name, email, date, time_slot, category, platformsStr, note || '', priority || 'Medium', status || 'Pending']
        );

        req.session.success = '✅ Booking created successfully!';
        res.redirect('/');
    } catch (error) {
        console.error('Error creating booking:', error);
        req.session.error = '❌ Failed to create booking. Please try again.';
        res.redirect('/');
    }
};

// Delete booking
exports.deleteBooking = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await pool.query('DELETE FROM bookings WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length > 0) {
            req.session.success = '✅ Booking deleted successfully!';
        } else {
            req.session.error = '❌ Booking not found.';
        }
        res.redirect('/');
    } catch (error) {
        console.error('Error deleting booking:', error);
        req.session.error = '❌ Failed to delete booking.';
        res.redirect('/');
    }
};

// ... (we'll add more functions later)
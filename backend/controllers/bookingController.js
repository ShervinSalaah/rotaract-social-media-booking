const { supabase } = require('../config/database');

// Get index page
exports.getIndex = async (req, res) => {
    try {
        // Fetch all bookings
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('*')
            .order('date', { ascending: true })
            .order('time_slot', { ascending: true });
        
        if (error) {
            throw error;
        }

        // Render EJS with data
        res.render('pages/index', {
            title: 'Rotaract Social Media Booking',
            bookings: bookings || [],
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
        req.session.error = '❌ Failed to load bookings. Please refresh.';
        res.render('pages/index', {
            title: 'Rotaract Social Media Booking',
            bookings: [],
            messages: {
                success: null,
                error: req.session.error
            }
        });
        req.session.error = null;
    }
};

// Create booking
exports.createBooking = async (req, res) => {
    try {
        const { name, project_name, email, date, time_slot, category, platforms, note, priority, status } = req.body;

        // Check if slot is already booked
        const { data: existing, error: checkError } = await supabase
            .from('bookings')
            .select('id')
            .eq('date', date)
            .eq('time_slot', time_slot)
            .maybeSingle();

        if (checkError) throw checkError;

        if (existing) {
            req.session.error = '❌ This time slot is already booked. Please choose another.';
            return res.redirect('/');
        }

        // Process platforms (convert array to comma-separated string)
        const platformsStr = Array.isArray(platforms) ? platforms.join(',') : platforms || '';

        // Insert new booking
        const { data, error } = await supabase
            .from('bookings')
            .insert({
                name,
                project_name,
                email,
                date,
                time_slot,
                category,
                platforms: platformsStr,
                note: note || '',
                priority: priority || 'Medium',
                status: status || 'Pending'
            });

        if (error) throw error;

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
        
        const { data, error } = await supabase
            .from('bookings')
            .delete()
            .eq('id', id);

        if (error) throw error;

        if (data) {
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

// Check availability (for AJAX)
exports.checkAvailability = async (req, res) => {
    try {
        const { date, time_slot } = req.query;
        
        const { data, error } = await supabase
            .from('bookings')
            .select('id')
            .eq('date', date)
            .eq('time_slot', time_slot)
            .maybeSingle();

        if (error) throw error;

        res.json({
            available: !data,
            booked: !!data
        });
    } catch (error) {
        console.error('Error checking availability:', error);
        res.status(500).json({ error: 'Failed to check availability' });
    }
};

// Get calendar data (for AJAX)
exports.getCalendarData = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('date', { count: 'exact' });

        if (error) throw error;

        // Group by date
        const calendarMap = {};
        data.forEach(item => {
            calendarMap[item.date] = (calendarMap[item.date] || 0) + 1;
        });

        const result = Object.keys(calendarMap).map(date => ({
            date,
            count: calendarMap[date]
        }));

        res.json(result);
    } catch (error) {
        console.error('Error getting calendar data:', error);
        res.status(500).json({ error: 'Failed to get calendar data' });
    }
};

// Filter bookings (for AJAX)
exports.filterBookings = async (req, res) => {
    try {
        let query = supabase.from('bookings').select('*');
        
        // Apply filters
        if (req.query.date) {
            query = query.eq('date', req.query.date);
        }
        if (req.query.category) {
            query = query.eq('category', req.query.category);
        }
        if (req.query.priority) {
            query = query.eq('priority', req.query.priority);
        }
        if (req.query.status) {
            query = query.eq('status', req.query.status);
        }
        if (req.query.search) {
            query = query.or(`name.ilike.%${req.query.search}%,project_name.ilike.%${req.query.search}%`);
        }

        const { data, error } = await query.order('date', { ascending: true });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error filtering bookings:', error);
        res.status(500).json({ error: 'Failed to filter bookings' });
    }
};

// Update booking (for edit)
exports.updateBooking = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, project_name, email, date, time_slot, category, platforms, note, priority, status } = req.body;

        // Check if slot conflicts with another booking (excluding current)
        const { data: existing, error: checkError } = await supabase
            .from('bookings')
            .select('id')
            .eq('date', date)
            .eq('time_slot', time_slot)
            .neq('id', id)
            .maybeSingle();

        if (checkError) throw checkError;

        if (existing) {
            req.session.error = '❌ This time slot is already booked. Please choose another.';
            return res.redirect('/');
        }

        const platformsStr = Array.isArray(platforms) ? platforms.join(',') : platforms || '';

        const { data, error } = await supabase
            .from('bookings')
            .update({
                name,
                project_name,
                email,
                date,
                time_slot,
                category,
                platforms: platformsStr,
                note: note || '',
                priority: priority || 'Medium',
                status: status || 'Pending'
            })
            .eq('id', id);

        if (error) throw error;

        req.session.success = '✅ Booking updated successfully!';
        res.redirect('/');
    } catch (error) {
        console.error('Error updating booking:', error);
        req.session.error = '❌ Failed to update booking.';
        res.redirect('/');
    }
};
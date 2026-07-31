import { supabase } from '../_lib/supabase.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const { id } = req.query;

    // DELETE: Delete booking
    if (req.method === 'DELETE') {
        try {
            const { error } = await supabase
                .from('bookings')
                .delete()
                .eq('id', id);

            if (error) throw error;

            res.status(200).json({
                success: true,
                message: 'Booking deleted successfully!'
            });
        } catch (error) {
            console.error('Error deleting booking:', error);
            res.status(500).json({ error: 'Failed to delete booking' });
        }
    }

    // PUT: Update booking
    else if (req.method === 'PUT') {
        try {
            const { name, project_name, email, date, time_slot, category, platforms, note, priority, status } = req.body;

            // Check if booking exists
            const { data: existing } = await supabase
                .from('bookings')
                .select('id, date, time_slot, status')
                .eq('id', id)
                .maybeSingle();

            if (!existing) {
                return res.status(404).json({ error: 'Booking not found' });
            }

            // Check for duplicate slot
            if (date !== existing.date || time_slot !== existing.time_slot) {
                const { data: duplicate } = await supabase
                    .from('bookings')
                    .select('id')
                    .eq('date', date)
                    .eq('time_slot', time_slot)
                    .neq('id', id)
                    .maybeSingle();

                if (duplicate) {
                    return res.status(409).json({
                        error: 'This time slot is already booked. Please choose another.'
                    });
                }
            }

            // Update booking
            const updateData = {
                name,
                project_name,
                email,
                date,
                time_slot,
                category,
                platforms: Array.isArray(platforms) ? platforms.join(',') : platforms,
                note: note || '',
                priority: priority || 'Medium',
                status: status || 'Pending'
            };

            // Auto-archive if status is Completed
            if (status === 'Completed') {
                updateData.archived = true;
            }

            const { data, error } = await supabase
                .from('bookings')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            res.status(200).json({
                success: true,
                message: 'Booking updated successfully!',
                booking: data
            });
        } catch (error) {
            console.error('Error updating booking:', error);
            res.status(500).json({ error: 'Failed to update booking' });
        }
    }

    // Method not allowed
    else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
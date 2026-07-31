import { supabase } from '../_lib/supabase.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { date, timeSlot } = req.query;

    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('id')
            .eq('date', date)
            .eq('time_slot', timeSlot)
            .maybeSingle();

        if (error) throw error;

        res.status(200).json({
            available: !data,
            booked: !!data,
            date,
            time_slot: timeSlot
        });
    } catch (error) {
        console.error('Error checking availability:', error);
        res.status(500).json({ error: 'Failed to check availability' });
    }
}
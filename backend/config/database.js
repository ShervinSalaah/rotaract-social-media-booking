const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Test connection function
async function testConnection() {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .limit(1);
        
        if (error) {
            console.error('❌ Supabase connection error:', error.message);
            return false;
        }
        
        console.log('✅ Connected to Supabase successfully!');
        return true;
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        return false;
    }
}

// Export both supabase client and test function
module.exports = {
    supabase,
    testConnection
};
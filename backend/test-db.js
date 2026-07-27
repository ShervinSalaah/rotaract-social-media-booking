const { supabase, testConnection } = require('./config/database');

async function test() {
    console.log('🔄 Testing Supabase connection...');
    
    try {
        // Test connection
        const connected = await testConnection();
        
        if (!connected) {
            console.error('❌ Failed to connect to Supabase');
            console.log('📋 Check:');
            console.log('   1. SUPABASE_URL in .env is correct');
            console.log('   2. SUPABASE_ANON_KEY in .env is correct');
            console.log('   3. You have internet connection');
            process.exit(1);
        }
        
        // Get all bookings
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('*')
            .order('date', { ascending: true })
            .order('time_slot', { ascending: true });
        
        if (error) {
            console.error('❌ Error fetching bookings:', error.message);
            process.exit(1);
        }
        
        console.log(`📊 Total bookings: ${bookings.length}`);
        console.log('📋 Bookings:');
        bookings.forEach(b => {
            console.log(`   - ${b.name}: ${b.date} ${b.time_slot} (${b.category})`);
        });
        
        console.log('🎉 Connection test complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

test();
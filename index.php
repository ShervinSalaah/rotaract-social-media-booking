<?php
// ============================================
// ROTARACT SOCIAL MEDIA BOOKING APP
// Main Page - index.php
// ============================================

// Start session for flash messages
session_start();

// Include database configuration
require_once 'config/database.php';

// Set page title
$pageTitle = 'Rotaract Social Media Booking';

// ============================================
// CALENDAR NAVIGATION
// ============================================

// Handle calendar month navigation
if (isset($_GET['month']) && isset($_GET['year'])) {
    $_SESSION['calendar_month'] = intval($_GET['month']);
    $_SESSION['calendar_year'] = intval($_GET['year']);
} elseif (!isset($_SESSION['calendar_month']) || !isset($_SESSION['calendar_year'])) {
    $_SESSION['calendar_month'] = date('n');
    $_SESSION['calendar_year'] = date('Y');
}

// If month goes out of range, adjust
if ($_SESSION['calendar_month'] > 12) {
    $_SESSION['calendar_month'] = 1;
    $_SESSION['calendar_year']++;
} elseif ($_SESSION['calendar_month'] < 1) {
    $_SESSION['calendar_month'] = 12;
    $_SESSION['calendar_year']--;
}

// ============================================
// FETCH BOOKINGS FROM DATABASE
// ============================================

// Get active bookings (not archived)
$bookings = fetchAll("SELECT * FROM bookings WHERE archived = 0 ORDER BY date ASC, time_slot ASC");

// Get archive count
$archiveCount = fetchOne("SELECT COUNT(*) as total FROM bookings WHERE archived = 1");
$archiveCount = $archiveCount ? $archiveCount['total'] : 0;

// Get statistics for dashboard
$totalBookings = fetchOne("SELECT COUNT(*) as total FROM bookings WHERE archived = 0");
$totalBookings = $totalBookings ? $totalBookings['total'] : 0;

$todayBookings = fetchOne("SELECT COUNT(*) as today FROM bookings WHERE date = CURDATE() AND archived = 0");
$todayBookings = $todayBookings ? $todayBookings['today'] : 0;

$pendingBookings = fetchOne("SELECT COUNT(*) as pending FROM bookings WHERE status = 'Pending' AND archived = 0");
$pendingBookings = $pendingBookings ? $pendingBookings['pending'] : 0;

$categories = fetchAll("SELECT category, COUNT(*) as count FROM bookings WHERE archived = 0 GROUP BY category");

// Get unique categories for filter dropdown
$uniqueCategories = [];
if ($categories) {
    foreach ($categories as $cat) {
        $uniqueCategories[] = $cat['category'];
    }
}

// Get flash messages from session
$successMessage = isset($_SESSION['success']) ? $_SESSION['success'] : null;
$errorMessage = isset($_SESSION['error']) ? $_SESSION['error'] : null;

// Clear flash messages after reading
unset($_SESSION['success']);
unset($_SESSION['error']);

// ============================================
// INCLUDE HEADER
// ============================================
include 'includes/header.php';
?>

<!-- ============================================ -->
<!-- STATS CARDS                                  -->
<!-- ============================================ -->
<section class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
    <div class="glass-card rounded-3xl p-6">
        <div class="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center mb-3">
            <i class="fas fa-calendar-check text-indigo-400 text-xl"></i>
        </div>
        <p class="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Bookings</p>
        <h2 class="text-3xl font-black mt-1 text-white"><?php echo $totalBookings; ?></h2>
    </div>
    
    <div class="glass-card rounded-3xl p-6">
        <div class="w-12 h-12 bg-emerald-600/20 rounded-2xl flex items-center justify-center mb-3">
            <i class="fas fa-calendar-day text-emerald-400 text-xl"></i>
        </div>
        <p class="text-slate-400 text-xs font-bold uppercase tracking-widest">Today's Bookings</p>
        <h2 class="text-3xl font-black mt-1 text-emerald-400"><?php echo $todayBookings; ?></h2>
    </div>
    
    <div class="glass-card rounded-3xl p-6">
        <div class="w-12 h-12 bg-amber-600/20 rounded-2xl flex items-center justify-center mb-3">
            <i class="fas fa-clock text-amber-400 text-xl"></i>
        </div>
        <p class="text-slate-400 text-xs font-bold uppercase tracking-widest">Pending</p>
        <h2 class="text-3xl font-black mt-1 text-amber-400"><?php echo $pendingBookings; ?></h2>
    </div>
    
    <div class="glass-card rounded-3xl p-6">
        <div class="w-12 h-12 bg-rose-600/20 rounded-2xl flex items-center justify-center mb-3">
            <i class="fas fa-tags text-rose-400 text-xl"></i>
        </div>
        <p class="text-slate-400 text-xs font-bold uppercase tracking-widest">Categories</p>
        <h2 class="text-3xl font-black mt-1 text-white"><?php echo count($uniqueCategories); ?></h2>
    </div>
</section>

<!-- ============================================ -->
<!-- FLASH MESSAGES                               -->
<!-- ============================================ -->
<?php if ($successMessage): ?>
    <div id="message" class="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl mb-6 flex items-center justify-between">
        <span><i class="fas fa-check-circle mr-2"></i> <?php echo htmlspecialchars($successMessage); ?></span>
        <button onclick="this.parentElement.style.display='none'" class="text-emerald-400/70 hover:text-emerald-400">
            <i class="fas fa-times"></i>
        </button>
    </div>
<?php endif; ?>

<?php if ($errorMessage): ?>
    <div id="message" class="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-xl mb-6 flex items-center justify-between">
        <span><i class="fas fa-exclamation-circle mr-2"></i> <?php echo htmlspecialchars($errorMessage); ?></span>
        <button onclick="this.parentElement.style.display='none'" class="text-rose-400/70 hover:text-rose-400">
            <i class="fas fa-times"></i>
        </button>
    </div>
<?php endif; ?>

<!-- ============================================ -->
<!-- CALENDAR VIEW                                -->
<!-- ============================================ -->
<section class="glass-card rounded-3xl p-6 md:p-8 mb-8">
    <div class="flex flex-wrap justify-between items-center mb-6">
        <h2 class="text-2xl font-bold flex items-center gap-3">
            <span class="w-2 h-8 bg-indigo-500 rounded-full"></span>
            <i class="fas fa-calendar-alt text-indigo-400"></i>
            Calendar View
        </h2>
        <div class="flex items-center gap-3">
            <button onclick="changeMonth(-1)" class="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-xl text-sm font-bold text-white transition">
                <i class="fas fa-chevron-left"></i>
            </button>
            <span id="calendarMonth" class="text-lg font-bold text-white min-w-[150px] text-center">
                <?php echo date('F Y', mktime(0, 0, 0, $_SESSION['calendar_month'], 1, $_SESSION['calendar_year'])); ?>
            </span>
            <button onclick="changeMonth(1)" class="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-xl text-sm font-bold text-white transition">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    </div>
    
    <div id="calendarGrid" class="grid grid-cols-7 gap-2">
        <div class="text-center text-slate-400 font-bold py-2 text-sm">Sun</div>
        <div class="text-center text-slate-400 font-bold py-2 text-sm">Mon</div>
        <div class="text-center text-slate-400 font-bold py-2 text-sm">Tue</div>
        <div class="text-center text-slate-400 font-bold py-2 text-sm">Wed</div>
        <div class="text-center text-slate-400 font-bold py-2 text-sm">Thu</div>
        <div class="text-center text-slate-400 font-bold py-2 text-sm">Fri</div>
        <div class="text-center text-slate-400 font-bold py-2 text-sm">Sat</div>
    </div>
    
    <!-- Calendar Days -->
    <div id="calendarDays" class="grid grid-cols-7 gap-2 mt-2">
        <?php
        // Use session values for calendar
        $calendarMonth = $_SESSION['calendar_month'];
        $calendarYear = $_SESSION['calendar_year'];
        
        $firstDay = date('w', mktime(0, 0, 0, $calendarMonth, 1, $calendarYear));
        $daysInMonth = date('t', mktime(0, 0, 0, $calendarMonth, 1, $calendarYear));
        $daysInPrevMonth = date('t', mktime(0, 0, 0, $calendarMonth - 1, 1, $calendarYear));
        $today = date('Y-m-d');
        
        // Fetch bookings for calendar
        $calendarBookings = [];
        try {
            $pdo = getDBConnection();
            $stmt = $pdo->prepare("SELECT date FROM bookings WHERE archived = 0");
            $stmt->execute();
            $calendarBookings = $stmt->fetchAll(PDO::FETCH_COLUMN);
        } catch (Exception $e) {
            // Silently fail
        }
        
        // Create booking count map
        $bookingCount = [];
        foreach ($calendarBookings as $date) {
            if (!isset($bookingCount[$date])) {
                $bookingCount[$date] = 0;
            }
            $bookingCount[$date]++;
        }
        
        // Previous month days
        for ($i = $firstDay - 1; $i >= 0; $i--) {
            $day = $daysInPrevMonth - $i;
            echo '<div class="text-center py-3 rounded-xl text-slate-500 text-sm opacity-50">' . $day . '</div>';
        }
        
        // Current month days
        for ($i = 1; $i <= $daysInMonth; $i++) {
            $dateStr = $calendarYear . '-' . str_pad($calendarMonth, 2, '0', STR_PAD_LEFT) . '-' . str_pad($i, 2, '0', STR_PAD_LEFT);
            $count = isset($bookingCount[$dateStr]) ? $bookingCount[$dateStr] : 0;
            $isToday = ($dateStr === $today) ? 'today' : '';
            
            if ($count > 0) {
                // Has bookings
                $bgColor = 'bg-indigo-500/40';
                if ($count >= 3) {
                    $bgColor = 'bg-indigo-600/50';
                } elseif ($count >= 2) {
                    $bgColor = 'bg-indigo-500/40';
                } else {
                    $bgColor = 'bg-indigo-400/30';
                }
                echo '<div class="text-center py-3 rounded-xl text-white font-bold ' . $bgColor . ' hover:bg-indigo-500/60 transition-all duration-200 cursor-pointer relative" 
                           onclick="showBookingDetails(\'' . $dateStr . '\')">
                    ' . $i . '
                    <span class="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center shadow-lg">' . $count . '</span>
                </div>';
            } else {
                // No bookings
                if ($isToday) {
                    echo '<div class="text-center py-3 rounded-xl text-indigo-400 font-bold border border-indigo-500/30 bg-indigo-500/10">' . $i . '</div>';
                } else {
                    echo '<div class="text-center py-3 rounded-xl text-slate-300 hover:bg-slate-700/30 transition-all duration-200 cursor-pointer" 
                               onclick="showMessage(\'No bookings on ' . date('M d, Y', strtotime($dateStr)) . '\', \'info\')">' . $i . '</div>';
                }
            }
        }
        
        // Next month days
        $totalDays = $firstDay + $daysInMonth;
        $remainingDays = $totalDays % 7 === 0 ? 0 : 7 - ($totalDays % 7);
        for ($i = 1; $i <= $remainingDays; $i++) {
            echo '<div class="text-center py-3 rounded-xl text-slate-500 text-sm opacity-50">' . $i . '</div>';
        }
        ?>
    </div>
    
    <!-- Legend -->
    <div class="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-700/50 text-xs text-slate-400">
        <span class="flex items-center gap-2">
            <span class="w-4 h-4 rounded bg-indigo-400/30"></span>
            <span>1 booking</span>
        </span>
        <span class="flex items-center gap-2">
            <span class="w-4 h-4 rounded bg-indigo-500/40"></span>
            <span>2 bookings</span>
        </span>
        <span class="flex items-center gap-2">
            <span class="w-4 h-4 rounded bg-indigo-600/50"></span>
            <span>3+ bookings</span>
        </span>
        <span class="flex items-center gap-2">
            <span class="w-4 h-4 rounded border border-indigo-500/30 bg-indigo-500/10"></span>
            <span>Today</span>
        </span>
        <span class="flex items-center gap-2 ml-auto">
            <i class="fas fa-mouse-pointer text-indigo-400"></i>
            <span>Click date for details</span>
        </span>
    </div>
</section>

<!-- ============================================ -->
<!-- BOOKING FORM                                 -->
<!-- ============================================ -->
<section class="glass-card rounded-3xl p-6 md:p-8 mb-8">
    <h2 class="text-2xl font-bold mb-6 flex items-center gap-3">
        <span class="w-2 h-8 bg-indigo-500 rounded-full"></span>
        <i class="fas fa-pen-to-square text-indigo-400"></i>
        Book a Time Slot
    </h2>

    <form id="bookingForm" action="api/create_booking.php" method="POST" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Name -->
        <div>
            <label class="block text-sm font-medium text-slate-400 mb-1">
                <i class="fas fa-user text-indigo-400 mr-1"></i> Full Name *
            </label>
            <input type="text" name="name" required
                   class="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                   placeholder="Enter your full name">
        </div>
        
        <!-- Project Name -->
        <div>
            <label class="block text-sm font-medium text-slate-400 mb-1">
                <i class="fas fa-project-diagram text-indigo-400 mr-1"></i> Project Name *
            </label>
            <input type="text" name="project_name" required
                   class="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                   placeholder="Enter project name">
        </div>
        
        <!-- Email -->
        <div>
            <label class="block text-sm font-medium text-slate-400 mb-1">
                <i class="fas fa-envelope text-indigo-400 mr-1"></i> Email *
            </label>
            <input type="email" name="email" required
                   class="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                   placeholder="your@email.com">
        </div>
        
        <!-- Date -->
        <div>
            <label class="block text-sm font-medium text-slate-400 mb-1">
                <i class="fas fa-calendar text-indigo-400 mr-1"></i> Date *
            </label>
            <input type="date" name="date" id="bookingDate" required
                   min="<?php echo date('Y-m-d'); ?>"
                   class="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition">
        </div>
        
        <!-- Time Slot -->
        <div>
            <label class="block text-sm font-medium text-slate-400 mb-1">
                <i class="fas fa-clock text-indigo-400 mr-1"></i> Time Slot *
            </label>
            <select name="time_slot" id="timeSlot" required
                    class="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition">
                <option value="">Select time slot</option>
                <?php
                $timeSlots = [
                    '9:00 AM - 9:30 AM', '9:30 AM - 10:00 AM',
                    '10:00 AM - 10:30 AM', '10:30 AM - 11:00 AM',
                    '11:00 AM - 11:30 AM', '11:30 AM - 12:00 PM',
                    '12:00 PM - 12:30 PM', '12:30 PM - 1:00 PM',
                    '1:00 PM - 1:30 PM', '1:30 PM - 2:00 PM',
                    '2:00 PM - 2:30 PM', '2:30 PM - 3:00 PM',
                    '3:00 PM - 3:30 PM', '3:30 PM - 4:00 PM',
                    '4:00 PM - 4:30 PM', '4:30 PM - 5:00 PM'
                ];
                foreach ($timeSlots as $slot) {
                    echo "<option value=\"$slot\">$slot</option>";
                }
                ?>
            </select>
            <div id="availabilityStatus" class="text-sm mt-1"></div>
        </div>
        
        <!-- Category -->
        <div>
            <label class="block text-sm font-medium text-slate-400 mb-1">
                <i class="fas fa-tag text-indigo-400 mr-1"></i> Category *
            </label>
            <select name="category" required
                    class="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition">
                <option value="Flyer">📄 Flyer</option>
                <option value="Video">🎬 Video</option>
                <option value="Reel">📱 Reel</option>
                <option value="Carousel">🖼️ Carousel</option>
                <option value="Story">📸 Story</option>
                <option value="Infographic">📊 Infographic</option>
            </select>
        </div>
        
        <!-- Priority -->
        <div>
            <label class="block text-sm font-medium text-slate-400 mb-1">
                <i class="fas fa-flag text-indigo-400 mr-1"></i> Priority
            </label>
            <select name="priority"
                    class="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition">
                <option value="Low">🟢 Low</option>
                <option value="Medium" selected>🟡 Medium</option>
                <option value="High">🔴 High</option>
            </select>
        </div>
        
        <!-- Platforms (Multi-select) -->
        <div class="md:col-span-2">
            <label class="block text-sm font-medium text-slate-400 mb-2">
                <i class="fas fa-share-alt text-indigo-400 mr-1"></i> Platforms *
            </label>
            <div class="flex flex-wrap gap-4">
                <label class="flex items-center gap-2 cursor-pointer hover:text-indigo-400 transition">
                    <input type="checkbox" name="platforms[]" value="whatsapp" class="accent-indigo-500 w-4 h-4">
                    <i class="fab fa-whatsapp text-green-400"></i> WhatsApp
                </label>
                <label class="flex items-center gap-2 cursor-pointer hover:text-indigo-400 transition">
                    <input type="checkbox" name="platforms[]" value="youtube" class="accent-indigo-500 w-4 h-4">
                    <i class="fab fa-youtube text-red-500"></i> YouTube
                </label>
                <label class="flex items-center gap-2 cursor-pointer hover:text-indigo-400 transition">
                    <input type="checkbox" name="platforms[]" value="facebook" class="accent-indigo-500 w-4 h-4">
                    <i class="fab fa-facebook text-blue-500"></i> Facebook
                </label>
                <label class="flex items-center gap-2 cursor-pointer hover:text-indigo-400 transition">
                    <input type="checkbox" name="platforms[]" value="instagram" class="accent-indigo-500 w-4 h-4">
                    <i class="fab fa-instagram text-pink-500"></i> Instagram
                </label>
                <label class="flex items-center gap-2 cursor-pointer hover:text-indigo-400 transition">
                    <input type="checkbox" name="platforms[]" value="linkedin" class="accent-indigo-500 w-4 h-4">
                    <i class="fab fa-linkedin text-blue-400"></i> LinkedIn
                </label>
            </div>
        </div>
        
        <!-- Note -->
        <div class="md:col-span-2">
            <label class="block text-sm font-medium text-slate-400 mb-1">
                <i class="fas fa-pencil text-indigo-400 mr-1"></i> Note (Optional)
            </label>
            <textarea name="note" rows="3"
                      class="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                      placeholder="Add any additional details..."></textarea>
        </div>
        
        <!-- Submit Button -->
        <div class="md:col-span-2">
            <button type="submit" id="submitBtn"
                    class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2">
                <i class="fas fa-calendar-plus"></i>
                Book Now
            </button>
        </div>
    </form>
</section>

<!-- ============================================ -->
<!-- BOOKINGS DASHBOARD                           -->
<!-- ============================================ -->
<section class="glass-card rounded-3xl p-6 md:p-8">
    <div class="flex flex-wrap justify-between items-center mb-6">
        <h2 class="text-2xl font-bold flex items-center gap-3">
            <span class="w-2 h-8 bg-indigo-500 rounded-full"></span>
            <i class="fas fa-table text-indigo-400"></i>
            Bookings Dashboard
        </h2>
        <span class="text-sm text-slate-400">
            <i class="fas fa-database mr-1"></i> <?php echo $totalBookings; ?> active bookings
            <span id="archiveCount" class="ml-2 text-slate-500">(<?php echo $archiveCount; ?> archived)</span>
        </span>
    </div>

    <!-- Filters & Archive Toggle -->
    <div class="flex flex-wrap items-center gap-3 mb-6">
        <button onclick="toggleArchive()" id="archiveToggleBtn" 
                class="bg-slate-700 hover:bg-slate-600 px-6 py-2 rounded-xl text-sm font-bold text-white transition">
            <i class="fas fa-archive mr-1"></i> Show Archive
        </button>
    </div>

    <div class="flex flex-wrap gap-3 mb-6">
        <input type="date" id="filterDate" 
               class="bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
        
        <select id="filterCategory" 
                class="bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
            <option value="">All Categories</option>
            <?php foreach ($uniqueCategories as $cat): ?>
                <option value="<?php echo htmlspecialchars($cat); ?>"><?php echo htmlspecialchars($cat); ?></option>
            <?php endforeach; ?>
        </select>
        
        <select id="filterPriority"
                class="bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
            <option value="">All Priorities</option>
            <option value="Low">🟢 Low</option>
            <option value="Medium">🟡 Medium</option>
            <option value="High">🔴 High</option>
        </select>
        
        <select id="filterStatus"
                class="bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
            <option value="">All Statuses</option>
            <option value="Pending">⏳ Pending</option>
            <option value="Confirmed">✅ Confirmed</option>
            <option value="Completed">✔️ Completed</option>
        </select>
        
        <div class="relative">
            <input type="text" id="filterSearch" placeholder="🔍 Search name, project, email..." 
                   class="bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-48">
            <button onclick="clearSearch()" id="clearSearchBtn" 
                    class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white hidden">
                <i class="fas fa-times-circle"></i>
            </button>
        </div>
        
        <button onclick="applyFilters()" 
                class="bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-xl text-sm font-bold text-white transition">
            <i class="fas fa-filter mr-1"></i> Apply Filters
        </button>
        
        <button onclick="resetFilters()" 
                class="bg-slate-700 hover:bg-slate-600 px-6 py-2 rounded-xl text-sm font-bold text-white transition">
            <i class="fas fa-undo mr-1"></i> Reset
        </button>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
        <table class="w-full" id="bookingsTable">
            <thead>
                <tr class="text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700">
                    <th class="pb-3"><i class="fas fa-user mr-1"></i>Name</th>
                    <th class="pb-3"><i class="fas fa-project-diagram mr-1"></i>Project</th>
                    <th class="pb-3"><i class="fas fa-calendar mr-1"></i>Date</th>
                    <th class="pb-3"><i class="fas fa-clock mr-1"></i>Time</th>
                    <th class="pb-3"><i class="fas fa-tag mr-1"></i>Category</th>
                    <th class="pb-3"><i class="fas fa-share-alt mr-1"></i>Platforms</th>
                    <th class="pb-3"><i class="fas fa-flag mr-1"></i>Priority</th>
                    <th class="pb-3"><i class="fas fa-circle mr-1"></i>Status</th>
                    <th class="pb-3 text-right"><i class="fas fa-cog mr-1"></i>Actions</th>
                </tr>
            </thead>
            <tbody id="bookingsTableBody">
                <?php if ($bookings && count($bookings) > 0): ?>
                    <?php foreach ($bookings as $booking): ?>
                        <tr class="border-b border-slate-700/50 hover:bg-slate-700/20 transition" data-id="<?php echo $booking['id']; ?>">
                            <td class="py-3 font-medium text-white"><?php echo htmlspecialchars($booking['name']); ?></td>
                            <td class="py-3 text-slate-300"><?php echo htmlspecialchars($booking['project_name']); ?></td>
                            <td class="py-3 text-slate-300"><?php echo date('M d, Y', strtotime($booking['date'])); ?></td>
                            <td class="py-3 text-slate-300"><?php echo htmlspecialchars($booking['time_slot']); ?></td>
                            <td class="py-3">
                                <span class="badge-<?php echo strtolower($booking['category']); ?> px-3 py-1 rounded-full text-xs font-medium">
                                    <?php echo htmlspecialchars($booking['category']); ?>
                                </span>
                            </td>
                            <td class="py-3 text-sm text-slate-300">
                                <?php 
                                $platforms = explode(',', $booking['platforms'] ?? '');
                                $platformIcons = [
                                    'whatsapp' => 'fab fa-whatsapp text-green-400',
                                    'youtube' => 'fab fa-youtube text-red-500',
                                    'facebook' => 'fab fa-facebook text-blue-500',
                                    'instagram' => 'fab fa-instagram text-pink-500',
                                    'linkedin' => 'fab fa-linkedin text-blue-400'
                                ];
                                foreach ($platforms as $p) {
                                    $p = trim($p);
                                    if (isset($platformIcons[$p])) {
                                        echo '<i class="' . $platformIcons[$p] . ' mr-1" title="' . ucfirst($p) . '"></i>';
                                    }
                                }
                                ?>
                            </td>
                            <td class="py-3">
                                <span class="badge-<?php echo strtolower($booking['priority']); ?> px-3 py-1 rounded-full text-xs font-medium">
                                    <?php echo htmlspecialchars($booking['priority']); ?>
                                </span>
                            </td>
                            <td class="py-3">
                                <span class="badge-<?php echo strtolower($booking['status']); ?> px-3 py-1 rounded-full text-xs font-medium">
                                    <?php echo htmlspecialchars($booking['status']); ?>
                                </span>
                            </td>
                            <td class="py-3 text-right">
                                <button onclick="openEditModal(<?php echo $booking['id']; ?>)" 
                                        class="text-indigo-400 hover:text-indigo-300 mr-2 transition" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="deleteBooking(<?php echo $booking['id']; ?>)" 
                                        class="text-rose-400 hover:text-rose-300 transition" title="Delete">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php else: ?>
                    <tr>
                        <td colspan="9" class="py-8 text-center text-slate-400">
                            <i class="fas fa-inbox text-4xl block mb-2"></i>
                            No active bookings found. Create your first booking above!
                        </td>
                    </tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</section>

<!-- ============================================ -->
<!-- EDIT MODAL (Hidden by default)               -->
<!-- ============================================ -->
<div id="editModal" class="fixed inset-0 bg-black/70 flex items-center justify-center hidden z-50 p-4">
    <div class="bg-slate-800 rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold flex items-center gap-2">
                <i class="fas fa-edit text-indigo-400"></i>
                Edit Booking
            </h2>
            <button onclick="closeEditModal()" class="text-slate-400 hover:text-white text-2xl transition">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <form id="editForm" action="api/update_booking.php" method="POST" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="hidden" name="id" id="editId">
            
            <div>
                <label class="block text-sm font-medium text-slate-400 mb-1">Full Name *</label>
                <input type="text" name="name" id="editName" required
                       class="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-400 mb-1">Project Name *</label>
                <input type="text" name="project_name" id="editProject" required
                       class="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-400 mb-1">Email *</label>
                <input type="email" name="email" id="editEmail" required
                       class="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-400 mb-1">Date *</label>
                <input type="date" name="date" id="editDate" required
                       min="<?php echo date('Y-m-d'); ?>"
                       class="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-400 mb-1">Time Slot *</label>
                <select name="time_slot" id="editTimeSlot" required
                        class="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500">
                    <?php foreach ($timeSlots as $slot): ?>
                        <option value="<?php echo $slot; ?>"><?php echo $slot; ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-400 mb-1">Category *</label>
                <select name="category" id="editCategory" required
                        class="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500">
                    <option value="Flyer">📄 Flyer</option>
                    <option value="Video">🎬 Video</option>
                    <option value="Reel">📱 Reel</option>
                    <option value="Carousel">🖼️ Carousel</option>
                    <option value="Story">📸 Story</option>
                    <option value="Infographic">📊 Infographic</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-400 mb-1">Priority</label>
                <select name="priority" id="editPriority"
                        class="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500">
                    <option value="Low">🟢 Low</option>
                    <option value="Medium">🟡 Medium</option>
                    <option value="High">🔴 High</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-400 mb-1">Status</label>
                <select name="status" id="editStatus"
                        class="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500">
                    <option value="Pending">⏳ Pending</option>
                    <option value="Confirmed">✅ Confirmed</option>
                    <option value="Completed">✔️ Completed</option>
                </select>
            </div>
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-slate-400 mb-1">Note</label>
                <textarea name="note" id="editNote" rows="2"
                          class="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"></textarea>
            </div>
            <div class="md:col-span-2 flex gap-3">
                <button type="submit"
                        class="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition">
                    <i class="fas fa-save mr-2"></i> Update Booking
                </button>
                <button type="button" onclick="closeEditModal()"
                        class="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-xl transition">
                    <i class="fas fa-times mr-2"></i> Cancel
                </button>
            </div>
        </form>
    </div>
</div>

<?php
// Include footer
include 'includes/footer.php';
?>
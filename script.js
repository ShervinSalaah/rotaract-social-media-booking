/**
 * ROTARACT SOCIAL MEDIA BOOKING APP
 * Main Application Script
 * 
 * Handles all client-side functionality including:
 * - Supabase database operations (CRUD)
 * - Real-time availability checking
 * - Calendar navigation
 * - Filter and search functionality
 * - Edit and delete operations
 * - Sidebar navigation
 * - Stats updates
 * 
 * @package RotaractBooking
 * @subpackage Scripts
 * @version 2.0.0
 */

'use strict';

console.log('Rotaract Booking App loaded');

// ============================================
// SUPABASE CONFIGURATION
// ============================================

/**
 * Supabase connection credentials
 * These should be stored in environment variables in production
 */
const SUPABASE_URL = 'https://tpbzidlyawcsayxgjgyp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwYnppZGx5YXdjc2F5eGdqZ3lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NzUwODcsImV4cCI6MjEwMTE1MTA4N30.AwpbzXI3VSKbk-h1CBbwrtZT82Kdvab2-1I9zXlVzIU';

// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('Supabase client initialized');

// ============================================
// CONSTANTS & CONFIGURATION
// ============================================

/** Available time slots */
const TIME_SLOTS = [
    '9:00 AM - 9:30 AM',
    '9:30 AM - 10:00 AM',
    '10:00 AM - 10:30 AM',
    '10:30 AM - 11:00 AM',
    '11:00 AM - 11:30 AM',
    '11:30 AM - 12:00 PM',
    '12:00 PM - 12:30 PM',
    '12:30 PM - 1:00 PM',
    '1:00 PM - 1:30 PM',
    '1:30 PM - 2:00 PM',
    '2:00 PM - 2:30 PM',
    '2:30 PM - 3:00 PM',
    '3:00 PM - 3:30 PM',
    '3:30 PM - 4:00 PM',
    '4:00 PM - 4:30 PM',
    '4:30 PM - 5:00 PM'
];

/** Content categories */
const CATEGORIES = ['Flyer', 'Video', 'Reel', 'Carousel', 'Story', 'Infographic'];

/** Available social media platforms */
const ALL_PLATFORMS = ['whatsapp', 'youtube', 'facebook', 'instagram', 'linkedin', 'tiktok'];

/** Priority levels */
const PRIORITIES = ['Low', 'Medium', 'High'];

/** Booking statuses */
const STATUSES = ['Pending', 'Confirmed', 'Completed'];

/** Platform icon mappings */
const PLATFORM_ICONS = {
    'whatsapp': 'fab fa-whatsapp text-green-400',
    'youtube': 'fab fa-youtube text-red-500',
    'facebook': 'fab fa-facebook text-blue-500',
    'instagram': 'fab fa-instagram text-pink-500',
    'linkedin': 'fab fa-linkedin text-blue-400',
    'tiktok': 'fab fa-tiktok text-white'
};

/** Platform display names */
const PLATFORM_NAMES = {
    'whatsapp': 'WhatsApp',
    'youtube': 'YouTube',
    'facebook': 'Facebook',
    'instagram': 'Instagram',
    'linkedin': 'LinkedIn',
    'tiktok': 'TikTok'
};

// ============================================
// STATE VARIABLES
// ============================================

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let showArchived = false;
let allBookings = [];

// ============================================
// REAL-TIME CLOCK
// ============================================

/**
 * Updates the clock display with current date and time
 */
function updateClock() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const clockElement = document.getElementById('clockText');
    if (clockElement) {
        clockElement.textContent = dateStr + ', ' + timeStr;
    }
}

// Update clock every second
setInterval(updateClock, 1000);

// ============================================
// DOM INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM ready');

    populateEditDropdowns();
    populateFilterDropdowns();
    attachEventListeners();
    setupEditModal();
    setupDateValidation();
    setupSearchListeners();
    setupPlatformValidation();
    updateClock();

    fetchBookings();
    renderCalendar();
});

// ============================================
// DROPDOWN POPULATION
// ============================================

/**
 * Populates filter dropdowns with all available options
 */
function populateFilterDropdowns() {
    // Populate category filter
    const categorySelect = document.getElementById('filterCategory');
    if (categorySelect) {
        const currentValue = categorySelect.value;
        categorySelect.innerHTML = '<option value="">All Categories</option>';
        CATEGORIES.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categorySelect.appendChild(option);
        });
        categorySelect.value = currentValue;
    }

    // Populate platform filter with all platforms
    const platformSelect = document.getElementById('filterPlatform');
    if (platformSelect) {
        const currentValue = platformSelect.value;
        platformSelect.innerHTML = '<option value="">All Platforms</option>';
        ALL_PLATFORMS.forEach(p => {
            const option = document.createElement('option');
            option.value = p;
            const displayName = p.charAt(0).toUpperCase() + p.slice(1);
            option.textContent = displayName;
            platformSelect.appendChild(option);
        });
        platformSelect.value = currentValue;
    }
}

/**
 * Populates edit modal dropdowns with all options
 */
function populateEditDropdowns() {
    // Populate time slots
    const timeSlotSelect = document.getElementById('editTimeSlot');
    if (timeSlotSelect) {
        timeSlotSelect.innerHTML = '<option value="">Select time slot</option>';
        TIME_SLOTS.forEach(slot => {
            const option = document.createElement('option');
            option.value = slot;
            option.textContent = slot;
            timeSlotSelect.appendChild(option);
        });
    }

    // Populate categories
    const categorySelect = document.getElementById('editCategory');
    if (categorySelect) {
        categorySelect.innerHTML = '';
        CATEGORIES.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categorySelect.appendChild(option);
        });
    }

    // Populate priorities
    const prioritySelect = document.getElementById('editPriority');
    if (prioritySelect) {
        prioritySelect.innerHTML = '';
        PRIORITIES.forEach(pri => {
            const option = document.createElement('option');
            option.value = pri;
            option.textContent = pri;
            prioritySelect.appendChild(option);
        });
    }

    // Populate statuses
    const statusSelect = document.getElementById('editStatus');
    if (statusSelect) {
        statusSelect.innerHTML = '';
        STATUSES.forEach(stat => {
            const option = document.createElement('option');
            option.value = stat;
            option.textContent = stat;
            statusSelect.appendChild(option);
        });
    }

    console.log('Edit modal dropdowns populated');
}

// ============================================
// PLATFORM VALIDATION
// ============================================

/**
 * Validates that at least one platform is selected
 */
function setupPlatformValidation() {
    const form = document.getElementById('bookingForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            const checkboxes = document.querySelectorAll('input[name="platforms[]"]:checked');
            if (checkboxes.length === 0) {
                e.preventDefault();
                showMessage('Please select at least one platform.', 'error');
                return false;
            }
        });
    }
}

// ============================================
// BOOKING CRUD OPERATIONS
// ============================================

/**
 * Fetches bookings from Supabase with optional filters
 * @param {Object} filters - Optional filter parameters
 * @returns {Promise<Array>} Array of booking objects
 */
async function fetchBookings(filters = {}) {
    console.log('Fetching bookings...');

    try {
        let query = supabaseClient
            .from('bookings')
            .select('*');

        // Apply archived filter
        if (showArchived) {
            query = query.eq('archived', true);
        } else {
            query = query.eq('archived', false);
        }

        // Apply optional filters
        if (filters.date) {
            query = query.eq('date', filters.date);
        }
        if (filters.category) {
            query = query.eq('category', filters.category);
        }
        if (filters.priority) {
            query = query.eq('priority', filters.priority);
        }
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.platform) {
            query = query.ilike('platforms', `%${filters.platform}%`);
        }
        if (filters.search && filters.search.trim() !== '') {
            const term = filters.search.trim();
            query = query.or(
                `name.ilike.%${term}%,` +
                `project_name.ilike.%${term}%,` +
                `email.ilike.%${term}%,` +
                `category.ilike.%${term}%,` +
                `time_slot.ilike.%${term}%`
            );
        }

        // Order results
        query = query.order('date', { ascending: true })
            .order('time_slot', { ascending: true });

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching bookings:', error);
            showMessage('Failed to load bookings', 'error');
            return [];
        }

        console.log(`Loaded ${data ? data.length : 0} bookings`);
        allBookings = data || [];

        renderBookingsTable(allBookings);
        updateStats(allBookings);
        renderCalendar();
        updateDashboardHeading();

        return allBookings;

    } catch (err) {
        console.error('Error in fetchBookings:', err);
        showMessage('Failed to load bookings', 'error');
        return [];
    }
}

/**
 * Creates a new booking
 * @param {Object} data - Booking data
 * @returns {Promise<Object|null>} Created booking or null
 */
async function createBooking(data) {
    try {
        // Check if slot is available
        const { data: existing } = await supabaseClient
            .from('bookings')
            .select('id')
            .eq('date', data.date)
            .eq('time_slot', data.time_slot)
            .eq('archived', false)
            .maybeSingle();

        if (existing) {
            showMessage('This time slot is already booked!', 'error');
            return null;
        }

        // Insert new booking
        const { data: result, error } = await supabaseClient
            .from('bookings')
            .insert({
                name: data.name,
                project_name: data.project_name,
                email: data.email,
                date: data.date,
                time_slot: data.time_slot,
                category: data.category,
                platforms: Array.isArray(data.platforms) ? data.platforms.join(',') : data.platforms || '',
                note: data.note || '',
                priority: data.priority || 'Medium',
                status: data.status || 'Pending',
                archived: false
            })
            .select()
            .single();

        if (error) throw error;

        showMessage('Booking created successfully!', 'success');
        return result;
    } catch (err) {
        console.error('Error creating booking:', err);
        showMessage('Failed to create booking', 'error');
        return null;
    }
}

/**
 * Updates an existing booking with platform preservation
 * @param {number|string} id - Booking ID
 * @param {Object} data - Updated booking data
 * @returns {Promise<Object|null>} Updated booking or null
 */
async function updateBooking(id, data) {
    try {
        // Get existing booking to preserve platforms if not provided
        const { data: existingBooking, error: fetchError } = await supabaseClient
            .from('bookings')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;
        if (!existingBooking) {
            showMessage('Booking not found', 'error');
            return null;
        }

        // Check slot availability if date/time changed
        if (data.date !== existingBooking.date || data.time_slot !== existingBooking.time_slot) {
            const { data: existing } = await supabaseClient
                .from('bookings')
                .select('id')
                .eq('date', data.date)
                .eq('time_slot', data.time_slot)
                .neq('id', id)
                .eq('archived', false)
                .maybeSingle();

            if (existing) {
                showMessage('This time slot is already booked!', 'error');
                return null;
            }
        }

        // Preserve platforms
        let platforms = data.platforms || existingBooking.platforms || '';
        if (Array.isArray(platforms)) {
            platforms = platforms.join(',');
        }

        // Prepare update data
        const updateData = {
            name: data.name || existingBooking.name,
            project_name: data.project_name || existingBooking.project_name,
            email: data.email || existingBooking.email,
            date: data.date || existingBooking.date,
            time_slot: data.time_slot || existingBooking.time_slot,
            category: data.category || existingBooking.category,
            platforms: platforms,
            note: data.note || existingBooking.note || '',
            priority: data.priority || existingBooking.priority || 'Medium',
            status: data.status || existingBooking.status || 'Pending'
        };

        // Auto-archive if status is "Completed"
        updateData.archived = data.status === 'Completed' ? true : (existingBooking.archived || false);

        console.log('Updating booking:', updateData);

        const { data: result, error } = await supabaseClient
            .from('bookings')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        showMessage('Booking updated successfully!', 'success');
        return result;
    } catch (err) {
        console.error('Error updating booking:', err);
        showMessage('Failed to update booking', 'error');
        return null;
    }
}

/**
 * Deletes a booking
 * @param {number|string} id - Booking ID
 */
async function deleteBooking(id) {
    if (!confirm('Delete this booking?')) return;

    try {
        const { error } = await supabaseClient
            .from('bookings')
            .delete()
            .eq('id', id);

        if (error) throw error;

        showMessage('Booking deleted!', 'success');
        fetchBookings();
        renderCalendar();
    } catch (err) {
        console.error('Error deleting booking:', err);
        showMessage('Failed to delete booking', 'error');
    }
}

// ============================================
// UI RENDERING FUNCTIONS
// ============================================

/**
 * Renders the bookings table
 * @param {Array} bookings - Array of booking objects
 */
function renderBookingsTable(bookings) {
    const tbody = document.getElementById('bookingsTableBody');
    if (!tbody) return;

    if (!bookings || bookings.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="py-8 text-center text-slate-400">
                    <i class="fas fa-inbox text-4xl block mb-2"></i>
                    No bookings found.
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    bookings.forEach(b => {
        const catClass = `badge-${b.category ? b.category.toLowerCase() : 'default'}`;
        const priClass = `badge-${b.priority ? b.priority.toLowerCase() : 'medium'}`;
        const statClass = `badge-${b.status ? b.status.toLowerCase() : 'pending'}`;

        // Render platforms with icons
        let platHtml = '';
        if (b.platforms) {
            const platformItems = b.platforms.split(',');
            platformItems.forEach(p => {
                const trimmed = p.trim().toLowerCase();
                if (PLATFORM_ICONS[trimmed]) {
                    const displayName = PLATFORM_NAMES[trimmed] || trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
                    platHtml += `<i class="${PLATFORM_ICONS[trimmed]} mr-1" title="${displayName}"></i>`;
                } else {
                    platHtml += `<span class="text-slate-400 text-xs mr-1">${trimmed}</span>`;
                }
            });
        }

        if (!platHtml) {
            platHtml = '<span class="text-slate-500">-</span>';
        }

        html += `
            <tr class="border-b border-slate-700/50 hover:bg-slate-700/20 transition" data-id="${b.id}">
                <td class="py-3 font-medium text-white">${escapeHtml(b.name)}</td>
                <td class="py-3 text-slate-300">${escapeHtml(b.project_name)}</td>
                <td class="py-3 text-slate-300">${formatDate(b.date)}</td>
                <td class="py-3 text-slate-300">${escapeHtml(b.time_slot)}</td>
                <td class="py-3">
                    <span class="${catClass} px-3 py-1 rounded-full text-xs font-medium">
                        ${escapeHtml(b.category)}
                    </span>
                </td>
                <td class="py-3 text-sm text-slate-300">${platHtml}</td>
                <td class="py-3">
                    <span class="${priClass} px-3 py-1 rounded-full text-xs font-medium">
                        ${escapeHtml(b.priority)}
                    </span>
                </td>
                <td class="py-3">
                    <span class="${statClass} px-3 py-1 rounded-full text-xs font-medium">
                        ${escapeHtml(b.status)}
                    </span>
                </td>
                <td class="py-3 text-right">
                    <button onclick="openEditModal('${b.id}')" 
                            class="text-indigo-400 hover:text-indigo-300 mr-2 transition" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteBooking('${b.id}')" 
                            class="text-rose-400 hover:text-rose-300 transition" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;

    // Update active count
    const activeCount = document.getElementById('activeCount');
    if (activeCount) {
        if (showArchived) {
            activeCount.textContent = bookings.length + ' archived';
        } else {
            activeCount.textContent = bookings.length;
        }
    }
}

/**
 * Updates dashboard statistics
 * @param {Array} bookings - Array of booking objects
 */
function updateStats(bookings) {
    if (!bookings) bookings = allBookings;

    const total = bookings ? bookings.length : 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const today = bookings ? bookings.filter(b => b.date === todayStr).length : 0;
    const pending = bookings ? bookings.filter(b => b.status === 'Pending').length : 0;
    const categories = bookings ? [...new Set(bookings.map(b => b.category).filter(Boolean))] : [];

    const elements = {
        statTotal: document.getElementById('statTotal'),
        statToday: document.getElementById('statToday'),
        statPending: document.getElementById('statPending'),
        statCategories: document.getElementById('statCategories'),
        sidebarTotal: document.getElementById('sidebarTotal'),
        sidebarToday: document.getElementById('sidebarToday'),
        sidebarPending: document.getElementById('sidebarPending')
    };

    if (elements.statTotal) elements.statTotal.textContent = total;
    if (elements.statToday) elements.statToday.textContent = today;
    if (elements.statPending) elements.statPending.textContent = pending;
    if (elements.statCategories) elements.statCategories.textContent = categories.length;
    if (elements.sidebarTotal) elements.sidebarTotal.textContent = total;
    if (elements.sidebarToday) elements.sidebarToday.textContent = today;
    if (elements.sidebarPending) elements.sidebarPending.textContent = pending;
}

/**
 * Updates the dashboard heading based on archive view
 */
function updateDashboardHeading() {
    const heading = document.querySelector('#bookingsTable h2');
    if (heading) {
        if (showArchived) {
            heading.innerHTML = '<span class="w-2 h-8 bg-indigo-500 rounded-full"></span> <i class="fas fa-archive text-indigo-400"></i> Archived Bookings';
        } else {
            heading.innerHTML = '<span class="w-2 h-8 bg-indigo-500 rounded-full"></span> <i class="fas fa-table text-indigo-400"></i> Bookings Dashboard';
        }
    }
}

// ============================================
// CALENDAR FUNCTIONS
// ============================================

/**
 * Renders the calendar view
 */
async function renderCalendar() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const display = document.getElementById('calendarMonth');
    if (display) {
        display.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }

    try {
        const start = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
        const end = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${new Date(currentYear, currentMonth + 1, 0).getDate()}`;

        const { data, error } = await supabaseClient
            .from('bookings')
            .select('date')
            .gte('date', start)
            .lte('date', end)
            .eq('archived', false);

        if (error) {
            console.error('Calendar error:', error);
            return;
        }

        const counts = {};
        if (data) {
            data.forEach(b => {
                counts[b.date] = (counts[b.date] || 0) + 1;
            });
        }

        const container = document.getElementById('calendarDays');
        if (!container) return;
        container.innerHTML = '';

        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
        const today = new Date().toISOString().split('T')[0];

        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            const d = prevMonthDays - i;
            const div = document.createElement('div');
            div.className = 'text-center py-3 rounded-xl text-slate-500 text-sm opacity-50';
            div.textContent = d;
            container.appendChild(div);
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const count = counts[dateStr] || 0;
            const div = document.createElement('div');

            if (count > 0) {
                let bg = 'bg-indigo-400/30';
                if (count >= 3) bg = 'bg-indigo-600/50';
                else if (count >= 2) bg = 'bg-indigo-500/40';

                div.className = `text-center py-3 rounded-xl text-white font-bold ${bg} hover:bg-indigo-500/60 transition-all duration-200 cursor-pointer relative`;
                div.textContent = i;

                const badge = document.createElement('span');
                badge.className = 'absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center shadow-lg';
                badge.textContent = count;
                div.appendChild(badge);

                div.onclick = function() {
                    showBookingsForDate(dateStr);
                };
            } else {
                if (dateStr === today) {
                    div.className = 'text-center py-3 rounded-xl text-indigo-400 font-bold border border-indigo-500/30 bg-indigo-500/10';
                    div.textContent = i;
                } else {
                    div.className = 'text-center py-3 rounded-xl text-slate-300 hover:bg-slate-700/30 transition-all duration-200 cursor-pointer';
                    div.textContent = i;
                    div.onclick = function() {
                        showMessage('No bookings on this date', 'info');
                    };
                }
            }
            container.appendChild(div);
        }

        // Next month days
        const totalDays = firstDay + daysInMonth;
        const remaining = totalDays % 7 === 0 ? 0 : 7 - (totalDays % 7);
        for (let i = 1; i <= remaining; i++) {
            const div = document.createElement('div');
            div.className = 'text-center py-3 rounded-xl text-slate-500 text-sm opacity-50';
            div.textContent = i;
            container.appendChild(div);
        }

    } catch (err) {
        console.error('Calendar error:', err);
    }
}

/**
 * Shows bookings for a specific date in a modal
 * @param {string} dateStr - Date string (YYYY-MM-DD)
 */
async function showBookingsForDate(dateStr) {
    try {
        const { data, error } = await supabaseClient
            .from('bookings')
            .select('*')
            .eq('date', dateStr)
            .eq('archived', false);

        if (error) throw error;

        if (!data || data.length === 0) {
            showMessage('No bookings on this date', 'info');
            return;
        }

        const old = document.getElementById('dateBookingsModal');
        if (old) old.remove();

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4';
        modal.id = 'dateBookingsModal';

        let html = '';
        data.forEach(b => {
            const platforms = b.platforms ? b.platforms.split(',') : [];
            let platHtml = '';
            platforms.forEach(p => {
                const trimmed = p.trim().toLowerCase();
                if (PLATFORM_ICONS[trimmed]) {
                    platHtml += `<i class="${PLATFORM_ICONS[trimmed]} mr-1"></i>`;
                }
            });

            html += `
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/50 py-3 hover:bg-slate-700/20 px-3 rounded-lg transition">
                    <div>
                        <span class="font-medium text-white">${escapeHtml(b.name)}</span>
                        <span class="text-slate-400 text-sm ml-2">${escapeHtml(b.time_slot)}</span>
                        <div class="text-xs text-slate-500 mt-1">
                            <span class="badge-${b.category ? b.category.toLowerCase() : 'default'} px-2 py-0.5 rounded-full text-xs">${escapeHtml(b.category)}</span>
                            ${platHtml ? `<span class="ml-2">${platHtml}</span>` : ''}
                            <span class="ml-2">${escapeHtml(b.project_name)}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${b.status === 'Pending' ? 'text-amber-400 bg-amber-500/20' : b.status === 'Confirmed' ? 'text-emerald-400 bg-emerald-500/20' : 'text-blue-400 bg-blue-500/20'}">
                            ${escapeHtml(b.status)}
                        </span>
                        <button onclick="closeDateModal(); openEditModal('${b.id}');" 
                                class="text-indigo-400 hover:text-indigo-300 transition text-sm">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        const formatted = formatDate(dateStr);
        const dayName = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });

        modal.innerHTML = `
            <div class="bg-slate-800 rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-slate-700 shadow-2xl">
                <div class="flex justify-between items-center mb-4 sticky top-0 bg-slate-800 py-2 z-10">
                    <div>
                        <h2 class="text-xl font-bold text-white">
                            <i class="fas fa-calendar-day text-indigo-400 mr-2"></i>
                            ${dayName}, ${formatted}
                        </h2>
                        <p class="text-sm text-slate-400">${data.length} booking${data.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button onclick="closeDateModal()" class="text-slate-400 hover:text-white text-2xl transition w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="space-y-1">${html}</div>
                <div class="mt-4 pt-4 border-t border-slate-700 flex justify-between text-sm text-slate-400">
                    <span>Total: ${data.length} booking${data.length !== 1 ? 's' : ''}</span>
                    <button onclick="closeDateModal()" class="text-indigo-400 hover:text-indigo-300 transition">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.addEventListener('click', function(e) {
            if (e.target === this) closeDateModal();
        });

    } catch (err) {
        console.error('Error fetching bookings for date:', err);
        showMessage('Error loading bookings', 'error');
    }
}

function closeDateModal() {
    const modal = document.getElementById('dateBookingsModal');
    if (modal) modal.remove();
}

// ============================================
// MONTH NAVIGATION
// ============================================

function changeMonth(delta) {
    currentMonth += delta;
    if (currentMonth > 11) { currentMonth = 0;
        currentYear++; } else if (currentMonth < 0) { currentMonth = 11;
        currentYear--; }
    renderCalendar();
}

// ============================================
// AVAILABILITY CHECKING
// ============================================

async function checkAvailability() {
    const date = document.getElementById('bookingDate').value;
    const timeSlot = document.getElementById('timeSlot').value;
    const statusEl = document.getElementById('availabilityStatus');

    if (!date || !timeSlot) {
        if (statusEl) {
            statusEl.textContent = '';
            statusEl.className = '';
        }
        return;
    }

    const selected = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selected < today) {
        if (statusEl) {
            statusEl.innerHTML = 'Cannot book past dates!';
            statusEl.className = 'text-rose-400 text-sm mt-1 font-medium';
        }
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from('bookings')
            .select('id')
            .eq('date', date)
            .eq('time_slot', timeSlot)
            .eq('archived', false)
            .maybeSingle();

        if (error) throw error;

        if (statusEl) {
            if (data) {
                statusEl.innerHTML = 'This slot is already booked!';
                statusEl.className = 'text-rose-400 text-sm mt-1 font-medium';
            } else {
                statusEl.innerHTML = 'Available!';
                statusEl.className = 'text-emerald-400 text-sm mt-1 font-medium';
            }
        }
    } catch (err) {
        console.error('Error checking availability:', err);
        if (statusEl) {
            statusEl.innerHTML = 'Could not check availability';
            statusEl.className = 'text-amber-400 text-sm mt-1 font-medium';
        }
    }
}

async function updateTimeSlotOptions() {
    const date = document.getElementById('bookingDate').value;
    const select = document.getElementById('timeSlot');
    if (!select) return;

    if (!date) {
        const opts = select.querySelectorAll('option');
        opts.forEach(o => {
            if (o.value) {
                o.disabled = false;
                o.textContent = o.value.replace(' Booked', '');
            }
        });
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from('bookings')
            .select('time_slot')
            .eq('date', date)
            .eq('archived', false);

        if (error) throw error;

        const booked = data ? data.map(b => b.time_slot) : [];
        const opts = select.querySelectorAll('option');
        opts.forEach(o => {
            if (o.value) {
                if (booked.includes(o.value)) {
                    o.disabled = true;
                    o.textContent = o.value + ' Booked';
                } else {
                    o.disabled = false;
                    o.textContent = o.value.replace(' Booked', '');
                }
            }
        });
    } catch (err) {
        console.error('Error updating time slots:', err);
    }
}

// ============================================
// FORM HANDLING
// ============================================

async function handleFormSubmit(e) {
    e.preventDefault();

    // Validate platforms
    const checkboxes = document.querySelectorAll('input[name="platforms[]"]:checked');
    if (checkboxes.length === 0) {
        showMessage('Please select at least one platform.', 'error');
        return;
    }

    const btn = document.getElementById('submitBtn');
    const orig = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';

    const form = e.target;
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
        if (key === 'platforms[]') {
            if (!data.platforms) data.platforms = [];
            data.platforms.push(value);
        } else {
            data[key] = value;
        }
    });

    const result = await createBooking(data);

    if (result) {
        form.reset();
        const status = document.getElementById('availabilityStatus');
        if (status) {
            status.textContent = '';
            status.className = '';
        }
        fetchBookings();
        renderCalendar();
    }

    btn.disabled = false;
    btn.innerHTML = orig;
}

async function handleEditSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const id = document.getElementById('editId').value;
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';

    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    const result = await updateBooking(id, data);

    if (result) {
        closeEditModal();
        fetchBookings();
        renderCalendar();
    }

    btn.disabled = false;
    btn.innerHTML = orig;
}

// ============================================
// EDIT MODAL
// ============================================

function openEditModal(id) {
    const booking = allBookings.find(b => b.id == id);
    if (!booking) {
        showMessage('Booking not found', 'error');
        return;
    }

    document.getElementById('editId').value = booking.id;
    document.getElementById('editName').value = booking.name || '';
    document.getElementById('editProject').value = booking.project_name || '';
    document.getElementById('editEmail').value = booking.email || '';
    document.getElementById('editDate').value = booking.date || '';
    document.getElementById('editTimeSlot').value = booking.time_slot || '';
    document.getElementById('editCategory').value = booking.category || 'Flyer';
    document.getElementById('editPriority').value = booking.priority || 'Medium';
    document.getElementById('editStatus').value = booking.status || 'Pending';
    document.getElementById('editNote').value = booking.note || '';

    document.getElementById('editModal').classList.remove('hidden');
}

function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
}

function setupEditModal() {
    const form = document.getElementById('editForm');
    if (form) {
        form.addEventListener('submit', handleEditSubmit);
    }
}

// ============================================
// FILTER FUNCTIONS
// ============================================

function applyFilters() {
    const filters = {};
    const date = document.getElementById('filterDate').value;
    const category = document.getElementById('filterCategory').value;
    const priority = document.getElementById('filterPriority').value;
    const status = document.getElementById('filterStatus').value;
    const platform = document.getElementById('filterPlatform').value;
    const search = document.getElementById('filterSearch').value;

    if (date) filters.date = date;
    if (category) filters.category = category;
    if (priority) filters.priority = priority;
    if (status) filters.status = status;
    if (platform) filters.platform = platform;
    if (search && search.trim() !== '') filters.search = search.trim();

    fetchBookings(filters);
}

function resetFilters() {
    document.getElementById('filterDate').value = '';
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterPriority').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterPlatform').value = '';
    document.getElementById('filterSearch').value = '';

    const clear = document.getElementById('clearSearchBtn');
    if (clear) clear.classList.add('hidden');

    fetchBookings();
}

function clearSearch() {
    const input = document.getElementById('filterSearch');
    const btn = document.getElementById('clearSearchBtn');
    if (input) input.value = '';
    if (btn) btn.classList.add('hidden');
    applyFilters();
}

function toggleArchive() {
    showArchived = !showArchived;
    const btn = document.getElementById('archiveToggleBtn');
    if (btn) {
        if (showArchived) {
            btn.innerHTML = '<i class="fas fa-archive mr-1"></i> Hide Archive';
            btn.className = 'bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-xl text-sm font-bold text-white transition';
        } else {
            btn.innerHTML = '<i class="fas fa-archive mr-1"></i> Show Archive';
            btn.className = 'bg-slate-700 hover:bg-slate-600 px-6 py-2 rounded-xl text-sm font-bold text-white transition';
        }
    }
    fetchBookings();
}

// ============================================
// EVENT LISTENERS
// ============================================

function attachEventListeners() {
    const form = document.getElementById('bookingForm');
    if (form) form.addEventListener('submit', handleFormSubmit);

    const date = document.getElementById('bookingDate');
    if (date) {
        date.addEventListener('change', function() {
            checkAvailability();
            updateTimeSlotOptions();
        });
    }

    const time = document.getElementById('timeSlot');
    if (time) time.addEventListener('change', checkAvailability);
}

function setupDateValidation() {
    const date = document.getElementById('bookingDate');
    if (date) {
        date.addEventListener('change', function() {
            const selected = new Date(this.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selected < today) {
                this.setCustomValidity('Cannot select past dates');
                this.reportValidity();
            } else {
                this.setCustomValidity('');
            }
        });
    }
}

function setupSearchListeners() {
    const input = document.getElementById('filterSearch');
    if (input) {
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyFilters();
            }
        });
    }
}

// ============================================
// SIDEBAR NAVIGATION
// ============================================

function toggleSidebar() {
    const s = document.getElementById('sidebar');
    const o = document.getElementById('sidebarOverlay');
    const m = document.getElementById('menuToggle');
    if (!s) return;
    s.classList.toggle('open');
    if (o) o.classList.toggle('active');
    if (m) m.classList.toggle('open');
    document.body.style.overflow = s.classList.contains('open') ? 'hidden' : '';
}

function closeSidebar() {
    const s = document.getElementById('sidebar');
    const o = document.getElementById('sidebarOverlay');
    const m = document.getElementById('menuToggle');
    if (s) s.classList.remove('open');
    if (o) o.classList.remove('active');
    if (m) m.classList.remove('open');
    document.body.style.overflow = '';
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeSidebar();
});

function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
        const top = el.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: top, behavior: 'smooth' });
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showMessage(text, type) {
    let el = document.getElementById('flashMessage');
    if (!el) {
        el = document.createElement('div');
        el.id = 'flashMessage';
        document.body.appendChild(el);
    }

    el.textContent = text;
    el.className = 'fixed top-4 right-4 px-6 py-3 rounded-xl shadow-lg z-50 transition-all duration-500';

    if (type === 'success') el.classList.add('bg-emerald-500', 'text-white');
    else if (type === 'error') el.classList.add('bg-rose-500', 'text-white');
    else el.classList.add('bg-blue-500', 'text-white');

    el.style.display = 'block';
    el.style.transform = 'translateX(0)';

    clearTimeout(window.messageTimeout);
    window.messageTimeout = setTimeout(() => {
        el.style.transform = 'translateX(100%)';
        setTimeout(() => { el.style.display = 'none'; }, 500);
    }, 4000);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ============================================
// GLOBAL EXPOSURE FOR HTML ONCLICK
// ============================================

window.changeMonth = changeMonth;
window.toggleArchive = toggleArchive;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.deleteBooking = deleteBooking;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.clearSearch = clearSearch;
window.checkAvailability = checkAvailability;
window.showBookingsForDate = showBookingsForDate;
window.closeDateModal = closeDateModal;
window.showMessage = showMessage;
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
window.scrollToSection = scrollToSection;

console.log('All functions loaded successfully');
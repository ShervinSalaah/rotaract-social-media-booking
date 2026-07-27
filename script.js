// ============================================
// ROTARACT SOCIAL MEDIA BOOKING APP
// Custom JavaScript - Full Version
// ============================================

console.log('✅ script.js loaded successfully!');

// ============================================
// DOM READY - Initialize everything
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM fully loaded');
    attachEventListeners();
    setupEditModal();
    renderCalendar();
    updateStats();
});

// ============================================
// SETUP EVENT LISTENERS
// ============================================

function attachEventListeners() {
    // Real-time availability check
    const dateInput = document.getElementById('bookingDate');
    const timeSlotSelect = document.getElementById('timeSlot');
    
    if (dateInput) {
        dateInput.addEventListener('change', checkAvailability);
        dateInput.addEventListener('change', updateTimeSlotOptions);
        console.log('✅ Date input listener attached');
    }
    if (timeSlotSelect) {
        timeSlotSelect.addEventListener('change', checkAvailability);
        console.log('✅ Time slot listener attached');
    }

    // Handle form submission
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleFormSubmit);
        console.log('✅ Form submit listener attached');
    }

    // Filter buttons
    const applyFiltersBtn = document.querySelector('[onclick="applyFilters()"]');
    const resetFiltersBtn = document.querySelector('[onclick="resetFilters()"]');
    
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetFilters);
    }
}

// ============================================
// UPDATE TIME SLOT OPTIONS (Hide booked slots)
// ============================================

async function updateTimeSlotOptions() {
    const date = document.getElementById('bookingDate').value;
    const timeSlotSelect = document.getElementById('timeSlot');
    
    if (!date) {
        // Enable all options
        const options = timeSlotSelect.querySelectorAll('option');
        options.forEach(opt => {
            if (opt.value) opt.disabled = false;
            // Remove any suffix
            opt.textContent = opt.value.replace(' 🔴 Booked', '');
        });
        return;
    }

    try {
        // Fetch all bookings for this date (active only)
        const response = await fetch(`api/get_bookings.php?date=${date}&archived=false`);
        const bookings = await response.json();
        
        // Get booked time slots
        const bookedSlots = bookings.map(b => b.time_slot);
        
        // Update dropdown options
        const options = timeSlotSelect.querySelectorAll('option');
        options.forEach(opt => {
            if (opt.value) {
                if (bookedSlots.includes(opt.value)) {
                    opt.disabled = true;
                    opt.textContent = opt.value + ' 🔴 Booked';
                } else {
                    opt.disabled = false;
                    opt.textContent = opt.value.replace(' 🔴 Booked', '');
                }
            }
        });
        
        console.log('✅ Time slot options updated');
    } catch (error) {
        console.error('Error updating time slots:', error);
    }
}

// ============================================
// CHECK AVAILABILITY IN REAL-TIME
// ============================================

async function checkAvailability() {
    const date = document.getElementById('bookingDate').value;
    const timeSlot = document.getElementById('timeSlot').value;
    const statusEl = document.getElementById('availabilityStatus');

    if (!date || !timeSlot) {
        statusEl.textContent = '';
        statusEl.className = '';
        return;
    }

    try {
        console.log(`🔍 Checking availability for ${date} - ${timeSlot}`);
        const response = await fetch(`api/check_availability.php?date=${date}&timeSlot=${encodeURIComponent(timeSlot)}`);
        const data = await response.json();

        if (data.booked) {
            statusEl.innerHTML = '❌ This slot is already booked!';
            statusEl.className = 'text-rose-400 text-sm mt-1 font-medium';
        } else {
            statusEl.innerHTML = '✅ Available!';
            statusEl.className = 'text-emerald-400 text-sm mt-1 font-medium';
        }
    } catch (error) {
        console.error('Error checking availability:', error);
        statusEl.innerHTML = '⚠️ Could not check availability';
        statusEl.className = 'text-amber-400 text-sm mt-1 font-medium';
    }
}

// ============================================
// HANDLE FORM SUBMISSION WITH AJAX
// ============================================

async function handleFormSubmit(e) {
    e.preventDefault(); // Prevent page reload
    
    console.log('📤 Form submitted');
    
    const form = e.target;
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';
    
    // Get form data
    const formData = new FormData(form);
    const data = {};
    
    // Convert FormData to object
    formData.forEach((value, key) => {
        // Handle multiple checkboxes (platforms[])
        if (key === 'platforms[]') {
            if (!data.platforms) data.platforms = [];
            data.platforms.push(value);
        } else {
            data[key] = value;
        }
    });
    
    console.log('📦 Form data:', data);
    
    try {
        const response = await fetch('api/create_booking.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        console.log('📥 Response:', result);
        
        if (result.success) {
            // Show success message
            showMessage(result.message || '✅ Booking created successfully!', 'success');
            
            // Add the new booking to the table
            if (result.booking) {
                addBookingToTable(result.booking);
                // Update stats
                updateStats();
                // Refresh calendar
                renderCalendar();
            } else {
                // Reload page to get updated data
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
            
            // Reset form
            form.reset();
            document.getElementById('availabilityStatus').textContent = '';
            document.getElementById('availabilityStatus').className = '';
            
            // Update time slot options
            updateTimeSlotOptions();
            
        } else {
            // Show error message
            showMessage(result.error || '❌ Failed to create booking.', 'error');
        }
    } catch (error) {
        console.error('❌ Error:', error);
        showMessage('❌ Network error. Please try again.', 'error');
    } finally {
        // Restore button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// ============================================
// ADD BOOKING TO TABLE DYNAMICALLY
// ============================================

function addBookingToTable(booking) {
    const tbody = document.getElementById('bookingsTableBody');
    
    // If no bookings message is shown, clear it
    if (tbody.querySelector('td[colspan]')) {
        tbody.innerHTML = '';
    }
    
    const categoryClass = `badge-${booking.category.toLowerCase()}`;
    const priorityClass = `badge-${booking.priority.toLowerCase()}`;
    const statusClass = `badge-${booking.status.toLowerCase()}`;
    
    // Process platform icons
    const platforms = booking.platforms ? booking.platforms.split(',') : [];
    let platformHtml = '';
    const platformIcons = {
        'whatsapp': 'fab fa-whatsapp text-green-400',
        'youtube': 'fab fa-youtube text-red-500',
        'facebook': 'fab fa-facebook text-blue-500',
        'instagram': 'fab fa-instagram text-pink-500',
        'linkedin': 'fab fa-linkedin text-blue-400'
    };
    platforms.forEach(p => {
        const trimmed = p.trim();
        if (platformIcons[trimmed]) {
            platformHtml += `<i class="${platformIcons[trimmed]} mr-1" title="${trimmed.charAt(0).toUpperCase() + trimmed.slice(1)}"></i>`;
        }
    });
    
    const row = document.createElement('tr');
    row.className = 'border-b border-slate-700/50 hover:bg-slate-700/20 transition';
    row.setAttribute('data-id', booking.id);
    
    row.innerHTML = `
        <td class="py-3 font-medium text-white">${escapeHtml(booking.name)}</td>
        <td class="py-3 text-slate-300">${escapeHtml(booking.project_name)}</td>
        <td class="py-3 text-slate-300">${formatDate(booking.date)}</td>
        <td class="py-3 text-slate-300">${escapeHtml(booking.time_slot)}</td>
        <td class="py-3">
            <span class="${categoryClass} px-3 py-1 rounded-full text-xs font-medium">
                ${escapeHtml(booking.category)}
            </span>
        </td>
        <td class="py-3 text-sm text-slate-300">${platformHtml || '-'}</td>
        <td class="py-3">
            <span class="${priorityClass} px-3 py-1 rounded-full text-xs font-medium">
                ${escapeHtml(booking.priority)}
            </span>
        </td>
        <td class="py-3">
            <span class="${statusClass} px-3 py-1 rounded-full text-xs font-medium">
                ${escapeHtml(booking.status)}
            </span>
        </td>
        <td class="py-3 text-right">
            <button onclick="openEditModal(${booking.id})" 
                    class="text-indigo-400 hover:text-indigo-300 mr-2 transition" title="Edit">
                <i class="fas fa-edit"></i>
            </button>
            <button onclick="deleteBooking(${booking.id})" 
                    class="text-rose-400 hover:text-rose-300 transition" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    tbody.appendChild(row);
    console.log('✅ New booking added to table');
}

// ============================================
// UPDATE STATS CARDS
// ============================================

async function updateStats() {
    try {
        const response = await fetch('api/get_bookings.php?archived=false');
        const bookings = await response.json();
        
        const total = bookings.length;
        const today = bookings.filter(b => b.date === new Date().toISOString().split('T')[0]).length;
        const pending = bookings.filter(b => b.status === 'Pending').length;
        const categories = [...new Set(bookings.map(b => b.category))];
        
        // Update stats cards
        const statTexts = document.querySelectorAll('.glass-card .text-3xl');
        if (statTexts.length >= 4) {
            statTexts[0].textContent = total;
            statTexts[1].textContent = today;
            statTexts[2].textContent = pending;
            statTexts[3].textContent = categories.length;
        }
        
        // Update archive count
        const archivedResponse = await fetch('api/get_bookings.php?archived=true');
        const archivedBookings = await archivedResponse.json();
        const archiveCountEl = document.getElementById('archiveCount');
        if (archiveCountEl) {
            archiveCountEl.textContent = `(${archivedBookings.length} archived)`;
        }
        
        console.log('📊 Stats updated');
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// ============================================
// FILTER BOOKINGS
// ============================================

function applyFilters() {
    const date = document.getElementById('filterDate').value;
    const category = document.getElementById('filterCategory').value;
    const priority = document.getElementById('filterPriority').value;
    const status = document.getElementById('filterStatus').value;
    const search = document.getElementById('filterSearch').value;

    // Build query string
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (category) params.append('category', category);
    if (priority) params.append('priority', priority);
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    params.append('archived', 'false'); // Only show active bookings

    console.log('🔍 Applying filters:', params.toString());

    // Fetch filtered results
    fetch(`api/get_bookings.php?${params.toString()}`)
        .then(response => response.json())
        .then(data => {
            console.log('📊 Filtered data:', data);
            renderBookingsTable(data);
        })
        .catch(error => {
            console.error('Error filtering bookings:', error);
            showMessage('Failed to apply filters', 'error');
        });
}

// ============================================
// RESET FILTERS
// ============================================

function resetFilters() {
    document.getElementById('filterDate').value = '';
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterPriority').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterSearch').value = '';
    
    // Reload all bookings
    window.location.reload();
}

// ============================================
// RENDER BOOKINGS TABLE
// ============================================

function renderBookingsTable(bookings) {
    const tbody = document.getElementById('bookingsTableBody');
    
    if (!bookings || bookings.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="py-8 text-center text-slate-400">
                    <i class="fas fa-inbox text-4xl block mb-2"></i>
                    No bookings found matching your filters.
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    bookings.forEach(booking => {
        const categoryClass = `badge-${booking.category.toLowerCase()}`;
        const priorityClass = `badge-${booking.priority.toLowerCase()}`;
        const statusClass = `badge-${booking.status.toLowerCase()}`;
        
        // Process platform icons
        const platforms = booking.platforms ? booking.platforms.split(',') : [];
        let platformHtml = '';
        const platformIcons = {
            'whatsapp': 'fab fa-whatsapp text-green-400',
            'youtube': 'fab fa-youtube text-red-500',
            'facebook': 'fab fa-facebook text-blue-500',
            'instagram': 'fab fa-instagram text-pink-500',
            'linkedin': 'fab fa-linkedin text-blue-400'
        };
        platforms.forEach(p => {
            const trimmed = p.trim();
            if (platformIcons[trimmed]) {
                platformHtml += `<i class="${platformIcons[trimmed]} mr-1" title="${trimmed.charAt(0).toUpperCase() + trimmed.slice(1)}"></i>`;
            }
        });

        html += `
            <tr class="border-b border-slate-700/50 hover:bg-slate-700/20 transition" data-id="${booking.id}">
                <td class="py-3 font-medium text-white">${escapeHtml(booking.name)}</td>
                <td class="py-3 text-slate-300">${escapeHtml(booking.project_name)}</td>
                <td class="py-3 text-slate-300">${formatDate(booking.date)}</td>
                <td class="py-3 text-slate-300">${escapeHtml(booking.time_slot)}</td>
                <td class="py-3">
                    <span class="${categoryClass} px-3 py-1 rounded-full text-xs font-medium">
                        ${escapeHtml(booking.category)}
                    </span>
                </td>
                <td class="py-3 text-sm text-slate-300">${platformHtml || '-'}</td>
                <td class="py-3">
                    <span class="${priorityClass} px-3 py-1 rounded-full text-xs font-medium">
                        ${escapeHtml(booking.priority)}
                    </span>
                </td>
                <td class="py-3">
                    <span class="${statusClass} px-3 py-1 rounded-full text-xs font-medium">
                        ${escapeHtml(booking.status)}
                    </span>
                </td>
                <td class="py-3 text-right">
                    <button onclick="openEditModal(${booking.id})" 
                            class="text-indigo-400 hover:text-indigo-300 mr-2 transition" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteBooking(${booking.id})" 
                            class="text-rose-400 hover:text-rose-300 transition" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// ============================================
// OPEN EDIT MODAL - FETCH DATA FROM SERVER
// ============================================

function openEditModal(id) {
    console.log('✏️ Opening edit modal for ID:', id);
    
    // Show loading state in modal
    document.getElementById('editName').value = 'Loading...';
    document.getElementById('editProject').value = 'Loading...';
    document.getElementById('editEmail').value = 'Loading...';
    document.getElementById('editDate').value = '';
    document.getElementById('editTimeSlot').value = '';
    document.getElementById('editCategory').value = '';
    document.getElementById('editPriority').value = '';
    document.getElementById('editStatus').value = '';
    document.getElementById('editNote').value = 'Loading...';
    
    // Show modal
    const modal = document.getElementById('editModal');
    modal.classList.remove('hidden');
    
    // Fetch full booking data from server
    fetchFullBookingData(id);
}

// ============================================
// FETCH FULL BOOKING DATA FOR EDIT MODAL
// ============================================

async function fetchFullBookingData(id) {
    try {
        console.log('📤 Fetching booking data for ID:', id);
        const response = await fetch(`api/get_bookings.php?id=${id}`);
        const bookings = await response.json();
        
        console.log('📥 Booking data received:', bookings);
        
        // Find the booking with matching ID
        const booking = bookings.find(b => b.id == id);
        
        if (booking) {
            console.log('✅ Booking found:', booking);
            
            // Populate all fields with proper data
            document.getElementById('editId').value = booking.id;
            document.getElementById('editName').value = booking.name || '';
            document.getElementById('editProject').value = booking.project_name || '';
            document.getElementById('editEmail').value = booking.email || '';
            
            // Fix date format for input type="date" (YYYY-MM-DD)
            if (booking.date) {
                // If date is already in YYYY-MM-DD format
                if (booking.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    document.getElementById('editDate').value = booking.date;
                } else {
                    // Try to parse and format
                    try {
                        const dateObj = new Date(booking.date);
                        if (!isNaN(dateObj)) {
                            const year = dateObj.getFullYear();
                            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                            const day = String(dateObj.getDate()).padStart(2, '0');
                            document.getElementById('editDate').value = `${year}-${month}-${day}`;
                        }
                    } catch (e) {
                        console.error('Date parsing error:', e);
                    }
                }
            }
            
            document.getElementById('editTimeSlot').value = booking.time_slot || '';
            document.getElementById('editCategory').value = booking.category || '';
            document.getElementById('editPriority').value = booking.priority || 'Medium';
            document.getElementById('editStatus').value = booking.status || 'Pending';
            document.getElementById('editNote').value = booking.note || '';
            
            console.log('✅ Edit modal populated with data');
        } else {
            console.error('❌ Booking not found for ID:', id);
            showMessage('Error loading booking data', 'error');
            closeEditModal();
        }
    } catch (error) {
        console.error('❌ Error fetching booking data:', error);
        showMessage('Error loading booking data', 'error');
        closeEditModal();
    }
}

// ============================================
// CLOSE EDIT MODAL
// ============================================

function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
    console.log('❌ Edit modal closed');
}

// ============================================
// SETUP EDIT MODAL
// ============================================

function setupEditModal() {
    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.addEventListener('submit', handleEditSubmit);
        console.log('✅ Edit form listener attached');
    }
}

// ============================================
// HANDLE EDIT SUBMIT
// ============================================

async function handleEditSubmit(e) {
    e.preventDefault();
    
    console.log('📤 Edit form submitted');
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
    
    const formData = new FormData(form);
    const data = {};
    
    // Convert FormData to object
    formData.forEach((value, key) => {
        data[key] = value;
    });
    
    console.log('📦 Edit data:', data);
    
    try {
        const response = await fetch('api/update_booking.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        console.log('📥 Edit response:', result);
        
        if (result.success) {
            showMessage(result.message || '✅ Booking updated successfully!', 'success');
            closeEditModal();
            
            // If we have the updated booking data, update the table row
            if (result.booking) {
                updateTableRow(result.booking);
                updateStats();
                renderCalendar();
            } else {
                // Reload page to refresh data
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        } else {
            showMessage(result.error || '❌ Failed to update booking.', 'error');
        }
    } catch (error) {
        console.error('❌ Edit error:', error);
        showMessage('❌ Network error. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// ============================================
// UPDATE TABLE ROW AFTER EDIT
// ============================================

function updateTableRow(booking) {
    const row = document.querySelector(`tr[data-id="${booking.id}"]`);
    if (!row) {
        console.log('Row not found, reloading page...');
        window.location.reload();
        return;
    }
    
    const categoryClass = `badge-${booking.category.toLowerCase()}`;
    const priorityClass = `badge-${booking.priority.toLowerCase()}`;
    const statusClass = `badge-${booking.status.toLowerCase()}`;
    
    // Process platform icons
    const platforms = booking.platforms ? booking.platforms.split(',') : [];
    let platformHtml = '';
    const platformIcons = {
        'whatsapp': 'fab fa-whatsapp text-green-400',
        'youtube': 'fab fa-youtube text-red-500',
        'facebook': 'fab fa-facebook text-blue-500',
        'instagram': 'fab fa-instagram text-pink-500',
        'linkedin': 'fab fa-linkedin text-blue-400'
    };
    platforms.forEach(p => {
        const trimmed = p.trim();
        if (platformIcons[trimmed]) {
            platformHtml += `<i class="${platformIcons[trimmed]} mr-1" title="${trimmed.charAt(0).toUpperCase() + trimmed.slice(1)}"></i>`;
        }
    });
    
    // Update each cell
    const cells = row.querySelectorAll('td');
    if (cells.length >= 8) {
        cells[0].textContent = booking.name;
        cells[1].textContent = booking.project_name;
        cells[2].textContent = formatDate(booking.date);
        cells[3].textContent = booking.time_slot;
        cells[4].innerHTML = `<span class="${categoryClass} px-3 py-1 rounded-full text-xs font-medium">${escapeHtml(booking.category)}</span>`;
        cells[5].innerHTML = platformHtml || '-';
        cells[6].innerHTML = `<span class="${priorityClass} px-3 py-1 rounded-full text-xs font-medium">${escapeHtml(booking.priority)}</span>`;
        cells[7].innerHTML = `<span class="${statusClass} px-3 py-1 rounded-full text-xs font-medium">${escapeHtml(booking.status)}</span>`;
    }
    
    console.log('✅ Table row updated for ID:', booking.id);
}

// ============================================
// DELETE BOOKING
// ============================================

async function deleteBooking(id) {
    console.log('🗑️ Delete clicked for ID:', id);
    
    if (!confirm('Are you sure you want to delete this booking?')) {
        console.log('❌ Delete cancelled');
        return;
    }

    try {
        console.log('📤 Sending delete request...');
        const response = await fetch(`api/delete_booking.php?id=${id}`, {
            method: 'DELETE',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        const data = await response.json();
        console.log('📥 Delete response:', data);

        if (response.ok) {
            showMessage(data.message || '✅ Booking deleted successfully!', 'success');
            // Remove row from table
            const row = document.querySelector(`tr[data-id="${id}"]`);
            if (row) {
                row.remove();
                // Update stats
                updateStats();
                renderCalendar();
            } else {
                // Reload page if row not found
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        } else {
            showMessage(data.error || '❌ Failed to delete booking.', 'error');
        }
    } catch (error) {
        console.error('❌ Delete error:', error);
        showMessage('❌ Network error. Please try again.', 'error');
    }
}

// ============================================
// CALENDAR FUNCTIONS
// ============================================

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

/**
 * Render the calendar with proper dates and interactivity
 */
async function renderCalendar() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Update month/year display
    const monthDisplay = document.getElementById('calendarMonth');
    if (monthDisplay) {
        monthDisplay.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }
    
    // Fetch all active bookings
    try {
        const response = await fetch('api/get_bookings.php?archived=false');
        const bookings = await response.json();
        
        // Filter bookings for current month
        const monthBookings = bookings.filter(b => {
            const bookingDate = new Date(b.date);
            return bookingDate.getMonth() === currentMonth && 
                   bookingDate.getFullYear() === currentYear;
        });
        
        // Create a map of dates with bookings
        const bookingMap = {};
        monthBookings.forEach(b => {
            if (!bookingMap[b.date]) bookingMap[b.date] = [];
            bookingMap[b.date].push(b);
        });
        
        // Get calendar details
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        const calendarDays = document.getElementById('calendarDays');
        if (!calendarDays) return;
        calendarDays.innerHTML = '';
        
        // Previous month days (greyed out)
        const prevMonthDays = firstDay;
        for (let i = prevMonthDays - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const div = document.createElement('div');
            div.className = 'text-center py-3 rounded-xl text-slate-500 text-sm cursor-not-allowed opacity-50';
            div.textContent = day;
            calendarDays.appendChild(div);
        }
        
        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const div = document.createElement('div');
            div.className = 'text-center py-3 rounded-xl text-white text-sm font-medium transition-all duration-200 cursor-pointer hover:bg-slate-700/50';
            
            // Check if this date has bookings
            if (bookingMap[dateStr]) {
                const count = bookingMap[dateStr].length;
                // Highlight with different colors based on count
                if (count >= 3) {
                    div.className = 'text-center py-3 rounded-xl text-white font-bold bg-indigo-600/50 hover:bg-indigo-600/70 transition-all duration-200 cursor-pointer relative';
                } else if (count >= 2) {
                    div.className = 'text-center py-3 rounded-xl text-white font-bold bg-indigo-500/40 hover:bg-indigo-500/60 transition-all duration-200 cursor-pointer relative';
                } else {
                    div.className = 'text-center py-3 rounded-xl text-white font-bold bg-indigo-400/30 hover:bg-indigo-400/50 transition-all duration-200 cursor-pointer relative';
                }
                
                div.textContent = i;
                
                // Add count badge
                const badge = document.createElement('span');
                badge.className = 'absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center shadow-lg';
                badge.textContent = count;
                div.appendChild(badge);
                
                // Click handler to show bookings for this date
                div.onclick = (function(date, bookingsList) {
                    return function() {
                        showBookingsForDate(date, bookingsList);
                    };
                })(dateStr, bookingMap[dateStr]);
                
                // Add title attribute for tooltip
                div.title = `${count} booking${count > 1 ? 's' : ''} on this date`;
                
            } else {
                // No bookings - check if it's today
                if (dateStr === todayStr) {
                    div.className = 'text-center py-3 rounded-xl text-indigo-400 font-bold border border-indigo-500/30 bg-indigo-500/10';
                    div.textContent = i;
                } else {
                    div.className = 'text-center py-3 rounded-xl text-slate-300 hover:bg-slate-700/30 transition-all duration-200 cursor-pointer';
                    div.textContent = i;
                    // Click to show no bookings message
                    div.onclick = function() {
                        showMessage('No bookings on this date', 'info');
                    };
                }
            }
            
            calendarDays.appendChild(div);
        }
        
        // Next month days (greyed out)
        const totalDays = firstDay + daysInMonth;
        const remainingDays = totalDays % 7 === 0 ? 0 : 7 - (totalDays % 7);
        for (let i = 1; i <= remainingDays; i++) {
            const div = document.createElement('div');
            div.className = 'text-center py-3 rounded-xl text-slate-500 text-sm cursor-not-allowed opacity-50';
            div.textContent = i;
            calendarDays.appendChild(div);
        }
        
        // Add legend
        addCalendarLegend();
        
        console.log('✅ Calendar rendered successfully');
        
    } catch (error) {
        console.error('Error rendering calendar:', error);
        const calendarDays = document.getElementById('calendarDays');
        if (calendarDays) {
            calendarDays.innerHTML = `
                <div class="col-span-7 text-center py-8 text-slate-400">
                    <i class="fas fa-exclamation-circle text-2xl mb-2 block"></i>
                    Failed to load calendar data
                </div>
            `;
        }
    }
}

/**
 * Add calendar legend
 */
function addCalendarLegend() {
    // Check if legend already exists
    let legend = document.getElementById('calendarLegend');
    if (legend) {
        legend.remove();
    }
    
    const calendarGrid = document.getElementById('calendarGrid');
    if (!calendarGrid) return;
    
    legend = document.createElement('div');
    legend.id = 'calendarLegend';
    legend.className = 'flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-700/50 text-xs text-slate-400';
    legend.innerHTML = `
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
            <span>Click date to view bookings</span>
        </span>
    `;
    
    calendarGrid.parentNode.appendChild(legend);
}

/**
 * Change month with animation
 */
function changeMonth(delta) {
    currentMonth += delta;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    } else if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    
    // Add fade animation
    const calendarDays = document.getElementById('calendarDays');
    if (calendarDays) {
        calendarDays.style.opacity = '0';
        calendarDays.style.transition = 'opacity 0.3s ease';
    }
    
    renderCalendar();
    
    // Fade in
    setTimeout(() => {
        if (calendarDays) {
            calendarDays.style.opacity = '1';
        }
    }, 100);
}

/**
 * Show bookings for a specific date - Enhanced
 */
function showBookingsForDate(dateStr, bookings) {
    // Remove existing modal if any
    const existingModal = document.getElementById('dateBookingsModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn';
    modal.id = 'dateBookingsModal';
    
    const formattedDate = formatDate(dateStr);
    const dayName = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });
    
    let bookingsHtml = '';
    if (bookings && bookings.length > 0) {
        bookings.forEach((b, index) => {
            const statusColors = {
                'Pending': 'text-amber-400 bg-amber-500/20',
                'Confirmed': 'text-emerald-400 bg-emerald-500/20',
                'Completed': 'text-blue-400 bg-blue-500/20'
            };
            const statusColor = statusColors[b.status] || 'text-slate-400 bg-slate-500/20';
            
            bookingsHtml += `
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/50 py-3 hover:bg-slate-700/20 px-3 rounded-lg transition">
                    <div>
                        <span class="font-medium text-white">${escapeHtml(b.name)}</span>
                        <span class="text-slate-400 text-sm ml-2">${escapeHtml(b.time_slot)}</span>
                        <div class="text-xs text-slate-500 mt-1">
                            <span class="badge-${b.category.toLowerCase()} px-2 py-0.5 rounded-full text-xs">
                                ${escapeHtml(b.category)}
                            </span>
                            <span class="ml-2">${escapeHtml(b.project_name)}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${statusColor}">
                            ${escapeHtml(b.status)}
                        </span>
                        <button onclick="closeDateModal(); openEditModal(${b.id});" 
                                class="text-indigo-400 hover:text-indigo-300 transition text-sm" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </div>
            `;
        });
    } else {
        bookingsHtml = `
            <div class="text-center py-8 text-slate-400">
                <i class="fas fa-calendar-day text-4xl mb-3 block"></i>
                <p>No bookings on this date</p>
            </div>
        `;
    }
    
    modal.innerHTML = `
        <div class="bg-slate-800 rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-slate-700 shadow-2xl">
            <div class="flex justify-between items-center mb-4 sticky top-0 bg-slate-800 py-2 z-10">
                <div>
                    <h2 class="text-xl font-bold text-white">
                        <i class="fas fa-calendar-day text-indigo-400 mr-2"></i>
                        ${dayName}, ${formattedDate}
                    </h2>
                    <p class="text-sm text-slate-400">${bookings ? bookings.length : 0} booking${bookings && bookings.length !== 1 ? 's' : ''}</p>
                </div>
                <button onclick="closeDateModal()" class="text-slate-400 hover:text-white text-2xl transition w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="space-y-1">
                ${bookingsHtml}
            </div>
            ${bookings && bookings.length > 0 ? `
                <div class="mt-4 pt-4 border-t border-slate-700 flex justify-between text-sm text-slate-400">
                    <span>Total: ${bookings.length} booking${bookings.length > 1 ? 's' : ''}</span>
                    <button onclick="closeDateModal()" class="text-indigo-400 hover:text-indigo-300 transition">
                        Close
                    </button>
                </div>
            ` : ''}
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on backdrop click
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeDateModal();
        }
    });
}

/**
 * Close date modal
 */
function closeDateModal() {
    const modal = document.getElementById('dateBookingsModal');
    if (modal) {
        modal.style.opacity = '0';
        modal.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// ============================================
// ARCHIVE FUNCTIONS
// ============================================

let showArchived = false;

/**
 * Toggle archive view
 */
function toggleArchive() {
    showArchived = !showArchived;
    const btn = document.getElementById('archiveToggleBtn');
    
    if (showArchived) {
        btn.innerHTML = '<i class="fas fa-archive mr-1"></i> Hide Archive';
        btn.className = 'bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-xl text-sm font-bold text-white transition';
        loadBookings(true);
    } else {
        btn.innerHTML = '<i class="fas fa-archive mr-1"></i> Show Archive';
        btn.className = 'bg-slate-700 hover:bg-slate-600 px-6 py-2 rounded-xl text-sm font-bold text-white transition';
        loadBookings(false);
    }
}

/**
 * Load bookings with archive filter
 */
async function loadBookings(archived) {
    try {
        const response = await fetch(`api/get_bookings.php?archived=${archived}`);
        const bookings = await response.json();
        renderBookingsTable(bookings);
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

// ============================================
// SHOW FLASH MESSAGE
// ============================================

function showMessage(text, type) {
    // Create message element if it doesn't exist
    let messageEl = document.getElementById('flashMessage');
    if (!messageEl) {
        messageEl = document.createElement('div');
        messageEl.id = 'flashMessage';
        messageEl.className = 'fixed top-4 right-4 px-6 py-3 rounded-xl shadow-lg z-50 transition-all duration-500 transform translate-x-0';
        document.body.appendChild(messageEl);
    }
    
    messageEl.textContent = text;
    
    // Remove existing classes
    messageEl.className = 'fixed top-4 right-4 px-6 py-3 rounded-xl shadow-lg z-50 transition-all duration-500 transform translate-x-0';
    
    if (type === 'success') {
        messageEl.classList.add('bg-emerald-500', 'text-white');
    } else if (type === 'error') {
        messageEl.classList.add('bg-rose-500', 'text-white');
    } else {
        messageEl.classList.add('bg-blue-500', 'text-white');
    }
    
    messageEl.style.display = 'block';
    messageEl.style.transform = 'translateX(0)';

    // Auto-hide after 4 seconds
    clearTimeout(window.messageTimeout);
    window.messageTimeout = setTimeout(() => {
        messageEl.style.transform = 'translateX(100%)';
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 500);
    }, 4000);
}

// ============================================
// ESCAPE HTML
// ============================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// FORMAT DATE
// ============================================

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ============================================
// EXPOSE FUNCTIONS TO GLOBAL SCOPE
// ============================================

window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.deleteBooking = deleteBooking;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.checkAvailability = checkAvailability;
window.toggleArchive = toggleArchive;
window.changeMonth = changeMonth;

console.log('✅ All functions loaded successfully!');
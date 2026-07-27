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
        // Fetch all bookings for this date
        const response = await fetch(`api/get_bookings.php?date=${date}`);
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
        const response = await fetch('api/get_bookings.php');
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

console.log('✅ All functions loaded successfully!');
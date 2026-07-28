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
    setupDateValidation();
    updateStats();
    setupSearchListeners();
});

// ============================================
// SETUP SEARCH LISTENERS
// ============================================

function setupSearchListeners() {
    const searchInput = document.getElementById('filterSearch');
    const clearBtn = document.getElementById('clearSearchBtn');
    
    if (searchInput) {
        // Enter key support for search
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                console.log('🔍 Enter key pressed, applying filters...');
                applyFilters();
            }
        });
        console.log('✅ Search Enter key listener attached');
        
        // Show/hide clear button
        if (clearBtn) {
            searchInput.addEventListener('input', function() {
                if (this.value.length > 0) {
                    clearBtn.classList.remove('hidden');
                } else {
                    clearBtn.classList.add('hidden');
                }
            });
        }
    }
}

// ============================================
// SETUP DATE VALIDATION
// ============================================

function setupDateValidation() {
    const bookingDateInput = document.getElementById('bookingDate');
    if (bookingDateInput) {
        bookingDateInput.addEventListener('change', function() {
            validateDateSelection(this);
            checkAvailability();
            updateTimeSlotOptions();
        });
    }
    
    const editDateInput = document.getElementById('editDate');
    if (editDateInput) {
        editDateInput.addEventListener('change', function() {
            validateDateSelection(this);
        });
    }
}

// ============================================
// VALIDATE DATE - PAST DATES RESTRICTION
// ============================================

function validateDateSelection(dateInput) {
    const selectedDate = new Date(dateInput.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        dateInput.setCustomValidity('❌ You cannot select a past date. Please choose today or a future date.');
        dateInput.reportValidity();
        return false;
    } else {
        dateInput.setCustomValidity('');
        return true;
    }
}

// ============================================
// SETUP EVENT LISTENERS
// ============================================

function attachEventListeners() {
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

    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleFormSubmit);
        console.log('✅ Form submit listener attached');
    }

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
// CLEAR SEARCH
// ============================================

function clearSearch() {
    const searchInput = document.getElementById('filterSearch');
    const clearBtn = document.getElementById('clearSearchBtn');
    
    if (searchInput) {
        searchInput.value = '';
        if (clearBtn) {
            clearBtn.classList.add('hidden');
        }
        applyFilters();
    }
}

// ============================================
// CALENDAR NAVIGATION
// ============================================

function changeMonth(delta) {
    console.log('📅 changeMonth called with delta:', delta);
    
    const monthDisplay = document.getElementById('calendarMonth');
    if (!monthDisplay) {
        console.error('❌ calendarMonth element not found');
        return;
    }
    
    // Get current month/year from display
    const parts = monthDisplay.textContent.trim().split(' ');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    let currentMonth = monthNames.indexOf(parts[0]);
    let currentYear = parseInt(parts[1]);
    
    if (isNaN(currentMonth) || isNaN(currentYear)) {
        console.error('❌ Invalid month/year from display:', monthDisplay.textContent);
        return;
    }
    
    // Calculate new month/year
    currentMonth += delta;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    } else if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    
    console.log('📅 Navigating to:', currentMonth + 1, currentYear);
    
    // Reload page with new month/year parameters
    window.location.href = `index.php?month=${currentMonth + 1}&year=${currentYear}`;
}

// ============================================
// ARCHIVE TOGGLE
// ============================================

let showArchived = false;

function toggleArchive() {
    console.log('📦 toggleArchive called, current state:', showArchived);
    
    showArchived = !showArchived;
    const btn = document.getElementById('archiveToggleBtn');
    
    if (!btn) {
        console.error('❌ archiveToggleBtn not found');
        return;
    }
    
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

async function loadBookings(archived) {
    console.log('📊 loadBookings called with archived:', archived);
    
    try {
        const response = await fetch(`api/get_bookings.php?archived=${archived ? 'true' : 'false'}`);
        if (!response.ok) {
            throw new Error('Failed to fetch bookings');
        }
        const bookings = await response.json();
        console.log('📊 Bookings loaded:', bookings.length);
        renderBookingsTable(bookings);
        
        // Update the heading
        const heading = document.querySelector('.glass-card:last-of-type h2');
        if (heading) {
            if (archived) {
                heading.textContent = '📦 Archived Bookings';
            } else {
                heading.textContent = '📋 Active Bookings';
            }
        }
        
        // Update the count
        const totalSpan = document.getElementById('archiveCount');
        if (totalSpan) {
            if (archived) {
                totalSpan.textContent = `(${bookings.length} archived)`;
            } else {
                const activeResponse = await fetch('api/get_bookings.php?archived=false');
                const activeBookings = await activeResponse.json();
                totalSpan.textContent = `(${activeBookings.length} active)`;
            }
        }
    } catch (error) {
        console.error('❌ Error loading bookings:', error);
        showMessage('Failed to load archived bookings', 'error');
    }
}

// ============================================
// SHOW BOOKING DETAILS FOR A DATE
// ============================================

function showBookingDetails(dateStr) {
    console.log('📅 showBookingDetails called for:', dateStr);
    
    // Remove existing modal
    const existingModal = document.getElementById('dateBookingsModal');
    if (existingModal) existingModal.remove();
    
    // Fetch bookings for this date
    fetch(`api/get_bookings.php?date=${dateStr}&archived=false`)
        .then(response => response.json())
        .then(bookings => {
            if (bookings.length === 0) {
                showMessage('No bookings on this date', 'info');
                return;
            }
            
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4';
            modal.id = 'dateBookingsModal';
            
            const formattedDate = formatDate(dateStr);
            const dayName = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });
            
            let bookingsHtml = '';
            bookings.forEach(b => {
                bookingsHtml += `
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/50 py-3 hover:bg-slate-700/20 px-3 rounded-lg transition">
                        <div>
                            <span class="font-medium text-white">${escapeHtml(b.name)}</span>
                            <span class="text-slate-400 text-sm ml-2">${escapeHtml(b.time_slot)}</span>
                            <div class="text-xs text-slate-500 mt-1">
                                <span class="badge-${b.category.toLowerCase()} px-2 py-0.5 rounded-full text-xs">${escapeHtml(b.category)}</span>
                                <span class="ml-2">${escapeHtml(b.project_name)}</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="px-2 py-1 rounded-full text-xs font-medium ${b.status === 'Pending' ? 'text-amber-400 bg-amber-500/20' : b.status === 'Confirmed' ? 'text-emerald-400 bg-emerald-500/20' : 'text-blue-400 bg-blue-500/20'}">
                                ${escapeHtml(b.status)}
                            </span>
                            <button onclick="closeDateModal(); openEditModal(${b.id});" 
                                    class="text-indigo-400 hover:text-indigo-300 transition text-sm">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
            
            modal.innerHTML = `
                <div class="bg-slate-800 rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-slate-700 shadow-2xl">
                    <div class="flex justify-between items-center mb-4 sticky top-0 bg-slate-800 py-2 z-10">
                        <div>
                            <h2 class="text-xl font-bold text-white">
                                <i class="fas fa-calendar-day text-indigo-400 mr-2"></i>
                                ${dayName}, ${formattedDate}
                            </h2>
                            <p class="text-sm text-slate-400">${bookings.length} booking${bookings.length !== 1 ? 's' : ''}</p>
                        </div>
                        <button onclick="closeDateModal()" class="text-slate-400 hover:text-white text-2xl transition w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="space-y-1">${bookingsHtml}</div>
                    <div class="mt-4 pt-4 border-t border-slate-700 flex justify-between text-sm text-slate-400">
                        <span>Total: ${bookings.length} booking${bookings.length !== 1 ? 's' : ''}</span>
                        <button onclick="closeDateModal()" class="text-indigo-400 hover:text-indigo-300 transition">Close</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Close on backdrop click
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeDateModal();
                }
            });
        })
        .catch(error => {
            console.error('Error fetching bookings:', error);
            showMessage('Error loading bookings', 'error');
        });
}

// ============================================
// CLOSE DATE MODAL
// ============================================

function closeDateModal() {
    const modal = document.getElementById('dateBookingsModal');
    if (modal) modal.remove();
}

// ============================================
// UPDATE TIME SLOT OPTIONS
// ============================================

async function updateTimeSlotOptions() {
    const date = document.getElementById('bookingDate').value;
    const timeSlotSelect = document.getElementById('timeSlot');
    
    if (!date) {
        const options = timeSlotSelect.querySelectorAll('option');
        options.forEach(opt => {
            if (opt.value) {
                opt.disabled = false;
                opt.textContent = opt.value.replace(' 🔴 Booked', '');
            }
        });
        return;
    }

    try {
        const response = await fetch(`api/get_bookings.php?date=${date}&archived=false`);
        const bookings = await response.json();
        const bookedSlots = bookings.map(b => b.time_slot);
        
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
    } catch (error) {
        console.error('Error updating time slots:', error);
    }
}

// ============================================
// CHECK AVAILABILITY
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

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        statusEl.innerHTML = '❌ Cannot book past dates!';
        statusEl.className = 'text-rose-400 text-sm mt-1 font-medium';
        return;
    }

    try {
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
// HANDLE FORM SUBMISSION
// ============================================

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    
    const dateInput = document.getElementById('bookingDate');
    if (!validateDateSelection(dateInput)) {
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';
    
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
        
        if (result.success) {
            showMessage(result.message || '✅ Booking created successfully!', 'success');
            
            if (result.booking) {
                addBookingToTable(result.booking);
                updateStats();
            }
            
            form.reset();
            document.getElementById('availabilityStatus').textContent = '';
            document.getElementById('availabilityStatus').className = '';
            updateTimeSlotOptions();
            
            setTimeout(() => {
                window.location.reload();
            }, 1500);
            
        } else {
            showMessage(result.error || '❌ Failed to create booking.', 'error');
        }
    } catch (error) {
        console.error('❌ Error:', error);
        showMessage('❌ Network error. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// ============================================
// ADD BOOKING TO TABLE
// ============================================

function addBookingToTable(booking) {
    const tbody = document.getElementById('bookingsTableBody');
    
    if (tbody.querySelector('td[colspan]')) {
        tbody.innerHTML = '';
    }
    
    const categoryClass = `badge-${booking.category.toLowerCase()}`;
    const priorityClass = `badge-${booking.priority.toLowerCase()}`;
    const statusClass = `badge-${booking.status.toLowerCase()}`;
    
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
}

// ============================================
// UPDATE STATS
// ============================================

async function updateStats() {
    try {
        const response = await fetch('api/get_bookings.php?archived=false');
        const bookings = await response.json();
        
        const total = bookings.length;
        const today = bookings.filter(b => b.date === new Date().toISOString().split('T')[0]).length;
        const pending = bookings.filter(b => b.status === 'Pending').length;
        const categories = [...new Set(bookings.map(b => b.category))];
        
        const statTexts = document.querySelectorAll('.glass-card .text-3xl');
        if (statTexts.length >= 4) {
            statTexts[0].textContent = total;
            statTexts[1].textContent = today;
            statTexts[2].textContent = pending;
            statTexts[3].textContent = categories.length;
        }
        
        const archivedResponse = await fetch('api/get_bookings.php?archived=true');
        const archivedBookings = await archivedResponse.json();
        const archiveCountEl = document.getElementById('archiveCount');
        if (archiveCountEl) {
            archiveCountEl.textContent = `(${archivedBookings.length} archived)`;
        }
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// ============================================
// FILTERS - WITH WORKING SEARCH
// ============================================

function applyFilters() {
    // Get filter values
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
    
    // IMPORTANT: Always include search if it has any value (including spaces)
    if (search !== undefined && search !== null) {
        const searchTrimmed = search.trim();
        if (searchTrimmed !== '') {
            params.append('search', searchTrimmed);
        }
    }
    
    // Always include archived parameter
    params.append('archived', 'false');

    console.log('🔍 Applying filters with params:', params.toString());

    // Fetch filtered results
    fetch(`api/get_bookings.php?${params.toString()}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('📊 Filtered data count:', data.length);
            renderBookingsTable(data);
            
            // Show message if no results
            if (data.length === 0) {
                showMessage('No bookings found matching your filters', 'info');
            }
        })
        .catch(error => {
            console.error('❌ Error filtering bookings:', error);
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
    
    const clearBtn = document.getElementById('clearSearchBtn');
    if (clearBtn) {
        clearBtn.classList.add('hidden');
    }
    
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
                    No bookings found.
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
// EDIT MODAL FUNCTIONS
// ============================================

function openEditModal(id) {
    console.log('✏️ Opening edit modal for ID:', id);
    
    document.getElementById('editName').value = 'Loading...';
    document.getElementById('editProject').value = 'Loading...';
    document.getElementById('editEmail').value = 'Loading...';
    document.getElementById('editDate').value = '';
    document.getElementById('editTimeSlot').value = '';
    document.getElementById('editCategory').value = '';
    document.getElementById('editPriority').value = '';
    document.getElementById('editStatus').value = '';
    document.getElementById('editNote').value = 'Loading...';
    
    const modal = document.getElementById('editModal');
    modal.classList.remove('hidden');
    
    fetchFullBookingData(id);
}

async function fetchFullBookingData(id) {
    try {
        const response = await fetch(`api/get_bookings.php?id=${id}`);
        const bookings = await response.json();
        const booking = bookings.find(b => b.id == id);
        
        if (booking) {
            document.getElementById('editId').value = booking.id;
            document.getElementById('editName').value = booking.name || '';
            document.getElementById('editProject').value = booking.project_name || '';
            document.getElementById('editEmail').value = booking.email || '';
            
            if (booking.date) {
                if (booking.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    document.getElementById('editDate').value = booking.date;
                } else {
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
        } else {
            showMessage('Error loading booking data', 'error');
            closeEditModal();
        }
    } catch (error) {
        console.error('Error fetching booking data:', error);
        showMessage('Error loading booking data', 'error');
        closeEditModal();
    }
}

function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
}

function setupEditModal() {
    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.addEventListener('submit', handleEditSubmit);
    }
}

async function handleEditSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    const dateInput = document.getElementById('editDate');
    if (!validateDateSelection(dateInput)) {
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
    
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });
    
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
        
        if (result.success) {
            showMessage(result.message || '✅ Booking updated successfully!', 'success');
            closeEditModal();
            
            if (result.booking) {
                updateTableRow(result.booking);
                updateStats();
            }
            
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            showMessage(result.error || '❌ Failed to update booking.', 'error');
        }
    } catch (error) {
        console.error('Edit error:', error);
        showMessage('❌ Network error. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

function updateTableRow(booking) {
    const row = document.querySelector(`tr[data-id="${booking.id}"]`);
    if (!row) {
        window.location.reload();
        return;
    }
    
    const categoryClass = `badge-${booking.category.toLowerCase()}`;
    const priorityClass = `badge-${booking.priority.toLowerCase()}`;
    const statusClass = `badge-${booking.status.toLowerCase()}`;
    
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
}

// ============================================
// DELETE BOOKING
// ============================================

async function deleteBooking(id) {
    if (!confirm('Are you sure you want to delete this booking?')) return;

    try {
        const response = await fetch(`api/delete_booking.php?id=${id}`, {
            method: 'DELETE',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(data.message || '✅ Booking deleted successfully!', 'success');
            const row = document.querySelector(`tr[data-id="${id}"]`);
            if (row) {
                row.remove();
                updateStats();
            }
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            showMessage(data.error || '❌ Failed to delete booking.', 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showMessage('❌ Network error. Please try again.', 'error');
    }
}

// ============================================
// SHOW FLASH MESSAGE
// ============================================

function showMessage(text, type) {
    let messageEl = document.getElementById('flashMessage');
    if (!messageEl) {
        messageEl = document.createElement('div');
        messageEl.id = 'flashMessage';
        messageEl.className = 'fixed top-4 right-4 px-6 py-3 rounded-xl shadow-lg z-50 transition-all duration-500 transform translate-x-0';
        document.body.appendChild(messageEl);
    }
    
    messageEl.textContent = text;
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

    clearTimeout(window.messageTimeout);
    window.messageTimeout = setTimeout(() => {
        messageEl.style.transform = 'translateX(100%)';
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 500);
    }, 4000);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

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
// EXPOSE FUNCTIONS TO GLOBAL SCOPE
// ============================================

// Make sure all functions are accessible globally
window.changeMonth = changeMonth;
window.toggleArchive = toggleArchive;
window.loadBookings = loadBookings;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.deleteBooking = deleteBooking;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.clearSearch = clearSearch;
window.checkAvailability = checkAvailability;
window.showBookingDetails = showBookingDetails;
window.closeDateModal = closeDateModal;
window.showMessage = showMessage;

console.log('✅ All functions exposed to global scope!');
console.log('✅ changeMonth available:', typeof window.changeMonth);
console.log('✅ toggleArchive available:', typeof window.toggleArchive);
console.log('✅ applyFilters available:', typeof window.applyFilters);
console.log('✅ clearSearch available:', typeof window.clearSearch);
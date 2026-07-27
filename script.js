// ============================================
// ROTARACT SOCIAL MEDIA BOOKING APP
// Custom JavaScript
// ============================================

/**
 * Load bookings on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    // No need to fetch again since PHP already loaded data
    // But we need to attach event listeners
    attachEventListeners();
});

/**
 * Attach all event listeners
 */
function attachEventListeners() {
    // Real-time availability check
    const dateInput = document.getElementById('bookingDate');
    const timeSlotSelect = document.getElementById('timeSlot');
    
    if (dateInput) {
        dateInput.addEventListener('change', checkAvailability);
    }
    if (timeSlotSelect) {
        timeSlotSelect.addEventListener('change', checkAvailability);
    }
}

/**
 * Check availability in real-time
 */
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
        const response = await fetch(`api/check_availability.php?date=${date}&timeSlot=${encodeURIComponent(timeSlot)}`);
        const data = await response.json();

        if (data.booked) {
            statusEl.textContent = '❌ This slot is already booked!';
            statusEl.className = 'text-rose-400 text-sm mt-1';
        } else {
            statusEl.textContent = '✅ Available!';
            statusEl.className = 'text-emerald-400 text-sm mt-1';
        }
    } catch (error) {
        console.error('Error checking availability:', error);
        statusEl.textContent = '⚠️ Could not check availability';
        statusEl.className = 'text-amber-400 text-sm mt-1';
    }
}

/**
 * Apply filters to bookings table
 */
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

    // Fetch filtered results
    fetch(`api/get_bookings.php?${params.toString()}`)
        .then(response => response.json())
        .then(data => {
            renderBookingsTable(data);
        })
        .catch(error => {
            console.error('Error filtering bookings:', error);
            showMessage('Failed to apply filters', 'error');
        });
}

/**
 * Reset all filters
 */
function resetFilters() {
    document.getElementById('filterDate').value = '';
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterPriority').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterSearch').value = '';
    
    // Reload all bookings
    window.location.reload();
}

/**
 * Render bookings table with data
 */
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

/**
 * Delete booking with confirmation
 */
async function deleteBooking(id) {
    if (!confirm('Are you sure you want to delete this booking?')) return;

    try {
        const response = await fetch(`api/delete_booking.php?id=${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(data.message || '✅ Booking deleted successfully!', 'success');
            // Reload page to refresh data
            window.location.reload();
        } else {
            showMessage(data.error || '❌ Failed to delete booking.', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('❌ Network error. Please try again.', 'error');
    }
}

/**
 * Open edit modal with booking data
 */
function openEditModal(id) {
    // Get the row data
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (!row) return;

    const cells = row.querySelectorAll('td');
    
    // Fill modal fields
    document.getElementById('editId').value = id;
    document.getElementById('editName').value = cells[0].textContent.trim();
    document.getElementById('editProject').value = cells[1].textContent.trim();
    document.getElementById('editEmail').value = cells[1].textContent.trim(); // Need to store email in data attribute
    document.getElementById('editDate').value = cells[2].textContent.trim(); // Need to format properly
    document.getElementById('editTimeSlot').value = cells[3].textContent.trim();
    document.getElementById('editCategory').value = cells[4].textContent.trim();
    document.getElementById('editPriority').value = cells[6].textContent.trim();
    document.getElementById('editStatus').value = cells[7].textContent.trim();
    document.getElementById('editNote').value = cells[8] ? cells[8].textContent.trim() : '';

    // Show modal
    document.getElementById('editModal').classList.remove('hidden');
}

/**
 * Close edit modal
 */
function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
}

/**
 * Show flash message
 */
function showMessage(text, type) {
    const messageEl = document.getElementById('message');
    if (!messageEl) return;
    
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 5000);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Format date
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
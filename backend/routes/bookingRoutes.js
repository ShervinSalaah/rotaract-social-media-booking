const express = require('express');
const router = express.Router();
const controller = require('../controllers/bookingController');

// Main page - render EJS view
router.get('/', controller.getIndex);

// API routes (AJAX calls)
router.get('/api/bookings', controller.filterBookings);
router.get('/api/check-availability', controller.checkAvailability);
router.get('/api/calendar', controller.getCalendarData);

// CRUD operations
router.post('/bookings', controller.createBooking);
router.post('/bookings/:id/update', controller.updateBooking);
router.get('/bookings/:id/delete', controller.deleteBooking);

module.exports = router;
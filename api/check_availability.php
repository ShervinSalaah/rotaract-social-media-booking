<?php
// ============================================
// ROTARACT SOCIAL MEDIA BOOKING APP
// API: Check Availability
// ============================================

// Include database configuration
require_once '../config/database.php';

// Set JSON response header
header('Content-Type: application/json');

// ============================================
// GET PARAMETERS
// ============================================

$date = isset($_GET['date']) ? sanitize($_GET['date']) : '';
$time_slot = isset($_GET['timeSlot']) ? sanitize($_GET['timeSlot']) : '';

// ============================================
// VALIDATE PARAMETERS
// ============================================

if (empty($date) || empty($time_slot)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Date and time slot are required'
    ]);
    exit;
}

if (!validateDate($date)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid date format'
    ]);
    exit;
}

// ============================================
// CHECK AVAILABILITY
// ============================================

try {
    $pdo = getDBConnection();
    
    $sql = "SELECT id FROM bookings WHERE date = :date AND time_slot = :time_slot";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':date' => $date,
        ':time_slot' => $time_slot
    ]);
    
    $is_booked = $stmt->rowCount() > 0;
    
    echo json_encode([
        'available' => !$is_booked,
        'booked' => $is_booked,
        'date' => $date,
        'time_slot' => $time_slot
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
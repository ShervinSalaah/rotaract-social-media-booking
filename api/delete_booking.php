<?php
// ============================================
// ROTARACT SOCIAL MEDIA BOOKING APP
// API: Delete Booking
// ============================================

// Start session for flash messages
session_start();

// Include database configuration
require_once '../config/database.php';

// Set JSON response header
header('Content-Type: application/json');

// ============================================
// GET BOOKING ID
// ============================================

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id <= 0) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid booking ID'
    ]);
    exit;
}

// ============================================
// DELETE BOOKING
// ============================================

try {
    $pdo = getDBConnection();
    
    // First check if booking exists
    $check_sql = "SELECT id FROM bookings WHERE id = :id";
    $check_stmt = $pdo->prepare($check_sql);
    $check_stmt->execute([':id' => $id]);
    
    if ($check_stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Booking not found'
        ]);
        exit;
    }
    
    // Delete the booking
    $sql = "DELETE FROM bookings WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([':id' => $id]);
    
    if ($result) {
        $_SESSION['success'] = '✅ Booking deleted successfully!';
        echo json_encode([
            'success' => true,
            'message' => '✅ Booking deleted successfully!',
            'id' => $id,
            'redirect' => '../index.php'
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => '❌ Failed to delete booking.'
        ]);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
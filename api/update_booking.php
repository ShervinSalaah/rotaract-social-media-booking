<?php
// ============================================
// ROTARACT SOCIAL MEDIA BOOKING APP
// API: Update Booking
// ============================================

// Start session for flash messages
session_start();

// Include database configuration
require_once '../config/database.php';

// Set JSON response header
header('Content-Type: application/json');

// ============================================
// GET POST DATA
// ============================================

$data = json_decode(file_get_contents('php://input'), true);

// If no JSON data, try POST data
if (!$data) {
    $data = $_POST;
}

// ============================================
// VALIDATE REQUIRED FIELDS
// ============================================

$required_fields = ['id', 'name', 'project_name', 'email', 'date', 'time_slot', 'category'];
$errors = [];

foreach ($required_fields as $field) {
    if (!isset($data[$field]) || empty(trim($data[$field]))) {
        $errors[] = "$field is required";
    }
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Missing required fields',
        'fields' => $errors
    ]);
    exit;
}

// ============================================
// SANITIZE INPUT
// ============================================

$id = intval($data['id']);
$name = sanitize($data['name']);
$project_name = sanitize($data['project_name']);
$email = sanitize($data['email']);
$date = sanitize($data['date']);
$time_slot = sanitize($data['time_slot']);
$category = sanitize($data['category']);
$note = isset($data['note']) ? sanitize($data['note']) : '';
$priority = isset($data['priority']) ? sanitize($data['priority']) : 'Medium';
$status = isset($data['status']) ? sanitize($data['status']) : 'Pending';

// ============================================
// VALIDATE EMAIL
// ============================================

if (!validateEmail($email)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid email address'
    ]);
    exit;
}

// ============================================
// VALIDATE DATE
// ============================================

if (!validateDate($date)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid date format. Use YYYY-MM-DD'
    ]);
    exit;
}

// ============================================
// UPDATE BOOKING
// ============================================

try {
    $pdo = getDBConnection();
    
    // Check if booking exists
    $check_sql = "SELECT id, date, time_slot FROM bookings WHERE id = :id";
    $check_stmt = $pdo->prepare($check_sql);
    $check_stmt->execute([':id' => $id]);
    $existing = $check_stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$existing) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Booking not found'
        ]);
        exit;
    }
    
    // Check for duplicate slot (excluding current booking)
    if ($date !== $existing['date'] || $time_slot !== $existing['time_slot']) {
        $duplicate_sql = "SELECT id FROM bookings WHERE date = :date AND time_slot = :time_slot AND id != :id";
        $duplicate_stmt = $pdo->prepare($duplicate_sql);
        $duplicate_stmt->execute([
            ':date' => $date,
            ':time_slot' => $time_slot,
            ':id' => $id
        ]);
        
        if ($duplicate_stmt->rowCount() > 0) {
            http_response_code(409);
            echo json_encode([
                'success' => false,
                'error' => '❌ This time slot is already booked. Please choose another.'
            ]);
            exit;
        }
    }
    
    // Update booking
    $sql = "UPDATE bookings SET 
            name = :name,
            project_name = :project_name,
            email = :email,
            date = :date,
            time_slot = :time_slot,
            category = :category,
            note = :note,
            priority = :priority,
            status = :status
            WHERE id = :id";
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([
        ':name' => $name,
        ':project_name' => $project_name,
        ':email' => $email,
        ':date' => $date,
        ':time_slot' => $time_slot,
        ':category' => $category,
        ':note' => $note,
        ':priority' => $priority,
        ':status' => $status,
        ':id' => $id
    ]);
    
    if ($result) {
        // Fetch updated booking data
        $get_sql = "SELECT * FROM bookings WHERE id = :id";
        $get_stmt = $pdo->prepare($get_sql);
        $get_stmt->execute([':id' => $id]);
        $updated_booking = $get_stmt->fetch(PDO::FETCH_ASSOC);
        
        $_SESSION['success'] = '✅ Booking updated successfully!';
        echo json_encode([
            'success' => true,
            'message' => '✅ Booking updated successfully!',
            'id' => $id,
            'booking' => $updated_booking
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => '❌ Failed to update booking.'
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
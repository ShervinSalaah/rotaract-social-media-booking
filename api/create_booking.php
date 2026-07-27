<?php
// ============================================
// ROTARACT SOCIAL MEDIA BOOKING APP
// API: Create Booking
// ============================================

// Start session for flash messages
session_start();

// Include database configuration
require_once '../config/database.php';

// Set JSON response header
header('Content-Type: application/json');

// ============================================
// CHECK IF IT'S AN AJAX REQUEST
// ============================================

$isAjax = isset($_SERVER['HTTP_X_REQUESTED_WITH']) && 
          strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';

// If not AJAX, redirect on success
if (!$isAjax) {
    // Handle as normal form submission (redirect)
    // ... (we'll keep this for backward compatibility)
}

// ============================================
// GET POST DATA
// ============================================

// Get JSON data from request body
$data = json_decode(file_get_contents('php://input'), true);

// If no JSON data, try POST data
if (!$data) {
    $data = $_POST;
}

// ============================================
// VALIDATE REQUIRED FIELDS
// ============================================

$required_fields = ['name', 'project_name', 'email', 'date', 'time_slot', 'category'];
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

$name = sanitize($data['name']);
$project_name = sanitize($data['project_name']);
$email = sanitize($data['email']);
$date = sanitize($data['date']);
$time_slot = sanitize($data['time_slot']);
$category = sanitize($data['category']);
$note = isset($data['note']) ? sanitize($data['note']) : '';
$priority = isset($data['priority']) ? sanitize($data['priority']) : 'Medium';
$status = isset($data['status']) ? sanitize($data['status']) : 'Pending';

// Process platforms (array to comma-separated string)
$platforms = isset($data['platforms']) ? $data['platforms'] : [];
if (is_array($platforms)) {
    $platforms_str = implode(',', array_map('sanitize', $platforms));
} else {
    $platforms_str = sanitize($platforms);
}

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
// CHECK FOR DUPLICATE BOOKING
// ============================================

try {
    $pdo = getDBConnection();
    
    // Check if slot is already booked
    $check_sql = "SELECT id FROM bookings WHERE date = :date AND time_slot = :time_slot";
    $check_stmt = $pdo->prepare($check_sql);
    $check_stmt->execute([
        ':date' => $date,
        ':time_slot' => $time_slot
    ]);
    
    if ($check_stmt->rowCount() > 0) {
        http_response_code(409); // Conflict
        echo json_encode([
            'success' => false,
            'error' => '❌ This time slot is already booked. Please choose another.',
            'date' => $date,
            'time_slot' => $time_slot
        ]);
        exit;
    }
    
    // ============================================
    // INSERT BOOKING
    // ============================================
    
    $sql = "INSERT INTO bookings (name, project_name, email, date, time_slot, category, platforms, note, priority, status) 
            VALUES (:name, :project_name, :email, :date, :time_slot, :category, :platforms, :note, :priority, :status)";
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([
        ':name' => $name,
        ':project_name' => $project_name,
        ':email' => $email,
        ':date' => $date,
        ':time_slot' => $time_slot,
        ':category' => $category,
        ':platforms' => $platforms_str,
        ':note' => $note,
        ':priority' => $priority,
        ':status' => $status
    ]);
    
    if ($result) {
        $booking_id = $pdo->lastInsertId();
        
        // Get the newly created booking data
        $get_sql = "SELECT * FROM bookings WHERE id = :id";
        $get_stmt = $pdo->prepare($get_sql);
        $get_stmt->execute([':id' => $booking_id]);
        $new_booking = $get_stmt->fetch(PDO::FETCH_ASSOC);
        
        // Store success message in session
        $_SESSION['success'] = '✅ Booking created successfully!';
        
        // Return JSON with the new booking data
        echo json_encode([
            'success' => true,
            'message' => '✅ Booking created successfully!',
            'booking_id' => $booking_id,
            'booking' => $new_booking,
            'redirect' => '../index.php'
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => '❌ Failed to create booking. Please try again.'
        ]);
    }
    
} catch (PDOException $e) {
    // Check if it's a duplicate key error (MySQL error code 23000 or 1062)
    if ($e->errorInfo[1] == 1062) {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'error' => '❌ This time slot is already booked. Please choose another.'
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Database error: ' . $e->getMessage()
        ]);
    }
}
?>
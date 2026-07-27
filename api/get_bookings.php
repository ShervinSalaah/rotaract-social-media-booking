<?php
// ============================================
// ROTARACT SOCIAL MEDIA BOOKING APP
// API: Get Bookings with Filters
// ============================================

// Include database configuration
require_once '../config/database.php';

// Set JSON response header
header('Content-Type: application/json');

// ============================================
// GET FILTERS FROM QUERY STRING
// ============================================

$filters = [];

if (isset($_GET['date']) && !empty($_GET['date'])) {
    $filters['date'] = sanitize($_GET['date']);
}
if (isset($_GET['category']) && !empty($_GET['category'])) {
    $filters['category'] = sanitize($_GET['category']);
}
if (isset($_GET['priority']) && !empty($_GET['priority'])) {
    $filters['priority'] = sanitize($_GET['priority']);
}
if (isset($_GET['status']) && !empty($_GET['status'])) {
    $filters['status'] = sanitize($_GET['status']);
}
if (isset($_GET['search']) && !empty($_GET['search'])) {
    $filters['search'] = sanitize($_GET['search']);
}

// ============================================
// BUILD SQL QUERY
// ============================================

try {
    $pdo = getDBConnection();
    
    // Start building query
    $sql = "SELECT * FROM bookings WHERE 1=1";
    $params = [];
    
    // Apply filters
    if (isset($filters['date'])) {
        $sql .= " AND date = :date";
        $params[':date'] = $filters['date'];
    }
    
    if (isset($filters['category'])) {
        $sql .= " AND category = :category";
        $params[':category'] = $filters['category'];
    }
    
    if (isset($filters['priority'])) {
        $sql .= " AND priority = :priority";
        $params[':priority'] = $filters['priority'];
    }
    
    if (isset($filters['status'])) {
        $sql .= " AND status = :status";
        $params[':status'] = $filters['status'];
    }
    
    if (isset($filters['search'])) {
        $sql .= " AND (name LIKE :search OR project_name LIKE :search)";
        $params[':search'] = '%' . $filters['search'] . '%';
    }
    
    // Order by date and time
    $sql .= " ORDER BY date ASC, time_slot ASC";
    
    // Execute query
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Return results
    echo json_encode($bookings);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
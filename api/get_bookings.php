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

// Support ID filter (for edit modal)
if (isset($_GET['id']) && !empty($_GET['id'])) {
    $filters['id'] = intval($_GET['id']);
}

// Date filter
if (isset($_GET['date']) && !empty($_GET['date'])) {
    $filters['date'] = sanitize($_GET['date']);
}

// Category filter
if (isset($_GET['category']) && !empty($_GET['category'])) {
    $filters['category'] = sanitize($_GET['category']);
}

// Priority filter
if (isset($_GET['priority']) && !empty($_GET['priority'])) {
    $filters['priority'] = sanitize($_GET['priority']);
}

// Status filter
if (isset($_GET['status']) && !empty($_GET['status'])) {
    $filters['status'] = sanitize($_GET['status']);
}

// Search filter
if (isset($_GET['search']) && $_GET['search'] !== '') {
    $filters['search'] = sanitize($_GET['search']);
}

// Archived filter
$showArchived = isset($_GET['archived']) && $_GET['archived'] == 'true';

// ============================================
// BUILD SQL QUERY
// ============================================

try {
    $pdo = getDBConnection();
    
    // Start building query
    $sql = "SELECT * FROM bookings WHERE archived = :archived";
    $params = [':archived' => $showArchived ? 1 : 0];
    
    // Apply filters
    if (isset($filters['id'])) {
        $sql .= " AND id = :id";
        $params[':id'] = $filters['id'];
    }
    
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
    
    // SEARCH: Search in multiple fields - FIXED
    if (isset($filters['search']) && !empty($filters['search'])) {
        $searchTerm = '%' . $filters['search'] . '%';
        $sql .= " AND (name LIKE :search1 
                       OR project_name LIKE :search2 
                       OR email LIKE :search3 
                       OR category LIKE :search4
                       OR time_slot LIKE :search5)";
        $params[':search1'] = $searchTerm;
        $params[':search2'] = $searchTerm;
        $params[':search3'] = $searchTerm;
        $params[':search4'] = $searchTerm;
        $params[':search5'] = $searchTerm;
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
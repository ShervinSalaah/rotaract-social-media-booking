<?php
// ============================================
// ROTARACT SOCIAL MEDIA BOOKING APP
// API: Get Bookings with Filters
// ============================================

require_once '../config/database.php';
header('Content-Type: application/json');

try {
    $pdo = getDBConnection();
    
    // Get parameters
    $search = isset($_GET['search']) ? $_GET['search'] : '';
    $archived = isset($_GET['archived']) && $_GET['archived'] == 'true' ? 1 : 0;
    $date = isset($_GET['date']) ? $_GET['date'] : '';
    $category = isset($_GET['category']) ? $_GET['category'] : '';
    $priority = isset($_GET['priority']) ? $_GET['priority'] : '';
    $status = isset($_GET['status']) ? $_GET['status'] : '';
    $platform = isset($_GET['platform']) ? $_GET['platform'] : '';
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    // Build query
    $sql = "SELECT * FROM bookings WHERE archived = " . intval($archived);
    
    if ($id > 0) {
        $sql .= " AND id = " . intval($id);
    }
    if (!empty($date)) {
        $sql .= " AND date = '" . addslashes($date) . "'";
    }
    if (!empty($category)) {
        $sql .= " AND category = '" . addslashes($category) . "'";
    }
    if (!empty($priority)) {
        $sql .= " AND priority = '" . addslashes($priority) . "'";
    }
    if (!empty($status)) {
        $sql .= " AND status = '" . addslashes($status) . "'";
    }
    if (!empty($platform)) {
        $sql .= " AND platforms LIKE '%" . addslashes($platform) . "%'";
    }
    if (!empty($search)) {
        $searchTerm = addslashes($search);
        $sql .= " AND (name LIKE '%$searchTerm%' 
                       OR project_name LIKE '%$searchTerm%' 
                       OR email LIKE '%$searchTerm%' 
                       OR category LIKE '%$searchTerm%'
                       OR time_slot LIKE '%$searchTerm%')";
    }
    
    $sql .= " ORDER BY date ASC, time_slot ASC";
    
    // Execute
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($bookings);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
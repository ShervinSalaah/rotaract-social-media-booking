<?php

/**
 * Database Configuration
 * 
 * LOCAL (XAMPP): Use default settings
 * PRODUCTION (InfinityFree): Update with your InfinityFree database details
 */

// ============================================
// DATABASE CONNECTION SETTINGS
// ============================================

// For LOCAL development (XAMPP)
$db_host = 'localhost';
$db_name = 'rotaract_booking';
$db_user = 'root';
$db_password = '';

// For PRODUCTION (InfinityFree) - Uncomment and update these
// $db_host = 'sql123.infinityfree.com';  // Your InfinityFree MySQL host
// $db_name = 'if0_12345678_rotaract_booking';  // Your InfinityFree database name
// $db_user = 'if0_12345678';  // Your InfinityFree username
// $db_password = 'your_password_here';  // Your InfinityFree password

// ============================================
// CONNECTION FUNCTION
// ============================================

/**
 * Get database connection using PDO
 * @return PDO|null Returns PDO connection or null on failure
 */
function getDBConnection() {
    global $db_host, $db_name, $db_user, $db_password;
    
    try {
        // Create DSN (Data Source Name)
        $dsn = "mysql:host=$db_host;dbname=$db_name;charset=utf8mb4";
        
        // PDO options for better performance and security
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
        ];
        
        // Create PDO connection
        $pdo = new PDO($dsn, $db_user, $db_password, $options);
        
        return $pdo;
        
    } catch (PDOException $e) {
        // Log error 
        error_log("Database Connection Error: " . $e->getMessage());
        
        die("Database connection failed. Please check your configuration.");
    }
}

// ============================================
// TEST CONNECTION (For debugging)
// ============================================

/**
 * Test database connection
 * @return bool True if connected, false otherwise
 */
function testDatabaseConnection() {
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->query("SELECT 1");
        return true;
    } catch (Exception $e) {
        return false;
    }
}

// ============================================
// QUERY HELPER FUNCTIONS
// ============================================

/**
 * Execute a query and return results
 * @param string $sql SQL query with placeholders
 * @param array $params Parameters for prepared statement
 * @return array|false Query results or false on failure
 */
function executeQuery($sql, $params = []) {
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    } catch (PDOException $e) {
        error_log("Query Error: " . $e->getMessage());
        return false;
    }
}

/**
 * Get single row from query
 * @param string $sql SQL query with placeholders
 * @param array $params Parameters for prepared statement
 * @return array|false Single row or false on failure
 */
function fetchOne($sql, $params = []) {
    $stmt = executeQuery($sql, $params);
    if ($stmt) {
        return $stmt->fetch();
    }
    return false;
}

/**
 * Get all rows from query
 * @param string $sql SQL query with placeholders
 * @param array $params Parameters for prepared statement
 * @return array|false All rows or false on failure
 */
function fetchAll($sql, $params = []) {
    $stmt = executeQuery($sql, $params);
    if ($stmt) {
        return $stmt->fetchAll();
    }
    return false;
}

/**
 * Insert data and return last insert ID
 * @param string $sql SQL query with placeholders
 * @param array $params Parameters for prepared statement
 * @return int|false Last insert ID or false on failure
 */
function insertData($sql, $params = []) {
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $pdo->lastInsertId();
    } catch (PDOException $e) {
        error_log("Insert Error: " . $e->getMessage());
        return false;
    }
}

/**
 * Update data and return affected rows
 * @param string $sql SQL query with placeholders
 * @param array $params Parameters for prepared statement
 * @return int|false Affected rows or false on failure
 */
function updateData($sql, $params = []) {
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->rowCount();
    } catch (PDOException $e) {
        error_log("Update Error: " . $e->getMessage());
        return false;
    }
}

/**
 * Delete data and return affected rows
 * @param string $sql SQL query with placeholders
 * @param array $params Parameters for prepared statement
 * @return int|false Affected rows or false on failure
 */
function deleteData($sql, $params = []) {
    return updateData($sql, $params);
}

// ============================================
// SANITIZATION FUNCTIONS
// ============================================

/**
 * Sanitize input data
 * @param string $input Raw input
 * @return string Sanitized input
 */
function sanitize($input) {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

/**
 * Validate email
 * @param string $email Email to validate
 * @return bool True if valid
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Validate date format (YYYY-MM-DD)
 * @param string $date Date to validate
 * @return bool True if valid
 */
function validateDate($date) {
    $d = DateTime::createFromFormat('Y-m-d', $date);
    return $d && $d->format('Y-m-d') === $date;
}

// ============================================
// ENVIRONMENT CHECK
// ============================================

/**
 * Check if running in production environment
 * @return bool True if production
 */
function isProduction() {
    // Check if running on InfinityFree or other production host
    $host = $_SERVER['HTTP_HOST'] ?? '';
    return strpos($host, 'infinityfree') !== false || 
           strpos($host, 'rf.gd') !== false ||
           isset($_SERVER['INFINITYFREE']);
}

// ============================================
// AUTO CONFIGURATION BASED ON ENVIRONMENT
// ============================================

// Automatically switch to production settings if on InfinityFree
if (isProduction()) {
    // Production settings (these should match your InfinityFree credentials)
    // Note: Update these with your actual InfinityFree database details
    $db_host = 'sql306.infinityfree.com';  // Your InfinityFree MySQL host
    $db_name = 'if0_41508821_rotaract_booking';  // Your InfinityFree database name
    $db_user = 'if0_41508821';  // Your InfinityFree username
    $db_password = 'wVSvWaHdz3NUF';  // Your InfinityFree password
    
    // Uncomment for production debugging (remove in production)
    // error_reporting(0);
    // ini_set('display_errors', 0);
}

// ============================================
// TESTING 
// ============================================

// Uncomment to test connection when this file is loaded
// if (testDatabaseConnection()) {
//     echo "Database connected successfully!";
// } else {
//     echo "Database connection failed!";
// }

?>
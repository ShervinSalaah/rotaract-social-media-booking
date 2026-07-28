<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo isset($pageTitle) ? $pageTitle : 'Rotaract Social Media Booking'; ?></title>
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Google Fonts - Outfit -->
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&display=swap" rel="stylesheet">
    
    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="style.css">
    
    <style>
        /* Sidebar Navigation Styles */
        .sidebar {
            position: fixed;
            top: 0;
            left: -280px;
            width: 280px;
            height: 100%;
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(20px);
            border-right: 1px solid rgba(255, 255, 255, 0.05);
            transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 1000;
            padding: 24px 20px;
            overflow-y: auto;
        }
        
        .sidebar.open {
            left: 0;
        }
        
        .sidebar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            z-index: 999;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        .sidebar-overlay.active {
            opacity: 1;
            visibility: visible;
        }
        
        .nav-item {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 12px 16px;
            border-radius: 12px;
            color: #94a3b8;
            transition: all 0.3s ease;
            cursor: pointer;
            text-decoration: none;
            font-weight: 500;
            font-size: 0.95rem;
        }
        
        .nav-item:hover {
            background: rgba(99, 102, 241, 0.1);
            color: #f1f5f9;
        }
        
        .nav-item.active {
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.1));
            color: #818cf8;
            border: 1px solid rgba(99, 102, 241, 0.2);
        }
        
        .nav-item i {
            width: 20px;
            text-align: center;
            font-size: 1.1rem;
        }
        
        .nav-divider {
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            margin: 12px 0;
        }
        
        /* Hamburger Menu Button - Better Icon */
        .menu-toggle {
            cursor: pointer;
            padding: 10px 12px;
            border-radius: 10px;
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.08);
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 5px;
            width: 44px;
            height: 44px;
        }
        
        .menu-toggle:hover {
            background: rgba(99, 102, 241, 0.15);
            border-color: rgba(99, 102, 241, 0.3);
        }
        
        .menu-toggle .bar {
            display: block;
            width: 24px;
            height: 2.5px;
            background: #f1f5f9;
            border-radius: 4px;
            transition: all 0.3s ease;
        }
        
        /* Hamburger to X animation when open */
        .menu-toggle.open .bar:nth-child(1) {
            transform: translateY(7.5px) rotate(45deg);
        }
        
        .menu-toggle.open .bar:nth-child(2) {
            opacity: 0;
        }
        
        .menu-toggle.open .bar:nth-child(3) {
            transform: translateY(-7.5px) rotate(-45deg);
        }
        
        /* Scrollable sidebar */
        .sidebar::-webkit-scrollbar {
            width: 4px;
        }
        
        .sidebar::-webkit-scrollbar-track {
            background: transparent;
        }
        
        .sidebar::-webkit-scrollbar-thumb {
            background: rgba(99, 102, 241, 0.3);
            border-radius: 4px;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
            .sidebar {
                width: 280px;
                left: -300px;
            }
        }
    </style>
</head>
<body>

<!-- ============================================ -->
<!-- SIDEBAR OVERLAY                              -->
<!-- ============================================ -->
<div id="sidebarOverlay" class="sidebar-overlay" onclick="closeSidebar()"></div>

<!-- ============================================ -->
<!-- SIDEBAR NAVIGATION                           -->
<!-- ============================================ -->
<nav id="sidebar" class="sidebar">
    <!-- Logo -->
    <div class="flex items-center gap-3 mb-8 px-2">
        <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0">
            <i class="fas fa-calendar-check text-white text-lg"></i>
        </div>
        <div>
            <h1 class="text-lg font-black italic tracking-tighter text-white">
                ROTARACT<span class="text-indigo-400">BOOK</span>
            </h1>
            <p class="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                Social Media Manager
            </p>
        </div>
    </div>
    
    <!-- Divider -->
    <div class="nav-divider"></div>
    
    <!-- Navigation Items -->
    <div class="space-y-1">
        <a href="#" class="nav-item active">
            <i class="fas fa-th-large"></i>
            Dashboard
        </a>
        <a href="#bookingForm" class="nav-item" onclick="closeSidebar(); scrollToSection('bookingForm');">
            <i class="fas fa-pen-to-square"></i>
            New Booking
        </a>
        <a href="#calendarView" class="nav-item" onclick="closeSidebar(); scrollToSection('calendarView');">
            <i class="fas fa-calendar-alt"></i>
            Calendar
        </a>
        <a href="#bookingsTable" class="nav-item" onclick="closeSidebar(); scrollToSection('bookingsTable');">
            <i class="fas fa-table"></i>
            Bookings
        </a>
    </div>
    
    <div class="nav-divider"></div>
    
    <!-- Stats in Sidebar -->
    <div class="mt-4 space-y-2 px-2">
        <div class="flex justify-between text-sm">
            <span class="text-slate-400">Total Bookings</span>
            <span class="text-white font-bold"><?php echo $totalBookings ?? 0; ?></span>
        </div>
        <div class="flex justify-between text-sm">
            <span class="text-slate-400">Today</span>
            <span class="text-emerald-400 font-bold"><?php echo $todayBookings ?? 0; ?></span>
        </div>
        <div class="flex justify-between text-sm">
            <span class="text-slate-400">Pending</span>
            <span class="text-amber-400 font-bold"><?php echo $pendingBookings ?? 0; ?></span>
        </div>
        <div class="flex justify-between text-sm">
            <span class="text-slate-400">Archived</span>
            <span class="text-slate-400 font-bold"><?php echo $archiveCount ?? 0; ?></span>
        </div>
    </div>
    
    <div class="nav-divider"></div>
    
    <!-- Footer in Sidebar -->
    <div class="mt-auto pt-4 px-2">
        <p class="text-xs text-slate-500">
            <i class="fas fa-code mr-1"></i> Rotaract Club
        </p>
        <p class="text-xs text-slate-600 mt-1">
            &copy; <?php echo date('Y'); ?> All rights reserved
        </p>
    </div>
</nav>

<!-- ============================================ -->
<!-- TOP HEADER WITH MENU TOGGLE                  -->
<!-- ============================================ -->
<header class="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
    <div class="container mx-auto px-4 py-3 max-w-7xl">
        <div class="flex items-center justify-between">
            <!-- Left: Menu Toggle + Logo -->
            <div class="flex items-center gap-4">
                <button id="menuToggle" class="menu-toggle" onclick="toggleSidebar()" aria-label="Toggle navigation">
                    <span class="bar"></span>
                    <span class="bar"></span>
                    <span class="bar"></span>
                </button>
                
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <i class="fas fa-calendar-check text-white text-sm"></i>
                    </div>
                    <div>
                        <h1 class="text-lg font-black italic tracking-tighter text-white hidden sm:block">
                            ROTARACT<span class="text-indigo-400">BOOK</span>
                        </h1>
                    </div>
                </div>
            </div>
            
            <!-- Right: Date & Time -->
            <div class="flex items-center gap-4">
                <span class="text-xs text-slate-400 hidden md:block">
                    <i class="fas fa-clock text-indigo-400 mr-1"></i>
                    <?php echo date('l, F j, Y'); ?>
                </span>
            </div>
        </div>
    </div>
</header>

<!-- ============================================ -->
<!-- MAIN CONTENT WRAPPER                          -->
<!-- ============================================ -->
<main class="container mx-auto px-4 py-6 max-w-7xl">
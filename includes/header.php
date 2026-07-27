<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo isset($pageTitle) ? $pageTitle : 'Rotaract Social Media Booking'; ?></title>
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Google Fonts - Outfit (matching hotel style) -->
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&display=swap" rel="stylesheet">
    
    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="style.css">
    
    <style>
        /* Additional inline styles for quick fixes */
        body {
            font-family: 'Outfit', sans-serif;
            background: #0f172a;
            color: #f1f5f9;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #1e293b;
            border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
            background: #6366f1;
            border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #818cf8;
        }
        
        /* Glass effect for cards */
        .glass-card {
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
        }
        
        .glass-card:hover {
            border-color: #6366f1;
            background: rgba(30, 41, 59, 0.8);
            transform: translateY(-3px);
            transition: all 0.3s ease;
        }
        
        /* Gradient button */
        .btn-gradient {
            background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
            box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4);
            transition: all 0.3s ease;
        }
        
        .btn-gradient:hover {
            transform: scale(1.02);
            box-shadow: 0 15px 30px -5px rgba(99, 102, 241, 0.6);
        }
        
        /* Status badges */
        .badge-pending {
            background: rgba(251, 191, 36, 0.2);
            color: #fbbf24;
            border: 1px solid rgba(251, 191, 36, 0.3);
        }
        
        .badge-confirmed {
            background: rgba(52, 211, 153, 0.2);
            color: #34d399;
            border: 1px solid rgba(52, 211, 153, 0.3);
        }
        
        .badge-completed {
            background: rgba(96, 165, 250, 0.2);
            color: #60a5fa;
            border: 1px solid rgba(96, 165, 250, 0.3);
        }
        
        /* Priority badges */
        .badge-high {
            background: rgba(239, 68, 68, 0.2);
            color: #ef4444;
            border: 1px solid rgba(239, 68, 68, 0.3);
        }
        
        .badge-medium {
            background: rgba(251, 191, 36, 0.2);
            color: #fbbf24;
            border: 1px solid rgba(251, 191, 36, 0.3);
        }
        
        .badge-low {
            background: rgba(52, 211, 153, 0.2);
            color: #34d399;
            border: 1px solid rgba(52, 211, 153, 0.3);
        }
        
        /* Category badges */
        .badge-flyer {
            background: rgba(99, 102, 241, 0.2);
            color: #818cf8;
            border: 1px solid rgba(99, 102, 241, 0.3);
        }
        
        .badge-video {
            background: rgba(236, 72, 153, 0.2);
            color: #f472b6;
            border: 1px solid rgba(236, 72, 153, 0.3);
        }
        
        .badge-reel {
            background: rgba(251, 146, 60, 0.2);
            color: #fb923c;
            border: 1px solid rgba(251, 146, 60, 0.3);
        }
        
        .badge-carousel {
            background: rgba(52, 211, 153, 0.2);
            color: #34d399;
            border: 1px solid rgba(52, 211, 153, 0.3);
        }
        
        .badge-story {
            background: rgba(168, 85, 247, 0.2);
            color: #a855f7;
            border: 1px solid rgba(168, 85, 247, 0.3);
        }
        
        .badge-infographic {
            background: rgba(6, 182, 212, 0.2);
            color: #22d3ee;
            border: 1px solid rgba(6, 182, 212, 0.3);
        }
    </style>
</head>
<body>
    <!-- ============================================ -->
    <!-- NAVIGATION HEADER                              -->
    <!-- ============================================ -->
    <header class="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
        <div class="container mx-auto px-4 py-4 max-w-7xl">
            <div class="flex items-center justify-between">
                <!-- Logo -->
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <i class="fas fa-calendar-check text-white text-lg"></i>
                    </div>
                    <div>
                        <h1 class="text-xl font-black italic tracking-tighter text-white">
                            ROTARACT<span class="text-indigo-400">BOOK</span>
                        </h1>
                        <p class="text-[10px] text-slate-400 font-medium tracking-wider uppercase hidden sm:block">
                            Social Media Time Slot Manager
                        </p>
                    </div>
                </div>
                
                <!-- Right side -->
                <div class="flex items-center gap-4">
                    <span class="text-xs text-slate-400 hidden md:block">
                        <i class="fas fa-clock text-indigo-400 mr-1"></i>
                        <?php echo date('l, F j, Y'); ?>
                    </span>
                    <div class="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                        <i class="fas fa-user text-indigo-400"></i>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- ============================================ -->
    <!-- MAIN CONTENT WRAPPER                          -->
    <!-- ============================================ -->
    <main class="container mx-auto px-4 py-8 max-w-7xl">
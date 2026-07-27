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
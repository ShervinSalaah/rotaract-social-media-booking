    <!-- ============================================ -->
    <!-- END OF MAIN CONTENT                          -->
    <!-- ============================================ -->
    </main>

    <!-- ============================================ -->
    <!-- FOOTER                                       -->
    <!-- ============================================ -->
    <footer class="border-t border-slate-800 bg-slate-900/50 mt-12">
        <div class="container mx-auto px-4 py-6 max-w-7xl">
            <div class="flex flex-col md:flex-row items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-indigo-600/20 rounded-xl flex items-center justify-center">
                        <i class="fas fa-calendar-check text-indigo-400 text-sm"></i>
                    </div>
                    <span class="text-sm text-slate-400">
                        &copy; <?php echo date('Y'); ?> Rotaract Social Media Booking
                    </span>
                </div>
                <div class="flex items-center gap-6 text-sm text-slate-500">
                    <span class="flex items-center gap-2">
                        <i class="fas fa-database text-indigo-400 text-xs"></i>
                        <?php
                        // Show database status
                        if (function_exists('testDatabaseConnection') && testDatabaseConnection()) {
                            echo '<span class="text-emerald-400">● Database Connected</span>';
                        } else {
                            echo '<span class="text-rose-400">● Database Offline</span>';
                        }
                        ?>
                    </span>
                    <span class="hidden sm:inline">|</span>
                    <span class="hidden sm:inline text-slate-600">
                        <i class="fas fa-code"></i> Built with ❤️
                    </span>
                </div>
            </div>
        </div>
    </footer>

    <!-- ============================================ -->
    <!-- JAVASCRIPT                                   -->
    <!-- ============================================ -->
    
    <!-- Font Awesome for icons (if not loaded in header) -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/js/all.min.js"></script>
    
    <!-- Custom JavaScript -->
    <script src="script.js"></script>
    
    <!-- Inline JavaScript for page-specific functionality -->
    <?php if (isset($pageScript)): ?>
        <script>
            <?php echo $pageScript; ?>
        </script>
    <?php endif; ?>
    
</body>
</html>
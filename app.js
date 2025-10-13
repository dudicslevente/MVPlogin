// Employee Schedule Manager Application
class ScheduleManager {
    constructor() {
        this.employees = [];
        this.schedules = {};
        this.departments = ['sales', 'kitchen', 'service', 'management'];
        this.holidays = {};
        this.mandatoryVacations = {};
        this.currentYear = new Date().getFullYear();
        this.currentWeek = this.getCurrentWeek();
        this.currentMonth = this.getCurrentMonth();
        this.currentView = 'week';
        this.currentPage = 'schedule';
        this.copiedWeek = null;
        this.copiedMonth = null;
        this.selectedWeeks = [];
        this.editingEmployee = null;
        this.editingShift = null;
        this.notificationId = 0;
        this.confirmationCallback = null;
        this.currentProfilePic = null;
        this.isDarkMode = false;
        
        // Statistics view properties
        this.currentStatsView = 'week';
        this.currentStatsPeriod = {
            week: this.getCurrentWeek(),
            month: this.getCurrentMonth(),
            year: new Date().getFullYear()
        };
        
        this.init();
    }

    init() {
        this.loadData();
        this.loadTheme();
        this.setupEventListeners();
        this.renderEmployeeList();
        this.renderSchedule();
        this.updateStatistics();
        this.updatePeriodLabels();
        
        // Initialize feather icons
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    // Data Management
    loadData() {
        // Load from localStorage or use sample data
        const savedEmployees = localStorage.getItem('scheduleManager_employees');
        const savedSchedules = localStorage.getItem('scheduleManager_schedules');
        const savedDepartments = localStorage.getItem('scheduleManager_departments');
        const savedHolidays = localStorage.getItem('scheduleManager_holidays');
        const savedMandatoryVacations = localStorage.getItem('scheduleManager_mandatory_vacations');
        
        // Load profile data
        const savedUsername = localStorage.getItem('scheduleManager_username');
        const savedDisplayName = localStorage.getItem('scheduleManager_displayName');
        
        if (savedEmployees) {
            this.employees = JSON.parse(savedEmployees);
            // Ensure all employees have the required properties for backward compatibility
            this.employees = this.employees.map(emp => {
                // Ensure employee has all required properties
                const updatedEmp = { ...emp };
                
                // Ensure customColor property exists
                if (!updatedEmp.hasOwnProperty('customColor')) {
                    updatedEmp.customColor = null;
                }
                
                // Ensure default time properties exist
                if (!updatedEmp.hasOwnProperty('defaultStartTime')) {
                    updatedEmp.defaultStartTime = '08:00';
                }
                
                if (!updatedEmp.hasOwnProperty('defaultEndTime')) {
                    updatedEmp.defaultEndTime = '16:00';
                }
                
                // Ensure profilePic property exists
                if (!updatedEmp.hasOwnProperty('profilePic')) {
                    updatedEmp.profilePic = null;
                }
                
                // Ensure nickname property exists
                if (!updatedEmp.hasOwnProperty('nickname')) {
                    updatedEmp.nickname = '';
                }
                
                return updatedEmp;
            });
        } else {
            // Instead of loading sample employees, start with an empty array
            this.employees = [];
        }
        
        if (savedSchedules) {
            this.schedules = JSON.parse(savedSchedules);
        } else {
            this.schedules = {};
        }
        
        if (savedDepartments) {
            this.departments = JSON.parse(savedDepartments);
        } else {
            // Instead of loading default departments, start with an empty array
            this.departments = [];
        }
        
        if (savedHolidays) {
            this.holidays = JSON.parse(savedHolidays);
        } else {
            this.holidays = {};
            this.holidays[this.currentYear] = this.getDefaultHolidaysForYear(this.currentYear);
        }
        
        if (savedMandatoryVacations) {
            this.mandatoryVacations = JSON.parse(savedMandatoryVacations);
        } else {
            this.mandatoryVacations = {};
        }
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('scheduleManager_theme');
        this.isDarkMode = savedTheme === 'dark';
        this.applyTheme();
    }

    applyTheme() {
        if (this.isDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.getElementById('darkModeIcon').setAttribute('data-feather', 'sun');
        } else {
            document.documentElement.removeAttribute('data-theme');
            document.getElementById('darkModeIcon').setAttribute('data-feather', 'moon');
        }
        
        // Re-render feather icons
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('scheduleManager_theme', this.isDarkMode ? 'dark' : 'light');
        this.applyTheme();
        //this.showNotification(`Váltottam ${this.isDarkMode ? 'sötét' : 'világos'} módra`, 'info');
    }

    // Helper to get display name (nickname first)
    getEmployeeDisplayName(employee) {
        if (!employee) return 'Employee';
        const fullName = (employee.name && employee.name.trim()) || [employee.firstName, employee.lastName].filter(Boolean).join(' ').trim();
        return (employee.nickname && employee.nickname.trim()) ? employee.nickname.trim() : (fullName || 'Alkalmazott');
    }

    saveData() {
        localStorage.setItem('scheduleManager_employees', JSON.stringify(this.employees));
        localStorage.setItem('scheduleManager_schedules', JSON.stringify(this.schedules));
        localStorage.setItem('scheduleManager_departments', JSON.stringify(this.departments));
        localStorage.setItem('scheduleManager_holidays', JSON.stringify(this.holidays));
        localStorage.setItem('scheduleManager_mandatory_vacations', JSON.stringify(this.mandatoryVacations));
        try {
            if (window.cloudSyncSave) {
                window.cloudSyncSave();
            }
        } catch (e) {
            console.error('Cloud sync failed:', e);
        }
    }

    getSampleEmployees() {
        return [
            {
                id: this.generateId(),
                name: 'John Doe',
                nickname: '',
                email: 'john.doe@example.com',
                phone: '555-0101',
                department: 'service',
                position: 'Pincér',
                minHours: 20,
                maxHours: 40,
                basePay: 15.50,
                overtimePremium: 50,
                vacationDaysPerYear: 14,
                sickDaysPerYear: 5,
                customFields: '',
                isActive: true,
                color: 'color-1',
                customColor: '#3b82f6',
                profilePic: null,
                defaultStartTime: '08:00',
                defaultEndTime: '16:00'
            },
            {
                id: this.generateId(),
                name: 'Jane Smith',
                nickname: '',
                email: 'jane.smith@example.com',
                phone: '555-0102',
                department: 'kitchen',
                position: 'Szakacs',
                minHours: 30,
                maxHours: 45,
                basePay: 22.00,
                overtimePremium: 50,
                vacationDaysPerYear: 21,
                sickDaysPerYear: 7,
                customFields: 'Főszakacs - 5 év tapasztalat',
                isActive: true,
                color: 'color-2',
                customColor: '#10b981',
                profilePic: null,
                defaultStartTime: '08:00',
                defaultEndTime: '16:00'
            },
            {
                id: this.generateId(),
                name: 'Mike Johnson',
                nickname: '',
                email: 'mike.johnson@example.com',
                phone: '555-0103',
                department: 'service',
                position: 'Italkeverő',
                minHours: 25,
                maxHours: 40,
                basePay: 18.00,
                overtimePremium: 50,
                vacationDaysPerYear: 14,
                sickDaysPerYear: 5,
                customFields: '',
                isActive: true,
                color: 'color-3',
                customColor: '#8b5cf6',
                profilePic: null,
                defaultStartTime: '08:00',
                defaultEndTime: '16:00'
            },
            {
                id: this.generateId(),
                name: 'Sarah Williams',
                nickname: '',
                email: 'sarah.williams@example.com',
                phone: '555-0104',
                department: 'service',
                position: 'Házigazda',
                minHours: 15,
                maxHours: 30,
                basePay: 14.00,
                overtimePremium: 50,
                vacationDaysPerYear: 10,
                sickDaysPerYear: 3,
                customFields: 'Részidős diák',
                isActive: true,
                color: 'color-4',
                customColor: '#f59e0b',
                profilePic: null,
                defaultStartTime: '08:00',
                defaultEndTime: '16:00'
            },
            {
                id: this.generateId(),
                name: 'David Brown',
                nickname: '',
                email: 'david.brown@example.com',
                phone: '555-0105',
                department: 'management',
                position: 'Kezelő',
                minHours: 40,
                maxHours: 50,
                basePay: 25.00,
                overtimePremium: 50,
                vacationDaysPerYear: 21,
                sickDaysPerYear: 10,
                customFields: 'Helyettes Kezelő',
                isActive: true,
                color: 'color-5',
                customColor: '#ef4444',
                profilePic: null,
                defaultStartTime: '08:00',
                defaultEndTime: '16:00'
            }
        ];
    }

    getDefaultHolidaysForYear(year) {
        // Note: Some dates vary by year (Easter, etc.) - using approximate dates for 2023
        // In a production system, you would calculate these dates properly
        return [
            // New Year's Day
            { id: this.generateId(), date: `${year}-01-01`, name: 'Újév', type: 'holiday' },
            // National Holiday (March 15)
            { id: this.generateId(), date: `${year}-03-15`, name: 'Nemzeti ünnep', type: 'holiday' },
            // Good Friday (varies by year - approximate for 2023)
            { id: this.generateId(), date: `${year}-04-07`, name: 'Nagypéntek', type: 'holiday' },
            // Easter Sunday (varies by year - approximate for 2023)
            { id: this.generateId(), date: `${year}-04-09`, name: 'Húsvétvasárnap', type: 'holiday' },
            // Easter Monday (varies by year - approximate for 2023)
            { id: this.generateId(), date: `${year}-04-10`, name: 'Húsvéthétfő', type: 'holiday' },
            // Labor Day (May 1)
            { id: this.generateId(), date: `${year}-05-01`, name: 'A munka ünnepe', type: 'holiday' },
            // Whit Sunday (varies by year - approximate for 2023)
            { id: this.generateId(), date: `${year}-05-28`, name: 'Pünkösdvasárnap', type: 'holiday' },
            // Whit Monday (varies by year - approximate for 2023)
            { id: this.generateId(), date: `${year}-05-29`, name: 'Pünkösdhétfő', type: 'holiday' },
            // State Foundation Day (August 20)
            { id: this.generateId(), date: `${year}-08-20`, name: 'Az államalapítás ünnepe', type: 'holiday' },
            // National Day (October 23)
            { id: this.generateId(), date: `${year}-10-23`, name: 'Nemzeti ünnep', type: 'holiday' },
            // All Saints' Day (November 1)
            { id: this.generateId(), date: `${year}-11-01`, name: 'Mindenszentek', type: 'holiday' },
            // Christmas Day (December 25)
            { id: this.generateId(), date: `${year}-12-25`, name: 'Karácsony', type: 'holiday' },
            // Second Day of Christmas (December 26)
            { id: this.generateId(), date: `${year}-12-26`, name: 'Karácsony másnapja', type: 'holiday' }
        ];
    }

    // Utility Functions
    getCurrentWeek() {
        const now = new Date();
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        // Make Monday the first day of the week
        const day = (startOfWeek.getDay() + 6) % 7; // 0=Monday, 6=Sunday
        startOfWeek.setDate(startOfWeek.getDate() - day);
        return this.formatDate(startOfWeek);
    }

    getCurrentMonth() {
        const now = new Date();
        return {
            year: now.getFullYear(),
            month: now.getMonth()
        };
    }

    formatDate(date) {
        // Use local timezone instead of UTC to prevent date shifts
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    isValidDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        return date instanceof Date && !isNaN(date) && dateString.match(/^\d{4}-\d{2}-\d{2}$/);
    }

    getWeekKey(date) {
        // Create a new date object to avoid modifying the original
        const startOfWeek = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        // Make Monday the first day of the week
        const day = (startOfWeek.getDay() + 6) % 7; // 0=Monday, 6=Sunday
        startOfWeek.setDate(startOfWeek.getDate() - day);
        return this.formatDate(startOfWeek);
    }

    getWeekDates(weekStart) {
        const dates = [];
        const start = new Date(weekStart + 'T00:00:00'); // Add time to prevent timezone issues
        for (let i = 0; i < 7; i++) {
            const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
            dates.push(this.formatDate(date));
        }
        return dates;
    }

    generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    // Event Listeners
    setupEventListeners() {
        // Employee search
        const employeeSearch = document.getElementById('employeeSearch');
        if (employeeSearch) {
            employeeSearch.addEventListener('input', (e) => {
                this.searchEmployees(e.target.value);
            });
        }

        // Department filter in employees page
        const departmentFilter = document.getElementById('departmentFilter');
        if (departmentFilter) {
            departmentFilter.addEventListener('change', (e) => {
                this.filterEmployeesByDepartment(e.target.value);
            });
        }

        // Modal close on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Auto-fill shift times based on selected employee defaults
        const shiftEmployeeSelect = document.getElementById('shiftEmployee');
        if (shiftEmployeeSelect) {
            shiftEmployeeSelect.addEventListener('change', () => {
                const empId = String(shiftEmployeeSelect.value || '');
                const emp = this.employees.find(e => String(e.id) === empId);
                if (emp) {
                    const startEl = document.getElementById('startTime');
                    const endEl = document.getElementById('endTime');
                    if (startEl) startEl.value = emp.defaultStartTime || '08:00';
                    if (endEl) endEl.value = emp.defaultEndTime || '16:00';
                    const posEl = document.getElementById('shiftPosition');
                    if (posEl && !posEl.value) posEl.value = emp.position || '';
                }
            });
        }
    }    // N
avigation
    showPage(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        
        // Show selected page
        document.getElementById(page + 'Page').classList.add('active');
        document.querySelector(`[onclick="showPage('${page}')"]`).classList.add('active');
        
        this.currentPage = page;
        
        // Update page content
        if (page === 'employees') {
            this.updateDepartmentDropdowns();
            this.renderEmployeeTable();
        } else if (page === 'statistics') {
            this.updateStatsPeriodLabels();
            this.updateStatistics();
        } else if (page === 'schedule') {
            this.renderSchedule();
        }
        
        // Update feather icons
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    // Navigation
    navigateTime(direction) {
        if (this.currentView === 'week') {
            this.navigateWeek(direction);
        } else {
            this.navigateMonth(direction);
        }
        this.updatePeriodLabels();
        this.renderSchedule();
    }

    navigateWeek(direction) {
        const current = new Date(this.currentWeek + 'T00:00:00');
        if (direction === 'next') {
            current.setDate(current.getDate() + 7);
        } else if (direction === 'prev') {
            current.setDate(current.getDate() - 7);
        }
        this.currentWeek = this.formatDate(current);
    }

    navigateMonth(direction) {
        if (direction === 'next') {
            this.currentMonth.month++;
            if (this.currentMonth.month > 11) {
                this.currentMonth.month = 0;
                this.currentMonth.year++;
            }
        } else if (direction === 'prev') {
            this.currentMonth.month--;
            if (this.currentMonth.month < 0) {
                this.currentMonth.month = 11;
                this.currentMonth.year--;
            }
        }
    }

    updatePeriodLabels() {
        const labelElement = document.getElementById('currentPeriodLabel');
        const datesElement = document.getElementById('currentPeriodDates');
        const clearButtonText = document.getElementById('clearButtonText');
        const copyBtn = document.querySelector("button[onclick='copyWeek()']" );
        const pasteBtn = document.querySelector("button[onclick='pasteWeek()']" );
        
        // Detect if we're on the English page
        const isEnglish = document.documentElement.lang === 'en' || document.title.includes('Employee Schedule');
        
        if (this.currentView === 'week') {
            const weekStart = new Date(this.currentWeek + 'T00:00:00');
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            
            labelElement.textContent = isEnglish ? 'Week View' : 'Heti Nézet';
            datesElement.textContent = `${this.formatDateDisplay(weekStart)} - ${this.formatDateDisplay(weekEnd)}`;
            clearButtonText.textContent = isEnglish ? 'Clear Week' : 'Hét Törlése';
            
            // Update copy/paste button text for week view
            if (copyBtn) {
                copyBtn.style.display = 'flex'; // Show copy button in week view
                const copyText = isEnglish ? 'Copy Week' : 'Hét Másolása';
                copyBtn.innerHTML = `<i data-feather="copy" class="mr-2"></i>${copyText}`;
            }
            if (pasteBtn) {
                const pasteText = isEnglish ? 'Paste Week' : 'Hét Beillesztése';
                document.getElementById('pasteBtnText').textContent = pasteText;
                
                // Enable/disable paste button based on copied week data
                if (this.copiedWeek) {
                    pasteBtn.disabled = false;
                    pasteBtn.classList.remove('opacity-50');
                } else {
                    pasteBtn.disabled = true;
                    pasteBtn.classList.add('opacity-50');
                }
            }
            
            // Hide paste to selected weeks button in week view
            const pasteToSelectedBtn = document.getElementById('pasteToSelectedBtn');
            if (pasteToSelectedBtn) {
                pasteToSelectedBtn.style.display = 'none';
            }
        } else {
            const monthNames = isEnglish ? 
                ['January', 'February', 'March', 'April', 'May', 'June',
                 'July', 'August', 'September', 'October', 'November', 'December'] :
                ['Január', 'Február', 'Március', 'Április', 'Május', 'Június',
                 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'];
            
            labelElement.textContent = isEnglish ? 'Month View' : 'Havi Nézet';
            datesElement.textContent = `${monthNames[this.currentMonth.month]} ${this.currentMonth.year}`;
        }
    }

    // New function to go to current period based on selected view
    goToCurrentPeriod() {
        const now = new Date();
        
        if (this.currentView === 'week') {
            // Set to current week
            const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            // Make Monday the first day of the week
            const day = (startOfWeek.getDay() + 6) % 7; // 0=Monday, 6=Sunday
            startOfWeek.setDate(startOfWeek.getDate() - day);
            this.currentWeek = this.formatDate(startOfWeek);
        } else {
            // Set to current month
            this.currentMonth = {
                year: now.getFullYear(),
                month: now.getMonth()
            };
        }
        
        this.updatePeriodLabels();
        this.renderSchedule();
        //this.showNotification('Aktuális időszakra váltva', 'info');
    }

    // Navigation
    navigateTime(direction) {
        if (this.currentView === 'week') {
            this.navigateWeek(direction);
        } else {
            this.navigateMonth(direction);
        }
        this.updatePeriodLabels();
        this.renderSchedule();
    }

    navigateWeek(direction) {
        const current = new Date(this.currentWeek + 'T00:00:00');
        const oldYear = current.getFullYear();
        
        if (direction === 'next') {
            current.setDate(current.getDate() + 7);
        } else if (direction === 'prev') {
            current.setDate(current.getDate() - 7);
        }
        this.currentWeek = this.formatDate(current);
        
        // Check if year has changed and update holiday manager if needed
        const newYear = current.getFullYear();
        if (oldYear !== newYear) {
            this.switchToYear(newYear);
            
            // If the holiday modal is open, update its display
            const holidayModal = document.getElementById('holidayModal');
            if (holidayModal && holidayModal.classList.contains('active')) {
                this.updateHolidayModalTitle();
                this.renderHolidayList();
                this.renderMandatoryVacationList();
            }
        }
    }

    navigateMonth(direction) {
        const oldYear = this.currentMonth.year;
        
        if (direction === 'next') {
            this.currentMonth.month++;
            if (this.currentMonth.month > 11) {
                this.currentMonth.month = 0;
                this.currentMonth.year++;
            }
        } else if (direction === 'prev') {
            this.currentMonth.month--;
            if (this.currentMonth.month < 0) {
                this.currentMonth.month = 11;
                this.currentMonth.year--;
            }
        }
        
        // Check if year has changed and update holiday manager if needed
        if (oldYear !== this.currentMonth.year) {
            this.switchToYear(this.currentMonth.year);
            
            // If the holiday modal is open, update its display
            const holidayModal = document.getElementById('holidayModal');
            if (holidayModal && holidayModal.classList.contains('active')) {
                this.updateHolidayModalTitle();
                this.renderHolidayList();
                this.renderMandatoryVacationList();
            }
        }
    }

    updatePeriodLabels() {
        const labelElement = document.getElementById('currentPeriodLabel');
        const datesElement = document.getElementById('currentPeriodDates');
        const clearButtonText = document.getElementById('clearButtonText');
        const copyBtn = document.querySelector("button[onclick='copyWeek()']" );
        const pasteBtn = document.querySelector("button[onclick='pasteWeek()']" );
        
        // Detect if we're on the English page
        const isEnglish = document.documentElement.lang === 'en' || document.title.includes('Employee Schedule');
        
        if (this.currentView === 'week') {
            const weekStart = new Date(this.currentWeek + 'T00:00:00');
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            
            labelElement.textContent = isEnglish ? 'Week View' : 'Heti Nézet';
            datesElement.textContent = `${this.formatDateDisplay(weekStart)} - ${this.formatDateDisplay(weekEnd)}`;
            clearButtonText.textContent = isEnglish ? 'Clear Week' : 'Hét Törlése';
            
            // Update copy/paste button text for week view
            if (copyBtn) {
                copyBtn.style.display = 'flex'; // Show copy button in week view
                const copyText = isEnglish ? 'Copy Week' : 'Hét Másolása';
                copyBtn.innerHTML = `<i data-feather="copy" class="mr-2"></i>${copyText}`;
            }
            if (pasteBtn) {
                const pasteText = isEnglish ? 'Paste Week' : 'Hét Beillesztése';
                document.getElementById('pasteBtnText').textContent = pasteText;
                
                // Enable/disable paste button based on copied week data
                if (this.copiedWeek) {
                    pasteBtn.disabled = false;
                    pasteBtn.classList.remove('opacity-50');
                } else {
                    pasteBtn.disabled = true;
                    pasteBtn.classList.add('opacity-50');
                }
            }
            
            // Hide paste to selected weeks button in week view
            const pasteToSelectedBtn = document.getElementById('pasteToSelectedBtn');
            if (pasteToSelectedBtn) {
                pasteToSelectedBtn.style.display = 'none';
            }
        } else {
            const monthNames = isEnglish ? 
                ['January', 'February', 'March', 'April', 'May', 'June',
                 'July', 'August', 'September', 'October', 'November', 'December'] :
                ['Január', 'Február', 'Március', 'Április', 'Május', 'Június',
                 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'];
            
            labelElement.textContent = isEnglish ? 'Month View' : 'Havi Nézet';
            datesElement.textContent = `${monthNames[this.currentMonth.month]} ${this.currentMonth.year}`;
            clearButtonText.textContent = isEnglish ? 'Clear Month' : 'Hónap Törlése';
        }
    }

    // New methods for statistics view switching
    switchStatsView(view) {
        this.currentStatsView = view;
        
        // Update view buttons
        document.querySelectorAll('.stats-view-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(view + 'StatsBtn').classList.add('active');
        
        // Update period labels
        this.updateStatsPeriodLabels();
        
        // Recalculate and update statistics
        this.updateStatistics();
    }

    navigateStatsPeriod(direction) {
        if (this.currentStatsView === 'week') {
            this.navigateStatsWeek(direction);
        } else if (this.currentStatsView === 'month') {
            this.navigateStatsMonth(direction);
        } else if (this.currentStatsView === 'year') {
            this.navigateStatsYear(direction);
        }
        
        this.updateStatsPeriodLabels();
        this.updateStatistics();
    }

    navigateStatsWeek(direction) {
        const current = new Date(this.currentStatsPeriod.week + 'T00:00:00');
        if (direction === 'next') {
            current.setDate(current.getDate() + 7);
        } else if (direction === 'prev') {
            current.setDate(current.getDate() - 7);
        }
        this.currentStatsPeriod.week = this.formatDate(current);
    }

    navigateStatsMonth(direction) {
        if (direction === 'next') {
            this.currentStatsPeriod.month.month++;
            if (this.currentStatsPeriod.month.month > 11) {
                this.currentStatsPeriod.month.month = 0;
                this.currentStatsPeriod.month.year++;
            }
        } else if (direction === 'prev') {
            this.currentStatsPeriod.month.month--;
            if (this.currentStatsPeriod.month.month < 0) {
                this.currentStatsPeriod.month.month = 11;
                this.currentStatsPeriod.month.year--;
            }
        }
    }

    navigateStatsYear(direction) {
        if (direction === 'next') {
            this.currentStatsPeriod.year++;
        } else if (direction === 'prev') {
            this.currentStatsPeriod.year--;
        }
    }

    updateStatsPeriodLabels() {
        const labelElement = document.getElementById('statsPeriodLabel');
        const datesElement = document.getElementById('statsPeriodDates');
        
        // Detect if we're on the English page
        const isEnglish = document.documentElement.lang === 'en' || document.title.includes('Employee Schedule');
        
        if (this.currentStatsView === 'week') {
            const weekStart = new Date(this.currentStatsPeriod.week + 'T00:00:00');
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            
            labelElement.textContent = isEnglish ? 'Week View' : 'Heti Nézet';
            datesElement.textContent = `${this.formatDateDisplay(weekStart)} - ${this.formatDateDisplay(weekEnd)}`;
        } else if (this.currentStatsView === 'month') {
            const monthNames = isEnglish ? 
                ['January', 'February', 'March', 'April', 'May', 'June',
                 'July', 'August', 'September', 'October', 'November', 'December'] :
                ['Január', 'Február', 'Március', 'Április', 'Május', 'Június',
                 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'];
            
            labelElement.textContent = isEnglish ? 'Month View' : 'Havi Nézet';
            datesElement.textContent = `${monthNames[this.currentStatsPeriod.month.month]} ${this.currentStatsPeriod.month.year}`;
        } else if (this.currentStatsView === 'year') {
            labelElement.textContent = isEnglish ? 'Year View' : 'Éves Nézet';
            datesElement.textContent = this.currentStatsPeriod.year;
        }
        
        // Update feather icons after changing button content
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    // New function to go to current period based on selected view
    goToCurrentStatsPeriod() {
        const now = new Date();
        
        if (this.currentStatsView === 'week') {
            // Set to current week
            const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            // Make Monday the first day of the week
            const day = (startOfWeek.getDay() + 6) % 7; // 0=Monday, 6=Sunday
            startOfWeek.setDate(startOfWeek.getDate() - day);
            this.currentStatsPeriod.week = this.formatDate(startOfWeek);
        } else if (this.currentStatsView === 'month') {
            // Set to current month
            this.currentStatsPeriod.month = {
                year: now.getFullYear(),
                month: now.getMonth()
            };
        } else if (this.currentStatsView === 'year') {
            // Set to current year
            this.currentStatsPeriod.year = now.getFullYear();
        }
        
        this.updateStatsPeriodLabels();
        this.updateStatistics();
        //this.showNotification('Aktuális időszakra váltva', 'info');
    }

    formatDateDisplay(date) {
        return date.toLocaleDateString('hu-HU', { 
            month: 'short', 
            day: 'numeric'
        });
    }

    switchView(view) {
        this.currentView = view;
        
        // Update view buttons
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(view + 'ViewBtn').classList.add('active');
        
        // Update view containers
        document.querySelectorAll('.schedule-view').forEach(v => v.classList.remove('active'));
        document.getElementById(view + 'View').classList.add('active');
        
        // Clear week selections when switching views
        if (view === 'week') {
            this.clearWeekSelections();
        }
        
        this.updatePeriodLabels();
        this.renderSchedule();
    }

    renderEmployeeList() {
        const container = document.getElementById('employeeList');
        if (!container) return;
        
        container.innerHTML = '';
        
        const activeEmployees = this.employees.filter(emp => emp.isActive);
        
        activeEmployees.forEach(employee => {
            const card = document.createElement('div');
            card.className = `employee-card-with-pic custom-styled-employee-card cursor-move`;
            card.draggable = true;
            card.dataset.employeeId = employee.id;
            
            // Apply custom color with border style for better visibility
            card.style.backgroundColor = 'transparent';
            card.style.borderWidth = '1px';
            card.style.borderStyle = 'solid';
            card.style.color = this.isDarkMode ? '#ffffff' : '#000000';
            
            // Determine the color to use for the profile icon and border
            let borderColor = '#3b82f6'; // Default color
            if (employee.customColor) {
                borderColor = employee.customColor;
            } else {
                // Use default color scheme based on employee.color class
                switch (employee.color) {
                    case 'color-1':
                        borderColor = '#3b82f6';
                        break;
                    case 'color-2':
                        borderColor = '#10b981';
                        break;
                    case 'color-3':
                        borderColor = '#8b5cf6';
                        break;
                    case 'color-4':
                        borderColor = '#f59e0b';
                        break;
                    case 'color-5':
                        borderColor = '#ef4444';
                        break;
                    case 'color-6':
                        borderColor = '#a855f7';
                        break;
                    case 'color-7':
                        borderColor = '#059669';
                        break;
                    case 'color-8':
                        borderColor = '#ec4899';
                        break;
                }
            }
            
            card.style.borderColor = borderColor;
            
            // Add profile icon with the same color
            const profileIconHtml = employee.profilePic ? 
                `<img src="${employee.profilePic}" alt="${this.getEmployeeDisplayName(employee)}" class="w-8 h-8 rounded-full object-cover mr-3" style="border: 2px solid ${borderColor};">` :
                `<div class="w-8 h-8 rounded-full flex items-center justify-center mr-3" style="border: 2px solid ${borderColor}; background-color: ${borderColor}20;">
                    <i data-feather="user" class="w-4 h-4" style="color: ${borderColor};"></i>
                </div>`;
            
            card.innerHTML = `
                <div class="flex items-center">
                    ${profileIconHtml}
                    <div class="employee-info">
                        <div class="employee-name">${this.getEmployeeDisplayName(employee)}</div>
                        <div class="employee-position">${employee.position}</div>
                    </div>
                </div>
            `;
            
            container.appendChild(card);
        });
        
        // Make employee list sortable
        if (typeof Sortable !== 'undefined') {
            new Sortable(container, {
                group: {
                    name: 'employees',
                    pull: 'clone',
                    put: false
                },
                sort: false,
                animation: 150
            });
        }
        
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    renderSchedule() {
        if (this.currentView === 'week') {
            this.renderWeekView();
        } else {
            this.renderMonthView();
        }
        
        // Initialize feather icons after rendering schedule
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    renderWeekView() {
        const container = document.getElementById('weekGrid');
        if (!container) return;
        
        const weekDates = this.getWeekDates(this.currentWeek);
        const days = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'];
        
        container.innerHTML = '';
        container.className = 'day-schedule';
        
        days.forEach((day, index) => {
            const dayColumn = document.createElement('div');
            const date = new Date(weekDates[index] + 'T00:00:00');
            const isToday = this.isToday(date);
            
            // Add today class to the day column for highlighting
            dayColumn.className = `day-column ${isToday ? 'today' : ''}`;
            
            // Check if this day is a holiday or mandatory vacation
            const dateStr = this.formatDate(date);
            const isHoliday = this.isHoliday(dateStr);
            const isMandatoryVacation = this.isMandatoryVacation(dateStr);
            let holidayName = '';
            
            if (isHoliday) {
                const holidayInfo = this.getHolidayInfo(dateStr);
                holidayName = holidayInfo.name;
            } else if (isMandatoryVacation) {
                const mvInfo = this.getMandatoryVacationInfo(dateStr);
                holidayName = mvInfo.name;
            }
            
            // Day header
            const header = document.createElement('div');
            header.className = `day-column-header ${isToday ? 'bg-blue-50 border-blue-200' : ''} ${isHoliday || isMandatoryVacation ? 'holiday-highlight' : ''}`;
            
            if (isHoliday || isMandatoryVacation) {
                header.innerHTML = `
                    <div class="day-column-title ${isToday ? 'text-blue-700' : 'text-red-600'} font-bold">${day}</div>
                    <div class="day-column-date ${isToday ? 'text-blue-600' : 'text-red-500'} text-sm">${this.formatDateDisplay(date)}</div>
                    <div class="holiday-name text-red-600 text-xs font-bold mt-1">${holidayName}</div>
                `;
            } else {
                header.innerHTML = `
                    <div class="day-column-title ${isToday ? 'text-blue-700' : ''}">${day}</div>
                    <div class="day-column-date ${isToday ? 'text-blue-600' : ''}">${this.formatDateDisplay(date)}</div>
                `;
            }
            
            dayColumn.appendChild(header);
            
            // Day content
            const content = document.createElement('div');
            content.className = 'day-column-content';
            content.dataset.date = weekDates[index];
            
            // Add existing shifts for this day
            const dayShifts = this.getShiftsForDay(weekDates[index]);
            dayShifts.sort((a, b) => this.parseTime(a.startTime) - this.parseTime(b.startTime));
            
            // We'll handle holiday/mandatory vacation display in the day header instead of a card
            // So we don't need to check for holidays here anymore
            
            dayShifts.forEach(shift => {
                const shiftElement = this.createDayShift(shift);
                content.appendChild(shiftElement);
            });
            
            // Adjust height based on content
            this.adjustDayColumnHeight(content, dayShifts.length);
            
            // Make droppable
            this.makeSlotDroppable(content, weekDates[index]);
            
            // Add click handler for new shifts
            content.addEventListener('click', (e) => {
                if (e.target === content) {
                    this.openShiftModal(weekDates[index], '09:00');
                }
            });
            
            dayColumn.appendChild(content);
            container.appendChild(dayColumn);
        });
    }

    createDayShift(shift) {
        const employee = this.employees.find(emp => String(emp.id) === String(shift.employeeId));
        if (!employee) return document.createElement('div');
        
        const shiftElement = document.createElement('div');
        shiftElement.className = `day-shift ${shift.type}`;
        shiftElement.dataset.shiftId = shift.id;
        shiftElement.dataset.employeeId = shift.employeeId;
        shiftElement.dataset.originalDate = shift.date;
        shiftElement.draggable = true;
        
        // Use custom employee color if available
        if (employee.customColor && shift.type === 'regular') {
            shiftElement.classList.add('has-custom-color');
            const rgb = this.hexToRgb(employee.customColor);
            shiftElement.style.setProperty('--employee-color', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
        } else {
            // Set border color based on shift type for non-regular shifts
            let borderColor = employee.customColor || '#3b82f6';
            switch (shift.type) {
                case 'vacation': borderColor = '#f59e0b'; break;
                case 'sick': borderColor = '#ef4444'; break;
                case 'holiday': borderColor = '#22c55e'; break;
                case 'training': borderColor = '#6366f1'; break;
            }
            shiftElement.style.borderLeftColor = borderColor;
        }
        
        // Display different content based on shift type
        let timeDisplay = `${this.formatTime(shift.startTime)} - ${this.formatTime(shift.endTime)}`;
        let positionDisplay = shift.position;
        
        // For non-regular shifts, show the type instead of time but keep the position
        if (shift.type !== 'regular') {
            switch (shift.type) {
                case 'vacation':
                    timeDisplay = 'Szabadság';
                    break;
                case 'sick':
                    timeDisplay = 'Betegség';
                    break;
                case 'holiday':
                    timeDisplay = 'Ünnep';
                    break;
                case 'training':
                    timeDisplay = 'Képzés';
                    break;
            }
        }
        
        shiftElement.innerHTML = `
            <div class="day-shift-employee">${this.getEmployeeDisplayName(employee)}</div>
            <div class="day-shift-time">${timeDisplay}</div>
            <div class="day-shift-position">${positionDisplay}</div>
            <button class="absolute top-2 right-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <i data-feather="x" class="w-3 h-3"></i>
            </button>
        `;
        
        // Add hover class for button visibility
        shiftElement.classList.add('group');
        
        // Add drag event listeners
        shiftElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', JSON.stringify({
                shiftId: shift.id,
                employeeId: shift.employeeId,
                originalDate: shift.date,
                type: 'shift'
            }));
            shiftElement.classList.add('dragging');
        });
        
        shiftElement.addEventListener('dragend', () => {
            shiftElement.classList.remove('dragging');
        });
        
        // Add click handler
        shiftElement.addEventListener('click', (e) => {
            e.stopPropagation();
            if (e.target.closest('button')) {
                this.removeShift(shift.id);
                this.showNotification('Műszak sikeresen törölve', 'success');
            } else {
                this.editShift(shift);
            }
        });
        
        return shiftElement;
    }

    formatTime(time24) {
        // Return military time format (24-hour)
        return time24;
    }

    // Currency helpers
    getCurrencySymbol() {
        const cur = (typeof localStorage !== 'undefined' && localStorage.getItem('scheduleManager_currency')) || 'Ft';
        if (cur === 'Ft' || cur === '€' || cur === '$') return cur;
        return 'Ft';
    }

    // New function to format currency with proper positioning
    formatCurrency(amount) {
        const symbol = this.getCurrencySymbol();
        let formattedAmount;
        
        // Format the amount with thousand separators (spaces)
        if (typeof amount === 'number') {
            // For Ft, no decimals
            if (symbol === 'Ft') {
                formattedAmount = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
            } else {
                // For other currencies, keep 2 decimals
                formattedAmount = amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
            }
        } else {
            formattedAmount = amount;
        }
        
        // For Ft, place symbol after amount with space
        if (symbol === 'Ft') {
            return `${formattedAmount} Ft`;
        }
        
        // For other currencies, place symbol before amount
        return `${symbol}${formattedAmount}`;
    }

    // New function to format numbers with thousand separators
    formatNumber(number, decimals = 2) {
        if (typeof number !== 'number') return number;
        return number.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 59, g: 130, b: 246 }; // default blue
    }

    adjustDayColumnHeight(content, shiftCount) {
        // Base height + additional height per shift
        const baseHeight = 200;
        const heightPerShift = 80;
        const maxHeight = 600;
        
        let calculatedHeight = baseHeight;
        if (shiftCount > 0) {
            calculatedHeight = Math.min(baseHeight + (shiftCount * heightPerShift), maxHeight);
            content.classList.add('has-shifts');
        } else {
            content.classList.remove('has-shifts');
        }
        
        content.style.minHeight = `${calculatedHeight}px`;
    }

    renderMonthView() {
        const container = document.getElementById('monthGrid');
        if (!container) return;
        
        // Clean up any existing trash icons
        const existingTrashIcons = container.querySelectorAll('.week-trash-container');
        existingTrashIcons.forEach(icon => icon.remove());
        
        // Remove custom attributes that track event listeners
        const existingCells = container.querySelectorAll('.month-day');
        existingCells.forEach(cell => {
            cell.removeAttribute('data-click-handler-added');
            cell.removeAttribute('data-hover-handler-added');
        });
        
        // Remove click handler added attribute from trash icons
        const existingTrashIcons2 = container.querySelectorAll('.week-trash-icon');
        existingTrashIcons2.forEach(icon => {
            icon.removeAttribute('data-click-handler-added');
        });
        
        const year = this.currentMonth.year;
        const month = this.currentMonth.month;
        
        // Get first day of month and calculate calendar grid
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        // Align start to Monday of the first week shown
        const firstDayIndex = (firstDay.getDay() + 6) % 7; // 0=Monday
        startDate.setDate(startDate.getDate() - firstDayIndex);
        
        // Calculate how many weeks we need to show the full month
        const endDate = new Date(lastDay);
        const lastDayIndex = (lastDay.getDay() + 6) % 7; // 0=Monday
        endDate.setDate(endDate.getDate() + (6 - lastDayIndex));
        // Use noon-based timestamps to avoid DST off-by-one errors
        const startNoon = new Date(startDate); startNoon.setHours(12,0,0,0);
        const endNoon = new Date(endDate); endNoon.setHours(12,0,0,0);
        const msPerDay = 1000 * 60 * 60 * 24;
        const totalDays = Math.round((endNoon - startNoon) / msPerDay) + 1; // inclusive
        const weeksNeeded = Math.ceil(totalDays / 7);
        const daysToShow = Math.min(weeksNeeded * 7, 42); // Cap at 6 weeks maximum
        
        container.innerHTML = '';
        
        // Add day headers
        const dayNames = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtő', 'Péntek', 'Szombat', 'Vasárnap'];
        dayNames.forEach(dayName => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'month-header';
            dayHeader.textContent = dayName;
            container.appendChild(dayHeader);
        });
        
        // Track weeks for click handling
        let currentWeekStart = null;
        let weekCells = [];
        let weekCount = 0;
        
        // Generate calendar days
        for (let i = 0; i < daysToShow; i++) {
            const date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
            
            // Check if we're starting a new week (Monday)
            const isMonday = date.getDay() === 1; // 1 = Monday in JavaScript
            if (isMonday || i === 0) {
                // Handle the previous week if it exists
                if (weekCells.length > 0 && currentWeekStart) {
                    this.addWeekClickHandler(weekCells, currentWeekStart);
                    this.addWeekTrashIcon(weekCells, currentWeekStart);
                    weekCount++;
                }
                
                // Start new week
                currentWeekStart = new Date(date);
                weekCells = [];
            }
            
            const dayCell = document.createElement('div');
            dayCell.className = 'month-day';
            dayCell.dataset.date = this.formatDate(date);
            
            if (date.getMonth() !== month) {
                dayCell.classList.add('other-month');
            }
            
            if (this.isToday(date)) {
                dayCell.classList.add('today');
            }
            
            const dateStr = this.formatDate(date);
            
            // Check if this day is a holiday or mandatory vacation
            const isHoliday = this.isHoliday(dateStr);
            const isMandatoryVacation = this.isMandatoryVacation(dateStr);
            let holidayName = '';
            
            if (isHoliday) {
                const holidayInfo = this.getHolidayInfo(dateStr);
                holidayName = holidayInfo.name;
            } else if (isMandatoryVacation) {
                const mvInfo = this.getMandatoryVacationInfo(dateStr);
                holidayName = mvInfo.name;
            }
            
            // Create a container for the day header
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header-container';
            dayHeader.style.display = 'flex';
            dayHeader.style.alignItems = 'center';
            dayHeader.style.justifyContent = 'space-between';
            dayHeader.style.marginBottom = '5px';
            
            // Create day number element
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = date.getDate();
            dayNumber.style.fontWeight = 'bold';
            
            // Highlight the day number if it's a holiday or mandatory vacation
            if (isHoliday || isMandatoryVacation) {
                dayNumber.style.color = '#dc2626'; // red color for holidays
                dayNumber.style.fontWeight = 'bold';
            }
            
            // Prevent dragging and selecting day numbers
            dayNumber.style.pointerEvents = 'none';
            dayNumber.style.userSelect = 'none';
            dayNumber.style.webkitUserSelect = 'none';
            dayNumber.style.mozUserSelect = 'none';
            dayNumber.style.msUserSelect = 'none';
            dayNumber.draggable = false;
            
            // Create holiday name element (if applicable)
            const holidayNameElement = document.createElement('div');
            holidayNameElement.className = 'holiday-name';
            holidayNameElement.textContent = holidayName;
            // Add title attribute for full name display on hover
            holidayNameElement.title = holidayName;
            
            // Add elements to day header container
            dayHeader.appendChild(dayNumber);
            
            // Only add holiday name if there is one
            if (holidayName) {
                dayHeader.appendChild(holidayNameElement);
            }
            
            dayCell.appendChild(dayHeader);
            
            // Add shifts for this day
            const dayShifts = this.getShiftsForDay(dateStr);
            
            dayShifts.forEach(shift => {
                const shiftCard = this.createShiftCard(shift, true);
                dayCell.appendChild(shiftCard);
            });
            
            // Make droppable
            this.makeSlotDroppable(dayCell, dateStr);
            
            // Add to current week cells
            weekCells.push(dayCell);
            
            container.appendChild(dayCell);
        }
        
        // Handle the last week
        if (weekCells.length > 0 && currentWeekStart) {
            this.addWeekClickHandler(weekCells, currentWeekStart);
            this.addWeekTrashIcon(weekCells, currentWeekStart);
            weekCount++;
        }
        
        // Initialize feather icons for trash icons
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    renderEmployeeList() {
        const container = document.getElementById('employeeList');
        if (!container) return;
        
        container.innerHTML = '';
        
        const activeEmployees = this.employees.filter(emp => emp.isActive);
        
        activeEmployees.forEach(employee => {
            const card = document.createElement('div');
            card.className = `employee-card-with-pic custom-styled-employee-card cursor-move`;
            card.draggable = true;
            card.dataset.employeeId = employee.id;
            
            // Apply custom color with border style for better visibility
            card.style.backgroundColor = 'transparent';
            card.style.borderWidth = '1px';
            card.style.borderStyle = 'solid';
            card.style.color = this.isDarkMode ? '#ffffff' : '#000000';
            
            // Ensure employee has customColor property (for backward compatibility)
            if (!employee.hasOwnProperty('customColor')) {
                employee.customColor = null;
            }
            
            if (employee.customColor) {
                card.style.borderColor = employee.customColor;
            } else {
                // Use default color scheme based on employee.color class
                switch (employee.color) {
                    case 'color-1':
                        card.style.borderColor = '#3b82f6';
                        break;
                    case 'color-2':
                        card.style.borderColor = '#10b981';
                        break;
                    case 'color-3':
                        card.style.borderColor = '#8b5cf6';
                        break;
                    case 'color-4':
                        card.style.borderColor = '#f59e0b';
                        break;
                    case 'color-5':
                        card.style.borderColor = '#ef4444';
                        break;
                    case 'color-6':
                        card.style.borderColor = '#a855f7';
                        break;
                    case 'color-7':
                        card.style.borderColor = '#059669';
                        break;
                    case 'color-8':
                        card.style.borderColor = '#ec4899';
                        break;
                    default:
                        card.style.borderColor = '#3b82f6';
                }
            }
            
            card.innerHTML = `
                <div class="employee-info">
                    <div class="employee-name">${this.getEmployeeDisplayName(employee)}</div>
                    <div class="employee-position">${employee.position}</div>
                </div>
            `;
            
            container.appendChild(card);
        });
        
        // Make employee list sortable
        if (typeof Sortable !== 'undefined') {
            new Sortable(container, {
                group: {
                    name: 'employees',
                    pull: 'clone',
                    put: false
                },
                sort: false,
                animation: 150
            });
        }
        
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    getShiftsForSlot(date, hour) {
        const weekKey = this.currentWeek;
        if (!this.schedules[weekKey] || !this.schedules[weekKey][date]) {
            return [];
        }
        
        return this.schedules[weekKey][date].filter(shift => {
            const startHour = this.parseTime(shift.startTime);
            const endHour = this.parseTime(shift.endTime);
            const slotHour = this.parseTime(this.convertTo24Hour(hour));
            
            return slotHour >= startHour && slotHour < endHour;
        });
    }

    getShiftsForDay(date) {
        // For monthly view, we need to find the correct week for this date
        if (this.currentView === 'month') {
            const shiftDate = new Date(date + 'T00:00:00');
            const weekKey = this.getWeekKey(shiftDate);
            if (!this.schedules[weekKey] || !this.schedules[weekKey][date]) {
                return [];
            }
            return this.schedules[weekKey][date];
        } else {
            // For weekly view, use current week
            const weekKey = this.currentWeek;
            if (!this.schedules[weekKey] || !this.schedules[weekKey][date]) {
                return [];
            }
            return this.schedules[weekKey][date];
        }
    }

    // Check if a date is a holiday or mandatory vacation
    isHoliday(date) {
        const year = new Date(date).getFullYear();
        if (!this.holidays[year]) {
            // Initialize holidays for this year if they don't exist
            this.holidays[year] = this.getDefaultHolidaysForYear(year);
            this.saveData();
        }
        return this.holidays[year].some(holiday => holiday.date === date);
    }

    isMandatoryVacation(date) {
        const year = new Date(date).getFullYear();
        if (!this.mandatoryVacations[year]) {
            this.mandatoryVacations[year] = [];
        }
        return this.mandatoryVacations[year].some(mv => mv.date === date);
    }

    getHolidayInfo(date) {
        const year = new Date(date).getFullYear();
        if (!this.holidays[year]) {
            // Initialize holidays for this year if they don't exist
            this.holidays[year] = this.getDefaultHolidaysForYear(year);
            this.saveData();
        }
        return this.holidays[year].find(holiday => holiday.date === date);
    }

    getMandatoryVacationInfo(date) {
        const year = new Date(date).getFullYear();
        if (!this.mandatoryVacations[year]) {
            this.mandatoryVacations[year] = [];
        }
        return this.mandatoryVacations[year].find(mv => mv.date === date);
    }

    createShiftCard(shift, compact = false) {
        const employee = this.employees.find(emp => String(emp.id) === String(shift.employeeId));
        if (!employee) return document.createElement('div');
        
        const card = document.createElement('div');
        card.className = `shift-card ${shift.type} ${employee.color}`;
        card.dataset.shiftId = shift.id;
        card.dataset.employeeId = shift.employeeId;
        card.dataset.originalDate = shift.date;
        card.draggable = true;
        
        // Display different content based on shift type
        let timeDisplay = `${this.formatTime(shift.startTime)} - ${this.formatTime(shift.endTime)}`;
        let positionDisplay = shift.position;
        
        // For non-regular shifts, show the type instead of time but keep the position
        if (shift.type !== 'regular') {
            switch (shift.type) {
                case 'vacation':
                    timeDisplay = 'Szabadság';
                    break;
                case 'sick':

                    timeDisplay = 'Betegszabadság';
                    break;
                case 'holiday':
                    timeDisplay = 'Ünnep';
                    break;
                case 'training':
                    timeDisplay = 'Képzés';
                    break;
            }
        }
        
        if (compact) {
            // Month view: show only the employee name and shift type
            card.innerHTML = `
                <div class="text-xs truncate">
                    <span class="font-medium">${this.getEmployeeDisplayName(employee)}</span>
                    <div class="text-xs opacity-75">${timeDisplay}</div>
                </div>
            `;
            // Apply employee-assigned color for compact (month) cards
            // Use border instead of background for better visibility
            card.style.backgroundColor = 'transparent';
            card.style.borderWidth = '1px';
            card.style.borderStyle = 'solid';
            
            // Set border color based on employee's custom color or default color
            if (employee.customColor) {
                card.style.borderColor = employee.customColor;
            } else {
                // Use default color scheme based on employee.color class
                switch (employee.color) {
                    case 'color-1':
                        card.style.borderColor = '#3b82f6';
                        break;
                    case 'color-2':
                        card.style.borderColor = '#10b981';
                        break;
                    case 'color-3':
                        card.style.borderColor = '#8b5cf6';
                        break;
                    case 'color-4':
                        card.style.borderColor = '#f59e0b';
                        break;
                    case 'color-5':
                        card.style.borderColor = '#ef4444';
                        break;
                    case 'color-6':
                        card.style.borderColor = '#a855f7';
                        break;
                    case 'color-7':
                        card.style.borderColor = '#059669';
                        break;
                    case 'color-8':
                        card.style.borderColor = '#ec4899';
                        break;
                    default:
                        card.style.borderColor = '#3b82f6';
                }
            }
        } else {
            card.innerHTML = `
                <div class="flex justify-between items-center">
                    <div class="truncate">
                        <div class="font-medium">${this.getEmployeeDisplayName(employee)}</div>
                        <div class="text-xs opacity-75">${timeDisplay}</div>
                        <div class="text-xs text-gray-700 truncate">${positionDisplay || ''}</div>
                    </div>
                    <button class="remove-shift text-xs opacity-50 hover:opacity-100 ml-1">
                        <i data-feather="x" class="w-3 h-3"></i>
                    </button>
                </div>
            `;
        }
        
        // Add drag event listeners
        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', JSON.stringify({
                shiftId: shift.id,
                employeeId: shift.employeeId,
                originalDate: shift.date,
                type: 'shift'
            }));
            card.classList.add('dragging');
        });
        
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
        });
        
        // Add click handler
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            if (e.target.closest('.remove-shift')) {
                this.removeShift(shift.id);
            } else {
                this.editShift(shift);
            }
        });
        
        return card;
    } 
   makeSlotDroppable(slot, date = null) {
        // Add drag over effects
        slot.addEventListener('dragover', (e) => {
            e.preventDefault();
            slot.classList.add('drag-over');
        });
        
        slot.addEventListener('dragleave', () => {
            slot.classList.remove('drag-over');
        });
        
        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            slot.classList.remove('drag-over');
            
            const dragData = e.dataTransfer.getData('text/plain');
            if (!dragData) return;
            
            try {
                const data = JSON.parse(dragData);
                
                // Get target date
                let targetDate = date;
                if (!targetDate) {
                    targetDate = slot.dataset.date;
                }
                
                if (!targetDate || !this.isValidDate(targetDate)) {
                    console.error('Invalid target date:', targetDate);
                    return;
                }
                
                if (data.type === 'shift') {
                    // Moving existing shift
                    this.moveShiftToDate(data.shiftId, data.originalDate, targetDate);
                } else {
                    // Adding new employee shift
                    const employeeId = String(data.employeeId || e.dataTransfer.getData('text/plain'));
                    const employee = this.employees.find(emp => String(emp.id) === employeeId);
                    
                    if (employee) {
                        // Check if employee already has a shift on this date
                        if (this.hasEmployeeShiftOnDate(employeeId, targetDate)) {
                            this.showNotification(`${this.getEmployeeDisplayName(employee)} már rendelkezik műszakkal ezen a napon!`, 'error');
                            return;
                        }
                        
                        const start = employee.defaultStartTime || '08:00';
                        const end = employee.defaultEndTime || '16:00';
                        const shift = {
                            id: this.generateId(),
                            employeeId: employee.id,
                            date: targetDate,
                            startTime: start,
                            endTime: end,
                            position: employee.position,
                            type: 'regular',
                            notes: ''
                        };
                        
                        this.addShiftToAllViews(shift);
                        this.showNotification(`Hozzáadva: ${this.getEmployeeDisplayName(employee)} - ${this.formatDateDisplay(new Date(targetDate + 'T00:00:00'))}`, 'success');
                    }
                }
                
                this.renderSchedule();
                
            } catch (error) {
                console.error('Error processing drop:', error);
            }
        });
        
        // Keep Sortable for employee list compatibility
        if (typeof Sortable !== 'undefined') {
            new Sortable(slot, {
                group: 'employees',
                animation: 150,
                filter: '.day-number, .day-shift, .shift-card', // Prevent dragging day numbers and shifts via sortable (month and week)
                preventOnFilter: false,
                onAdd: (evt) => {
                    // Handle employee drops from employee list only
                    const fromId = evt.from && evt.from.id;
                    if (fromId !== 'employeeList') {
                        // Ignore drops that are not coming from the employee list
                        if (evt.item && typeof evt.item.remove === 'function') {
                            evt.item.remove();
                        }
                        return;
                    }
                    const employeeId = String(evt.item.dataset.employeeId);
                    const employee = this.employees.find(emp => String(emp.id) === employeeId);
                    
                    if (employee) {
                        let slotDate = date;
                        if (!slotDate) {
                            slotDate = slot.dataset.date;
                        }
                        
                        if (!slotDate || !this.isValidDate(slotDate)) {
                            evt.item.remove();
                            return;
                        }
                        
                        // Check if employee already has a shift on this date
                        if (this.hasEmployeeShiftOnDate(employeeId, slotDate)) {
                            evt.item.remove();
                            this.showNotification(`${this.getEmployeeDisplayName(employee)} már rendelkezik műszakkal ezen a napon!`, 'error');
                            return;
                        }
                        
                        const start = employee.defaultStartTime || '08:00';
                        const end = employee.defaultEndTime || '16:00';
                        const shift = {
                            id: this.generateId(),
                            employeeId: employee.id,
                            date: slotDate,
                            startTime: start,
                            endTime: end,
                            position: employee.position,
                            type: 'regular',
                            notes: ''
                        };
                        
                        this.addShiftToAllViews(shift);
                        evt.item.remove();
                        this.renderSchedule();
                        this.showNotification(`Hozzáadva: ${this.getEmployeeDisplayName(employee)} - ${this.formatDateDisplay(new Date(slotDate + 'T00:00:00'))}`, 'success');
                    }
                }
            });
        }
        
        // Add drag over effects
        slot.addEventListener('dragover', (e) => {
            e.preventDefault();
            slot.classList.add('drag-over');
        });
        
        slot.addEventListener('dragleave', () => {
            slot.classList.remove('drag-over');
        });
        
        slot.addEventListener('drop', () => {
            slot.classList.remove('drag-over');
        });
    }

    // Shift Management
    addShift(shift) {
        const weekKey = this.currentWeek;
        if (!this.schedules[weekKey]) {
            this.schedules[weekKey] = {};
        }
        if (!this.schedules[weekKey][shift.date]) {
            this.schedules[weekKey][shift.date] = [];
        }
        
        this.schedules[weekKey][shift.date].push(shift);
        this.saveData();
    }

    addShiftToAllViews(shift) {
        // Get the week key for the shift's date
        const shiftDate = new Date(shift.date + 'T00:00:00');
        const weekKey = this.getWeekKey(shiftDate);
        
        if (!this.schedules[weekKey]) {
            this.schedules[weekKey] = {};
        }
        if (!this.schedules[weekKey][shift.date]) {
            this.schedules[weekKey][shift.date] = [];
        }
        
        this.schedules[weekKey][shift.date].push(shift);
        this.saveData();
    }

    // New function to check if an employee already has a shift on a specific date
    hasEmployeeShiftOnDate(employeeId, date) {
        // Check all weeks for shifts on this date for this employee
        for (const weekKey in this.schedules) {
            if (this.schedules[weekKey] && this.schedules[weekKey][date]) {
                const shifts = this.schedules[weekKey][date];
                for (const shift of shifts) {
                    if (String(shift.employeeId) === String(employeeId)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // New function to check if a new shift would overlap with existing shifts for the same employee
    checkShiftOverlap(employeeId, date, startTime, endTime) {
        // Check all weeks for shifts on this date for this employee
        for (const weekKey in this.schedules) {
            if (this.schedules[weekKey] && this.schedules[weekKey][date]) {
                const shifts = this.schedules[weekKey][date];
                for (const shift of shifts) {
                    if (String(shift.employeeId) === String(employeeId)) {
                        // Check if time ranges overlap
                        const existingStart = this.parseTime(shift.startTime);
                        const existingEnd = this.parseTime(shift.endTime);
                        const newStart = this.parseTime(startTime);
                        const newEnd = this.parseTime(endTime);
                        
                        // Overlap occurs if: (StartA < EndB) and (EndA > StartB)
                        if (newStart < existingEnd && newEnd > existingStart) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    moveShiftToDate(shiftId, originalDate, targetDate) {
        // Find the shift in all weeks
        let foundShift = null;
        let originalWeekKey = null;
        
        // Search through all weeks to find the shift
        Object.keys(this.schedules).forEach(weekKey => {
            if (this.schedules[weekKey] && this.schedules[weekKey][originalDate]) {
                const shiftIndex = this.schedules[weekKey][originalDate].findIndex(s => s.id === shiftId);
                if (shiftIndex !== -1) {
                    foundShift = this.schedules[weekKey][originalDate][shiftIndex];
                    originalWeekKey = weekKey;
                }
            }
        });
        
        if (!foundShift) {
            console.error('Shift not found:', shiftId);
            return;
        }
        
        // Remove from original location
        this.schedules[originalWeekKey][originalDate] = this.schedules[originalWeekKey][originalDate].filter(s => s.id !== shiftId);
        
        // Clean up empty arrays
        if (this.schedules[originalWeekKey][originalDate].length === 0) {
            delete this.schedules[originalWeekKey][originalDate];
        }
        
        // Update shift date
        foundShift.date = targetDate;
        
        // Add to new location
        const targetShiftDate = new Date(targetDate + 'T00:00:00');
        const targetWeekKey = this.getWeekKey(targetShiftDate);
        
        if (!this.schedules[targetWeekKey]) {
            this.schedules[targetWeekKey] = {};
        }
        if (!this.schedules[targetWeekKey][targetDate]) {
            this.schedules[targetWeekKey][targetDate] = [];
        }
        
        this.schedules[targetWeekKey][targetDate].push(foundShift);
        
        // Save and refresh
        this.saveData();
        
        const employee = this.employees.find(emp => String(emp.id) === String(foundShift.employeeId));
        const employeeName = this.getEmployeeDisplayName(employee);
        this.showNotification(`${employeeName} sikeresen áthelyezve: ${this.formatDateDisplay(new Date(targetDate + 'T00:00:00'))}`, 'success');
    }

    removeShift(shiftId) {
        // Find and remove shift from all weeks
        let shiftFound = false;
        Object.keys(this.schedules).forEach(weekKey => {
            if (this.schedules[weekKey]) {
                Object.keys(this.schedules[weekKey]).forEach(date => {
                    const originalLength = this.schedules[weekKey][date].length;
                    this.schedules[weekKey][date] = this.schedules[weekKey][date].filter(
                        shift => shift.id !== shiftId
                    );
                    if (this.schedules[weekKey][date].length < originalLength) {
                        shiftFound = true;
                    }
                    // Clean up empty arrays
                    if (this.schedules[weekKey][date].length === 0) {
                        delete this.schedules[weekKey][date];
                    }
                });
                // Clean up empty week entries
                if (Object.keys(this.schedules[weekKey]).length === 0) {
                    delete this.schedules[weekKey];
                }
            }
        });
        
        if (shiftFound) {
            this.saveData();
            this.renderSchedule();
        }
    }

    editShift(shift) {
        this.editingShift = shift;
        this.openShiftModal(shift.date, null, shift);
    }

    openShiftModal(date = null, hour = null, shift = null) {
        const modal = document.getElementById('shiftModal');
        const form = document.getElementById('shiftForm');
        
        // Populate employee dropdown
        const employeeSelect = document.getElementById('shiftEmployee');
        employeeSelect.innerHTML = '<option value="">Válassz alkalmazottat</option>';
        this.employees.filter(emp => emp.isActive).forEach(employee => {
            const option = document.createElement('option');
            option.value = employee.id;
            option.textContent = `${this.getEmployeeDisplayName(employee)}`;
            employeeSelect.appendChild(option);
        });
        
        // Store original shift type for comparison
        if (shift) {
            modal.dataset.originalType = shift.type;
        } else {
            modal.dataset.originalType = '';
        }
        
        if (shift) {
            // Edit mode
            document.getElementById('shiftEmployee').value = String(shift.employeeId);
            document.getElementById('startTime').value = shift.startTime;
            document.getElementById('endTime').value = shift.endTime;
            document.getElementById('shiftPosition').value = shift.position;
            document.getElementById('shiftType').value = shift.type;
            document.getElementById('shiftNotes').value = shift.notes;
            document.getElementById('deleteShiftBtn').style.display = 'block';
        } else {
            // Add mode
            form.reset();
            if (hour) {
                document.getElementById('startTime').value = this.convertTo24Hour(hour);
                document.getElementById('endTime').value = this.addHours(this.convertTo24Hour(hour), 8);
            }
            document.getElementById('deleteShiftBtn').style.display = 'none';
        }
        
        modal.classList.add('active');
        modal.dataset.date = date;
    }

    closeShiftModal() {
        document.getElementById('shiftModal').classList.remove('active');
        this.editingShift = null;
        // Clean up dataset
        const modal = document.getElementById('shiftModal');
        delete modal.dataset.originalType;
    }

    // New function to check if a new shift would overlap with existing shifts for the same employee
    checkShiftOverlap(employeeId, date, startTime, endTime, excludeShiftId = null) {
        // Check all weeks for shifts on this date for this employee
        for (const weekKey in this.schedules) {
            if (this.schedules[weekKey] && this.schedules[weekKey][date]) {
                const shifts = this.schedules[weekKey][date];
                for (const shift of shifts) {
                    // Skip the shift we're editing (if specified)
                    if (excludeShiftId && shift.id === excludeShiftId) {
                        continue;
                    }
                    
                    // Only check for the same employee
                    if (String(shift.employeeId) === String(employeeId)) {
                        // Check if time ranges overlap
                        const existingStart = this.parseTime(shift.startTime);
                        const existingEnd = this.parseTime(shift.endTime);
                        const newStart = this.parseTime(startTime);
                        const newEnd = this.parseTime(endTime);
                        
                        // Overlap occurs if: (StartA < EndB) and (EndA > StartB)
                        if (newStart < existingEnd && newEnd > existingStart) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    saveShift() {
        const form = document.getElementById('shiftForm');
        const formData = new FormData(form);
        
        const employeeId = String(document.getElementById('shiftEmployee').value);
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;
        const position = document.getElementById('shiftPosition').value;
        const type = document.getElementById('shiftType').value;
        const notes = document.getElementById('shiftNotes').value;
        const date = document.getElementById('shiftModal').dataset.date;
        
        if (!employeeId || !startTime || !endTime || !position) {
            this.showNotification('Kérjük, tölts ki minden kötelező mezőt', 'error');
            return;
        }
        
        // Check if this employee already has a shift on this date (for regular shifts)
        if (type === 'regular') {
            // If we're editing an existing shift, we only check if we're changing the employee or date
            if (this.editingShift) {
                // If employee or date changed, check for existing shifts
                if ((this.editingShift.employeeId !== employeeId) || (this.editingShift.date !== date)) {
                    if (this.hasEmployeeShiftOnDate(employeeId, date)) {
                        const employee = this.employees.find(emp => String(emp.id) === String(employeeId));
                        const employeeName = this.getEmployeeDisplayName(employee);
                        this.showNotification(`${employeeName} már rendelkezik műszakkal ezen a napon!`, 'error');
                        return;
                    }
                } else {
                    // Same employee and date, check for time overlap with other shifts (excluding the one being edited)
                    if (this.checkShiftOverlap(employeeId, date, startTime, endTime, this.editingShift.id)) {
                        const employee = this.employees.find(emp => String(emp.id) === String(employeeId));
                        const employeeName = this.getEmployeeDisplayName(employee);
                        this.showNotification(`${employeeName} már rendelkezik műszakkal ezen a napon, ami átfedésben van az új műszakkal!`, 'error');
                        return;
                    }
                }
            } else {
                // Adding a new shift, check if employee already has a shift on this date
                if (this.hasEmployeeShiftOnDate(employeeId, date)) {
                    const employee = this.employees.find(emp => String(emp.id) === String(employeeId));
                    const employeeName = this.getEmployeeDisplayName(employee);
                    this.showNotification(`${employeeName} már rendelkezik műszakkal ezen a napon!`, 'error');
                    return;
                }
            }
        }
        
        const shift = {
            id: this.editingShift ? this.editingShift.id : this.generateId(),
            employeeId,
            date,
            startTime,
            endTime,
            position,
            type,
            notes
        };
        
        // Check vacation/sick days before saving if it's a leave type and type has changed
        if ((type === 'vacation' || type === 'sick') && 
            (!this.editingShift || this.editingShift.type !== type)) {
            const alertResult = this.checkLeaveDaysAlert(employeeId, type);
            if (alertResult.shouldAlert) {
                // Show confirmation dialog before proceeding
                this.showConfirmation(
                    alertResult.title,
                    alertResult.message,
                    () => {
                        // User confirmed, proceed with saving
                        if (this.editingShift) {
                            // Update existing shift
                            this.removeShift(this.editingShift.id);
                        }
                        
                        this.addShift(shift);
                        this.closeShiftModal();
                        this.renderSchedule();
                    },
                    'Mentés',
                    'bg-blue-600 hover:bg-blue-700'
                );
                return; // Don't proceed with saving yet
            }
        }
        
        if (this.editingShift) {
            // Update existing shift
            this.removeShift(this.editingShift.id);
        }
        
        this.addShift(shift);
        this.closeShiftModal();
        this.renderSchedule();
    }

    // New method to check if employee is running low on leave days
    checkLeaveDaysAlert(employeeId, leaveType) {
        const employee = this.employees.find(emp => String(emp.id) === String(employeeId));
        if (!employee) return { shouldAlert: false };
        
        // Calculate current leave days used
        let usedDays = 0;
        const maxDays = leaveType === 'vacation' ? employee.vacationDaysPerYear : employee.sickDaysPerYear;
        
        // Count used days from all schedules
        Object.keys(this.schedules).forEach(weekKey => {
            if (this.schedules[weekKey]) {
                Object.keys(this.schedules[weekKey]).forEach(date => {
                    if (this.schedules[weekKey][date]) {
                        this.schedules[weekKey][date].forEach(shift => {
                            if (String(shift.employeeId) === String(employeeId) && shift.type === leaveType) {
                                usedDays++;
                            }
                        });
                    }
                });
            }
        });
        
        // If we're editing and the original shift was of the same type, don't count it twice
        if (this.editingShift && this.editingShift.type === leaveType) {
            // We're modifying an existing leave shift, so don't increment the count
        } else {
            // We're adding a new leave shift or changing type, so increment the count
            usedDays++;
        }
        
        const remainingDays = maxDays - usedDays;
        
        // Check if we should show an alert
        if (remainingDays < 0) {
            // No days left
            return {
                shouldAlert: true,
                title: leaveType === 'vacation' ? 'Szabadság elfogyott' : 'Betegszabadság elfogyott',
                message: `${this.getEmployeeDisplayName(employee)} nem rendelkezik több ${leaveType === 'vacation' ? 'szabadsággal' : 'betegszabadsággal'}. Biztosan hozzá szeretnéd adni ezt a műszakot?`
            };
        } else if (remainingDays <= 0) {
            // No days left
            return {
                shouldAlert: true,
                title: leaveType === 'vacation' ? 'Szabadság el fog fogyni' : 'Betegszabadság elfogyott',
                message: `${this.getEmployeeDisplayName(employee)} ez a művelet után nem fog rendelkezni több ${leaveType === 'vacation' ? 'szabadsággal' : 'betegszabadsággal'}. Biztosan hozzá szeretnéd adni ezt a műszakot?`
            };
        } else if (remainingDays <= 2) {
            // Low on days (2 or fewer remaining)
            return {
                shouldAlert: true,
                title: leaveType === 'vacation' ? 'Kevés szabadság maradt' : 'Kevés betegszabadság maradt',
                message: `${this.getEmployeeDisplayName(employee)} ez a művelet után csak ${remainingDays} ${leaveType === 'vacation' ? 'szabadsággal' : 'betegszabadsággal'} fog rendelkezni. Biztosan hozzá szeretnéd adni ezt a műszakot?`
            };
        }
        
        // No alert needed
        return { shouldAlert: false };
    }

    deleteShift() {
        if (!this.editingShift) return;
        
        const employee = this.employees.find(emp => String(emp.id) === String(this.editingShift.employeeId));
        const employeeName = this.getEmployeeDisplayName(employee) || 'Unknown Employee';
        
        this.showConfirmation(
            'Műszak Törlése',
            `Biztos vagy benne, hogy törölni akarod ${employeeName} műszakját?`,
            () => {
                this.removeShift(this.editingShift.id);
                this.closeShiftModal();
                this.renderSchedule();
                this.showNotification('Műszak sikeresen törölve', 'success');
            }
        );
    }

    // Employee Management
    renderEmployeeTable() {
        const tbody = document.getElementById('employeeTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        this.employees.forEach(employee => {
            // Determine the color to use for the profile icon
            let profileIconColor = '#3b82f6'; // Default color
            if (employee.customColor) {
                profileIconColor = employee.customColor;
            } else {
                // Use default color scheme based on employee.color class
                switch (employee.color) {
                    case 'color-1':
                        profileIconColor = '#3b82f6';
                        break;
                    case 'color-2':
                        profileIconColor = '#10b981';
                        break;
                    case 'color-3':
                        profileIconColor = '#8b5cf6';
                        break;
                    case 'color-4':
                        profileIconColor = '#f59e0b';
                        break;
                    case 'color-5':
                        profileIconColor = '#ef4444';
                        break;
                    case 'color-6':
                        profileIconColor = '#a855f7';
                        break;
                    case 'color-7':
                        profileIconColor = '#059669';
                        break;
                    case 'color-8':
                        profileIconColor = '#ec4899';
                        break;
                }
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center mr-3 overflow-hidden" style="border: 2px solid ${profileIconColor};">
                            ${employee.profilePic ? 
                                `<img src="${employee.profilePic}" alt="${this.getEmployeeDisplayName(employee)}" class="w-full h-full object-cover">` :
                                `<i data-feather="user" class="w-4 h-4" style="color: ${profileIconColor};"></i>`
                            }
                        </div>
                        <div>
                            <div class="text-sm font-medium text-gray-900">${this.getEmployeeDisplayName(employee)}</div>
                            <div class="text-sm text-gray-500">${employee.email}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${employee.department}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${employee.minHours} - ${employee.maxHours}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${this.formatCurrency(employee.basePay)}/ó</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${employee.vacationDaysPerYear}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${employee.isActive ? 'Aktív' : 'Inaktív'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                        <button onclick="scheduleManager.editEmployee('${employee.id}')" class="action-btn edit" title="Alkalmazott Szerkesztése">
                            <i data-feather="edit-2" class="w-4 h-4"></i>
                        </button>
                        <button onclick="scheduleManager.deleteEmployee('${employee.id}')" class="action-btn delete" title="Alkalmazott Törlése">
                            <i data-feather="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    openEmployeeModal(employee = null) {
        const modal = document.getElementById('employeeModal');
        const form = document.getElementById('employeeForm');
        
        if (employee) {
            // Edit mode
            this.editingEmployee = employee;
            document.getElementById('modalTitle').textContent = 'Edit Employee';
            
            // Populate form
            const fullName = (employee.name && employee.name.trim()) || [employee.firstName, employee.lastName].filter(Boolean).join(' ').trim();
            document.getElementById('name').value = fullName;
            document.getElementById('nickname').value = employee.nickname || '';
            document.getElementById('email').value = employee.email;
            document.getElementById('phone').value = employee.phone;
            document.getElementById('department').value = employee.department;
            document.getElementById('position').value = employee.position;
            document.getElementById('minHours').value = employee.minHours;
            document.getElementById('maxHours').value = employee.maxHours;
            document.getElementById('basePay').value = employee.basePay;
            document.getElementById('overtimePremium').value = employee.overtimePremium;
            document.getElementById('vacationDaysPerYear').value = employee.vacationDaysPerYear;
            document.getElementById('sickDaysPerYear').value = employee.sickDaysPerYear;
            document.getElementById('customFields').value = employee.customFields;
            document.getElementById('isActive').checked = employee.isActive;
        } else {
            // Add mode
            this.editingEmployee = null;
            document.getElementById('modalTitle').textContent = 'Alklalmazott Hozzáadása';
            form.reset();
            document.getElementById('isActive').checked = true;
        }
        
        modal.classList.add('active');
        // Ensure the modal starts at the top and focus the first field
        const content = modal.querySelector('.modal-content');
        if (content) {
            content.scrollTop = 0;
        }
        const firstInput = document.getElementById('name');
        if (firstInput) {
            firstInput.focus({ preventScroll: true });
        }
    }

    closeEmployeeModal() {
        document.getElementById('employeeModal').classList.remove('active');
        this.editingEmployee = null;
    }

    saveEmployee() {
        const form = document.getElementById('employeeForm');
        
        const employee = {
            id: this.editingEmployee ? this.editingEmployee.id : this.generateId(),
            name: document.getElementById('name').value,
            nickname: document.getElementById('nickname').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            department: document.getElementById('department').value,
            position: document.getElementById('position').value,
            minHours: parseInt(document.getElementById('minHours').value) || 0,
            maxHours: parseInt(document.getElementById('maxHours').value) || 40,
            basePay: parseFloat(document.getElementById('basePay').value) || 0,
            overtimePremium: parseFloat(document.getElementById('overtimePremium').value) || 50,
            vacationDaysPerYear: parseInt(document.getElementById('vacationDaysPerYear').value) || 0,
            sickDaysPerYear: parseInt(document.getElementById('sickDaysPerYear').value) || 0,
            customFields: document.getElementById('customFields').value,
            isActive: document.getElementById('isActive').checked,
            color: this.editingEmployee ? this.editingEmployee.color : this.getNextEmployeeColor(),
            customColor: document.getElementById('employeeColor').value,
            profilePic: this.currentProfilePic,
            defaultStartTime: (document.getElementById('defaultStartTime') && document.getElementById('defaultStartTime').value) || '08:00',
            defaultEndTime: (document.getElementById('defaultEndTime') && document.getElementById('defaultEndTime').value) || '16:00'
        };
        
        if (!employee.name || !employee.department || !employee.position) {
            this.showNotification('Kérjük, tölts ki minden kötelező mezőt', 'error');
            return;
        }
        
        if (this.editingEmployee) {
            // Update existing employee
            const index = this.employees.findIndex(emp => String(emp.id) === String(this.editingEmployee.id));
            this.employees[index] = employee;
            
            // Update employee information in existing shifts
            let updatedShifts = 0;
            Object.keys(this.schedules).forEach(weekKey => {
                Object.keys(this.schedules[weekKey]).forEach(date => {
                    this.schedules[weekKey][date].forEach(shift => {
                        if (String(shift.employeeId) === String(this.editingEmployee.id)) {
                            // Update shift with new employee information
                            shift.position = employee.position;
                            // Note: We don't update the employee name in shifts as it's looked up dynamically
                            updatedShifts++;
                        }
                    });
                });
            });
            
            console.log(`Updated ${updatedShifts} shifts for employee ${employee.name}`);
        } else {
            // Add new employee
            this.employees.push(employee);
        }
        
        this.saveData();
        this.closeEmployeeModal();
        this.renderEmployeeTable();
        this.renderEmployeeList();
        this.renderSchedule(); // Re-render schedule to reflect changes
        this.showNotification(`Alkalmazott: ${this.getEmployeeDisplayName(employee)} ${this.editingEmployee ? 'frissítve' : 'hozzáadva'} sikeresen!`, 'success');
    }

    editEmployee(id) {
        const employee = this.employees.find(emp => String(emp.id) === String(id));
        if (employee) {
            this.openEmployeeModal(employee);
        }
    }

    deleteEmployee(id) {
        const employee = this.employees.find(emp => String(emp.id) === String(id));
        if (!employee) return;
        
        this.showConfirmation(
            'Alkalmazott Törlése',
            `Biztos vagy benne, hogy törölni akarod ${this.getEmployeeDisplayName(employee)} alkalmazottat? Ez eltávolítja az összes beosztott műszakját is.`, 
            () => {
                this.employees = this.employees.filter(emp => String(emp.id) !== String(id));
                
                // Remove all shifts for this employee
                Object.keys(this.schedules).forEach(week => {
                    Object.keys(this.schedules[week]).forEach(date => {
                        this.schedules[week][date] = this.schedules[week][date].filter(
                            shift => String(shift.employeeId) !== String(id)
                        );
                    });
                });
                
                this.saveData();
                this.renderEmployeeTable();
                this.renderEmployeeList();
                this.renderSchedule();
                this.showNotification(`Alkalmazott: ${this.getEmployeeDisplayName(employee)} sikeresen törölve`, 'success');
            }
        );
    }

    getNextEmployeeColor() {
        const colors = ['color-1', 'color-2', 'color-3', 'color-4', 'color-5', 'color-6', 'color-7', 'color-8'];
        const usedColors = this.employees.map(emp => emp.color);
        const availableColors = colors.filter(color => !usedColors.includes(color));
        return availableColors.length > 0 ? availableColors[0] : colors[Math.floor(Math.random() * colors.length)];
    }    
// Utility Functions
    parseTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    convertTo24Hour(time12h) {
        if (time12h.includes(':') && !time12h.includes('M')) {
            return time12h; // Already 24-hour format
        }
        
        const [time, modifier] = time12h.split(' ');
        let [hours, minutes] = time.split(':');
        
        if (hours === '12') {
            hours = '00';
        }
        
        if (modifier === 'PM') {
            hours = parseInt(hours, 10) + 12;
        }
        
        return `${hours.toString().padStart(2, '0')}:${minutes || '00'}`;
    }

    addHours(timeStr, hoursToAdd) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + (hoursToAdd * 60);
        const newHours = Math.floor(totalMinutes / 60) % 24;
        const newMinutes = totalMinutes % 60;
        
        return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
    }

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    addWeekClickHandler(weekCells, weekStartDate) {
        // Add click handler to each cell in the week
        weekCells.forEach(cell => {
            // Check if event listener has already been added
            if (!cell.hasAttribute('data-click-handler-added')) {
                cell.setAttribute('data-click-handler-added', 'true');
                
                cell.addEventListener('click', (e) => {
                    // Handle clicks in month view
                    if (this.currentView === 'month') {
                        e.stopPropagation();
                        
                        // If we have copied week data, paste it to this week
                        if (this.copiedWeek) {
                            const weekStartStr = this.formatDate(weekStartDate);
                            this.pasteWeekToMonthView(weekStartStr);
                        } else {
                            // If no copied week data, copy this week
                            const weekStartStr = this.formatDate(weekStartDate);
                            this.copyWeekFromMonthView(weekStartStr);
                            // Highlight the selected week more obviously
                            this.highlightSelectedWeek(weekCells);
                        }
                    }
                });
            }
        });
    }

    // New function to highlight the selected week more obviously
    highlightSelectedWeek(weekCells) {
        // Remove any existing highlighted weeks
        document.querySelectorAll('.month-day.highlighted-week').forEach(cell => {
            cell.classList.remove('highlighted-week');
        });
        
        // Add highlight class to the selected week
        weekCells.forEach(cell => {
            cell.classList.add('highlighted-week');
        });
    }
    
    addWeekTrashIcon(weekCells, weekStartDate) {
        // Create a container for the trash icon outside the grid
        const monthGrid = document.getElementById('monthGrid');
        if (!monthGrid) return;
        
        // Create trash icon container
        const trashContainer = document.createElement('div');
        trashContainer.className = 'week-trash-container';
        trashContainer.style.cssText = `
            position: absolute;
            top: ${weekCells[0].offsetTop + 5}px;
            right: -25px;
            opacity: 0;
            transition: opacity 0.2s ease;
            z-index: 10;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        // Create trash icon
        const trashIcon = document.createElement('i');
        trashIcon.setAttribute('data-feather', 'trash-2');
        trashIcon.className = 'week-trash-icon';
        trashIcon.style.cssText = `
            width: 16px;
            height: 16px;
            color: #ef4444;
            cursor: pointer;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 50%;
            padding: 2px;
        `;
        
        trashContainer.appendChild(trashIcon);
        monthGrid.appendChild(trashContainer);
        
        // Add hover events to show/hide trash icon
        weekCells.forEach(cell => {
            // Check if event listener has already been added
            if (!cell.hasAttribute('data-hover-handler-added')) {
                cell.setAttribute('data-hover-handler-added', 'true');
                
                cell.addEventListener('mouseenter', () => {
                    trashContainer.style.opacity = '1';
                });
                
                cell.addEventListener('mouseleave', () => {
                    trashContainer.style.opacity = '0';
                });
            }
        });
        
        // Add click event to trash icon
        if (!trashIcon.hasAttribute('data-click-handler-added')) {
            trashIcon.setAttribute('data-click-handler-added', 'true');
            
            trashIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                const weekStartStr = this.formatDate(weekStartDate);
                
                // Show confirmation dialog
                const weekEnd = new Date(weekStartDate);
                weekEnd.setDate(weekEnd.getDate() + 6);
                
                this.showConfirmation(
                    'Hét Törlése',
                    `Biztosan törölni szeretnéd a műszakbeosztást a következő időszakra: ${this.formatDateDisplay(weekStartDate)} - ${this.formatDateDisplay(weekEnd)}?`,
                    () => {
                        // Clear the week
                        this.clearWeekSchedule(weekStartStr);
                        this.showNotification('Hét sikeresen törölve!', 'success');
                    },
                    'Törlés',
                    'bg-red-600 hover:bg-red-700'
                );
            });
        }
    }

    // Copy/Paste Functionality
    copyWeek() {
        if (this.currentView === 'week') {
            this.copyCurrentWeek();
        } else if (this.currentView === 'month') {
            // In month view, guide the user to select a week first
            // Clear any existing copied week data to allow copying a new week
            this.copiedWeek = null;
            
            // Remove any existing highlighted weeks
            document.querySelectorAll('.month-day.highlighted-week').forEach(cell => {
                cell.classList.remove('highlighted-week');
            });
            
            this.showNotification('Kérjük, kattints egy hétre a másoláshoz', 'info');
            // Add visual indicator to show which weeks can be clicked
            this.highlightWeeksForCopying();
        }
    }

    // New function to highlight weeks that can be selected for copying
    highlightWeeksForCopying() {
        // Add a temporary class to all weeks in the month view to indicate they can be selected
        const weekCells = document.querySelectorAll('.month-day');
        weekCells.forEach(cell => {
            cell.classList.add('selectable-week');
        });
        
        // Remove the highlighting after 5 seconds
        setTimeout(() => {
            weekCells.forEach(cell => {
                cell.classList.remove('selectable-week');
            });
        }, 5000);
    }

    // New function to copy a week from a specific date in month view
    copyWeekFromMonthView(dateStr) {
        // Get the week key for the specified date
        const date = new Date(dateStr + 'T00:00:00');
        const weekKey = this.getWeekKey(date);
        
        // Check if there are shifts for this week
        if (this.schedules[weekKey] && Object.keys(this.schedules[weekKey]).length > 0) {
            this.copiedWeek = JSON.parse(JSON.stringify(this.schedules[weekKey]));
            document.getElementById('pasteBtn').disabled = false;
            document.getElementById('pasteBtn').classList.remove('opacity-50');
            this.showNotification('Hét sikeresen másolva! Most kattints egy másik hétre a beillesztéshez.', 'success');
            
            // Highlight weeks that can be pasted to
            this.highlightWeeksForPasting();
        } else {
            this.showNotification('Nincs másolható műszakbeosztás erre a hétre.', 'warning');
        }
    }

    // New function to paste a week to a specific date in month view
    pasteWeekToMonthView(dateStr) {
        if (!this.copiedWeek) {
            this.showNotification('Nincs másolt hét a beillesztéshez.', 'warning');
            return;
        }
        
        // Get the week key for the specified date
        const date = new Date(dateStr + 'T00:00:00');
        const weekKey = this.getWeekKey(date);
        const weekDates = this.getWeekDates(dateStr);
        
        console.log('Pasting to week:', weekKey);
        console.log('Current schedules:', this.schedules);
        console.log('Target week schedules:', this.schedules[weekKey]);
        
        // Check if target week already has schedules
        const targetWeekHasSchedules = this.schedules[weekKey] && Object.keys(this.schedules[weekKey]).length > 0;
        
        console.log('Target week has schedules:', targetWeekHasSchedules);
        console.log('Number of scheduled days:', this.schedules[weekKey] ? Object.keys(this.schedules[weekKey]).length : 0);
        
        // Additional check - see if any day in the week has shifts
        let hasShifts = false;
        if (this.schedules[weekKey]) {
            for (const date in this.schedules[weekKey]) {
                if (this.schedules[weekKey][date] && this.schedules[weekKey][date].length > 0) {
                    hasShifts = true;
                    console.log('Found shifts on date:', date, 'Shifts:', this.schedules[weekKey][date]);
                    break;
                }
            }
        }
        console.log('Week has shifts:', hasShifts);
        
        if (targetWeekHasSchedules && hasShifts) {
            console.log('Showing confirmation dialog');
            // Show confirmation dialog
            this.showConfirmation(
                'Műszakbeosztás Felülírása vagy Összefűzése',
                'Ez a hét már tartalmaz műszakbeosztást. Szeretnéd felülírni a meglévő beosztást, vagy összefűzni az új beosztással?',
                () => {
                    // Replace option
                    this.performWeekPaste(weekKey, weekDates, 'replace');
                },
                'Felülírás',
                'bg-red-600 hover:bg-red-700',
                () => {
                    // Merge option
                    this.performWeekPaste(weekKey, weekDates, 'merge');
                },
                'Összefűzés',
                'bg-blue-600 hover:bg-blue-700'
            );
        } else {
            console.log('No existing schedules, just pasting');
            // No existing schedules, just paste
            this.performWeekPaste(weekKey, weekDates, 'replace');
        }
    }

    // New function to perform the actual week paste operation
    performWeekPaste(weekKey, weekDates, mode) {
        if (mode === 'replace') {
            // Clear target week
            this.schedules[weekKey] = {};
        } else if (mode === 'merge') {
            // Keep existing schedules, we'll merge with them
            if (!this.schedules[weekKey]) {
                this.schedules[weekKey] = {};
            }
        }
        
        // Paste copied shifts with new dates
        Object.keys(this.copiedWeek).forEach((originalDate, index) => {
            if (index < weekDates.length) {
                const newDate = weekDates[index];
                
                // Initialize array for this date if it doesn't exist
                if (!this.schedules[weekKey][newDate]) {
                    this.schedules[weekKey][newDate] = [];
                }
                
                // Add copied shifts
                const copiedShifts = this.copiedWeek[originalDate].map(shift => ({
                    ...shift,
                    id: this.generateId(),
                    date: newDate
                }));
                
                if (mode === 'merge') {
                    // For merge mode, only add shifts that don't already exist
                    copiedShifts.forEach(newShift => {
                        // Check if a similar shift already exists (same employee and time slot)
                        const isDuplicate = this.schedules[weekKey][newDate].some(existingShift => 
                            String(existingShift.employeeId) === String(newShift.employeeId) &&
                            existingShift.startTime === newShift.startTime &&
                            existingShift.endTime === newShift.endTime &&
                            existingShift.type === newShift.type
                        );
                        
                        // Only add if not a duplicate
                        if (!isDuplicate) {
                            this.schedules[weekKey][newDate].push(newShift);
                        }
                    });
                } else {
                    // For replace mode, simply concatenate
                    this.schedules[weekKey][newDate] = this.schedules[weekKey][newDate].concat(copiedShifts);
                }
            }
        });
        
        this.saveData();
        this.renderSchedule();
        
        if (mode === 'replace') {
            this.showNotification('Hét sikeresen lecserélve!', 'success');
        } else {
            this.showNotification('Hét sikeresen összefűzve!', 'success');
        }
    }

    // New function to generate a unique ID for shifts
    generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    // New function to highlight weeks that can be pasted to
    highlightWeeksForPasting() {
        // Remove the highlighted week after pasting
        document.querySelectorAll('.month-day.highlighted-week').forEach(cell => {
            cell.classList.remove('highlighted-week');
        });
        
        // Add a temporary class to all weeks in the month view to indicate they can be pasted to
        const weekCells = document.querySelectorAll('.month-day');
        weekCells.forEach(cell => {
            cell.classList.add('pasteable-week');
        });
        
        // Remove the highlighting after 5 seconds
        setTimeout(() => {
            weekCells.forEach(cell => {
                cell.classList.remove('pasteable-week');
            });
        }, 5000);
    }

    pasteWeek() {
        if (this.currentView === 'week') {
            this.pasteCurrentWeek();
        } else {
            // In month view, we still allow pasting weeks
            if (this.copiedWeek) {
                this.showNotification('Kérjük, kattints egy hétre a havi nézetben a beillesztéshez', 'info');
            } else {
                this.showNotification('Nincs másolt hét a beillesztéshez.', 'warning');
            }
        }
    }

    pasteToSelectedWeeks() {
        if (this.currentView !== 'month') return;
        
        if (!this.copiedWeek) {
            this.showNotification('Nincs másolt hét a beillesztéshez.', 'warning');
            return;
        }
        
        if (!this.selectedWeeks || this.selectedWeeks.length === 0) {
            this.showNotification('Kérjük, válassz ki egy vagy több hetet a beillesztéshez', 'warning');
            return;
        }
        
        // Show confirmation dialog
        const weekCount = this.selectedWeeks.length;
        const weekText = weekCount === 1 ? 'hét' : `${weekCount} hét`;
        this.showConfirmation(
            'Beillesztés kiválasztott hetekre',
            `Biztosan beilleszted a másolt hetet ${weekText} a havi nézetben?`,
            () => {
                // Paste to all selected weeks
                this.selectedWeeks.forEach(weekStartStr => {
                    this.pasteWeekToSelectedWeek(weekStartStr);
                });
                
                // Clear selections
                this.clearWeekSelections();
                
                this.showNotification(`${weekCount} hét sikeresen frissítve!`, 'success');
            },
            'Beillesztés',
            'bg-green-600 hover:bg-green-700'
        );
    }
    
    clearWeekSelections() {
        // Remove all week selections
        document.querySelectorAll('.month-day.selected-week').forEach(c => 
            c.classList.remove('selected-week'));
        this.selectedWeeks = [];
        
        // Update the paste to selected weeks button
        this.updatePeriodLabels();
    }
    
    updatePasteToSelectedButton() {
        // Update the paste to selected weeks button state
        const pasteToSelectedBtn = document.getElementById('pasteToSelectedBtn');
        if (pasteToSelectedBtn && this.currentView === 'month') {
            const isEnglish = document.documentElement.lang === 'en' || document.title.includes('Employee Schedule');
            
            // Enable/disable paste to selected button based on copied week data and selections
            if (this.copiedWeek && this.selectedWeeks && this.selectedWeeks.length > 0) {
                pasteToSelectedBtn.disabled = false;
                pasteToSelectedBtn.classList.remove('opacity-50');
                
                // Update button text to show number of selected weeks
                const weekCount = this.selectedWeeks.length;
                const weekText = isEnglish ? 
                    (weekCount === 1 ? '1 Week Selected' : `${weekCount} Weeks Selected`) :
                    (weekCount === 1 ? '1 hét kiválasztva' : `${weekCount} hét kiválasztva`);
                
                const baseText = isEnglish ? 'To Selected Weeks' : 'Kiválasztott hetekre';
                pasteToSelectedBtn.innerHTML = `<i data-feather="clipboard" class="mr-2"></i>${baseText} (${weekCount})`;
            } else {
                pasteToSelectedBtn.disabled = true;
                pasteToSelectedBtn.classList.add('opacity-50');
                
                const baseText = isEnglish ? 'To Selected Weeks' : 'Kiválasztott hetekre';
                pasteToSelectedBtn.innerHTML = `<i data-feather="clipboard" class="mr-2"></i>${baseText}`;
            }
            
            // Update feather icons
            if (typeof feather !== 'undefined') {
                feather.replace();
            }
        }
    }

    copyCurrentWeek() {
        const weekKey = this.currentWeek;
        if (this.schedules[weekKey] && Object.keys(this.schedules[weekKey]).length > 0) {
            this.copiedWeek = JSON.parse(JSON.stringify(this.schedules[weekKey]));
            document.getElementById('pasteBtn').disabled = false;
            document.getElementById('pasteBtn').classList.remove('opacity-50');
            this.showNotification('Hét sikeresen másolva!', 'success');
        } else {
            this.showNotification('Nincs másolható műszakbeosztás erre a hétre.', 'warning');
        }
    }

    copyCurrentMonth() {
        // This functionality has been removed as per requirements
        // Users can only copy weeks, not entire months
        this.showNotification('A hónap másolása már nem elérhető. Kérjük, másoljon egy hetet inkább.', 'info');
    }

    pasteCurrentWeek() {
        if (!this.copiedWeek) {
            this.showNotification('Nincs másolt hét a beillesztéshez.', 'warning');
            return;
        }
        
        this.showConfirmation(
            'Heti Műszakbeosztás Beillesztése',
            'Ez lecseréli a jelenlegi hét műszakbeosztását a másolt héttel. Biztosan folytatod?',
            () => {
                const weekKey = this.currentWeek;
                const weekDates = this.getWeekDates(this.currentWeek);
                
                // Clear current week
                this.schedules[weekKey] = {};
                
                // Paste copied shifts with new dates
                Object.keys(this.copiedWeek).forEach((originalDate, index) => {
                    if (index < weekDates.length) {
                        const newDate = weekDates[index];
                        this.schedules[weekKey][newDate] = this.copiedWeek[originalDate].map(shift => ({
                            ...shift,
                            id: this.generateId(),
                            date: newDate
                        }));
                    }
                });
                
                this.saveData();
                this.renderSchedule();
                this.showNotification('Hét sikeresen beillesztve!', 'success');
            },
            'Beillesztés',
            'bg-blue-600 hover:bg-blue-700'
        );
    }

    pasteWeekToSelectedWeek(weekStartStr) {
        if (!this.copiedWeek) {
            this.showNotification('Nincs másolt hét a beillesztéshez.', 'warning');
            return;
        }
        
        const weekKey = weekStartStr;
        const weekDates = this.getWeekDates(weekStartStr);
        
        // Clear target week
        this.schedules[weekKey] = {};
        
        // Paste copied shifts with new dates
        Object.keys(this.copiedWeek).forEach((originalDate, index) => {
            if (index < weekDates.length) {
                const newDate = weekDates[index];
                this.schedules[weekKey][newDate] = this.copiedWeek[originalDate].map(shift => ({
                    ...shift,
                    id: this.generateId(),
                    date: newDate
                }));
            }
        });
        
        this.saveData();
        this.renderSchedule();
        this.showNotification('Hét sikeresen beillesztve!', 'success');
    }

    pasteCurrentMonth() {
        // This functionality has been removed as per requirements
        // Users can only paste weeks, not entire months
        this.showNotification('A hónap beillesztése már nem elérhető. Kérjük, illesszen be egy hetet inkább.', 'info');
    }

    clearCurrentPeriod() {
        if (this.currentView === 'week') {
            this.clearWeek();
        } else {
            this.clearMonth();
        }
    }

    clearWeek() {
        this.showConfirmation(
            'Heti Műszakbeosztás Törlése',
            'Biztos vagy benne, hogy törölni szeretnéd az egész heti műszakbeosztást? Ez a művelet nem vonható vissza.',
            () => {
                const weekKey = this.currentWeek;
                this.schedules[weekKey] = {};
                this.saveData();
                this.renderSchedule();
                this.showNotification('Heti műszakbeosztás sikeresen törölve!', 'success');
            }
        );
    }
    
    clearWeekSchedule(weekStartStr) {
        // Clear schedule for the specified week
        const weekKey = weekStartStr;
        this.schedules[weekKey] = {};
        this.saveData();
        this.renderSchedule();
    }

    clearMonth() {
        this.showConfirmation(
            'Havi Műszakbeosztás Törlése',
            'Biztos vagy benne, hogy törölni szeretnéd az egész havi műszakbeosztást? Ez a művelet nem vonható vissza.',
            () => {
                const year = this.currentMonth.year;
                const month = this.currentMonth.month;
                
                // Clear all schedules for dates in this month
                Object.keys(this.schedules).forEach(weekKey => {
                    if (this.schedules[weekKey]) {
                        Object.keys(this.schedules[weekKey]).forEach(dateStr => {
                            const date = new Date(dateStr);
                            if (date.getFullYear() === year && date.getMonth() === month) {
                                delete this.schedules[weekKey][dateStr];
                            }
                        });
                    }
                });
                
                this.saveData();
                this.renderSchedule();
                this.showNotification('Havi műszakbeosztás sikeresen törölve!', 'success');
            }
        );
    }

    // Import/Export Functionality
    importSchedule() {
        document.getElementById('importModal').classList.add('active');
    }

    closeImportModal() {
        document.getElementById('importModal').classList.remove('active');
    }

    processImport() {
        const fileInput = document.getElementById('importFile');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showNotification('Kérjük, válassz egy fájlt az importáláshoz.', 'warning');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                let data;
                if (file.type === 'application/json') {
                    data = JSON.parse(e.target.result);
                    this.importJSON(data);
                } else if (file.type === 'text/csv') {
                    data = this.parseCSV(e.target.result);
                    this.importCSV(data);
                } else {
                    alert('Nem támogatott fájlformátum. Kérjük, használj JSON vagy CSV fájlt.');
                    return;
                }
                
                this.closeImportModal();
                this.renderSchedule();
                this.showNotification('Műszakbeosztás sikeresen importálva!', 'success');
            } catch (error) {
                this.showNotification('Hiba a fájl importálásakor: ' + error.message, 'error');
            }
        };
        
        reader.readAsText(file);
    }

    importJSON(data) {
        if (data.employees) {
            // Merge employees
            data.employees.forEach(emp => {
                const existing = this.employees.find(e => e.email === emp.email);
                if (!existing) {
                    emp.id = this.generateId();
                    emp.color = this.getNextEmployeeColor();
                    this.employees.push(emp);
                }
            });
        }
        
        if (data.schedules) {
            // Merge schedules
            Object.keys(data.schedules).forEach(week => {
                if (!this.schedules[week]) {
                    this.schedules[week] = {};
                }
                Object.keys(data.schedules[week]).forEach(date => {
                    if (!this.schedules[week][date]) {
                        this.schedules[week][date] = [];
                    }
                    data.schedules[week][date].forEach(shift => {
                        shift.id = this.generateId();
                        this.schedules[week][date].push(shift);
                    });
                });
            });
        }
        
        this.saveData();
    }

    parseCSV(csvText) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',').map(v => v.trim());
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index];
                });
                data.push(row);
            }
        }
        
        return data;
    }

    importCSV(data) {
        data.forEach(row => {
            const employeeName = row.Employee || row.employee;
            const date = row.Date || row.date;
            const startTime = row['Start Time'] || row.startTime;
            const endTime = row['End Time'] || row.endTime;
            const position = row.Position || row.position;
            const type = row.Type || row.type || 'regular';
            
            if (employeeName && date && startTime && endTime) {
                // Find or create employee
                let employee = this.employees.find(emp => 
                    `${emp.firstName} ${emp.lastName}` === employeeName
                );
                
                if (!employee) {
                    const [firstName, ...lastNameParts] = employeeName.split(' ');
                    employee = {
                        id: this.generateId(),
                        firstName,
                        lastName: lastNameParts.join(' '),
                        email: `${firstName.toLowerCase()}.${lastNameParts.join('').toLowerCase()}@example.com`,
                        phone: '',
                        department: 'service',
                        position: position || 'Staff',
                        minHours: 20,
                        maxHours: 40,
                        basePay: 15.00,
                        overtimePremium: 50,
                        vacationDaysPerYear: 14,
                        sickDaysPerYear: 5,
                        workTypes: [position || 'Staff'],
                        customFields: '',
                        isActive: true,
                        color: this.getNextEmployeeColor()
                    };
                    this.employees.push(employee);
                }
                
                // Create shift
                const shift = {
                    id: this.generateId(),
                    employeeId: employee.id,
                    date,
                    startTime,
                    endTime,
                    position: position || employee.position,
                    type,
                    notes: ''
                };
                
                // Add to schedule
                const weekStart = this.getWeekStart(date);
                if (!this.schedules[weekStart]) {
                    this.schedules[weekStart] = {};
                }
                if (!this.schedules[weekStart][date]) {
                    this.schedules[weekStart][date] = [];
                }
                this.schedules[weekStart][date].push(shift);
            }
        });
        
        this.saveData();
    }

    getWeekStart(dateStr) {
        const date = new Date(dateStr);
        const startOfWeek = new Date(date);
        // Make Monday the first day of the week
        const day = (startOfWeek.getDay() + 6) % 7; // 0=Monday, 6=Sunday
        startOfWeek.setDate(startOfWeek.getDate() - day);
        return this.formatDate(startOfWeek);
    }

    exportSchedule() {
        const data = {
            employees: this.employees,
            schedules: this.schedules,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `schedulix-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Statistics
    updateStatistics() {
        const stats = this.calculateStatistics();
        
        // Update stat cards
        document.getElementById('totalEmployees').textContent = stats.totalEmployees;
        document.getElementById('totalHours').textContent = stats.totalHours;
        document.getElementById('vacationDays').textContent = stats.vacationDays;
        document.getElementById('sickDays').textContent = stats.sickDays;
        
        // Render charts and tables
        this.renderPerformanceTable(stats.employeeStats);
        this.renderDepartmentChart(stats.departmentStats);
        
        // Update chart title based on current view
        const chartTitle = document.querySelector('#weeklyChart').previousElementSibling;
        if (chartTitle) {
            if (this.currentStatsView === 'week') {
                chartTitle.textContent = 'Heti beosztás áttekintése';
            } else if (this.currentStatsView === 'month') {
                chartTitle.textContent = 'Havi beosztás áttekintése';
            } else if (this.currentStatsView === 'year') {
                chartTitle.textContent = 'Éves beosztás áttekintése';
            }
        }
        
        // Update total hours card label based on current view
        const totalHoursLabel = document.querySelector('#totalHours').previousElementSibling;
        if (totalHoursLabel) {
            const isEnglish = document.documentElement.lang === 'en' || document.title.includes('Employee Schedule');
            if (this.currentStatsView === 'week') {
                totalHoursLabel.textContent = isEnglish ? 'Total Hours This Week' : 'Összes óra ezen a héten';
            } else if (this.currentStatsView === 'month') {
                totalHoursLabel.textContent = isEnglish ? 'Total Hours This Month' : 'Összes óra ebben a hónapban';
            } else if (this.currentStatsView === 'year') {
                totalHoursLabel.textContent = isEnglish ? 'Total Hours This Year' : 'Összes óra ebben az évben';
            }
        }
        
        // Render the chart with the appropriate data
        this.renderWeeklyChart(stats.weeklyStats);
    }

    calculateStatistics() {
        let totalHours = 0;
        let vacationDays = 0;
        let sickDays = 0;
        const employeeStats = {};
        const departmentStats = {};
        let weeklyStats = {};
        
        // Initialize weeklyStats based on current view
        if (this.currentStatsView === 'week') {
            weeklyStats = {
                Hétfő: 0, Kedd: 0, Szerda: 0, Csütörtök: 0,
                Péntek: 0, Szombat: 0, Vasárnap: 0
            };
        }
        
        // Initialize employee stats
        this.employees.forEach(emp => {
            employeeStats[emp.id] = {
                employee: emp,
                weekHours: 0,
                monthHours: 0,
                overtimeHours: 0,
                vacationDays: 0,
                sickDays: 0,
                attendanceRate: 100,
                totalShifts: 0,
                scheduledShifts: 0
            };
            
            // Initialize department stats
            if (!departmentStats[emp.department]) {
                departmentStats[emp.department] = {
                    name: emp.department,
                    hours: 0,
                    employees: 0
                };
            }
            departmentStats[emp.department].employees++;
        });
        
        // Calculate based on current stats view
        if (this.currentStatsView === 'week') {
            const result = this.calculateWeeklyStatistics(employeeStats, departmentStats, weeklyStats);
            totalHours = result.totalHours;
            vacationDays = result.vacationDays;
            sickDays = result.sickDays;
        } else if (this.currentStatsView === 'month') {
            const result = this.calculateMonthlyStatistics(employeeStats, departmentStats, weeklyStats);
            totalHours = result.totalHours;
            vacationDays = result.vacationDays;
            sickDays = result.sickDays;
        } else if (this.currentStatsView === 'year') {
            const result = this.calculateYearlyStatistics(employeeStats, departmentStats, weeklyStats);
            totalHours = result.totalHours;
            vacationDays = result.vacationDays;
            sickDays = result.sickDays;
        }
        
        // Calculate attendance rates
        Object.values(employeeStats).forEach(stat => {
            if (stat.totalShifts > 0) {
                stat.attendanceRate = Math.round((stat.scheduledShifts / stat.totalShifts) * 100);
            }
        });
        
        return {
            totalEmployees: this.employees.filter(emp => emp.isActive).length,
            totalHours: Math.round(totalHours * 10) / 10,
            vacationDays,
            sickDays,
            employeeStats: Object.values(employeeStats),
            departmentStats: Object.values(departmentStats),
            weeklyStats
        };
    }

    calculateWeeklyStatistics(employeeStats, departmentStats, weeklyStats) {
        let totalHours = 0;
        let vacationDays = 0;
        let sickDays = 0;
        
        const weekKey = this.currentStatsPeriod.week;
        const weekSchedule = this.schedules[weekKey] || {};
        
        // For weekly view, we only calculate data for the current week
        // Month hours will be calculated separately in the monthly view
        
        // Calculate from current week
        const weekDates = this.getWeekDates(this.currentStatsPeriod.week);
        const dayNames = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'];
        
        Object.keys(weekSchedule).forEach(dateStr => {
            const dayIndex = weekDates.indexOf(dateStr);
            const dayName = dayNames[dayIndex];
            
            weekSchedule[dateStr].forEach(shift => {
                const duration = this.calculateShiftDuration(shift.startTime, shift.endTime);
                const employee = this.employees.find(emp => String(emp.id) === String(shift.employeeId));
                
                if (shift.type === 'vacation') {
                    vacationDays++;
                    // Track vacation days per employee
                    if (employeeStats[shift.employeeId]) {
                        employeeStats[shift.employeeId].vacationDays = (employeeStats[shift.employeeId].vacationDays || 0) + 1;
                    }
                } else if (shift.type === 'sick') {
                    sickDays++;
                    // Track sick days per employee
                    if (employeeStats[shift.employeeId]) {
                        employeeStats[shift.employeeId].sickDays = (employeeStats[shift.employeeId].sickDays || 0) + 1;
                    }
                } else if (shift.type === 'regular') {
                    totalHours += duration;
                    
                    if (dayName && weeklyStats[dayName] !== undefined) {
                        weeklyStats[dayName] += duration;
                    }
                    
                    if (employee && departmentStats[employee.department]) {
                        departmentStats[employee.department].hours += duration;
                    }
                }
                
                if (employeeStats[shift.employeeId]) {
                    employeeStats[shift.employeeId].totalShifts++;
                    if (shift.type === 'regular') {
                        employeeStats[shift.employeeId].weekHours += duration;
                        employeeStats[shift.employeeId].scheduledShifts++;
                    }
                }
            });
        });
        
        // Calculate overtime hours for each employee (hours worked over 40 in the week)
        Object.values(employeeStats).forEach(stat => {
            stat.overtimeHours = Math.max(0, stat.weekHours - 40);
        });
        
        return { totalHours, vacationDays, sickDays };
    }

    calculateMonthlyStatistics(employeeStats, departmentStats, weeklyStats) {
        let totalHours = 0;
        let vacationDays = 0;
        let sickDays = 0;
        
        const currentMonth = this.currentStatsPeriod.month;
        
        // Initialize daily stats for the current month
        const monthlyStats = {};
        const daysInMonth = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            monthlyStats[day] = 0;
        }
        
        // Calculate hours for the current month
        Object.keys(this.schedules).forEach(weekKey => {
            const weekSchedule = this.schedules[weekKey];
            Object.keys(weekSchedule).forEach(dateStr => {
                const date = new Date(dateStr);
                if (date.getFullYear() === currentMonth.year && date.getMonth() === currentMonth.month) {
                    weekSchedule[dateStr].forEach(shift => {
                        const duration = this.calculateShiftDuration(shift.startTime, shift.endTime);
                        const employee = this.employees.find(emp => String(emp.id) === String(shift.employeeId));
                        
                        if (shift.type === 'vacation') {
                            vacationDays++;
                            // Track vacation days per employee
                            if (employeeStats[shift.employeeId]) {
                                employeeStats[shift.employeeId].vacationDays = (employeeStats[shift.employeeId].vacationDays || 0) + 1;
                            }
                        } else if (shift.type === 'sick') {
                            sickDays++;
                            // Track sick days per employee
                            if (employeeStats[shift.employeeId]) {
                                employeeStats[shift.employeeId].sickDays = (employeeStats[shift.employeeId].sickDays || 0) + 1;
                            }
                        } else if (shift.type === 'regular') {
                            totalHours += duration;
                            
                            if (employee && departmentStats[employee.department]) {
                                departmentStats[employee.department].hours += duration;
                            }
                            
                            // Add to daily stats
                            const day = new Date(dateStr).getDate();
                            if (monthlyStats[day] !== undefined) {
                                monthlyStats[day] += duration;
                            }
                        }
                        
                        if (employeeStats[shift.employeeId]) {
                            employeeStats[shift.employeeId].totalShifts++;
                            if (shift.type === 'regular') {
                                employeeStats[shift.employeeId].monthHours += duration;
                                employeeStats[shift.employeeId].scheduledShifts++;
                                // For monthly view, calculate overtime based on week hours
                                // We need to calculate weekly overtime and sum it up
                                // For now, we'll set it to 0 as we don't have weekly breakdown in monthly view
                                employeeStats[shift.employeeId].overtimeHours = 0;
                            }
                        }
                    });
                }
            });
        });
        
        // Copy monthly stats to weeklyStats object for consistency
        Object.keys(monthlyStats).forEach(day => {
            weeklyStats[`Day ${day}`] = monthlyStats[day];
        });
        
        return { totalHours, vacationDays, sickDays };
    }

    calculateYearlyStatistics(employeeStats, departmentStats, weeklyStats) {
        let totalHours = 0;
        let vacationDays = 0;
        let sickDays = 0;
        
        const currentYear = this.currentStatsPeriod.year;
        
        // Initialize monthly stats for the current year
        const yearlyStats = {};
        const monthNames = ['Jan', 'Feb', 'Már', 'Ápr', 'Máj', 'Jún', 'Júl', 'Aug', 'Sze', 'Okt', 'Nov', 'Dec'];
        for (let month = 0; month < 12; month++) {
            yearlyStats[monthNames[month]] = 0;
        }
        
        // Calculate hours for the current year
        Object.keys(this.schedules).forEach(weekKey => {
            const weekSchedule = this.schedules[weekKey];
            Object.keys(weekSchedule).forEach(dateStr => {
                const date = new Date(dateStr);
                if (date.getFullYear() === currentYear) {
                    weekSchedule[dateStr].forEach(shift => {
                        const duration = this.calculateShiftDuration(shift.startTime, shift.endTime);
                        const employee = this.employees.find(emp => String(emp.id) === String(shift.employeeId));
                        
                        if (shift.type === 'vacation') {
                            vacationDays++;
                            // Track vacation days per employee
                            if (employeeStats[shift.employeeId]) {
                                employeeStats[shift.employeeId].vacationDays = (employeeStats[shift.employeeId].vacationDays || 0) + 1;
                            }
                        } else if (shift.type === 'sick') {
                            sickDays++;
                            // Track sick days per employee
                            if (employeeStats[shift.employeeId]) {
                                employeeStats[shift.employeeId].sickDays = (employeeStats[shift.employeeId].sickDays || 0) + 1;
                            }
                        } else if (shift.type === 'regular') {
                            totalHours += duration;
                            
                            if (employee && departmentStats[employee.department]) {
                                departmentStats[employee.department].hours += duration;
                            }
                            
                            // Add to monthly stats
                            const month = date.getMonth();
                            if (yearlyStats[monthNames[month]] !== undefined) {
                                yearlyStats[monthNames[month]] += duration;
                            }
                        }
                        
                        if (employeeStats[shift.employeeId]) {
                            employeeStats[shift.employeeId].totalShifts++;
                            if (shift.type === 'regular') {
                                employeeStats[shift.employeeId].scheduledShifts++;
                                // For yearly view, we accumulate all hours in monthHours
                                employeeStats[shift.employeeId].monthHours += duration;
                                // For yearly view, we don't calculate overtime as it's based on weekly limits
                                employeeStats[shift.employeeId].overtimeHours = 0;
                            }
                        }
                    });
                }
            });
        });
        
        // Copy yearly stats to weeklyStats object for consistency
        Object.keys(yearlyStats).forEach(month => {
            weeklyStats[month] = yearlyStats[month];
        });
        
        return { totalHours, vacationDays, sickDays };
    }

    calculateShiftDuration(startTime, endTime) {
        const start = this.parseTime(startTime);
        const end = this.parseTime(endTime);
        return (end - start) / 60; // Convert to hours
    }

    renderPerformanceTable(employeeStats) {
        const tbody = document.getElementById('performanceTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        // Prepare leave stats for each employee using pre-calculated values
        const employeeLeaveStats = {};
        
        this.employees.forEach(emp => {
            employeeLeaveStats[emp.id] = {
                sickDaysTaken: 0,
                vacationDaysTaken: 0,
                maxSickDays: emp.sickDaysPerYear || 0,
                maxVacationDays: emp.vacationDaysPerYear || 0
            };
        });
        
        // Use pre-calculated leave days from the statistics calculation
        employeeStats.forEach(stat => {
            if (stat.sickDays) {
                employeeLeaveStats[stat.employee.id].sickDaysTaken = stat.sickDays;
            }
            if (stat.vacationDays) {
                employeeLeaveStats[stat.employee.id].vacationDaysTaken = stat.vacationDays;
            }
        });
        
        employeeStats.forEach(stat => {
            const leaveStats = employeeLeaveStats[stat.employee.id] || { sickDaysTaken: 0, vacationDaysTaken: 0, maxSickDays: 0, maxVacationDays: 0 };
            
            // Determine which hours to show based on current view
            let hoursDisplay = '0 ó';
            let regularHours = 0;
            let overtimeHours = 0;
            
            if (this.currentStatsView === 'week') {
                hoursDisplay = stat.weekHours + ' ó';
                overtimeHours = stat.overtimeHours;
                regularHours = Math.max(0, stat.weekHours - overtimeHours);
            } else if (this.currentStatsView === 'month') {
                hoursDisplay = stat.monthHours + ' ó';
                // For monthly view, we don't calculate overtime in the same way
                // Overtime is calculated per week, not per month
                regularHours = stat.monthHours;
            } else if (this.currentStatsView === 'year') {
                hoursDisplay = stat.monthHours + ' ó';
                // For yearly view, we don't calculate overtime in the same way
                // Overtime is calculated per week, not per year
                regularHours = stat.monthHours;
            }
            
            // Calculate pay based on regular hours and overtime
            const regularPay = regularHours * (stat.employee.basePay || 0);
            const overtimePay = overtimeHours * (stat.employee.basePay || 0) * (1 + (stat.employee.overtimePremium || 0) / 100);
            const totalPay = regularPay + overtimePay;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="w-8 h-8 rounded-full ${stat.employee.color} flex items-center justify-center mr-3">
                            <i data-feather="user" class="w-4 h-4"></i>
                        </div>
                        <div class="text-sm font-medium text-gray-900">
                            ${this.getEmployeeDisplayName(stat.employee)}
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${hoursDisplay}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${overtimeHours} ó</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${leaveStats.sickDaysTaken || 0}/${leaveStats.maxSickDays}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${leaveStats.vacationDaysTaken || 0}/${leaveStats.maxVacationDays}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${stat.attendanceRate}%</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${this.formatCurrency(totalPay)}</td>
            `;
            tbody.appendChild(row);
        });
        
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    exportPayData() {
        // Get the current employee stats
        const stats = this.calculateStatistics();
        
        // Prepare data for export
        const exportData = [];
        
        // Add header row
        exportData.push(['Alkalmazott neve', 'Aktuális időszak órái', 'Túlórák', 'Betegszabadságok', 'Szabadságok', 'Jelenléti Arány', 'Fizetés']);
        
        // Prepare leave stats for each employee using pre-calculated values
        const employeeLeaveStats = {};
        
        this.employees.forEach(emp => {
            employeeLeaveStats[emp.id] = {
                sickDaysTaken: 0,
                vacationDaysTaken: 0,
                maxSickDays: emp.sickDaysPerYear || 0,
                maxVacationDays: emp.vacationDaysPerYear || 0
            };
        });
        
        // Use pre-calculated leave days from the statistics calculation
        stats.employeeStats.forEach(stat => {
            if (stat.sickDays) {
                employeeLeaveStats[stat.employee.id].sickDaysTaken = stat.sickDays;
            }
            if (stat.vacationDays) {
                employeeLeaveStats[stat.employee.id].vacationDaysTaken = stat.vacationDays;
            }
        });
        
        // Add data rows
        stats.employeeStats.forEach(stat => {
            const leaveStats = employeeLeaveStats[stat.employee.id] || { sickDaysTaken: 0, vacationDaysTaken: 0, maxSickDays: 0, maxVacationDays: 0 };
            
            // Determine which hours to show based on current view
            let hoursDisplay = '0 ó';
            let regularHours = 0;
            let overtimeHours = 0;
            
            if (this.currentStatsView === 'week') {
                hoursDisplay = stat.weekHours + ' ó';
                overtimeHours = stat.overtimeHours;
                regularHours = Math.max(0, stat.weekHours - overtimeHours);
            } else if (this.currentStatsView === 'month') {
                hoursDisplay = stat.monthHours + ' ó';
                // For monthly view, we don't calculate overtime in the same way
                // Overtime is calculated per week, not per month
                regularHours = stat.monthHours;
            } else if (this.currentStatsView === 'year') {
                hoursDisplay = stat.monthHours + ' ó';
                // For yearly view, we don't calculate overtime in the same way
                // Overtime is calculated per week, not per year
                regularHours = stat.monthHours;
            }
            
            // Calculate pay based on regular hours and overtime
            const regularPay = regularHours * (stat.employee.basePay || 0);
            const overtimePay = overtimeHours * (stat.employee.basePay || 0) * (1 + (stat.employee.overtimePremium || 0) / 100);
            const totalPay = regularPay + overtimePay;
            
            // Format data for export
            const rowData = [
                this.getEmployeeDisplayName(stat.employee),
                hoursDisplay,
                overtimeHours + ' ó',
                leaveStats.sickDaysTaken + '/' + leaveStats.maxSickDays,
                leaveStats.vacationDaysTaken + '/' + leaveStats.maxVacationDays,
                stat.attendanceRate + '%',
                this.formatCurrency(totalPay)
            ];
            
            exportData.push(rowData);
        });
        
        // Export to Excel
        this.exportToExcel(exportData);
    }
    
    exportToExcel(data) {
        try {
            // Create worksheet using XLSX.utils.aoa_to_sheet
            const ws = XLSX.utils.aoa_to_sheet(data);
            
            // Create workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Alkalmazottak teljesítmányei');
            
            // Generate file name
            const fileName = `alkalmazottak_teljesitmenyei_${new Date().toISOString().slice(0, 10)}.${this.currentStatsView}.xlsx`;
            
            // Download file
            XLSX.writeFile(wb, fileName);
        } catch (error) {
            console.error('Hiba az exportálásban:', error);
            // Fallback to CSV if Excel export fails
            this.exportToCSV(data);
        }
    }
    
    renderDepartmentChart(departmentStats) {
        const container = document.getElementById('departmentChart');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (departmentStats.length === 0) {
            container.innerHTML = '<div class="text-center text-gray-500">No data available</div>';
            return;
        }
        
        const maxHours = Math.max(...departmentStats.map(d => d.hours));
        
        const chartContainer = document.createElement('div');
        chartContainer.className = 'flex items-end justify-center space-x-4 h-full';
        
        departmentStats.forEach(dept => {
            const barContainer = document.createElement('div');
            barContainer.className = 'flex flex-col items-center';
            
            const barHeight = maxHours > 0 ? (dept.hours / maxHours) * 200 : 0;
            
            const bar = document.createElement('div');
            bar.className = 'chart-bar w-12';
            bar.style.height = `${barHeight}px`;
            bar.title = `${dept.name}: ${this.formatNumber(dept.hours, 1)} óra`;
            
            const value = document.createElement('div');
            value.className = 'chart-value';
            value.textContent = `${this.formatNumber(dept.hours, 1)} ó`;
            
            const label = document.createElement('div');
            label.className = 'chart-label';
            label.textContent = dept.name.charAt(0).toUpperCase() + dept.name.slice(1);
            
            barContainer.appendChild(value);
            barContainer.appendChild(bar);
            barContainer.appendChild(label);
            chartContainer.appendChild(barContainer);
        });
        
        container.appendChild(chartContainer);
    }

    renderWeeklyChart(weeklyStats) {
        const container = document.getElementById('weeklyChart');
        if (!container) return;
        
        container.innerHTML = '';
        
        const keys = Object.keys(weeklyStats);
        const values = Object.values(weeklyStats);
        const maxHours = Math.max(...values);
        
        // If no data, show a message
        if (maxHours === 0 && values.every(v => v === 0)) {
            container.innerHTML = '<div class="text-center text-gray-500">No data available</div>';
            return;
        }
        
        // Add a wrapper for horizontal scrolling if needed
        const scrollWrapper = document.createElement('div');
        scrollWrapper.className = 'overflow-x-auto w-full';
        
        const chartContainer = document.createElement('div');
        chartContainer.className = 'flex items-end justify-center h-full mx-auto';
        
        // Adjust bar width and spacing based on number of items and view
        let barWidthClass = 'w-8';
        let spaceClass = 'space-x-2';
        
        // Check if we need to make bars narrower for better fit
        if (this.currentStatsView === 'month' && keys.length > 15) {
            // For monthly view with many days, make bars narrower
            barWidthClass = 'w-3';
            spaceClass = 'space-x-1';
        } else if (this.currentStatsView === 'month' && keys.length > 10) {
            // For monthly view with moderate number of days
            barWidthClass = 'w-4';
            spaceClass = 'space-x-1';
        } else if (this.currentStatsView === 'year') {
            // For yearly view, standard width is fine
            barWidthClass = 'w-8';
            spaceClass = 'space-x-2';
        } else {
            // For weekly view, standard width
            barWidthClass = 'w-8';
            spaceClass = 'space-x-2';
        }
        
        chartContainer.classList.add(spaceClass);
        
        // Set minimum width to enable horizontal scrolling when needed
        if (this.currentStatsView === 'month' && keys.length > 20) {
            chartContainer.style.minWidth = `${keys.length * 20}px`;
        } else if (this.currentStatsView === 'month' && keys.length > 15) {
            chartContainer.style.minWidth = `${keys.length * 25}px`;
        } else {
            chartContainer.style.minWidth = '100%';
        }
        
        keys.forEach(key => {
            const hours = weeklyStats[key];
            const barContainer = document.createElement('div');
            barContainer.className = 'flex flex-col items-center flex-shrink-0';
            
            const barHeight = maxHours > 0 ? (hours / maxHours) * 200 : 0;
            
            const bar = document.createElement('div');
            bar.className = `chart-bar ${barWidthClass}`;
            bar.style.height = `${barHeight}px`;
            bar.title = `${key}: ${this.formatNumber(hours, 1)} óra`;
            
            const value = document.createElement('div');
            value.className = 'chart-value';
            value.textContent = `${this.formatNumber(hours, 1)} ó`;
            value.style.fontSize = '0.6rem';
            
            const label = document.createElement('div');
            label.className = 'chart-label';
            label.style.fontSize = '0.6rem';
            
            // Format labels based on current view
            if (this.currentStatsView === 'week') {
                label.textContent = key.substring(0, 3);
            } else if (this.currentStatsView === 'month') {
                // For monthly view, key is "Day X"
                label.textContent = key.replace('Day ', '');
            } else if (this.currentStatsView === 'year') {
                // For yearly view, key is month name
                label.textContent = key;
            }
            
            barContainer.appendChild(value);
            barContainer.appendChild(bar);
            barContainer.appendChild(label);
            chartContainer.appendChild(barContainer);
        });
        
        scrollWrapper.appendChild(chartContainer);
        container.appendChild(scrollWrapper);
    }

    renderMonthlyChart(employeeStats) {
        const container = document.getElementById('weeklyChart');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Update the chart title
        const chartTitle = document.querySelector('#weeklyChart').previousElementSibling;
        if (chartTitle) {
            chartTitle.textContent = 'Havi beosztás áttekintése';
        }
        
        // Sort employees by monthly hours
        const sortedStats = [...employeeStats].sort((a, b) => b.monthHours - a.monthHours);
        // Take top 10 employees for better visualization
        const topStats = sortedStats.slice(0, 10);
        
        if (topStats.length === 0) {
            container.innerHTML = '<div class="text-center text-gray-500">No data available</div>';
            return;
        }
        
        const maxHours = Math.max(...topStats.map(stat => stat.monthHours));
        
        const chartContainer = document.createElement('div');
        chartContainer.className = 'flex items-end justify-center space-x-4 h-full';
        
        topStats.forEach(stat => {
            const barContainer = document.createElement('div');
            barContainer.className = 'flex flex-col items-center';
            
            const barHeight = maxHours > 0 ? (stat.monthHours / maxHours) * 200 : 0;
            
            const bar = document.createElement('div');
            bar.className = 'chart-bar w-12';
            bar.style.height = `${barHeight}px`;
            bar.title = `${this.getEmployeeDisplayName(stat.employee)}: ${this.formatNumber(stat.monthHours, 1)} óra`;
            
            const value = document.createElement('div');
            value.className = 'chart-value';
            value.textContent = `${this.formatNumber(stat.monthHours, 1)} ó`;
            
            const label = document.createElement('div');
            label.className = 'chart-label';
            label.textContent = this.getEmployeeDisplayName(stat.employee);
            
            barContainer.appendChild(value);
            barContainer.appendChild(bar);
            barContainer.appendChild(label);
            chartContainer.appendChild(barContainer);
        });
        
        container.appendChild(chartContainer);
    }

    renderYearlyChart(employeeStats) {
        const container = document.getElementById('weeklyChart');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Update the chart title
        const chartTitle = document.querySelector('#weeklyChart').previousElementSibling;
        if (chartTitle) {
            chartTitle.textContent = 'Éves beosztás áttekintése';
        }
        
        // Sort employees by yearly hours
        const sortedStats = [...employeeStats].sort((a, b) => b.monthHours - a.monthHours);
        // Take top 10 employees for better visualization
        const topStats = sortedStats.slice(0, 10);
        
        if (topStats.length === 0) {
            container.innerHTML = '<div class="text-center text-gray-500">No data available</div>';
            return;
        }
        
        const maxHours = Math.max(...topStats.map(stat => stat.monthHours));
        
        const chartContainer = document.createElement('div');
        chartContainer.className = 'flex items-end justify-center space-x-4 h-full';
        
        topStats.forEach(stat => {
            const barContainer = document.createElement('div');
            barContainer.className = 'flex flex-col items-center';
            
            const barHeight = maxHours > 0 ? (stat.monthHours / maxHours) * 200 : 0;
            
            const bar = document.createElement('div');
            bar.className = 'chart-bar w-12';
            bar.style.height = `${barHeight}px`;
            bar.title = `${this.getEmployeeDisplayName(stat.employee)}: ${this.formatNumber(stat.monthHours, 1)} óra`;
            
            const value = document.createElement('div');
            value.className = 'chart-value';
            value.textContent = `${this.formatNumber(stat.monthHours, 1)} ó`;
            
            const label = document.createElement('div');
            label.className = 'chart-label';
            label.textContent = this.getEmployeeDisplayName(stat.employee);
            
            barContainer.appendChild(value);
            barContainer.appendChild(bar);
            barContainer.appendChild(label);
            chartContainer.appendChild(barContainer);
        });
        
        container.appendChild(chartContainer);
    }

    // Filter Functions

    searchEmployees(query) {
        // Filter employee table by search query
        const rows = document.querySelectorAll('#employeeTableBody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(query.toLowerCase())) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    filterEmployeesByDepartment(department) {
        const rows = document.querySelectorAll('#employeeTableBody tr');
        rows.forEach(row => {
            if (!department || row.textContent.includes(department)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    // Utility Functions
    saveSchedule() {
        this.saveData();
        this.showNotification('Műszakbeosztás sikeresen mentve!', 'success');
    }

    printSchedule() {
        // Create a print-friendly version of the schedule
        const printWindow = window.open('', '_blank');
        printWindow.opener = null; // Security fix for about:blank
        const scheduleContent = this.generatePrintableSchedule();
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Beosztás - ${this.formatDateDisplay(new Date(this.currentWeek + 'T00:00:00'))}</title>
                <style>
                    @page {
                        size: A4 landscape;
                        margin: 10mm;
                        @bottom-left {
                            content: "Schedulix";
                            font-size: 8pt;
                            color: #666;
                        }
                    }
                    html, body { height: 100%; }
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        background: white;
                        color: black;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .print-header {
                        text-align: center;
                        margin: 0 0 6mm 0;
                        border-bottom: 1px solid #000;
                        padding-bottom: 3mm;
                    }
                    .print-schedule {
                        display: grid;
                        grid-template-columns: repeat(7, 1fr);
                        gap: 2mm;
                        margin-top: 4mm;
                    }
                    .print-day {
                        border: 1px solid #000;
                        padding: 2mm;
                        min-height: 40mm;
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }
                    .print-day-header {
                        font-weight: bold;
                        text-align: center;
                        border-bottom: 1px solid #000;
                        padding-bottom: 1mm;
                        margin-bottom: 2mm;
                        font-size: 10pt;
                    }
                    .print-shift {
                        background: #f0f0f0;
                        border: 1px solid #999;
                        padding: 1mm;
                        margin-bottom: 1.5mm;
                        border-radius: 1mm;
                    }
                    .print-shift-employee {
                        font-weight: bold;
                        font-size: 9pt;
                    }
                    .print-shift-time {
                        font-size: 8pt;
                        color: #333;
                    }
                    .print-shift-position {
                        font-size: 7.5pt;
                        color: #555;
                    }
                    .print-shift.vacation {
                        background: #fff3cd;
                        border-color: #ffc107;
                    }
                    .print-shift.sick {
                        background: #f8d7da;
                        border-color: #dc3545;
                    }
                    .print-shift.holiday {
                        background: #d1edff;
                        border-color: #0dcaf0;
                    }
                    @media print {
                        html, body { height: auto; }
                        body { margin: 0; }
                        .print-schedule { gap: 1.5mm; }
                        .print-day { min-height: 35mm; }
                    }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h1>Műszakbeosztás</h1>
                    <h2>${this.currentView === 'week' ? '' : ''} ${this.getCurrentPeriodLabel()}</h2> 
                </div>
                ${scheduleContent}
            </body>
            </html>
        `);
        //<h2>${this.currentView === 'week' ? 'Hét:' : 'Hónap:'} ${this.getCurrentPeriodLabel()}</h2> 
        printWindow.document.close();
        printWindow.focus();
        
        // Wait for content to load then print
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    }

    generatePrintableSchedule() {
        if (this.currentView === 'week') {
            return this.generatePrintableWeekSchedule();
        } else {
            return this.generatePrintableMonthSchedule();
        }
    }

    generatePrintableWeekSchedule() {
        const weekDates = this.getWeekDates(this.currentWeek);
        const days = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'];
        
        let html = '<div class="print-schedule">';
        
        days.forEach((day, index) => {
            const date = new Date(weekDates[index]);
            const dayShifts = this.getShiftsForDay(weekDates[index]);
            dayShifts.sort((a, b) => this.parseTime(a.startTime) - this.parseTime(b.startTime));
            
            html += `
                <div class="print-day">
                    <div class="print-day-header">
                        ${day}<br>
                        <small>${this.formatDateDisplay(date)}</small>
                    </div>
            `;
            
            dayShifts.forEach(shift => {
                const employee = this.employees.find(emp => String(emp.id) === String(shift.employeeId));
                if (employee) {
                    // Display different content based on shift type
                    let timeDisplay = `${this.formatTime(shift.startTime)} - ${this.formatTime(shift.endTime)}`;
                    let positionDisplay = shift.position;
                    
                    // For non-regular shifts, show the type instead of time but keep the position
                    if (shift.type !== 'regular') {
                        switch (shift.type) {
                            case 'vacation':
                                timeDisplay = 'Szabadság';
                                break;
                            case 'sick':
                                timeDisplay = 'Betegszabadság';
                                break;
                            case 'holiday':
                                timeDisplay = 'Ünnep';
                                break;
                            case 'training':
                                timeDisplay = 'Képzés';
                                break;
                        }
                    }
                    
                    html += `
                        <div class="print-shift ${shift.type}">
                            <div class="print-shift-employee">${this.getEmployeeDisplayName(employee)}</div>
                            <div class="print-shift-time">${timeDisplay}</div>
                            <div class="print-shift-position">${positionDisplay}</div>
                        </div>
                    `;
                }
            });
            
            html += '</div>';
        });
        
        html += '</div>';
        return html;
    }

    generatePrintableMonthSchedule() {
        // For month view, create a simplified calendar layout
        const year = this.currentMonth.year;
        const month = this.currentMonth.month;
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        // Align start to Monday for printable month view
        const firstDayIndex = (firstDay.getDay() + 6) % 7; // 0=Monday
        startDate.setDate(startDate.getDate() - firstDayIndex);
        
        let html = '<div class="print-schedule">';
        
        // Add day headers
        const dayNames = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'];
        dayNames.forEach(dayName => {
            html += `<div class="print-day-header" style="grid-column: span 1; text-align: center; font-weight: bold; padding: 10px; border: 1px solid #000;">${dayName}</div>`;
        });
        
        // Generate calendar days
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const dateStr = this.formatDate(date);
            const dayShifts = this.getShiftsForDay(dateStr);
            const isCurrentMonth = date.getMonth() === month;
            
            html += `
                <div class="print-day" style="${!isCurrentMonth ? 'opacity: 0.5;' : ''}">
                    <div class="print-day-header">${date.getDate()}</div>
            `;
            
            dayShifts.forEach(shift => {
                const employee = this.employees.find(emp => String(emp.id) === String(shift.employeeId));
                if (employee) {
                    // Display different content based on shift type
                    let displayText = this.getEmployeeDisplayName(employee);
                    
                    // For non-regular shifts, show the type instead of just the name
                    if (shift.type !== 'regular') {
                        switch (shift.type) {
                            case 'vacation':
                                displayText += ' (Szabadság)';
                                break;
                            case 'sick':
                                displayText += ' (Betegszabadság)';
                                break;
                            case 'holiday':
                                displayText += ' (Ünnep)';
                                break;
                            case 'training':
                                displayText += ' (Képzés)';
                                break;
                        }
                    }
                    
                    html += `
                        <div class="print-shift ${shift.type}">
                            <div class="print-shift-employee">${displayText}</div>
                        </div>
                    `;
                }
            });
            
            html += '</div>';
        }
        
        html += '</div>';
        return html;
    }

    getCurrentPeriodLabel() {
        if (this.currentView === 'week') {
            const weekStart = new Date(this.currentWeek);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            return `${this.formatDateDisplay(weekStart)} - ${this.formatDateDisplay(weekEnd)}`;
        } else {
            const monthNames = ['Január', 'Február', 'Március', 'Április', 'Május', 'Június',
                              'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'];
            return `${monthNames[this.currentMonth.month]} ${this.currentMonth.year}`;
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    // Notification System
    showNotification(message, type = 'info', title = null, duration = 4000) {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const notificationId = ++this.notificationId;
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.dataset.id = notificationId;

        const iconMap = {
            success: 'check-circle',
            error: 'x-circle',
            warning: 'alert-triangle',
            info: 'info'
        };

        const titleMap = {
            success: title || 'Sikeres',
            error: title || 'Hiba',
            warning: title || 'Figyelmeztetés',
            info: title || 'Információ'
        };

        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i data-feather="${iconMap[type]}" class="w-5 h-5 text-${type === 'success' ? 'green' : type === 'error' ? 'red' : type === 'warning' ? 'yellow' : 'blue'}-600"></i>
                </div>
                <div class="notification-text">
                    <div class="notification-title">${titleMap[type]}</div>
                    <div class="notification-message">${message}</div>
                </div>
                <div class="notification-close" onclick="scheduleManager.closeNotification(${notificationId})">
                    <i data-feather="x" class="w-4 h-4"></i>
                </div>
            </div>
        `;

        container.appendChild(notification);

        // Initialize feather icons
        if (typeof feather !== 'undefined') {
            feather.replace();
        }

        // Show notification with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Auto-remove notification
        if (duration > 0) {
            setTimeout(() => {
                this.closeNotification(notificationId);
            }, duration);
        }

        return notificationId;
    }

    closeNotification(id) {
        const notification = document.querySelector(`[data-id="${id}"]`);
        if (notification) {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }

    // Confirmation System
    showConfirmation(title, message, callback, confirmText = 'Megerősítés', confirmClass = 'bg-red-600 hover:bg-red-700', secondCallback = null, secondText = null, secondClass = null) {
        console.log('Showing confirmation dialog:', {title, message, confirmText, secondText});
        
        const modal = document.getElementById('confirmationModal');
        const titleElement = document.getElementById('confirmationTitle');
        const messageElement = document.getElementById('confirmationMessage');
        const confirmButton = document.getElementById('confirmButton');
        const cancelButton = document.getElementById('cancelButton');
        const secondButtonContainer = document.getElementById('secondButtonContainer');
        const secondButton = document.getElementById('secondButton');
        
        if (!modal) {
            console.error('Confirmation modal not found in DOM');
            return;
        }
        
        titleElement.textContent = title;
        messageElement.textContent = message;
        confirmButton.textContent = confirmText;
        confirmButton.className = `px-4 py-2 text-white rounded-md ${confirmClass}`;
        
        // Handle second button
        if (secondCallback && secondText && secondClass) {
            console.log('Setting up second button');
            secondButton.textContent = secondText;
            secondButton.className = `px-4 py-2 text-white rounded-md ${secondClass}`;
            secondButton.style.display = 'block';
            this.secondConfirmationCallback = secondCallback;
        } else {
            console.log('Hiding second button');
            secondButton.style.display = 'none';
            this.secondConfirmationCallback = null;
        }
        
        this.confirmationCallback = callback;
        modal.classList.add('active');
        console.log('Modal should be visible now');
        
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    confirmAction() {
        if (this.confirmationCallback) {
            this.confirmationCallback();
            this.confirmationCallback = null;
        }
        this.closeConfirmationModal();
    }

    secondConfirmAction() {
        if (this.secondConfirmationCallback) {
            this.secondConfirmationCallback();
            this.secondConfirmationCallback = null;
        }
        this.closeConfirmationModal();
    }

    cancelConfirmation() {
        this.confirmationCallback = null;
        this.secondConfirmationCallback = null;
        this.closeConfirmationModal();
        
        // Restore the original cancelConfirmation function if it was overridden
        if (this.originalCancelConfirmation) {
            this.cancelConfirmation = this.originalCancelConfirmation;
            this.originalCancelConfirmation = null;
        }
    }

    closeConfirmationModal() {
        document.getElementById('confirmationModal').classList.remove('active');
    }

    // Department Management
    openDepartmentModal() {
        const modal = document.getElementById('departmentModal');
        this.renderDepartmentList();
        modal.classList.add('active');
        
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    // Holiday Management
    openHolidayModal() {
        const modal = document.getElementById('holidayModal');
        this.renderHolidayList();
        this.renderMandatoryVacationList();
        this.updateHolidayModalTitle();
        
        modal.classList.add('active');
        
        // Hide both forms when modal opens
        document.getElementById('holidayForm').classList.add('hidden');
        document.getElementById('mandatoryVacationForm').classList.add('hidden');
        
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    closeHolidayModal() {
        document.getElementById('holidayModal').classList.remove('active');
    }

    previousYear() {
        this.currentYear--;
        this.updateHolidayModalTitle();
        this.renderHolidayList();
        this.renderMandatoryVacationList();
        // Initialize holidays for the new year if they don't exist
        if (!this.holidays[this.currentYear]) {
            this.holidays[this.currentYear] = this.getDefaultHolidaysForYear(this.currentYear);
        }
        if (!this.mandatoryVacations[this.currentYear]) {
            this.mandatoryVacations[this.currentYear] = [];
        }
        this.saveData();
    }

    nextYear() {
        this.currentYear++;
        this.updateHolidayModalTitle();
        this.renderHolidayList();
        this.renderMandatoryVacationList();
        // Initialize holidays for the new year if they don't exist
        if (!this.holidays[this.currentYear]) {
            this.holidays[this.currentYear] = this.getDefaultHolidaysForYear(this.currentYear);
        }
        if (!this.mandatoryVacations[this.currentYear]) {
            this.mandatoryVacations[this.currentYear] = [];
        }
        this.saveData();
    }

    // Method to handle year changes from the main timetable
    switchToYear(year) {
        this.currentYear = year;
        this.updateHolidayModalTitle();
        this.renderHolidayList();
        this.renderMandatoryVacationList();
        // Initialize holidays for the new year if they don't exist
        if (!this.holidays[this.currentYear]) {
            this.holidays[this.currentYear] = this.getDefaultHolidaysForYear(this.currentYear);
        }
        if (!this.mandatoryVacations[this.currentYear]) {
            this.mandatoryVacations[this.currentYear] = [];
        }
        this.saveData();
    }

    updateHolidayModalTitle() {
        const titleElement = document.getElementById('holidayModalTitle');
        if (titleElement) {
            titleElement.textContent = `Ünnepnapok és Kötelező Szabadságok Kezelése (${this.currentYear})`;
        }
    }

    showHolidayForm() {
        // Hide both forms first
        document.getElementById('holidayForm').classList.add('hidden');
        document.getElementById('mandatoryVacationForm').classList.add('hidden');
        
        // Show holiday form
        document.getElementById('holidayForm').classList.remove('hidden');
    }

    showMandatoryVacationForm() {
        // Hide both forms first
        document.getElementById('holidayForm').classList.add('hidden');
        document.getElementById('mandatoryVacationForm').classList.add('hidden');
        
        // Show mandatory vacation form
        document.getElementById('mandatoryVacationForm').classList.remove('hidden');
    }

    addHoliday() {
        const dateInput = document.getElementById('holidayDate');
        const nameInput = document.getElementById('holidayName');
        
        const date = dateInput.value;
        const name = nameInput.value.trim();
        
        if (!date || !name) {
            this.showNotification('Kérjük, adja meg a dátumot és a nevet', 'warning');
            return;
        }
        
        const year = new Date(date).getFullYear();
        
        // Initialize holidays for this year if they don't exist
        if (!this.holidays[year]) {
            this.holidays[year] = this.getDefaultHolidaysForYear(year);
        }
        
        // Check if holiday already exists
        const existingHoliday = this.holidays[year].find(h => h.date === date);
        if (existingHoliday) {
            this.showNotification('Ez a dátum már ünnepnapként szerepel', 'warning');
            return;
        }
        
        const holiday = {
            id: this.generateId(),
            date: date,
            name: name,
            type: 'holiday'
        };
        
        this.holidays[year].push(holiday);
        this.saveData();
        this.renderHolidayList();
        
        // Clear inputs
        dateInput.value = '';
        nameInput.value = '';
        
        this.showNotification('Ünnepnap sikeresen hozzáadva', 'success');
    }

    addMandatoryVacation() {
        const dateInput = document.getElementById('mandatoryVacationDate');
        const nameInput = document.getElementById('mandatoryVacationName');
        
        const date = dateInput.value;
        const name = nameInput.value.trim();
        
        if (!date || !name) {
            this.showNotification('Kérjük, adja meg a dátumot és a nevet', 'warning');
            return;
        }
        
        const year = new Date(date).getFullYear();
        
        // Initialize mandatory vacations for this year if they don't exist
        if (!this.mandatoryVacations[year]) {
            this.mandatoryVacations[year] = [];
        }
        
        // Check if mandatory vacation already exists
        const existingMandatoryVacation = this.mandatoryVacations[year].find(mv => mv.date === date);
        if (existingMandatoryVacation) {
            this.showNotification('Ez a dátum már kötelező szabadságként szerepel', 'warning');
            return;
        }
        
        const mandatoryVacation = {
            id: this.generateId(),
            date: date,
            name: name,
            type: 'mandatory_vacation'
        };
        
        this.mandatoryVacations[year].push(mandatoryVacation);
        this.saveData();
        this.renderMandatoryVacationList();
        
        // Clear inputs
        dateInput.value = '';
        nameInput.value = '';
        
        this.showNotification('Kötelező szabadság sikeresen hozzáadva', 'success');
    }

    deleteHoliday(id) {
        this.showConfirmation(
            'Ünnepnap Törlése',
            'Biztosan törölni szeretné ezt az ünnepnapot?',
            () => {
                // Find and remove holiday from the current year
                const currentYear = this.currentYear;
                if (this.holidays[currentYear]) {
                    this.holidays[currentYear] = this.holidays[currentYear].filter(holiday => holiday.id !== id);
                    this.saveData();
                    this.renderHolidayList();
                    this.showNotification('Ünnepnap sikeresen törölve', 'success');
                }
            }
        );
    }

    deleteMandatoryVacation(id) {
        this.showConfirmation(
            'Kötelező Szabadság Törlése',
            'Biztosan törölni szeretné ezt a kötelező szabadságot?',
            () => {
                // Find and remove mandatory vacation from the current year
                const currentYear = this.currentYear;
                if (this.mandatoryVacations[currentYear]) {
                    this.mandatoryVacations[currentYear] = this.mandatoryVacations[currentYear].filter(mv => mv.id !== id);
                    this.saveData();
                    this.renderMandatoryVacationList();
                    this.showNotification('Kötelező szabadság sikeresen törölve', 'success');
                }
            }
        );
    }

    renderHolidayList() {
        const container = document.getElementById('holidayList');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Initialize holidays for current year if they don't exist
        if (!this.holidays[this.currentYear]) {
            this.holidays[this.currentYear] = this.getDefaultHolidaysForYear(this.currentYear);
        }
        
        if (this.holidays[this.currentYear].length === 0) {
            container.innerHTML = '<div class="text-center text-gray-500 py-4">Nincs hozzáadva ünnepnap</div>';
            return;
        }
        
        // Sort holidays by date
        const sortedHolidays = [...this.holidays[this.currentYear]].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        sortedHolidays.forEach(holiday => {
            const holidayItem = document.createElement('div');
            holidayItem.className = 'flex justify-between items-center p-2 bg-gray-50 rounded mb-2';
            
            const date = new Date(holiday.date);
            const formattedDate = date.toLocaleDateString('hu-HU', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            holidayItem.innerHTML = `
                <div class="flex-1 min-w-0">
                    <div class="font-medium truncate">${holiday.name}</div>
                    <div class="text-sm text-gray-600 truncate">${formattedDate}</div>
                </div>
                <button onclick="scheduleManager.deleteHoliday('${holiday.id}')" 
                    class="text-red-600 hover:text-red-800 p-1 flex-shrink-0">
                    <i data-feather="trash-2" class="w-4 h-4"></i>
                </button>
            `;
            
            container.appendChild(holidayItem);
        });
        
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    renderMandatoryVacationList() {
        const container = document.getElementById('mandatoryVacationList');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Initialize mandatory vacations for current year if they don't exist
        if (!this.mandatoryVacations[this.currentYear]) {
            this.mandatoryVacations[this.currentYear] = [];
        }
        
        if (this.mandatoryVacations[this.currentYear].length === 0) {
            container.innerHTML = '<div class="text-center text-gray-500 py-4">Nincs hozzáadva kötelező szabadság</div>';
            return;
        }
        
        // Sort mandatory vacations by date
        const sortedMandatoryVacations = [...this.mandatoryVacations[this.currentYear]].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        sortedMandatoryVacations.forEach(mv => {
            const mvItem = document.createElement('div');
            mvItem.className = 'flex justify-between items-center p-2 bg-gray-50 rounded mb-2';
            
            const date = new Date(mv.date);
            const formattedDate = date.toLocaleDateString('hu-HU', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            mvItem.innerHTML = `
                <div class="flex-1 min-w-0">
                    <div class="font-medium truncate">${mv.name}</div>
                    <div class="text-sm text-gray-600 truncate">${formattedDate}</div>
                </div>
                <button onclick="scheduleManager.deleteMandatoryVacation('${mv.id}')" 
                    class="text-red-600 hover:text-red-800 p-1 flex-shrink-0">
                    <i data-feather="trash-2" class="w-4 h-4"></i>
                </button>
            `;
            
            container.appendChild(mvItem);
        });
        
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    closeDepartmentModal() {
        document.getElementById('departmentModal').classList.remove('active');
    }

    renderDepartmentList() {
        const container = document.getElementById('departmentList');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.departments.forEach(dept => {
            const deptItem = document.createElement('div');
            deptItem.className = 'department-item';
            
            deptItem.innerHTML = `
                <div class="department-name">${dept.charAt(0).toUpperCase() + dept.slice(1)}</div>
                <div class="department-actions">
                    <button onclick="scheduleManager.deleteDepartment('${dept}')" class="action-btn delete" title="Részleg Törlése">
                        <i data-feather="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            `;
            
            container.appendChild(deptItem);
        });
        
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    addDepartment() {
        const input = document.getElementById('newDepartmentName');
        const name = input.value.trim().toLowerCase();
        
        if (!name) {
            this.showNotification('Adj meg egy nevet a részlegnek', 'warning');
            return;
        }
        
        if (this.departments.includes(name)) {
            this.showNotification('A részleg már létezik', 'warning');
            return;
        }
        
        this.departments.push(name);
        this.saveData();
        this.renderDepartmentList();
        this.updateDepartmentDropdowns();
        input.value = '';
        this.showNotification(`"${name}" részleg sikeresen hozzáadva`, 'success');
    }

    deleteDepartment(deptName) {
        // Check if any employees are in this department
        const employeesInDept = this.employees.filter(emp => emp.department === deptName);
        
        if (employeesInDept.length > 0) {
            this.showNotification(`Cannot delete department "${deptName}" - ${employeesInDept.length} employees are assigned to it`, 'error');
            return;
        }
        
        this.showConfirmation(
            'Részleg Törlése',
            `Biztos vagy benne, hogy törölni akarod a(z) "${deptName}" részleget?`,
            () => {
                this.departments = this.departments.filter(dept => dept !== deptName);
                this.saveData();
                this.renderDepartmentList();
                this.updateDepartmentDropdowns();
                this.showNotification(`"${deptName}" részleg sikeresen törölve`, 'success');
            }
        );
    }

    updateDepartmentDropdowns() {
        const dropdowns = ['department', 'departmentFilter'];
        
        dropdowns.forEach(dropdownId => {
            const dropdown = document.getElementById(dropdownId);
            if (!dropdown) return;
            
            const currentValue = dropdown.value;
            const isFilter = dropdownId === 'departmentFilter';
            
            dropdown.innerHTML = isFilter ? '<option value="">Összes részleg</option>' : '<option value="">Select Department</option>';
            
            this.departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept;
                option.textContent = dept.charAt(0).toUpperCase() + dept.slice(1);
                dropdown.appendChild(option);
            });
            
            // Restore previous value if it still exists
            if (currentValue && this.departments.includes(currentValue)) {
                dropdown.value = currentValue;
            }
        });
    }

    // Enhanced Employee Modal with Profile Picture
    openEmployeeModal(employee = null) {
        const modal = document.getElementById('employeeModal');
        const form = document.getElementById('employeeForm');
        
        // Update department dropdown
        this.updateDepartmentDropdowns();
        
        if (employee) {
            // Edit mode
            this.editingEmployee = employee;
            document.getElementById('modalTitle').textContent = 'Edit Employee';
            
            // Populate form
            const fullName = (employee.name && employee.name.trim()) || [employee.firstName, employee.lastName].filter(Boolean).join(' ').trim();
            document.getElementById('name').value = fullName;
            document.getElementById('nickname').value = employee.nickname || '';
            document.getElementById('email').value = employee.email;
            document.getElementById('phone').value = employee.phone;
            document.getElementById('department').value = employee.department;
            document.getElementById('position').value = employee.position;
            document.getElementById('minHours').value = employee.minHours;
            document.getElementById('maxHours').value = employee.maxHours;
            document.getElementById('basePay').value = employee.basePay;
            document.getElementById('overtimePremium').value = employee.overtimePremium;
            document.getElementById('vacationDaysPerYear').value = employee.vacationDaysPerYear;
            document.getElementById('sickDaysPerYear').value = employee.sickDaysPerYear;
            document.getElementById('customFields').value = employee.customFields;
            document.getElementById('isActive').checked = employee.isActive;
            // Default work time
            const _dst = document.getElementById('defaultStartTime');
            const _det = document.getElementById('defaultEndTime');
            if (_dst) _dst.value = employee.defaultStartTime || '08:00';
            if (_det) _det.value = employee.defaultEndTime || '16:00';
            document.getElementById('employeeColor').value = employee.customColor || '#3b82f6';
            const _col = document.getElementById('employeeColor').value;
            const _prevEl = document.getElementById('employeeColorPreview');
            if (_prevEl) _prevEl.style.backgroundColor = _col;
            const _hexEl = document.getElementById('employeeColorHex');
            if (_hexEl) _hexEl.value = _col;
            
            // Set profile picture
            const preview = document.getElementById('profilePicPreview');
            if (employee.profilePic) {
                preview.innerHTML = `<img src="${employee.profilePic}" alt="Profile" class="w-full h-full object-cover rounded-full">`;
                this.currentProfilePic = employee.profilePic;
            } else {
                preview.innerHTML = '<i data-feather="user" class="w-12 h-12 text-gray-400"></i>';
                this.currentProfilePic = null;
            }
        } else {
            // Add mode
            this.editingEmployee = null;
            document.getElementById('modalTitle').textContent = 'Alkalmazott létrehozása';
            form.reset();
            document.getElementById('isActive').checked = true;
            // Default work time for add mode
            const _dst2 = document.getElementById('defaultStartTime');
            const _det2 = document.getElementById('defaultEndTime');
            if (_dst2) _dst2.value = '08:00';
            if (_det2) _det2.value = '16:00';
            // Reset color picker UI
            const _defaultCol = '#3b82f6';
            const _colorEl = document.getElementById('employeeColor');
            if (_colorEl) _colorEl.value = _defaultCol;
            const _prevEl2 = document.getElementById('employeeColorPreview');
            if (_prevEl2) _prevEl2.style.backgroundColor = _defaultCol;
            const _hexEl2 = document.getElementById('employeeColorHex');
            if (_hexEl2) _hexEl2.value = _defaultCol;
            
            // Reset profile picture
            const preview = document.getElementById('profilePicPreview');
            preview.innerHTML = '<i data-feather="user" class="w-12 h-12 text-gray-400"></i>';
            this.currentProfilePic = null;
        }
        
        modal.classList.add('active');
        // Ensure the modal starts at the top and focus the first field
        const content = modal.querySelector('.modal-content');
        if (content) {
            content.scrollTop = 0;
        }
        const firstInput = document.getElementById('name');
        if (firstInput) {
            firstInput.focus({ preventScroll: true });
        }
        // Set currency symbol in Base Pay label (if present)
        const curSpan = document.getElementById('basePayCurrency');
        if (curSpan) curSpan.textContent = this.getCurrencySymbol();
        
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    saveEmployee() {
        const form = document.getElementById('employeeForm');
        
        const employee = {
            id: this.editingEmployee ? this.editingEmployee.id : this.generateId(),
            name: document.getElementById('name').value,
            nickname: document.getElementById('nickname').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            department: document.getElementById('department').value,
            position: document.getElementById('position').value,
            minHours: parseInt(document.getElementById('minHours').value) || 0,
            maxHours: parseInt(document.getElementById('maxHours').value) || 40,
            basePay: parseFloat(document.getElementById('basePay').value) || 0,
            overtimePremium: parseFloat(document.getElementById('overtimePremium').value) || 50,
            vacationDaysPerYear: parseInt(document.getElementById('vacationDaysPerYear').value) || 0,
            sickDaysPerYear: parseInt(document.getElementById('sickDaysPerYear').value) || 0,
            customFields: document.getElementById('customFields').value,
            isActive: document.getElementById('isActive').checked,
            color: this.editingEmployee ? this.editingEmployee.color : this.getNextEmployeeColor(),
            customColor: document.getElementById('employeeColor').value,
            profilePic: this.currentProfilePic,
            defaultStartTime: (document.getElementById('defaultStartTime') && document.getElementById('defaultStartTime').value) || '08:00',
            defaultEndTime: (document.getElementById('defaultEndTime') && document.getElementById('defaultEndTime').value) || '16:00'
        };
        
        if (!employee.name || !employee.department || !employee.position) {
            this.showNotification('Kérjük, tölts ki minden kötelező mezőt', 'error');
            return;
        }
        
        if (this.editingEmployee) {
            // Update existing employee
            const index = this.employees.findIndex(emp => String(emp.id) === String(this.editingEmployee.id));
            this.employees[index] = employee;
            
            // Update employee information in existing shifts
            let updatedShifts = 0;
            const editingEmployeeId = String(this.editingEmployee.id);
            
            Object.keys(this.schedules).forEach(weekKey => {
                Object.keys(this.schedules[weekKey]).forEach(date => {
                    this.schedules[weekKey][date].forEach(shift => {
                        // Use string comparison to ensure type compatibility
                        if (String(shift.employeeId) === editingEmployeeId) {
                            // Update shift with new employee information
                            shift.position = employee.position;
                            // Note: We don't update the employee name in shifts as it's looked up dynamically
                            updatedShifts++;
                        }
                    });
                });
            });
            
            console.log(`Updated ${updatedShifts} shifts for employee ${employee.name}`);
        } else {
            // Add new employee
            this.employees.push(employee);
        }
        
        this.saveData();
        this.closeEmployeeModal();
        this.renderEmployeeTable();
        this.renderEmployeeList();
        this.renderSchedule(); // Re-render schedule to reflect changes
        this.showNotification(`Alkalmazott: ${this.getEmployeeDisplayName(employee)} ${this.editingEmployee ? 'frissítve' : 'hozzáadva'} sikeresen!`, 'success');
    }

    closeEmployeeModal() {
        document.getElementById('employeeModal').classList.remove('active');
        this.editingEmployee = null;
        this.currentProfilePic = null;
    }

    getNextEmployeeColor() {
        const colors = ['color-1', 'color-2', 'color-3', 'color-4', 'color-5', 'color-6', 'color-7', 'color-8'];
        const usedColors = this.employees.map(emp => emp.color);
        const availableColors = colors.filter(color => !usedColors.includes(color));
        return availableColors.length > 0 ? availableColors[0] : colors[Math.floor(Math.random() * colors.length)];
    }
}

// Global functions for HTML onclick handlers
function showPage(page) {
    scheduleManager.showPage(page);
}

function pasteToSelectedWeeks() {
    scheduleManager.pasteToSelectedWeeks();
}

function switchView(view) {
    scheduleManager.switchView(view);
}

function copyWeek() {
    scheduleManager.copyWeek();
}

function pasteWeek() {
    scheduleManager.pasteWeek();
}

function clearCurrentPeriod() {
    scheduleManager.clearCurrentPeriod();
}

function navigateTime(direction) {
    scheduleManager.navigateTime(direction);
}

// New global function for going to current period
function goToCurrentPeriod() {
    scheduleManager.goToCurrentPeriod();
}

function saveSchedule() {
    scheduleManager.saveSchedule();
}

function printSchedule() {
    scheduleManager.printSchedule();
}

function importSchedule() {
    scheduleManager.importSchedule();
}

function exportSchedule() {
    scheduleManager.exportSchedule();
}

function openEmployeeModal() {
    scheduleManager.openEmployeeModal();
}

function closeEmployeeModal() {
    scheduleManager.closeEmployeeModal();
}

function saveEmployee() {
    scheduleManager.saveEmployee();
}

function closeShiftModal() {
    scheduleManager.closeShiftModal();
}

function saveShift() {
    scheduleManager.saveShift();
}

function deleteShift() {
    scheduleManager.deleteShift();
}

function closeImportModal() {
    scheduleManager.closeImportModal();
}

function processImport() {
    scheduleManager.processImport();
}

// Global functions for confirmation system
function confirmAction() {
    scheduleManager.confirmAction();
}

function secondConfirmAction() {
    scheduleManager.secondConfirmAction();
}

function cancelConfirmation() {
    scheduleManager.cancelConfirmation();
}

// Global functions for department management
function openDepartmentModal() {
    scheduleManager.openDepartmentModal();
}

function closeDepartmentModal() {
    scheduleManager.closeDepartmentModal();
}

function addDepartment() {
    scheduleManager.addDepartment();
}

// Global functions for holiday management
function openHolidayModal() {
    scheduleManager.openHolidayModal();
}

function closeHolidayModal() {
    scheduleManager.closeHolidayModal();
}

function showHolidayForm() {
    scheduleManager.showHolidayForm();
}

function showMandatoryVacationForm() {
    scheduleManager.showMandatoryVacationForm();
}

function addHoliday() {
    scheduleManager.addHoliday();
}

function addMandatoryVacation() {
    scheduleManager.addMandatoryVacation();
}

function previousYear() {
    scheduleManager.previousYear();
}

function nextYear() {
    scheduleManager.nextYear();
}

// Global function for profile picture handling
function handleProfilePicChange(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            scheduleManager.showNotification('Profile picture must be less than 5MB', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('profilePicPreview');
            preview.innerHTML = `<img src="${e.target.result}" alt="Profile" class="w-full h-full object-cover rounded-full">`;
            scheduleManager.currentProfilePic = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Global function for dark mode toggle
function toggleDarkMode() {
    scheduleManager.toggleDarkMode();
}

// Global functions for statistics view switching
function switchStatsView(view) {
    scheduleManager.switchStatsView(view);
}

function navigateStatsPeriod(direction) {
    scheduleManager.navigateStatsPeriod(direction);
}

// New global function for going to current stats period
function goToCurrentStatsPeriod() {
    scheduleManager.goToCurrentStatsPeriod();
}

// Initialize the application
var scheduleManager;
document.addEventListener('DOMContentLoaded', function() {
    if (window && window.BLOCK_APP_INIT) {
        return; // Auth guard will initialize later
    }
    scheduleManager = new ScheduleManager();
    try { window.scheduleManager = scheduleManager; } catch (_) {}
});
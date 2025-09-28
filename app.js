// Employee Schedule Manager Application
class ScheduleManager {
    constructor() {
        this.employees = [];
        this.schedules = {};
        this.departments = ['sales', 'kitchen', 'service', 'management'];
        this.currentWeek = this.getCurrentWeek();
        this.currentMonth = this.getCurrentMonth();
        this.currentView = 'week';
        this.currentPage = 'schedule';
        this.copiedWeek = null;
        this.editingEmployee = null;
        this.editingShift = null;
        this.notificationId = 0;
        this.confirmationCallback = null;
        this.currentProfilePic = null;
        this.isDarkMode = false;
        
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
        
        if (savedEmployees) {
            this.employees = JSON.parse(savedEmployees);
        } else {
            this.employees = this.getSampleEmployees();
        }
        
        if (savedSchedules) {
            this.schedules = JSON.parse(savedSchedules);
        } else {
            this.schedules = {};
        }
        
        if (savedDepartments) {
            this.departments = JSON.parse(savedDepartments);
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
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
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
                workTypes: ['Pincér', 'Házigazda'],
                customFields: '',
                isActive: true,
                color: 'color-1',
                customColor: '#3b82f6',
                profilePic: null
            },
            {
                id: 2,
                firstName: 'Jane',
                lastName: 'Smith',
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
                workTypes: ['Szakacs', 'Konyhai Előkészítő'],
                customFields: 'Főszakacs - 5 év tapasztalat',
                isActive: true,
                color: 'color-2',
                customColor: '#10b981',
                profilePic: null
            },
            {
                id: 3,
                firstName: 'Mike',
                lastName: 'Johnson',
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
                workTypes: ['Italkeverő', 'Pincér'],
                customFields: '',
                isActive: true,
                color: 'color-3',
                customColor: '#8b5cf6',
                profilePic: null
            },
            {
                id: 4,
                firstName: 'Sarah',
                lastName: 'Williams',
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
                workTypes: ['Házigazda', 'Pénztáros'],
                customFields: 'Részidős diák',
                isActive: true,
                color: 'color-4',
                customColor: '#f59e0b',
                profilePic: null
            },
            {
                id: 5,
                firstName: 'David',
                lastName: 'Brown',
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
                workTypes: ['Kezelő', 'Felügyelő'],
                customFields: 'Helyettes Kezelő',
                isActive: true,
                color: 'color-5',
                customColor: '#ef4444',
                profilePic: null
            }
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
        
        if (this.currentView === 'week') {
            const weekStart = new Date(this.currentWeek + 'T00:00:00');
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            
            labelElement.textContent = 'Heti Nézet';
            datesElement.textContent = `${this.formatDateDisplay(weekStart)} - ${this.formatDateDisplay(weekEnd)}`;
            clearButtonText.textContent = 'Hét Törlése';
        } else {
            const monthNames = ['Január', 'Február', 'Március', 'Április', 'Május', 'Június',
                              'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'];
            
            labelElement.textContent = 'Havi Nézet';
            datesElement.textContent = `${monthNames[this.currentMonth.month]} ${this.currentMonth.year}`;
            clearButtonText.textContent = 'Hónap Törlése';
        }
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
            card.className = `employee-card-with-pic ${employee.color} cursor-move`;
            card.draggable = true;
            card.dataset.employeeId = employee.id;
            
            // Apply custom color if available
            if (employee.customColor) {
                card.style.borderLeft = `4px solid ${employee.customColor}`;
                const rgb = this.hexToRgb(employee.customColor);
                card.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
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

    renderSchedule() {
        if (this.currentView === 'week') {
            this.renderWeekView();
        } else {
            this.renderMonthView();
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
            dayColumn.className = 'day-column';
            
            const date = new Date(weekDates[index] + 'T00:00:00');
            const isToday = this.isToday(date);
            
            // Day header
            const header = document.createElement('div');
            header.className = `day-column-header ${isToday ? 'bg-blue-50 border-blue-200' : ''}`;
            header.innerHTML = `
                <div class="day-column-title ${isToday ? 'text-blue-700' : ''}">${day}</div>
                <div class="day-column-date ${isToday ? 'text-blue-600' : ''}">${this.formatDateDisplay(date)}</div>
            `;
            dayColumn.appendChild(header);
            
            // Day content
            const content = document.createElement('div');
            content.className = 'day-column-content';
            content.dataset.date = weekDates[index];
            
            // Add existing shifts for this day
            const dayShifts = this.getShiftsForDay(weekDates[index]);
            dayShifts.sort((a, b) => this.parseTime(a.startTime) - this.parseTime(b.startTime));
            
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
        
        shiftElement.innerHTML = `
            <div class="day-shift-employee">${this.getEmployeeDisplayName(employee)}</div>
            <div class="day-shift-time">${this.formatTime(shift.startTime)} - ${this.formatTime(shift.endTime)}</div>
            <div class="day-shift-position">${shift.position}</div>
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
        const cur = (typeof localStorage !== 'undefined' && localStorage.getItem('scheduleManager_currency')) || '$';
        if (cur === 'Ft' || cur === '€' || cur === '$') return cur;
        return '$';
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
        
        // Generate calendar days
        for (let i = 0; i < daysToShow; i++) {
            const date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
            
            const dayCell = document.createElement('div');
            dayCell.className = 'month-day';
            dayCell.dataset.date = this.formatDate(date);
            
            if (date.getMonth() !== month) {
                dayCell.classList.add('other-month');
            }
            
            if (this.isToday(date)) {
                dayCell.classList.add('today');
            }
            
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = date.getDate();
            // Prevent dragging and selecting day numbers
            dayNumber.style.pointerEvents = 'none';
            dayNumber.style.userSelect = 'none';
            dayNumber.style.webkitUserSelect = 'none';
            dayNumber.style.mozUserSelect = 'none';
            dayNumber.style.msUserSelect = 'none';
            dayNumber.draggable = false;
            dayCell.appendChild(dayNumber);
            
            // Add shifts for this day
            const dateStr = this.formatDate(date);
            const dayShifts = this.getShiftsForDay(dateStr);
            dayShifts.forEach(shift => {
                const shiftCard = this.createShiftCard(shift, true);
                dayCell.appendChild(shiftCard);
            });
            
            // Make droppable
            this.makeSlotDroppable(dayCell, dateStr);
            
            container.appendChild(dayCell);
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

    createShiftCard(shift, compact = false) {
        const employee = this.employees.find(emp => String(emp.id) === String(shift.employeeId));
        if (!employee) return document.createElement('div');
        
        const card = document.createElement('div');
        card.className = `shift-card ${shift.type} ${employee.color}`;
        card.dataset.shiftId = shift.id;
        card.dataset.employeeId = shift.employeeId;
        card.dataset.originalDate = shift.date;
        card.draggable = true;
        
        if (compact) {
            // Month view: show only the employee name (no time)
            card.innerHTML = `
                <div class="text-xs truncate">
                    <span class="font-medium">${this.getEmployeeDisplayName(employee)}</span>
                </div>
            `;
            // Apply employee-assigned color for compact (month) cards
            if (employee.customColor && shift.type === 'regular') {
                const rgb = this.hexToRgb(employee.customColor);
                card.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`;
                card.style.border = `1px solid rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
            }
        } else {
            card.innerHTML = `
                <div class="flex justify-between items-center">
                    <div class="truncate">
                        <div class="font-medium">${this.getEmployeeDisplayName(employee)}</div>
                        <div class="text-xs opacity-75">${this.formatTime(shift.startTime)} - ${this.formatTime(shift.endTime)}</div>
                        <div class="text-xs text-gray-700 truncate">${shift.position || ''}</div>
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
        employeeSelect.innerHTML = '<option value="">Select Employee</option>';
        this.employees.filter(emp => emp.isActive).forEach(employee => {
            const option = document.createElement('option');
            option.value = employee.id;
            option.textContent = `${this.getEmployeeDisplayName(employee)}`;
            employeeSelect.appendChild(option);
        });
        
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
        
        if (this.editingShift) {
            // Update existing shift
            this.removeShift(this.editingShift.id);
        }
        
        this.addShift(shift);
        this.closeShiftModal();
        this.renderSchedule();
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
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="w-8 h-8 rounded-full ${employee.color} flex items-center justify-center mr-3 overflow-hidden">
                            ${employee.profilePic ? 
                                `<img src="${employee.profilePic}" alt="${this.getEmployeeDisplayName(employee)}" class="w-full h-full object-cover">` :
                                `<i data-feather="user" class="w-4 h-4"></i>`
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
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${this.getCurrencySymbol()}${employee.basePay}/hr</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${employee.vacationDaysPerYear}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${employee.isActive ? 'Active' : 'Inactive'}
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
            document.getElementById('modalTitle').textContent = 'Add Employee';
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
            color: this.editingEmployee ? this.editingEmployee.color : this.getNextEmployeeColor()
        };
        
        if (!employee.name || !employee.department || !employee.position) {
            this.showNotification('Kérjük, tölts ki minden kötelező mezőt', 'error');
            return;
        }
        
        if (this.editingEmployee) {
            // Update existing employee
            const index = this.employees.findIndex(emp => emp.id === this.editingEmployee.id);
            this.employees[index] = employee;
        } else {
            // Add new employee
            this.employees.push(employee);
        }
        
        this.saveData();
        this.closeEmployeeModal();
        this.renderEmployeeTable();
        this.renderEmployeeList();
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
                this.employees = this.employees.filter(emp => emp.id !== id);
                
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

    // Copy/Paste Functionality
    copyWeek() {
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

    pasteWeek() {
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
        this.renderWeeklyChart(stats.weeklyStats);
    }

    calculateStatistics() {
        const weekKey = this.currentWeek;
        const weekSchedule = this.schedules[weekKey] || {};
        
        let totalHours = 0;
        let vacationDays = 0;
        let sickDays = 0;
        const employeeStats = {};
        const departmentStats = {};
        const weeklyStats = {
            Hétfó: 0, Kedd: 0, Szerda: 0, Csütörtök: 0,
            Péntek: 0, Szombat: 0, Vasárnap: 0
        };
        
        // Initialize employee stats
        this.employees.forEach(emp => {
            employeeStats[emp.id] = {
                employee: emp,
                weekHours: 0,
                monthHours: 0,
                overtimeHours: 0,
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
        
        // Calculate month hours for all employees
        const currentMonth = this.currentMonth;
        Object.keys(this.schedules).forEach(weekKey => {
            const weekSchedule = this.schedules[weekKey];
            Object.keys(weekSchedule).forEach(dateStr => {
                const date = new Date(dateStr);
                if (date.getFullYear() === currentMonth.year && date.getMonth() === currentMonth.month) {
                    weekSchedule[dateStr].forEach(shift => {
                        const duration = this.calculateShiftDuration(shift.startTime, shift.endTime);
                        if (employeeStats[shift.employeeId] && shift.type === 'regular') {
                            employeeStats[shift.employeeId].monthHours += duration;
                        }
                    });
                }
            });
        });
        
        // Calculate from current week
        const weekDates = this.getWeekDates(this.currentWeek);
        const dayNames = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'];
        
        Object.keys(weekSchedule).forEach(dateStr => {
            const dayIndex = weekDates.indexOf(dateStr);
            const dayName = dayNames[dayIndex];
            
            weekSchedule[dateStr].forEach(shift => {
                const duration = this.calculateShiftDuration(shift.startTime, shift.endTime);
                const employee = this.employees.find(emp => String(emp.id) === String(shift.employeeId));
                
                if (shift.type === 'vacation') {
                    vacationDays++;
                } else if (shift.type === 'sick') {
                    sickDays++;
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
                    
                    if (employeeStats[shift.employeeId].weekHours > 40) {
                        employeeStats[shift.employeeId].overtimeHours = 
                            employeeStats[shift.employeeId].weekHours - 40;
                    }
                }
            });
        });
        
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

    calculateShiftDuration(startTime, endTime) {
        const start = this.parseTime(startTime);
        const end = this.parseTime(endTime);
        return (end - start) / 60; // Convert to hours
    }

    renderPerformanceTable(employeeStats) {
        const tbody = document.getElementById('performanceTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        employeeStats.forEach(stat => {
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
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${stat.weekHours}h</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${stat.monthHours}h</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${stat.overtimeHours}h</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${stat.attendanceRate}%</td>
            `;
            tbody.appendChild(row);
        });
        
        if (typeof feather !== 'undefined') {
            feather.replace();
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
            bar.title = `${dept.name}: ${dept.hours.toFixed(1)} hours`;
            
            const value = document.createElement('div');
            value.className = 'chart-value';
            value.textContent = `${dept.hours.toFixed(1)}h`;
            
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
        
        const days = Object.keys(weeklyStats);
        const maxHours = Math.max(...Object.values(weeklyStats));
        
        const chartContainer = document.createElement('div');
        chartContainer.className = 'flex items-end justify-center space-x-2 h-full';
        
        days.forEach(day => {
            const hours = weeklyStats[day];
            const barContainer = document.createElement('div');
            barContainer.className = 'flex flex-col items-center';
            
            const barHeight = maxHours > 0 ? (hours / maxHours) * 200 : 0;
            
            const bar = document.createElement('div');
            bar.className = 'chart-bar w-8';
            bar.style.height = `${barHeight}px`;
            bar.title = `${day}: ${hours.toFixed(1)} hours`;
            
            const value = document.createElement('div');
            value.className = 'chart-value';
            value.textContent = `${hours.toFixed(1)}h`;
            
            const label = document.createElement('div');
            label.className = 'chart-label';
            label.textContent = day.substring(0, 3);
            
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
                    html += `
                        <div class="print-shift ${shift.type}">
                            <div class="print-shift-employee">${this.getEmployeeDisplayName(employee)}</div>
                            <div class="print-shift-time">${this.formatTime(shift.startTime)} - ${this.formatTime(shift.endTime)}</div>
                            <div class="print-shift-position">${shift.position}</div>
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
                    html += `
                        <div class="print-shift ${shift.type}">
                            <div class="print-shift-employee">${this.getEmployeeDisplayName(employee)}</div>
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
    showConfirmation(title, message, callback, confirmText = 'Megerősítés', confirmClass = 'bg-red-600 hover:bg-red-700') {
        const modal = document.getElementById('confirmationModal');
        const titleElement = document.getElementById('confirmationTitle');
        const messageElement = document.getElementById('confirmationMessage');
        const confirmButton = document.getElementById('confirmButton');
        
        titleElement.textContent = title;
        messageElement.textContent = message;
        confirmButton.textContent = confirmText;
        confirmButton.className = `px-4 py-2 text-white rounded-md ${confirmClass}`;
        
        this.confirmationCallback = callback;
        modal.classList.add('active');
        
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

    cancelConfirmation() {
        this.confirmationCallback = null;
        this.closeConfirmationModal();
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
            this.showNotification('Please enter a department name', 'warning');
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
            document.getElementById('modalTitle').textContent = 'Add Employee';
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
            const index = this.employees.findIndex(emp => emp.id === this.editingEmployee.id);
            this.employees[index] = employee;
        } else {
            // Add new employee
            this.employees.push(employee);
        }
        
        this.saveData();
        this.closeEmployeeModal();
        this.renderEmployeeTable();
        this.renderEmployeeList();
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

// Initialize the application
var scheduleManager;
document.addEventListener('DOMContentLoaded', function() {
    if (window && window.BLOCK_APP_INIT) {
        return; // Auth guard will initialize later
    }
    scheduleManager = new ScheduleManager();
    try { window.scheduleManager = scheduleManager; } catch (_) {}
});
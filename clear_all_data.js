// Script to clear all schedule manager data from localStorage
// This ensures new users start with a completely clean application

(function() {
    try {
        // Clear all schedule manager data
        localStorage.removeItem('scheduleManager_employees');
        localStorage.removeItem('scheduleManager_schedules');
        localStorage.removeItem('scheduleManager_departments');
        localStorage.removeItem('scheduleManager_holidays');
        localStorage.removeItem('scheduleManager_mandatory_vacations');
        localStorage.removeItem('scheduleManager_theme');
        
        console.log('All Schedule Manager data has been cleared from localStorage.');
        console.log('The application will now start with no employees, departments, or sample data.');
    } catch (error) {
        console.error('Error clearing localStorage:', error);
    }
})();
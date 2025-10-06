// Test file for shift overlap functionality

// Mock data for testing
const mockEmployees = [
    {
        id: 'emp1',
        name: 'John Doe',
        defaultStartTime: '08:00',
        defaultEndTime: '16:00'
    },
    {
        id: 'emp2',
        name: 'Jane Smith',
        defaultStartTime: '09:00',
        defaultEndTime: '17:00'
    }
];

const mockSchedules = {
    '2023-10-02': {
        '2023-10-02': [
            {
                id: 'shift1',
                employeeId: 'emp1',
                date: '2023-10-02',
                startTime: '08:00',
                endTime: '16:00',
                position: 'Developer',
                type: 'regular'
            }
        ]
    }
};

// Test functions
function testHasEmployeeShiftOnDate() {
    console.log('Testing hasEmployeeShiftOnDate function...');
    
    // Test case 1: Employee has shift on date
    const result1 = hasEmployeeShiftOnDate('emp1', '2023-10-02', mockSchedules);
    console.log('Test 1 (employee has shift):', result1 === true ? 'PASS' : 'FAIL');
    
    // Test case 2: Employee does not have shift on date
    const result2 = hasEmployeeShiftOnDate('emp2', '2023-10-02', mockSchedules);
    console.log('Test 2 (employee does not have shift):', result2 === false ? 'PASS' : 'FAIL');
    
    // Test case 3: Employee has shift on different date
    const result3 = hasEmployeeShiftOnDate('emp1', '2023-10-03', mockSchedules);
    console.log('Test 3 (employee has shift on different date):', result3 === false ? 'PASS' : 'FAIL');
}

function testCheckShiftOverlap() {
    console.log('\nTesting checkShiftOverlap function...');
    
    // Test case 1: New shift overlaps with existing shift (same time)
    const result1 = checkShiftOverlap('emp1', '2023-10-02', '08:00', '16:00', mockSchedules);
    console.log('Test 1 (exact overlap):', result1 === true ? 'PASS' : 'FAIL');
    
    // Test case 2: New shift overlaps with existing shift (partial overlap - start)
    const result2 = checkShiftOverlap('emp1', '2023-10-02', '07:00', '10:00', mockSchedules);
    console.log('Test 2 (partial overlap - start):', result2 === true ? 'PASS' : 'FAIL');
    
    // Test case 3: New shift overlaps with existing shift (partial overlap - end)
    const result3 = checkShiftOverlap('emp1', '2023-10-02', '14:00', '18:00', mockSchedules);
    console.log('Test 3 (partial overlap - end):', result3 === true ? 'PASS' : 'FAIL');
    
    // Test case 4: New shift does not overlap (before)
    const result4 = checkShiftOverlap('emp1', '2023-10-02', '06:00', '07:00', mockSchedules);
    console.log('Test 4 (no overlap - before):', result4 === false ? 'PASS' : 'FAIL');
    
    // Test case 5: New shift does not overlap (after)
    const result5 = checkShiftOverlap('emp1', '2023-10-02', '17:00', '18:00', mockSchedules);
    console.log('Test 5 (no overlap - after):', result5 === false ? 'PASS' : 'FAIL');
    
    // Test case 6: Different employee (should not overlap)
    const result6 = checkShiftOverlap('emp2', '2023-10-02', '08:00', '16:00', mockSchedules);
    console.log('Test 6 (different employee):', result6 === false ? 'PASS' : 'FAIL');
}

// Helper functions (simplified versions for testing)
function hasEmployeeShiftOnDate(employeeId, date, schedules) {
    // Check all weeks for shifts on this date for this employee
    for (const weekKey in schedules) {
        if (schedules[weekKey] && schedules[weekKey][date]) {
            const shifts = schedules[weekKey][date];
            for (const shift of shifts) {
                if (String(shift.employeeId) === String(employeeId)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function checkShiftOverlap(employeeId, date, startTime, endTime, schedules) {
    // Check all weeks for shifts on this date for this employee
    for (const weekKey in schedules) {
        if (schedules[weekKey] && schedules[weekKey][date]) {
            const shifts = schedules[weekKey][date];
            for (const shift of shifts) {
                // Only check for the same employee
                if (String(shift.employeeId) === String(employeeId)) {
                    // Check if time ranges overlap
                    const existingStart = parseTime(shift.startTime);
                    const existingEnd = parseTime(shift.endTime);
                    const newStart = parseTime(startTime);
                    const newEnd = parseTime(endTime);
                    
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

function parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

// Run tests
testHasEmployeeShiftOnDate();
testCheckShiftOverlap();

console.log('\nAll tests completed!');